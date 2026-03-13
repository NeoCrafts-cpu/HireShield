const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

export function txUrl(hash: string): string {
  return `${SEPOLIA_EXPLORER}/tx/${hash}`;
}

export function addressUrl(addr: string): string {
  return `${SEPOLIA_EXPLORER}/address/${addr}`;
}

export function tokenUrl(addr: string, tokenId: string | number): string {
  return `${SEPOLIA_EXPLORER}/token/${addr}?a=${tokenId}`;
}

export function shortenAddress(addr: string, chars = 4): string {
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}
