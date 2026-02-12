export function formatSize(bytes: number): string {
  return Math.abs(bytes) > 1024 ? (bytes / 1024).toFixed(1) + ' KB' : bytes + ' B'
}
