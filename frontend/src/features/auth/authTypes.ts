export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface LoginApiResponse {
    isSuccess: boolean;
    code: number;
    message: string;
    result: {
      accessToken: string;
      refreshToken: string;
    };
  }