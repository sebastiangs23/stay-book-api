import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
};

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION || '';
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: UploadedFile, folder = 'rooms'): Promise<string> {
    try {
      const extension = file.originalname.split('.').pop();
      const fileName = `${folder}/${randomUUID()}.${extension}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }

  async uploadFiles(
    files: UploadedFile[],
    folder = 'rooms',
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }

  async deleteFileByUrl(fileUrl: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(fileUrl);

      if (!key) {
        return;
      }

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error deleting file from S3');
    }
  }

  async deleteFilesByUrls(fileUrls: string[]): Promise<void> {
    await Promise.all(fileUrls.map((url) => this.deleteFileByUrl(url)));
  }

  private getKeyFromUrl(fileUrl: string): string | null {
    try {
      const url = new URL(fileUrl);

      /**
       * Example URL:
       * https://my-bucket.s3.us-east-1.amazonaws.com/rooms/abc.png
       *
       * pathname:
       * /rooms/abc.png
       *
       * key:
       * rooms/abc.png
       */
      return decodeURIComponent(url.pathname.substring(1));
    } catch (error) {
      console.error('Invalid S3 URL:', fileUrl);
      return null;
    }
  }
}
