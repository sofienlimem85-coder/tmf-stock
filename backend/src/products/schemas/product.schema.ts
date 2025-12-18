import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export type ProductStatus = 'disponible' | 'stock_vide';
export type ProductType = 'TYPE1' | 'TYPE2';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ index: true })
  normalizedName?: string;

  @Prop({ required: true, min: 0, default: 0 })
  quantity!: number;

  @Prop()
  invoiceNumber?: string;

  @Prop()
  invoiceAttachment?: string;

  @Prop({ required: true, default: 'TYPE1', enum: ['TYPE1', 'TYPE2'] })
  type!: ProductType;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
