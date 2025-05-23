[![Node.js CI](https://github.com/cerberius-soft/nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/cerberius-soft/nodejs/actions/workflows/ci.yml)

# Cerberius API Client for Node.js

A Node.js client library for interacting with the Cerberius API. This package provides a convenient way to access Cerberius services for email lookups, IP lookups, and prompt checking.

## Installation

To install the Cerberius API Client, use npm:

```bash
npm install cerberius-api-client
```
*(Note: This package name `cerberius-api-client` is a placeholder for when it's published to npm. For local development, you would use it directly from your project structure.)*

## Authentication

To use the Cerberius API, you need an API Key and an API Secret.

### Obtaining Credentials

You can obtain your API Key and API Secret from your Cerberius account dashboard. Please refer to the official Cerberius API (e.g., at `https://cerberius.com/api/docs/`) for more details on managing your API credentials.

### Instantiating the Client

Once you have your credentials, you can instantiate the `CerberiusClient`:

```typescript
import { CerberiusClient } from 'cerberius-api-client'; // Or your local path e.g., './src/CerberiusClient' for local use

const apiKey = 'YOUR_API_KEY';
const apiSecret = 'YOUR_API_SECRET';

const client = new CerberiusClient(apiKey, apiSecret);
```

## Usage

The client generates the necessary authentication headers (`X-API-Key`, `X-Timestamp`, `X-Signature`) automatically for each request. The signature is an HMAC-SHA256 hash of (`timestamp + apiKey`) using your `apiSecret`.

### `emailLookup(emails: string[])`

Performs a lookup for one or more email addresses.

```typescript
async function checkEmails() {
    try {
        const emailsToLookup = ['test@example.com', 'another@example.org'];
        const results = await client.emailLookup(emailsToLookup);
        console.log('Email Lookup Results:', results);
        // Process results based on the actual API response structure
    } catch (error) {
        console.error('Error during email lookup:', error.message);
        // Handle error, e.g., by checking error.response if it's an API error from axios
    }
}

checkEmails();
```

### `ipLookup(ips: string[])`

Performs a lookup for one or more IP addresses.

```typescript
async function checkIps() {
    try {
        const ipsToLookup = ['1.2.3.4', '8.8.8.8'];
        const results = await client.ipLookup(ipsToLookup);
        console.log('IP Lookup Results:', results);
        // Process results
    } catch (error) {
        console.error('Error during IP lookup:', error.message);
    }
}

checkIps();
```

### `promptCheck(prompt: string)`

Checks a given text prompt for potential risks or policy violations.

```typescript
async function checkUserPrompt() {
    try {
        const promptText = "Is this a legitimate login page: example.com/login";
        const result = await client.promptCheck(promptText);
        console.log('Prompt Check Result:', result);
        // Process result
    } catch (error) {
        console.error('Error during prompt check:', error.message);
    }
}

checkUserPrompt();
```

## API Reference

### `CerberiusClient(apiKey: string, apiSecret: string)`
Constructor for the client.
- **`apiKey: string`** - Your Cerberius API Key.
- **`apiSecret: string`** - Your Cerberius API Secret.

### `async emailLookup(emails: string[]): Promise<any>`
- **`emails: string[]`** - An array of email strings to look up.
- **Returns**: `Promise<any>` - A promise that resolves with the API response data. *(The `any` type should be replaced with a more specific type definition once the actual API response structure is known.)*

### `async ipLookup(ips: string[]): Promise<any>`
- **`ips: string[]`** - An array of IP address strings to look up.
- **Returns**: `Promise<any>` - A promise that resolves with the API response data. *(Replace `any` with a specific type definition based on the API response.)*

### `async promptCheck(prompt: string): Promise<any>`
- **`prompt: string`** - The text prompt to check.
- **Returns**: `Promise<any>` - A promise that resolves with the API response data. *(Replace `any` with a specific type definition based on the API response.)*

## Error Handling

The client uses `axios` for HTTP requests. If an API request fails, `axios` will typically throw an error.
- For API errors (e.g., HTTP 4xx or 5xx status codes), the error object will often be an `AxiosError` which includes a `response` property containing details like `error.response.status` and `error.response.data`. The `CerberiusClient` catches these errors and re-throws a new `Error` with a message like: `API Error: <status_code> <response_data_message_or_object>`.
- For network issues or other errors not directly from the API response, a standard `Error` object might be thrown by `axios` or other parts of the code.

It's crucial to wrap API calls in `try...catch` blocks to handle potential errors gracefully:

```typescript
try {
    const results = await client.emailLookup(['nonexistent@example.com']);
    // Process results
} catch (error) {
    console.error('Operation failed:', error.message);
    // You can inspect the error further if needed,
    // though the client attempts to provide a clear message.
    // if (error.response) { /* Axios-specific error details */ }
}
```

## Contributing

Currently, this project is not accepting external contributions. Please check back in the future for updates on contribution guidelines.

## License

This client library is provisionally licensed under the MIT License. A formal `LICENSE` file will be added to the repository.
