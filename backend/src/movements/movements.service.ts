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
      // Les entrées augmentent toujours le stock
      await this.stockService.increaseStock(dto.productId, dto.quantity);
    } else {
      // Pour les sorties (prêts), on NE diminue PAS le stock
      // Le stock reste le même, seule la quantité disponible change (calculée dynamiquement)
      // Le stock ne change que lors des changements de statut (PRETE <-> RENDU)
    }

    const created = new this.movementModel({
      productId: dto.productId,
      technicianId: dto.technicianId,
      quantity: dto.quantity,
      type: dto.type,
      comment: dto.comment,
      invoiceNumber: dto.invoiceNumber,
      invoiceAttachment: dto.invoiceAttachment,
      loanStatus: dto.type === 'SORTIE' ? (dto.loanStatus || 'PRETE') : undefined,
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
    const existingMovement = await this.movementModel.findById(id).exec();
    if (!existingMovement) {
      throw new NotFoundException('Movement not found');
    }

    // Pour les changements de statut de prêt, on ne modifie PAS le stock
    // La quantité totale reste la même, seule la quantité disponible change (calculée dynamiquement)
    // Le stock ne change que lors des entrées/sorties réelles (ENTREE/SORTIE sans prêt)

    const movement = await this.movementModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    
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


