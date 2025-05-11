import { createSecretKey } from 'crypto';

//AUTHORIZATION TOKEN
export const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '24h';
export const JWT_KEY = createSecretKey(process.env.JWT_KEY || "secret_key");
export const ISSUER = process.env.JWT_ISSUER || 'http://localhost:3000';
export const AUDIENCE = process.env.JWT_AUDIENCE || 'http://localhost:5173';