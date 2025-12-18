import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Movement, MovementSchema } from './schemas/movement.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { StockService } from './stock.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movement.name, schema: MovementSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [MovementsService, StockService],
  controllers: [MovementsController],
})
export class MovementsModule {}


