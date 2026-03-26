import * as openpgp from 'openpgp';

export interface PgpKeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PgpPublicKey {
  publicKey: string;
  fingerprint: string;
  userId: string;
}

export interface EncryptResult {
  encrypted: string;
  signature?: string;
}

export interface DecryptResult {
  decrypted: string;
  signedBy?: string;
  verified: boolean;
}

export class PgpService {
  private privateKeys = new Map<string, openpgp.PrivateKey>();
  private publicKeys = new Map<string, openpgp.PublicKey>();

  async generateKeyPair(
    name: string,
    email: string,
    passphrase: string,
    expirationDays?: number,
  ): Promise<PgpKeyPair> {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 4096,
      userIDs: [{ name, email }],
      passphrase,
      keyExpirationTime: expirationDays ? expirationDays * 86400 : undefined,
    });

    const pubKey = await openpgp.readKey({ armoredKey: publicKey });
    const fingerprint = pubKey.getFingerprint().toUpperCase();

    return {
      publicKey,
      privateKey,
      fingerprint,
      userId: `${name} <${email}>`,
      createdAt: new Date(),
      expiresAt: expirationDays
        ? new Date(Date.now() + expirationDays * 86400000)
        : undefined,
    };
  }

  async importPublicKey(armoredKey: string): Promise<PgpPublicKey> {
    const key = await openpgp.readKey({ armoredKey });
    const fingerprint = key.getFingerprint().toUpperCase();
    const userId = key.getUserIDs()[0] || 'Unknown';
    this.publicKeys.set(fingerprint, key);
    return { publicKey: armoredKey, fingerprint, userId };
  }

  async importPrivateKey(armoredKey: string, passphrase: string): Promise<string> {
    const key = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey }),
      passphrase,
    });
    const fingerprint = key.getFingerprint().toUpperCase();
    this.privateKeys.set(fingerprint, key);
    this.publicKeys.set(fingerprint, key.toPublic());
    return fingerprint;
  }

  async encrypt(
    text: string,
    recipientFingerprints: string[],
    signerFingerprint?: string,
  ): Promise<EncryptResult> {
    const encryptionKeys = recipientFingerprints
      .map((fp) => this.publicKeys.get(fp))
      .filter((k): k is openpgp.PublicKey => !!k);

    if (encryptionKeys.length === 0) {
      throw new Error('No valid recipient keys found');
    }

    const signingKey = signerFingerprint
      ? this.privateKeys.get(signerFingerprint)
      : undefined;

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text }),
      encryptionKeys,
      ...(signingKey && { signingKeys: signingKey }),
    });

    return { encrypted: encrypted as string };
  }

  async decrypt(
    encryptedText: string,
    decryptFingerprint: string,
    senderFingerprint?: string,
  ): Promise<DecryptResult> {
    const privateKey = this.privateKeys.get(decryptFingerprint);
    if (!privateKey) throw new Error('Private key not found');

    const verificationKeys = senderFingerprint
      ? this.publicKeys.get(senderFingerprint)
      : undefined;

    const message = await openpgp.readMessage({ armoredMessage: encryptedText });
    const { data, signatures } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey,
      ...(verificationKeys && { verificationKeys }),
    });

    let verified = false;
    let signedBy: string | undefined;

    if (signatures.length > 0) {
      try {
        await signatures[0].verified;
        verified = true;
        signedBy = signatures[0].keyID.toHex().toUpperCase();
      } catch {
        verified = false;
      }
    }

    return { decrypted: data as string, signedBy, verified };
  }

  async sign(text: string, signerFingerprint: string): Promise<string> {
    const privateKey = this.privateKeys.get(signerFingerprint);
    if (!privateKey) throw new Error('Private key not found');

    const signed = await openpgp.sign({
      message: await openpgp.createCleartextMessage({ text }),
      signingKeys: privateKey,
    });

    return signed as string;
  }

  async verify(signedText: string, signerFingerprint: string): Promise<boolean> {
    const publicKey = this.publicKeys.get(signerFingerprint);
    if (!publicKey) throw new Error('Public key not found');

    try {
      const message = await openpgp.readCleartextMessage({ cleartextMessage: signedText });
      const { signatures } = await openpgp.verify({
        message,
        verificationKeys: publicKey,
      });
      await signatures[0].verified;
      return true;
    } catch {
      return false;
    }
  }

  getLoadedKeys(): Array<{ fingerprint: string; userId: string; hasPrivate: boolean }> {
    const result: Array<{ fingerprint: string; userId: string; hasPrivate: boolean }> = [];
    for (const [fp, key] of this.publicKeys) {
      result.push({
        fingerprint: fp,
        userId: key.getUserIDs()[0] || 'Unknown',
        hasPrivate: this.privateKeys.has(fp),
      });
    }
    return result;
  }
}
