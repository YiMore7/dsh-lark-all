/**
 * Inbound resource download/storage and outbound media handling for the
 * Feishu/Lark channel. Everything here is transport-agnostic: downloads go
 * through the channel port (which owns the SDK client), storage goes to the
 * configured inbox directory, and outbound sources are validated before the
 * SDK's own uploader reads them (the SDK additionally enforces its built-in
 * SSRF guard and POSIX blocklist on URL / path sources).
 */
import type { Config } from './config.js';
/** Resource types a Feishu message can carry (as normalized by the SDK). */
export type InboundResourceType = 'file' | 'audio' | 'video' | 'sticker';
/** One downloaded inbound resource, ready to describe to the model. */
export interface StoredInboundResource {
    type: InboundResourceType;
    /** Original file name when Feishu provided one. */
    fileName: string;
    /** Absolute path of the stored file under the inbox directory. */
    path: string;
    /** Stored byte length. */
    bytes: number;
    /** Optional audio/video duration in milliseconds. */
    durationMs?: number;
    /** Text preview (text-like files only, truncated to the configured limit). */
    preview?: string;
}
/** Outbound media attached to a model reply or a `/bot-send-*` command. */
export type OutboundMediaKind = 'file' | 'image' | 'audio' | 'video';
/** A validated outbound media item ready for `channel.send`. */
export interface OutboundMedia {
    kind: OutboundMediaKind;
    /** Buffer or local path / http(s) URL understood by the SDK uploader. */
    source: string | Buffer;
    fileName: string;
}
/** Markers the model can emit to attach media to a reply. */
export type OutboundMarkerKind = OutboundMediaKind | 'doc';
/**
 * Download one inbound resource and store it under the inbox directory.
 * `downloader` resolves a file key to bytes (the message-resource endpoint
 * for audio/video, the plain file endpoint for files). Audio/video first try
 * the generic 'file' type — which works for most deployments, mirroring the
 * larksuite/openclaw-lark implementation — and fall back to the concrete
 * type on failure.
 */
export declare function storeInboundResource(downloader: (fileKey: string, type: 'file' | 'audio' | 'video') => Promise<Buffer>, config: Config, resource: {
    type: InboundResourceType;
    fileKey: string;
    fileName?: string;
    durationMs?: number;
}, chatKey: string, log: {
    warn(message: string, ...args: unknown[]): void;
}): Promise<StoredInboundResource | undefined>;
/**
 * Extract `[lark-file: ...]`-style markers from a model reply. Returns the
 * cleaned text and the parsed markers (deduplicated, in order). Markers are
 * removed from the text so the visible reply stays clean; the caller sends
 * each media item after the text pages.
 */
export declare function extractMediaMarkers(text: string, config: Config, log: {
    warn(message: string, ...args: unknown[]): void;
}): {
    text: string;
    markers: Array<{
        kind: OutboundMediaKind | 'doc';
        source: string;
    }>;
};
/**
 * Build the list of outbound media for one reply: model markers first, then
 * image blocks (kept for backward compatibility). `resolveSource` turns each
 * marker into validated media; failures are logged and skipped so one bad
 * attachment never blocks the whole reply.
 */
export declare function buildOutboundMedia(markers: Array<{
    kind: OutboundMediaKind | 'doc';
    source: string;
}>, config: Config, log: {
    warn(message: string, ...args: unknown[]): void;
}): Promise<{
    media: OutboundMedia[];
    failures: string[];
}>;
/**
 * Validate one outbound media source: resolve local paths against the
 * configured allowlist (realpath-checked, so symlinks cannot escape) and
 * enforce the per-kind size cap. Buffers are size-checked directly; URLs
 * cannot be pre-flighted and are capped by the SDK's own 50MB URL fetch.
 */
export declare function resolveOutboundMedia(kind: OutboundMediaKind, source: string | Buffer, config: Config): Promise<OutboundMedia>;
/** True when a file name extension looks like a text file worth previewing. */
export declare function isTextLike(fileName: string, data: Uint8Array): boolean;
/** Decode a text preview capped at `limit` chars; undefined for binary files. */
export declare function textPreview(data: Uint8Array, fileName: string, limit: number): string | undefined;
/** Strip markdown/code wrappers and surrounding quotes from a media source. */
export declare function cleanSource(value: string): string;
/** Reject a local path outside the allowed directories (realpath-aware). */
export declare function assertInsideAllowedDirs(filePath: string, allowedDirs: readonly string[]): void;
/** A filesystem-safe display name (no separators, no traversal). */
export declare function sanitizeFileName(name: string): string;
export declare function isAbsoluteOrUrl(value: string): boolean;
