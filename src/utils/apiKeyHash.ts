import { createHash, timingSafeEqual } from 'node:crypto';

export function hashApiKey(rawKey: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${rawKey}`, 'utf8').digest('hex');
}

export function constantTimeEqualHex(leftHex: string, rightHex: string): boolean {
  const left = Buffer.from(leftHex, 'hex');
  const right = Buffer.from(rightHex, 'hex');

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
