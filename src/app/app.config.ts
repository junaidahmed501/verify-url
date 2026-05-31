import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';

import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {mockUrlCheckInterceptor} from './interceptors/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
  ]
};
