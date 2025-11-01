import { AllowedMimeTypes } from "../../config/file-upload-management";
import { BaseWooService } from "../services/base-woo.service";
import fs from "fs";
import path from "path";

export interface MediaUploadResponse {
  id: number;
  source_url: string;
  [key: string]: any;
}

export class WooMediaService extends BaseWooService {
  private readonly endpoint = "/wp-json/wp/v2/media";

  async uploadMediaFromBase64(
    base64Data: string,
    fileName: string
  ): Promise<MediaUploadResponse> {
    // Remove data:image/jpeg;base64, prefix if present
    const cleanBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const fileBuffer = Buffer.from(cleanBase64, "base64");
    return this.uploadMediaFromBuffer(fileBuffer, fileName);
  }

  async uploadMediaFromPath(filePath: string): Promise<MediaUploadResponse> {
    const fileName = path.basename(filePath);
    const fileBuffer = await fs.promises.readFile(filePath);
    return this.uploadMediaFromBuffer(fileBuffer, fileName);
  }

  async uploadMediaFromBuffer(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<MediaUploadResponse> {
    const contentType = this.getMimeTypeFromExtension(fileName);
    const boundary = this.generateBoundary();
    const payload = this.createMultipartPayload(
      fileName,
      fileBuffer,
      contentType,
      boundary
    );

    const response = await this.api.post(this.endpoint, payload, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": String(payload.length),
      },
    });

    return response.data;
  }

  private getMimeTypeFromExtension(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap: Record<string, string> = AllowedMimeTypes;
    return mimeMap[ext] || "application/octet-stream";
  }

  private generateBoundary(): string {
    return "----ElectronFormBoundary" + Date.now();
  }

  private createMultipartPayload(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
    boundary: string
  ): Buffer {
    const crlf = "\r\n";
    const header =
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"${crlf}` +
      `Content-Type: ${contentType}${crlf}${crlf}`;
    const footer = `${crlf}--${boundary}--${crlf}`;

    return Buffer.concat([
      Buffer.from(header, "utf8"),
      fileBuffer,
      Buffer.from(footer, "utf8"),
    ]);
  }
}
