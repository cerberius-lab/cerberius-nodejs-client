import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export class CerberiusClient {
    private apiKey: string;
    private apiSecret: string;
    private httpClient: AxiosInstance;

    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.httpClient = axios.create({
            baseURL: 'https://service.cerberius.com/api',
        });
    }

    private _generateAuthHeaders(): Record<string, string> {
        const timestamp = Date.now().toString();
        const dataToSign = timestamp + this.apiKey;
        const signature = crypto
            .createHmac('sha256', this.apiSecret)
            .update(dataToSign)
            .digest('hex');

        return {
            'X-API-Key': this.apiKey,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
        };
    }

    public async emailLookup(emails: string[]): Promise<any> {
        try {
            const headers = this._generateAuthHeaders();
            const response = await this.httpClient.post('/email-lookup', { emails }, { headers });
            return response.data;
        } catch (error) {
            // Basic error handling
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.data}`);
            }
            throw error;
        }
    }

    public async ipLookup(ips: string[]): Promise<any> {
        try {
            const headers = this._generateAuthHeaders();
            const response = await this.httpClient.post('/ip-lookup', { ips }, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.data}`);
            }
            throw error;
        }
    }

    public async promptCheck(prompt: string): Promise<any> {
        try {
            const headers = this._generateAuthHeaders();
            const response = await this.httpClient.post('/prompt-check', { prompt }, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.data}`);
            }
            throw error;
        }
    }
}
