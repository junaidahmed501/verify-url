import {inject, Injectable} from '@angular/core';
import {UrlCheckResult} from './models';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {
  /*
    Http Client
    */
  private readonly http = inject(HttpClient);

  /**
   * method to verify the url against existence/valid/type checks
   */
  verifyURL(url: string) {
    return this.http.get<UrlCheckResult>('https://nodejs-http-server-template.junaidahmed501.workers.dev/api/check-url', {
      params: {url},
    }).pipe(
      map((response): UrlCheckResult => {
        return {
          kind: response?.kind,
          message: response?.message,
        } satisfies UrlCheckResult;
      })
    );
  }
}
