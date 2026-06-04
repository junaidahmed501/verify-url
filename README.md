# Verify URL

Small Angular (v21) application for checking whether a URL is valid and whether the mocked server says it exists.

[**Verify URL**](https://junaidahmed501.github.io/verify-url/)

## Requirements

- Node 22.16+

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
- A simple server is deployed on cloudflare workers.

## Implementation

- I intentionally used HTML input of type 'text' instead of 'url' for the sake of this assignment

### Mock rules:

- URLs containing `missing`, `not-found`, or `404` are treated as not existing, all other URLs are considered existing.
- Existing URLs ending with a file extension, for example `.pdf`, are treated as files.
- Existing URLs ending with `/` are treated as folders.
- Other existing URLs return an unknown resource type message.

## Notes

The app uses Angular Signal Forms, with sync as well as async validators, & zoneless change detection.

Time spent: a little over 4 hours.

I did not use AI for the actual assignment part.
However, I used AI to generate the html layout as I can't stand an ugly design.
