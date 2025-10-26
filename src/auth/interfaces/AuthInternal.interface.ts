export interface AuthInternal {
  userEmail: string;
  accessToken: string;
  refreshToken?: string;
  message: string;
}
