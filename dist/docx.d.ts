/**
 * Feishu cloud document (docx) helpers: create a docx from markdown and
 * read a docx's markdown content. Both go through the SDK's docx client
 * (`docx.v1.document`) and need the app to have docx document permissions
 * on the Feishu open platform.
 */
import type { Client } from '@larksuiteoapi/node-sdk';
/** A docx created from markdown. */
export interface CreatedDocx {
    documentId: string;
    /** Feishu shareable URL. */
    url: string;
    title: string;
}
/**
 * Create a docx titled `title` and fill it with `markdown` content.
 * Uses the documented flow: create the document, convert markdown to
 * blocks, then insert the blocks as descendants of the root block.
 */
export declare function createDocxFromMarkdown(client: Client, title: string, markdown: string): Promise<CreatedDocx>;
/** Read a docx's markdown content via the docs content endpoint. */
export declare function readDocxMarkdown(client: Client, documentId: string): Promise<string>;
