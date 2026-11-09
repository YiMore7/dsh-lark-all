/**
 * Feishu Drive large-file upload. IM messages cap file uploads at 20MB, so
 * oversized outbound files are uploaded to Drive with the multipart flow
 * (upload_prepare → upload_part × N → upload_finish) and the resulting
 * share URL is sent instead. Requires drive permissions on the app.
 */
import type { Client } from '@larksuiteoapi/node-sdk';
/** A file uploaded to Drive with its share link. */
export interface DriveUpload {
    fileToken: string;
    url: string;
    fileName: string;
}
/**
 * Upload `data` to the app's Drive root via multipart upload and return
 * the file token plus share URL. Chunk size is fixed by Feishu (4MB);
 * the number of blocks comes from the prepare response.
 */
export declare function uploadFileToDrive(client: Client, fileName: string, data: Buffer): Promise<DriveUpload>;
