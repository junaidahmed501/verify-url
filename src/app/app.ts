import {Component, computed, signal, WritableSignal} from '@angular/core';
import {Link, UrlCheckResult} from './models';
import {FieldTree, form, FormField, required, validate, validateHttp} from '@angular/forms/signals';


@Component({
  selector: 'app-root',
  imports: [FormField],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly linkSchemaFields: WritableSignal<Link> = signal({
    url: '',
  });

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
    validateHttp(schemaPath.url, {
      debounce: 500,
      request: ({ value }) => {
        const rawValue = value().trim();
        return {
          url: '/api/check-url',
          method: 'GET',
          params: {
            url: rawValue,
          },
        };
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
  readonly fieldMessages = computed(() => this.linkSchema.url().errors());
  readonly urlErrors = computed(() => this.fieldMessages().filter((message) => message.kind !== 'urlCheckResult'));
  readonly urlCheckResults = computed(() =>
    this.fieldMessages().filter(message => message.kind === 'urlCheckResult')
  );

  private isHttpUrl(value: string): boolean {
    if (!URL.canParse(value)) {
      return false;
    }

    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  }
}
