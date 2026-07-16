import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ScanError } from "@/lib/scan/errors";

const blockedHostSuffixes = [".local", ".internal", ".localhost"];

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIp(address: string) {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) {
    const normalized = address.toLowerCase();
    const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    if (mappedIpv4) return isPrivateIpv4(mappedIpv4);
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb") ||
      normalized.startsWith("2001:db8:")
    );
  }
  return true;
}

export function normalizeCompanyUrl(input: string) {
  const value = input.trim();
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new ScanError("invalid_url", "Enter a valid public company website.", 400);
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new ScanError("invalid_url", "Enter a public http or https company website.", 400);
  }

  url.hash = "";
  url.search = "";
  return url;
}

export async function assertPublicUrl(url: URL) {
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    blockedHostSuffixes.some((suffix) => hostname.endsWith(suffix)) ||
    (isIP(hostname) && isPrivateIp(hostname))
  ) {
    throw new ScanError("blocked_url", "That address is not a public company website.", 400);
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new ScanError("unreachable_url", "We could not find that website. Check the address and try again.", 422);
  }

  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new ScanError("blocked_url", "That address is not a public company website.", 400);
  }
}
