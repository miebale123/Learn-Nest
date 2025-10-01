export interface GoogleRequest extends Request {
    user: {
        provider: string;
        providerId: string;
        email: string;
        accessToken?: string;
    };
}