import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type FindAllOptions = {
  search?: string;
  type?: 'TYPE1' | 'TYPE2';
  sortBy?: 'name' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  create(dto: CreateProductDto) {
    const created = new this.productModel(dto);
    return created.save();
  }

  async findAll(options: FindAllOptions = {}) {
    const {
      search,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = options;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const productsWithStatus = data.map((product) => ({
      ...product.toObject(),
      status: this.getStatus(product.quantity),
    }));

    return {
      data: productsWithStatus,
      total,
      page,
      limit,
      hasNextPage: skip + limit < total,
    };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const productObj = product.toObject();
    return {
      ...productObj,
      status: this.getStatus(product.quantity),
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const productObj = product.toObject();
    return {
      ...productObj,
      status: this.getStatus(product.quantity),
    };
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private getStatus(quantity: number): ProductStatus {
    return quantity > 0 ? 'disponible' : 'stock_vide';
  }
}


