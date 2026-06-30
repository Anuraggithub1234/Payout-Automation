import * as OTPAuth from 'otpauth';

export function generateOTP(secret: string): string {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  });

  return totp.generate();
}