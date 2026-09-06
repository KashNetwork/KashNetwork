import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

/** scrypt hash, self-describing string: `scrypt$<saltHex>$<hashHex>` */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const dk = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return `scrypt$${salt.toString('hex')}$${dk.toString('hex')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1]!, 'hex');
  const expected = Buffer.from(parts[2]!, 'hex');
  const dk = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return dk.length === expected.length && timingSafeEqual(dk, expected);
}

export function passwordStrengthError(plain: string): string | null {
  if (plain.length < 8) return 'Password must be at least 8 characters.';
  if (plain.length > 200) return 'Password is too long.';
  return null;
}
