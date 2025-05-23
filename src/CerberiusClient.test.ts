import { CerberiusClient } from './CerberiusClient';
import axios from 'axios';
import * as crypto from 'crypto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
// Mock crypto for consistent signature generation
jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'), // import and retain default behavior
    createHmac: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => 'mocked_signature'),
    })),
}));


describe('CerberiusClient', () => {
    let client: CerberiusClient;
    const apiKey = 'testApiKey';
    const apiSecret = 'testApiSecret';

    beforeEach(() => {
        client = new CerberiusClient(apiKey, apiSecret);
        // Reset mocks before each test
        mockedAxios.create.mockReturnThis(); // Ensure create returns the mocked instance
        mockedAxios.post.mockReset();
        (crypto.createHmac as jest.Mock).mockClear();
        (crypto.createHmac().update as jest.Mock).mockClear();
        (crypto.createHmac().digest as jest.Mock).mockClear();
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
            expect(crypto.createHmac().update).toHaveBeenCalledWith(expectedDataToSign);
            expect(crypto.createHmac().digest).toHaveBeenCalledWith('hex');

            global.Date.now = RealDate; // Restore original Date.now
        });
    });

    describe('API methods', () => {
        const mockApiSuccessResponse = { data: { success: true } };
        const mockApiErrorResponse = {
            response: {
                status: 500,
                data: { message: 'Internal Server Error' },
            },
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
            // Mock _generateAuthHeaders to ensure it's called and to simplify header checks
            const mockAuthHeaders = {
                'X-API-Key': apiKey,
                'X-Timestamp': 'mocked_timestamp',
                'X-Signature': 'mocked_signature_for_method_test',
            };
            const generateAuthHeadersSpy = jest.spyOn(CerberiusClient.prototype as any, '_generateAuthHeaders')
                .mockReturnValue(mockAuthHeaders);

            mockedAxios.post.mockResolvedValue(mockApiSuccessResponse);

            const response = await (client as any)[methodName](payload);

            expect(generateAuthHeadersSpy).toHaveBeenCalledTimes(1);
            expect(mockedAxios.post).toHaveBeenCalledWith(
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

            mockedAxios.post.mockRejectedValue(mockApiErrorResponse);

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
            mockedAxios.post.mockRejectedValue(genericError);
             const generateAuthHeadersSpy = jest.spyOn(CerberiusClient.prototype as any, '_generateAuthHeaders')
                .mockReturnValue({}); // Mock headers

            await expect(client.emailLookup(mockEmails)).rejects.toThrow("Network Error");
            expect(generateAuthHeadersSpy).toHaveBeenCalledTimes(1);
            generateAuthHeadersSpy.mockRestore();
        });
    });
});
