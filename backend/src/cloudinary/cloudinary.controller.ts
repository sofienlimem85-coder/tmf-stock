import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CloudinaryService } from './cloudinary.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('cloudinary')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async uploadImage(@Body() body: { image: string; folder?: string }) {
    const { image, folder } = body;
    if (!image) {
      throw new Error('Image is required');
    }
    const url = await this.cloudinaryService.uploadImage(image, folder);
    return { url };
  }
}


