import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getCurrentStock(productId: string): Promise<number> {
    const product = await this.productModel
      .findById(productId)
      .select('quantity')
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product.quantity ?? 0;
  }

  async increaseStock(productId: string, quantity: number) {
    const updated = await this.productModel
      .findOneAndUpdate(
        { _id: productId },
        { $inc: { quantity: quantity } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return updated.quantity;
  }

  async decreaseStock(productId: string, quantity: number) {
    const updated = await this.productModel
      .findOneAndUpdate(
        { _id: productId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true },
      )
      .exec();

    if (!updated) {
      const current = await this.productModel
        .findById(productId)
        .select('quantity')
        .exec();
      if (!current) {
        throw new NotFoundException('Product not found');
      }
      throw new BadRequestException('Insufficient stock for this product');
    }

    return updated.quantity;
  }
}


