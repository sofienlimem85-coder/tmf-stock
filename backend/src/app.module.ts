import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TechniciansModule } from './technicians/technicians.module';
import { MovementsModule } from './movements/movements.module';
import { ToolLoansModule } from './tool-loans/tool-loans.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/tmf_stock',
    ),
    UsersModule,
    AuthModule,
    ProductsModule,
    TechniciansModule,
    MovementsModule,
    ToolLoansModule,
    CloudinaryModule,
    EmailModule,
  ],
})
export class AppModule {}


