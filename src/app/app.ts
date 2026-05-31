import {Component, computed, inject, resource, signal, WritableSignal} from '@angular/core';
import {Link, UrlCheckResult} from './models';
import {debounce, FieldTree, form, FormField, required, validate, validateAsync,} from '@angular/forms/signals';
import {debounceTime, distinctUntilChanged, lastValueFrom, map} from 'rxjs';
import {HttpClient} from '@angular/common/http';




@Component({
  selector: 'app-root',
  imports: [FormField],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  /*
  Http Client
   */
  private readonly http = inject(HttpClient);
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
      console.log('sync validation');
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
            loader: async ({params: url}) => {
              // ({params}) => {
                return await lastValueFrom(this.http.get<UrlCheckResult>('https://nodejs-http-server-template.junaidahmed501.workers.dev/api/check-url', {
                  params: {
                    url
                  }
                }).pipe(
                  distinctUntilChanged(),
                  debounceTime(5000),
                  map((response): UrlCheckResult => {
                    return {
                      kind: response?.kind,
                      message: response?.message
                    } satisfies UrlCheckResult;
                  })
                ));
              }
            // }
          });
      },
      onSuccess: (response: UrlCheckResult) => {
        return {
          kind: 'urlCheckResult',
          message: response.message,
        };
      },
      onError: () => {
        return {
          kind: 'badRequest',
          message: 'Could not verify URL',
        };
      },
    });
  });


  /**
   * Signal Forms exposes both validation errors and the async URL check result
   * through the field error list. The UI keeps those two message types separate.
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
