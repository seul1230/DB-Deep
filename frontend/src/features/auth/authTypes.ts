export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  email: string;
  imageUrl: string | null;
  passwordNotChanged: boolean;
  name: string;
  teamName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
}

export interface LoginApiResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    profile: UserProfile;
  };
}
