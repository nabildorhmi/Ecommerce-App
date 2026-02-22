import { apiClient } from '../../../shared/api/client';
import type { User } from '../store';

// ---- Login ----

export interface LoginResponse {
  token: string;
  user: User;
}

export async function loginApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return res.data;
}

// ---- Register ----

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address_city?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export async function registerApi(data: RegisterData): Promise<RegisterResponse> {
  const res = await apiClient.post<RegisterResponse>('/auth/register', data);
  return res.data;
}

// ---- Logout ----

export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}

// ---- Update profile ----

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address_city?: string | null;
  address_street?: string | null;
}

export type UpdateProfileResponse = User;

export async function updateProfileApi(
  data: UpdateProfileData
): Promise<UpdateProfileResponse> {
  const res = await apiClient.put<UpdateProfileResponse>('/user', data);
  return res.data;
}

// ---- Change password ----

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function changePasswordApi(
  data: ChangePasswordData
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/user/password', data);
  return res.data;
}

// ---- Forgot password ----

export async function forgotPasswordApi(
  email: string
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return res.data;
}

// ---- Reset password ----

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export async function resetPasswordApi(
  data: ResetPasswordData
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/reset-password', data);
  return res.data;
}
