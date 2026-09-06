/**
 * Darkroom client-side API — main thread ↔ WebWorker architecture.
 *
 * Exports:
 * - Protocol types for worker messaging
 * - EXIF / RAF / image dimension parsers
 * - Demosaic algorithms (Fujifilm, Sony, generic Bayer)
 * - Worker client factory for main-thread usage
 */

export * from "./protocol";
export * from "./parsers/exif";
export * from "./parsers/image";
export * from "./parsers/raf";
export { demosaic, detectCfaPattern, CfaPattern } from "./demosaic";
export type { DemosaicResult, DemosaicOptions } from "./demosaic";
export { createImageWorkerClient } from "./worker-client";
export { renderDemosaic } from "./shaders/raf";
// worker.ts is a WebWorker entry point — imported via new URL in worker-client.ts
