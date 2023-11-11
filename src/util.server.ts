import { createDecipheriv, pbkdf2 } from "node:crypto";

export function decrypt(
  ciphertext: string,
  password: string,
  ivEncoded: string,
  saltEncoded: string
) {
  return new Promise<{ plaintext: string }>(async (resolve, reject) => {
    const iv = Buffer.from(ivEncoded, "base64");
    const salt = Buffer.from(saltEncoded, "base64");

    const key = await new Promise<Buffer>((resolve, reject) => {
      pbkdf2(password, salt, 100000, 32, "sha512", (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    const decipher = createDecipheriv("aes-256-gcm", key, iv);

    let plaintext = "";
    decipher.on("readable", () => {
      let chunk;
      while (null !== (chunk = decipher.read())) {
        plaintext += chunk.toString("utf8");
      }
    });
    decipher.on("end", () => {
      resolve({ plaintext });
    });
    decipher.on("error", (e) => {
      reject(e);
    });

    decipher.write(ciphertext, "base64");
    decipher.end();
  });
}
