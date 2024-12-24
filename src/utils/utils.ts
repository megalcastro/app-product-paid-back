import * as crypto from 'crypto';

export function generateSignature({reference, amount_in_cents, currency, }) {
    const integrityKey = process.env.INTEGRITY_KEY;
    const key = reference + amount_in_cents + currency + integrityKey;

    const hash = crypto.createHash('sha256');
    hash.update(key);
    const hashHex = hash.digest('hex');
    return hashHex;
  }
