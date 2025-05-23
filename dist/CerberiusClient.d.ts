export declare class CerberiusClient {
    private apiKey;
    private apiSecret;
    private httpClient;
    constructor(apiKey: string, apiSecret: string);
    private _generateAuthHeaders;
    emailLookup(emails: string[]): Promise<any>;
    ipLookup(ips: string[]): Promise<any>;
    promptCheck(prompt: string): Promise<any>;
}
