import pako from 'pako';
import base64url from 'base64-url';
import {Buffer} from "buffer"

/**
 * Compresses a JSON object to a URL-safe base64 string.
 * @param jsonData The object to compress.
 * @returns URL-safe base64 string.
 */
export function compressJsonToUrlSafe(jsonData: object): string {
  const jsonString = JSON.stringify(jsonData);
  const compressed = pako.deflate(jsonString);
  const compressedBase64 = Buffer.from(compressed).toString('base64');
  return base64url.escape(compressedBase64);
}

/**
 * Decompresses a URL-safe base64 string back into a JSON object.
 * @param encoded URL-safe base64 string.
 * @returns Parsed JSON object.
 */
export function decompressUrlSafeToJson<T = unknown>(encoded: string): T {
  const base64 = base64url.unescape(encoded);
  const compressedBuffer = Buffer.from(base64, 'base64');
  const decompressed = pako.inflate(compressedBuffer, { to: 'string' });
  return JSON.parse(decompressed) as T;
}