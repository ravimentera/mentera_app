export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    medspaId: string;
    providerId: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    medspaId: string;
    providerId: string;
  };
  token?: string;
  message?: string;
}
