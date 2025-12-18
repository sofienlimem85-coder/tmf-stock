import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movement, MovementDocument } from './schemas/movement.schema';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { StockService } from './stock.service';

@Injectable()
export class MovementsService {
  constructor(
    @InjectModel(Movement.name)
    private readonly movementModel: Model<MovementDocument>,
    private readonly stockService: StockService,
  ) {}

  async create(dto: CreateMovementDto) {
    if (dto.type === 'ENTREE') {
      await this.stockService.increaseStock(dto.productId, dto.quantity);
    } else {
      await this.stockService.decreaseStock(dto.productId, dto.quantity);
    }

    const created = new this.movementModel({
      productId: dto.productId,
      technicianId: dto.technicianId,
      quantity: dto.quantity,
      type: dto.type,
      comment: dto.comment,
    });
    return created.save();
  }

  findAll() {
    return this.movementModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const movement = await this.movementModel.findById(id).exec();
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    return movement;
  }

  async update(id: string, dto: UpdateMovementDto) {
    const movement = await this.movementModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    return movement;
  }

  async remove(id: string) {
    const movement = await this.movementModel.findByIdAndDelete(id).exec();
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    return movement;
  }
}


