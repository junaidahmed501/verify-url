import {Component, computed, inject, resource, signal, WritableSignal} from '@angular/core';
import {Link, UrlCheckResult} from './models';
import {FieldTree, form, FormField, required, validate, validateAsync,} from '@angular/forms/signals';
import {fromEvent, lastValueFrom, switchMap, takeUntil, timer} from 'rxjs';
import {VerificationService} from './verification.service';


@Component({
  selector: 'app-root',
  imports: [FormField],
  templateUrl: './app.html',
})
export class App {
  /*
  URL service
   */
  private readonly vService = inject(VerificationService);
  /*
    Signal form schema fields to create the form against
   */
  readonly linkSchemaFields: WritableSignal<Link> = signal({
    url: '',
  });
  /*
    Form Schema aka Signal Form for the defined fields
   */
  readonly linkSchema: FieldTree<Link> = form(this.linkSchemaFields, (schemaPath) => {
    required(schemaPath.url, {
      message: 'URL is required',
    });
    validate(schemaPath.url, ({ value }) => {
      const rawValue = value().trim();
      if (!rawValue) {
        return null;
      }
      if (this.isHttpUrl(rawValue)) {
        return null;
      }
      return {
        kind: 'urlFormat',
        message: 'Enter a valid URL',
      };
    });
    validateAsync(schemaPath.url, {
      params: ({value}) => {
        if (value().length > 0) {
          return value();
        }
        return undefined;
      },
      factory: url => {
        return resource({
          params: url,
          loader: async ({params: url, abortSignal}) => {
            const abort$ = fromEvent(abortSignal, 'abort');

            return await lastValueFrom(
              timer(500).pipe(
                switchMap(() => this.vService.verifyURL(url)),
                takeUntil(abort$),
              ),
            );
          }
        });
      },
      onSuccess: (response: UrlCheckResult) => {
        return response;
      },
      onError: (error: unknown) => {
        return {
          kind: 'urlVerificationError',
          message: error instanceof Error
            ? error.message
            : "Something bad happened, don't look at me",
        };
      },
    });
  });
  /**
   * The Signal-Form expose both validation errors and the async URL check results
   * through the field error list. The UI keeps those two message types separate using computed signals
   */
  private readonly fieldMessages = computed(() => this.linkSchema.url().errors());
  readonly urlErrors = computed(() => this.fieldMessages().filter((message) => message.kind !== 'urlCheckResult'));
  readonly urlCheckResults = computed(() =>
    this.fieldMessages().filter(message => message.kind === 'urlCheckResult')
  );
  /**
   * Helper method that checks whether the input is an http url or not
   * @param value - The string to check against
   */
  private isHttpUrl(value: string): boolean {
    if (!URL.canParse(value)) {
      return false;
    }
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  }
}
