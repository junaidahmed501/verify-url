import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {firstValueFrom} from 'rxjs';

import {VerificationService} from './verification.service';

describe('VerificationService', () => {
  let service: VerificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(VerificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map a successful verification response', async () => {
    const result = firstValueFrom(service.verifyURL('https://example.com/report.pdf'));

    const request = httpMock.expectOne((req) => req.params.get('url') === 'https://example.com/report.pdf');
    expect(request.request.method).toBe('GET');

    request.flush({
      kind: 'urlCheckResult',
      message: 'URL exists and points to a file.',
    });

    await expect(result).resolves.toEqual({
      kind: 'urlCheckResult',
      message: 'URL exists and points to a file.',
    });
  });
});
