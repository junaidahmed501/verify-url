import {inject, Injectable} from '@angular/core';
import {UrlCheckResult} from './models';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {
  /*
    Http Client
    */
  private readonly http = inject(HttpClient);
  /*
   Api endpoint
   */
  private readonly endpoint: string = 'https://nodejs-http-server-template.junaidahmed501.workers.dev/api/check-url';

  /**
   * method to verify the url against existence/valid/type checks
   */
  verifyURL(url: string) {
    return this.http.get<UrlCheckResult>(this.endpoint, {
      params: {url},
    }).pipe(
      map((response) => this.mapResponse(response)),
      catchError(() => throwError(() => new Error('Could not verify URL'))),
    );
  }
  /*
    Map success response
   */
  private mapResponse(response: UrlCheckResult | null | undefined): UrlCheckResult {
    const message = response?.message?.trim() || 'URL exists, but the resource type is unknown.';

    return {
      kind: 'urlCheckResult',
      message,
    };
  }
}
