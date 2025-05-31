[![Node.js CI](https://github.com/cerberius-lab/cerberius-nodejs-client/actions/workflows/ci.yml/badge.svg)](https://github.com/cerberius-lab/cerberius-nodejs-client/actions/workflows/ci.yml)

# Cerberius API Client for Node.js

A Node.js client library for interacting with the Cerberius API. This package provides a convenient way to access Cerberius services for email lookups, IP lookups, and prompt checking.

## Table of Contents

*   [Installation](#installation)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Initializing the Client](#initializing-the-client)
*   [Usage Examples](#usage-examples)
    *   [Email Lookup](#email-lookup)
    *   [IP Lookup](#ip-lookup)
    *   [Prompt Check](#prompt-check)
*   [API Reference](#api-reference)
*   [Error Handling](#error-handling)
*   [Contributing](#contributing)
*   [License](#license)

## Installation

Install the package using npm:

```bash
npm install cerberius-client
```

## Getting Started

### Prerequisites

To use the Cerberius API Client, you need an API Key and an API Secret. These credentials are used to authenticate your requests to the Cerberius API.

You can obtain your API Key and API Secret from your Cerberius account dashboard. For more details on managing your API credentials, please refer to the official Cerberius API [documentation](https://service.cerberius.com/api/docs/`).

### Initializing the Client

Once you have your API Key and API Secret, import the `CerberiusClient` and create a new instance:

```javascript
// For CommonJS (require)
const { CerberiusClient } = require('cerberius-client');

// Or for ES Modules (import), if your project is set up for it:
// import { CerberiusClient } from 'cerberius-client';

const apiKey = 'YOUR_API_KEY'; // Replace with your actual Cerberius API Key
const apiSecret = 'YOUR_API_SECRET'; // Replace with your actual Cerberius API Secret

if (apiKey === 'YOUR_API_KEY' || apiSecret === 'YOUR_API_SECRET') {
    console.warn("Warning: Initialize the CerberiusClient with your actual API Key and API Secret for it to function correctly.");
}

const client = new CerberiusClient(apiKey, apiSecret);
```
**Note:** The client automatically generates the necessary authentication headers (`X-API-Key`, `X-Timestamp`, `X-Signature`) for each request.

## Usage Examples

Here's how you can use the client to interact with the Cerberius API. All methods return a Promise.

### Email Lookup

Performs a lookup for one or more email addresses.

```javascript
async function checkEmails() {
    try {
        const emailsToLookup = ['test@example.com', 'another@example.org'];
        const results = await client.emailLookup(emailsToLookup);
        console.log('Email Lookup Results:', results);
        // TODO: Describe the expected structure of 'results' here,
        // or link to your API documentation for the emailLookup response schema.
        // Example: console.log(results[0].status);
    } catch (error) {
        console.error('Error during email lookup:', error.message);
    }
}

checkEmails();
```

### IP Lookup

Performs a lookup for one or more IP addresses.

```javascript
async function checkIps() {
    try {
        const ipsToLookup = ['1.2.3.4', '8.8.8.8'];
        const results = await client.ipLookup(ipsToLookup);
        console.log('IP Lookup Results:', results);
        // TODO: Describe the expected structure of 'results' here,
        // or link to your API documentation for the ipLookup response schema.
    } catch (error) {
        console.error('Error during IP lookup:', error.message);
    }
}

checkIps();
```

### Prompt Check

Checks a given text prompt.

```javascript
async function checkUserPrompt() {
    try {
        const promptText = "Is this a legitimate login page: example.com/login";
        const result = await client.promptCheck(promptText);
        console.log('Prompt Check Result:', result);
        // TODO: Describe the expected structure of 'result' here,
        // or link to your API documentation for the promptCheck response schema.
    } catch (error) {
        console.error('Error during prompt check:', error.message);
    }
}

checkUserPrompt();
```

## API Reference

This library is written in TypeScript and includes type definitions for a better development experience. API methods return a `Promise`.

**(TODO: It is highly recommended to link to your official Cerberius API documentation for detailed request and response schemas.)**

### `new CerberiusClient(apiKey: string, apiSecret: string)`
Constructor for the client.
-   **`apiKey: string`** - Your Cerberius API Key.
-   **`apiSecret: string`** - Your Cerberius API Secret.

### `async emailLookup(emails: string[]): Promise<any>`
-   **`emails: string[]`** - An array of email strings to look up.
-   **Returns**: `Promise<any>` - A promise that resolves with the API response data. *(Consult API documentation for the specific response structure.)*

### `async ipLookup(ips: string[]): Promise<any>`
-   **`ips: string[]`** - An array of IP address strings to look up.
-   **Returns**: `Promise<any>` - A promise that resolves with the API response data. *(Consult API documentation for the specific response structure.)*

### `async promptCheck(prompt: string): Promise<any>`
-   **`prompt: string`** - The text prompt to check.
-   **Returns**: `Promise<any>` - A promise that resolves with the API response data. *(Consult API documentation for the specific response structure.)*

## Error Handling

The client uses `axios` for HTTP requests. If an API request fails, an error will be thrown.
- The `CerberiusClient` catches `AxiosError` instances and re-throws a new `Error` with a message formatted as: `API Error: <status_code> <response_data_object_or_message>`.
- For network issues or other errors not directly from an API response, a standard `Error` might be thrown.

It's crucial to wrap API calls in `try...catch` blocks to handle potential errors gracefully:

```javascript
try {
    const results = await client.emailLookup(['nonexistent@example.com']);
    // Process results
    console.log(results);
} catch (error) {
    console.error('Operation failed:', error.message);
    // The client formats the error message.
    // If you need to access raw Axios error details (though less common now):
    // if (error.originalError && error.originalError.isAxiosError && error.originalError.response) {
    //   console.error('Raw API Error Details:', error.originalError.response.data);
    // }
}
```

## Contributing

Currently, this project is not accepting external contributions. Please check back in the future for updates on contribution guidelines.

## License

This client library is licensed under the MIT License. See the `LICENSE` file in the repository for the full license text.
