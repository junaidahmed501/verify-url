import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideZonelessChangeDetection} from '@angular/core';
import {vi} from 'vitest';
import {App} from './app';
import {mockUrlCheckInterceptor} from './interceptors/mock-backend.interceptor';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([mockUrlCheckInterceptor])),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should initialize linkSchemaFields with an empty url', () => {
    expect(app.linkSchemaFields()).toEqual({ url: '' });
  });

  it('should update the signal form value', async () => {
    vi.useFakeTimers();

    app.linkSchemaFields.set({ url: 'https://example.com/' });

    expect(app.linkSchemaFields()).toEqual({ url: 'https://example.com/' });
    expect(app.linkSchema.url().value()).toBe('https://example.com/');

    app.linkSchemaFields.update((value) => ({
      ...value,
      url: 'https://example.com/report.pdf',
    }));

    expect(app.linkSchemaFields()).toEqual({ url: 'https://example.com/report.pdf' });
    expect(app.linkSchema.url().value()).toBe('https://example.com/report.pdf');
  });

  it('should show a required error for an empty dirty field', () => {
    app.linkSchema.url().markAsDirty();

    expect(errorMessages()).toContain('URL is required');
    expect(urlCheckResultMessages()).toEqual([]);
  });

  it('should show a URL format error for an invalid URL', () => {
    app.linkSchemaFields.set({ url: 'not-a-url' });
    app.linkSchema.url().markAsDirty();

    expect(errorMessages()).toContain('Enter a valid URL');
    expect(urlCheckResultMessages()).toEqual([]);
  });

  it('should show a URL format error for a non-HTTP URL', () => {
    app.linkSchemaFields.set({ url: 'ftp://example.com/report.pdf' });
    app.linkSchema.url().markAsDirty();

    expect(errorMessages()).toContain('Enter a valid URL');
    expect(urlCheckResultMessages()).toEqual([]);
  });

  it('should not show a sync validation error for a valid HTTP URL', async () => {
    app.linkSchemaFields.set({ url: 'https://example.com/' });
    app.linkSchema.url().markAsDirty();

    expect(errorMessages()).toEqual([]);
  });

  it('should show the async result for an existing file URL', async () => {
    vi.useFakeTimers();

    app.linkSchemaFields.set({ url: 'https://example.com/report.pdf' });

    await flushAsyncValidation();

    expect(errorMessages()).toEqual([]);
    expect(urlCheckResultMessages()).toContain('URL exists and points to a file.');
  });

  it('should show the async result for an existing folder URL', async () => {
    vi.useFakeTimers();

    app.linkSchemaFields.set({ url: 'https://example.com/docs/' });

    await flushAsyncValidation();

    expect(errorMessages()).toEqual([]);
    expect(urlCheckResultMessages()).toContain('URL exists and points to a folder.');
  });

  it('should show the async result for an existing URL with unknown resource type', async () => {
    vi.useFakeTimers();

    app.linkSchemaFields.set({ url: 'https://example.com/docs' });

    await flushAsyncValidation();

    expect(errorMessages()).toEqual([]);
    expect(urlCheckResultMessages()).toContain('URL exists, but the resource type is unknown.');
  });

  it('should show the async result for a missing URL', async () => {
    vi.useFakeTimers();

    app.linkSchemaFields.set({ url: 'https://example.com/missing.pdf' });

    await flushAsyncValidation();

    expect(errorMessages()).toEqual([]);
    expect(urlCheckResultMessages()).toContain('URL does not exist.');
  });

  async function flushAsyncValidation() {
    await vi.runAllTimersAsync();
    fixture.detectChanges();
  }

  function errorMessages() {
    return app.urlErrors().map((error) => error.message);
  }

  function urlCheckResultMessages() {
    return app.urlCheckResults().map((message) => message.message);
  }
});
