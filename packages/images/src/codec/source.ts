/** The smallest thing the readers need from a photo on disk. */
export interface ImageSource {
  readonly mimeType: string | undefined;
  /** Resolve the bytes; the caller owns where they come from. */
  getFile: () => Promise<File>;
}
