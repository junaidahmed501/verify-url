import {HttpErrorResponse, HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {delay, of, throwError} from 'rxjs';
import {UrlCheckResult} from '../models';


/**
 * Client-side mock for the URL check endpoint.
 * It keeps the rules deterministic so the app is easy to demo and test.
 */
export const mockUrlCheckInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url === '/api/check-url') {
    const rawUrl = req.params.get('url');
    if (!rawUrl) {
      return throwError(() => new HttpErrorResponse({
        status: 400,
      }));
    }

    try {
      const parsedUrl = new URL(rawUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return throwError(() => new HttpErrorResponse({
          status: 400,
        }));
      }

      const isFile = /\.[a-zA-Z0-9]+$/.test(parsedUrl.pathname);
      const isFolder = parsedUrl.pathname.endsWith('/');
      const exists = !/missing|not-found|404/i.test(`${parsedUrl.hostname}${parsedUrl.pathname}`);
      const body: UrlCheckResult = {
        kind: 'urlCheckResult',
        message: getUrlCheckMessage(exists, isFile, isFolder),
      };

      return of(
        new HttpResponse({
          status: 200,
          body,
        })
      ).pipe(delay(300));
    } catch {
      return throwError(() => new HttpErrorResponse({
        status: 400,
      }));
    }
  }
  return next(req);
};

/**
 * Builds the one user-facing message returned by the mocked endpoint.
 * The type is inferred from simple URL path conventions, not a real resource lookup.
 */
function getUrlCheckMessage(exists: boolean, isFile: boolean, isFolder: boolean): string {
  if (!exists) {
    return 'URL does not exist.';
  }

  if (isFile) {
    return 'URL exists and points to a file.';
  }

  if (isFolder) {
    return 'URL exists and points to a folder.';
  }

  return 'URL exists, but the resource type is unknown.';
}
