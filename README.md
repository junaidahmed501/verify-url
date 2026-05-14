# Verify URL

Small Angular application for checking whether a URL is valid and whether the mocked server says it exists.

## Requirements

- Node 22.22+

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Test

```bash
npm test
```

## Behavior

- URL format validation runs as the user types.
- The existence check is debounced to avoid a request on every keystroke.
- The server is mocked on the client with an Angular HTTP interceptor.
- The mocked server response is asynchronous.

## Implementation

- I intentionally used HTML input of type 'text' instead of 'url' for the sake of this assignment

### Mock rules:

- URLs containing `missing`, `not-found`, or `404` are treated as not existing, all other URLs are considered existing.
- Existing URLs ending with a file extension, for example `.pdf`, are treated as files.
- Existing URLs ending with `/` are treated as folders.
- Other existing URLs return an unknown resource type message.

## Notes

The app uses Angular Signal Forms and zoneless change detection.

Time spent: a little over 4 hours.

I used Angular prerelease packages (_because there was a bug in v21 for signal-forms, so I decided to upgrade to next/pre-release_) to try Signal Forms. For production work I would normally prefer stable framework versions, but I kept the implementation small and focused for this task.
