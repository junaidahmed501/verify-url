export interface Link {
  url: string;
}

/**
 * Response shape for the mocked URL check endpoint.
 */
export interface UrlCheckResult {
  kind: 'urlCheckResult';
  message: string;
}
