import axios from 'axios';
import { http } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
}
export interface AuthResponse {
  accessToken: string;
  user: User;
}

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';
const MOCK_USER_KEY = 'feedbackiq-mock-user';

// In sample-data mode there is no server, so sign-in is simulated in the browser (demo only).
async function mockAuth(email: string, name?: string): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 250));
  const user: User = { id: 1, name: name ?? email.split('@')[0], email };
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  return { accessToken: 'mock-token', user };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (useMock) return mockAuth(email);
  return (await http.post<AuthResponse>('/api/auth/login', { email, password })).data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  if (useMock) return mockAuth(email, name);
  return (await http.post<AuthResponse>('/api/auth/register', { name, email, password })).data;
}

export async function fetchMe(): Promise<User> {
  if (useMock) {
    const raw = localStorage.getItem(MOCK_USER_KEY);
    if (!raw) throw new Error('not signed in');
    return JSON.parse(raw) as User;
  }
  return (await http.get<User>('/api/auth/me')).data;
}

/** Turns an API error into a short message a customer can act on. */
export function authErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'We could not reach the server. Check your connection and try again.';
    const detail = err.response.data?.detail;
    if (typeof detail === 'string') return detail;
    if (err.response.status === 422) return 'Please check the details you entered and try again.';
  }
  return 'Something went wrong. Please try again.';
}
