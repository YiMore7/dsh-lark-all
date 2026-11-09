import type { Context } from '@deepseek-ai/cordis';
import type { ImageMediaType } from '@deepseek-ai/dsh-attachment';
import type { ContentBlock } from '@deepseek-ai/dsh-llm';
import type { NormalizedMessage } from '@larksuiteoapi/node-sdk';
import type { LarkChannelPort } from './channel-port.js';
import type { Config } from './config.js';
/** Options passed by the bridge to enrich inbound content with media. */
export interface InboundMediaHandlers {
    /** Download a file/audio/video resource of one message (message-resource endpoint). */
    downloadResource(fileKey: string, type: 'file' | 'audio' | 'video'): Promise<Buffer>;
    /** Read a Feishu docx's markdown content; absent when disabled. */
    readDocx?(documentId: string): Promise<string>;
}
/** Build durable DSH content blocks from one normalized Lark message. */
export declare function inboundContent(ctx: Context, config: Config, channel: LarkChannelPort, message: NormalizedMessage, includeImages?: boolean, textOverride?: string, media?: InboundMediaHandlers): Promise<ContentBlock[]>;
/** Detect image formats accepted by Harness attachments from magic bytes. */
export declare function detectImageMediaType(data: Uint8Array): ImageMediaType;
