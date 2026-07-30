import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    const url = new URL(config.getOrThrow<string>('CLOUDINARY_URL'));
    cloudinary.config({
      cloud_name: url.hostname,
      api_key: url.username,
      api_secret: url.password,
    });
  }

  uploadVideo(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'afrilingua/lessons' },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new InternalServerErrorException('Cloudinary upload failed'));
            return;
          }
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }
}
