import {
  effect,
  signal,
  Signal,
  untracked,
} from '@angular/core';

import {
  httpResource,
  HttpResourceOptions,
  HttpResourceRequest,
} from '@angular/common/http';

import {
  FieldContext,
  LogicFn,
  PathKind,
  SchemaPath,
  SchemaPathRules,
  TreeValidationResult,
  validateAsync,
} from '@angular/forms/signals';

type DebounceTimer<T> =
  | number
  | ((value: T, previousValue: T | undefined) => Promise<void> | void);

type AppHttpResourceRequest = string | HttpResourceRequest | undefined;

type MapToErrorsFn<TValue, TResult, TPathKind extends PathKind = PathKind.Root> = (
  result: TResult,
  ctx: FieldContext<TValue, TPathKind>,
) => TreeValidationResult;

export interface AppHttpValidatorOptions<
  TValue,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
> {
  readonly request: (ctx: FieldContext<TValue, TPathKind>) => AppHttpResourceRequest;

  readonly onSuccess: MapToErrorsFn<TValue, TResult, TPathKind>;

  readonly onError: (
    error: unknown,
    ctx: FieldContext<TValue, TPathKind>,
  ) => TreeValidationResult;

  readonly options?: HttpResourceOptions<TResult, unknown>;

  readonly debounce?: DebounceTimer<AppHttpResourceRequest>;

  readonly when?: LogicFn<TValue, boolean, TPathKind>;
}

function debouncedSignal<T>(
  source: Signal<T>,
  wait: DebounceTimer<T>,
): Signal<T> {
  const debouncedValue = signal<T>(source());

  effect((onCleanup) => {
    const nextValue = source();
    const previousValue = untracked(debouncedValue);

    if (typeof wait === 'number') {
      const timeoutId = setTimeout(() => {
        debouncedValue.set(nextValue);
      }, wait);

      onCleanup(() => clearTimeout(timeoutId));
      return;
    }

    const result = wait(nextValue, previousValue);

    if (result === undefined) {
      debouncedValue.set(nextValue);
      return;
    }

    let cancelled = false;

    result.then(() => {
      if (!cancelled) {
        debouncedValue.set(nextValue);
      }
    });

    onCleanup(() => {
      cancelled = true;
    });
  });

  return debouncedValue.asReadonly();
}

function toHttpResourceRequest(
  request: AppHttpResourceRequest,
): HttpResourceRequest | undefined {
  if (typeof request === 'string') {
    return { url: request };
  }

  return request;
}

export function validateHttpCompat<
  TValue,
  TResult = unknown,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: AppHttpValidatorOptions<TValue, TResult, TPathKind>,
): void {
  validateAsync(path, {
    params: (ctx) => {
      if (opts.when && !opts.when(ctx)) {
        return undefined;
      }

      return opts.request(ctx);
    },

    factory: (request) => {
      const effectiveRequest =
        opts.debounce === undefined
          ? request
          : debouncedSignal(request, opts.debounce);

      return httpResource<TResult>(
        () => toHttpResourceRequest(effectiveRequest()),
        opts.options,
      );
    },

    onSuccess: opts.onSuccess,
    onError: opts.onError,
  });
}
