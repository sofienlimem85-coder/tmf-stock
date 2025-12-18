import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(base64Image: string, folder: string = 'tmf-stock'): Promise<string> {
    try {
      // Extraire le type MIME et les données base64
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
      }

      const imageType = matches[1];
      const imageData = matches[2];

      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${imageType};base64,${imageData}`,
        {
          folder: folder,
          resource_type: 'auto',
        }
      );

      return result.secure_url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image to Cloudinary: ${errorMessage}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete image from Cloudinary: ${errorMessage}`);
    }
  }
}


