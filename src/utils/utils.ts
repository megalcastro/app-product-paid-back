import * as crypto from 'crypto';


export async function encrypt({ reference,amount, currency }) {
    const integrityKey = process.env.INTEGRITY_KEY;
    const key = reference + amount + currency + integrityKey;

    const hash = crypto.createHash('sha256');
    hash.update(key);
    const hashHex = hash.digest('hex');
    return hashHex;
}
