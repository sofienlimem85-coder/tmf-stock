import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // Mot de passe hashé (bcrypt)
  @Prop({ required: true })
  password!: string;

  @Prop({ default: UserRole.USER, enum: UserRole })
  role!: UserRole;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop()
  verificationCode?: string;

  @Prop()
  verificationCodeExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


