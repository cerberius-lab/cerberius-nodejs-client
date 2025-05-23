import { CerberiusClient } from './CerberiusClient';
import axios from 'axios';
import * as crypto from 'crypto';

// Define shared mock instances for Hmac methods
const mockHmacUpdate = jest.fn().mockReturnThis();
const mockHmacDigest = jest.fn(() => 'mocked_signature');

// Mock axios selectively
const mockAxiosInstancePost = jest.fn();
jest.mock('axios', () => {
    // Get the actual axios module to access its isAxiosError function INSIDE the factory
    const actualAxios = jest.requireActual('axios'); 
    return {
        __esModule: true, // This is important for ES modules
        default: {
            create: jest.fn(() => ({
                post: mockAxiosInstancePost, // The instance created will have this mock post
                // Add other methods like get, put, delete if your client uses them
            })),
            isAxiosError: actualAxios.isAxiosError,
            // Mock other static methods of axios if CerberiusClient uses them directly e.g. axios.post()
            // post: jest.fn(),
        },
        // Also export isAxiosError directly if it's imported like: import { isAxiosError } from 'axios'
        isAxiosError: actualAxios.isAxiosError,
    };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock crypto for consistent signature generation
jest.mock('crypto', () => {
    const originalCrypto = jest.requireActual('crypto'); // Get the actual module
    return {
        ...originalCrypto, // Spread original exports
        createHmac: jest.fn((_algorithm: string, _key: crypto.BinaryLike | crypto.KeyObject) => ({
            update: mockHmacUpdate,
            digest: mockHmacDigest,
        })),
    };
});


describe('CerberiusClient', () => {
    let client: CerberiusClient;
    const apiKey = 'testApiKey';
    const apiSecret = 'testApiSecret';

    beforeEach(() => {
        client = new CerberiusClient(apiKey, apiSecret);
        // Reset the mock for the httpClient.post method before each test
        mockAxiosInstancePost.mockReset(); 
        // Clear mocks for crypto
        (crypto.createHmac as jest.Mock).mockClear();
        mockHmacUpdate.mockClear();
        mockHmacDigest.mockClear();
    });

    describe('_generateAuthHeaders', () => {
        it('should generate correct authentication headers', () => {
            const RealDate = Date.now;
            const mockTimestamp = 1678886400000; // A fixed timestamp: 2023-03-15T12:00:00.000Z
            global.Date.now = jest.fn(() => mockTimestamp);

            // Access the private method for testing
            const headers = (client as any)._generateAuthHeaders();

            expect(headers['X-API-Key']).toBe(apiKey);
            expect(headers['X-Timestamp']).toBe(mockTimestamp.toString());
            expect(headers['X-Signature']).toBe('mocked_signature');

            const expectedDataToSign = mockTimestamp.toString() + apiKey;
            expect(crypto.createHmac).toHaveBeenCalledWith('sha256', apiSecret);
            expect(mockHmacUpdate).toHaveBeenCalledWith(expectedDataToSign); // Assert on the stable update mock
            expect(mockHmacDigest).toHaveBeenCalledWith('hex'); // Assert on the stable digest mock

            global.Date.now = RealDate; // Restore original Date.now
        });
    });

    describe('API methods', () => {
        const mockApiSuccessResponse = { data: { success: true } };
        const mockApiErrorResponse = {
            isAxiosError: true, // Ensures axios.isAxiosError(error) is true
            response: {
                status: 500,
                data: { message: 'Internal Server Error' },
                headers: {}, // Standard for Axios error response
                statusText: 'Internal Server Error', // Standard for Axios error response
                config: {} as any, // Standard for Axios error response, cast to any for simplicity
            },
            message: 'Request failed with status code 500', // Generic message for the error itself
            name: 'AxiosError',
            code: 'ERR_BAD_REQUEST', // Example error code
            config: {} as any, // Standard for Axios error, cast to any for simplicity
            toJSON: () => ({}), // Standard for Axios error
        };
        const mockEmails = ['test1@example.com', 'test2@example.com'];
        const mockIps = ['1.2.3.4', '5.6.7.8'];
        const mockPrompt = 'Is this a safe website?';

        // Helper to test common API method behavior
        const testApiMethod = async (
            methodName: 'emailLookup' | 'ipLookup' | 'promptCheck',
            endpoint: string,
            payload: any,
            payloadKey: string
        ) => {
            const mockAuthHeaders = {
                'X-API-Key': apiKey,
                'X-Timestamp': 'mocked_timestamp',
                'X-Signature': 'mocked_signature_for_method_test',
            };
            const generateAuthHeadersSpy = jest.spyOn(CerberiusClient.prototype as any, '_generateAuthHeaders')
                .mockReturnValue(mockAuthHeaders);

            mockAxiosInstancePost.mockResolvedValue(mockApiSuccessResponse);

            const response = await (client as any)[methodName](payload);

            expect(generateAuthHeadersSpy).toHaveBeenCalledTimes(1);
            expect(mockAxiosInstancePost).toHaveBeenCalledWith(
                endpoint,
                { [payloadKey]: payload },
                { headers: mockAuthHeaders }
            );
            expect(response).toEqual(mockApiSuccessResponse.data);

            generateAuthHeadersSpy.mockRestore();
        };

         const testApiMethodErrorHandling = async (
            methodName: 'emailLookup' | 'ipLookup' | 'promptCheck',
            payload: any
        ) => {
            const mockAuthHeaders = {
                'X-API-Key': apiKey,
                'X-Timestamp': 'mocked_timestamp_error',
                'X-Signature': 'mocked_signature_for_error_test',
            };
             const generateAuthHeadersSpy = jest.spyOn(CerberiusClient.prototype as any, '_generateAuthHeaders')
                .mockReturnValue(mockAuthHeaders);

            mockAxiosInstancePost.mockRejectedValue(mockApiErrorResponse);

            await expect((client as any)[methodName](payload)).rejects.toThrow(
                `API Error: ${mockApiErrorResponse.response.status} ${mockApiErrorResponse.response.data}`
            );
            expect(generateAuthHeadersSpy).toHaveBeenCalledTimes(1);
            generateAuthHeadersSpy.mockRestore();
        };


        describe('emailLookup', () => {
            it('should make a POST request to /email-lookup with correct data and headers', async () => {
                await testApiMethod('emailLookup', '/email-lookup', mockEmails, 'emails');
            });
            it('should handle API errors correctly', async () => {
                await testApiMethodErrorHandling('emailLookup', mockEmails);
            });
        });

        describe('ipLookup', () => {
            it('should make a POST request to /ip-lookup with correct data and headers', async () => {
                await testApiMethod('ipLookup', '/ip-lookup', mockIps, 'ips');
            });
            it('should handle API errors correctly', async () => {
                await testApiMethodErrorHandling('ipLookup', mockIps);
            });
        });

        describe('promptCheck', () => {
            it('should make a POST request to /prompt-check with correct data and headers', async () => {
                await testApiMethod('promptCheck', '/prompt-check', mockPrompt, 'prompt');
            });
            it('should handle API errors correctly', async () => {
                await testApiMethodErrorHandling('promptCheck', mockPrompt);
            });
        });

        it('should throw a generic error if axios error is not standard', async () => {
            const genericError = new Error("Network Error");
            mockAxiosInstancePost.mockRejectedValue(genericError);
            
            const generateAuthHeadersSpy = jest.spyOn(CerberiusClient.prototype as any, '_generateAuthHeaders')
                .mockReturnValue({}); // Mock headers

            await expect(client.emailLookup(mockEmails)).rejects.toThrow("Network Error");
            expect(generateAuthHeadersSpy).toHaveBeenCalledTimes(1);
            generateAuthHeadersSpy.mockRestore();
        });
    });
});
