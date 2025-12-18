import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    emailVerified?: boolean;
    verificationCode?: string;
    verificationCodeExpires?: Date;
  }): Promise<UserDocument> {
    const created = new this.userModel(data);
    return created.save();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}


