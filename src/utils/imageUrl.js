const DRIVE_FILE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?id=([^&]+)/,
];

export function normalizeImageUrl(url) {
  if (!url) {
    return '';
  }

  const trimmedUrl = String(url).trim();

  for (const pattern of DRIVE_FILE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  return trimmedUrl;
}
