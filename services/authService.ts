import { api } from './api';

export interface RegisterDTO {
  fullName: string;
  identityNumber: string;
  phone: string;
  email?: string;
  password: string;
}
export interface CompleteProfileDTO {
  phone: string;
  identityNumber: string;
}
export interface LoginDTO {
  phone: string;
  password: string;
}

export interface VerifyPhoneDTO {
  phone: string;
  otp: string;
}

export interface ForgotPasswordDTO {
  phone: string;
}

export interface ResetPasswordDTO {
  phone: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    userType: 'resident' | 'user' | 'admin';
    profilePicture?: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    languagePreference: 'en' | 'ar';
    profileCompleted?: boolean;
  };
}

export const authService = {
  // Register new user
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Verify phone with OTP
  verifyPhone: async (data: VerifyPhoneDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-phone', data);
    return response.data;
  },

  completeProfile: async (data: CompleteProfileDTO): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/complete-profile', data);
  return response.data;
},
  // Resend OTP
  resendOTP: async (phone: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-otp', { phone });
    return response.data;
  },

  // Request password reset
  forgotPassword: async (data: ForgotPasswordDTO): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (data: ResetPasswordDTO): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },

  // Refresh token (future implementation)
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh-token');
    return response.data;
  },
};
