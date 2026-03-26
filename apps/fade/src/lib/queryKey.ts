export function fileHandleKey(
  handle: { kind: 'file', name: string } | null,
): string | null {
  return handle ? `file:${handle.name}` : null
}

export function directoryHandleKey(
  handle: { kind: 'directory', name: string } | null,
): string | null {
  return handle ? `dir:${handle.name}` : null
}
