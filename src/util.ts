import { nanoid } from "nanoid";
import { CreatePasteDto } from "./data/types";

const crypto: Crypto = globalThis.crypto;

function getKeyMaterial(password: string) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ]);
}

export function binaryToBase64(buffer: ArrayBuffer | Uint8Array) {
  if (typeof window === "undefined") {
    return Buffer.from(buffer).toString("base64");
  }

  let bytes = new Uint8Array(buffer);
  let binary = "";
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToBinary(text: string) {
  if (typeof window === "undefined") {
    return new Uint8Array(Buffer.from(text, "base64"));
  }

  const input = window.atob(text);
  const bytes = new Uint8Array(input.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = input.charCodeAt(i);
  }
  return bytes;
}

export async function encrypt(plain: ArrayBuffer, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(64));
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await getKeyMaterial(password);
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plain
  );
  return {
    ciphertext,
    iv: binaryToBase64(iv),
    salt: binaryToBase64(salt),
  };
}

export async function decrypt(
  ciphertext: ArrayBuffer,
  password: string,
  ivEncoded: string,
  saltEncoded: string
) {
  const iv = base64ToBinary(ivEncoded);
  const salt = base64ToBinary(saltEncoded);

  const keyMaterial = await getKeyMaterial(password);
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return { plaintext };
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (_e) => resolve(reader.result as string);
    reader.onerror = (_e) => reject(reader.error);
    reader.onabort = (_e) => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
}
