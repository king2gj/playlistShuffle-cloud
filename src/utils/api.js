import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (!token) return config;
  return {
    ...config,
    headers: { ...config.headers, Authorization: `Bearer ${token}` },
  };
});

// JWTs are just base64url-encoded JSON split by dots (header.payload.signature) — decoding
// the payload client-side (without verifying the signature, since that's the server's job)
// is enough to read the userId it carries, without needing an extra jwt-decoding dependency.
export function decodeJwtPayload(token) {
  const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64Payload));
}

export default api;
