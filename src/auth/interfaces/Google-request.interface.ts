export interface GoogleRequest extends Request {
    user: {
        provider: string;
        providerId: string;
        email: string;
        firstName?: string;
        lastName?: string;
        picture?: string;
        accessToken?: string;
    };
}