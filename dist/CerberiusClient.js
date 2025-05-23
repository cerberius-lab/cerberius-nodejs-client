"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CerberiusClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
class CerberiusClient {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.httpClient = axios_1.default.create({
            baseURL: 'https://service.cerberius.com/api',
        });
    }
    _generateAuthHeaders() {
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
    async emailLookup(emails) {
        try {
            const headers = this._generateAuthHeaders();
            const response = await this.httpClient.post('/email-lookup', { emails }, { headers });
            return response.data;
        }
        catch (error) {
            // Basic error handling
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.data}`);
            }
            throw error;
        }
    }
    async ipLookup(ips) {
        try {
            const headers = this._generateAuthHeaders();
            const response = await this.httpClient.post('/ip-lookup', { ips }, { headers });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.data}`);
            }
            throw error;
        }
    }
    async promptCheck(prompt) {
        try {
            const headers = this._generateAuthHeaders();
            const response = await this.httpClient.post('/prompt-check', { prompt }, { headers });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new Error(`API Error: ${error.response.status} ${error.response.data}`);
            }
            throw error;
        }
    }
}
exports.CerberiusClient = CerberiusClient;
