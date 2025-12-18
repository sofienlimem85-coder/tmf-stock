import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Technician,
  TechnicianDocument,
} from './schemas/technician.schema';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<TechnicianDocument>,
  ) {}

  create(dto: CreateTechnicianDto) {
    const created = new this.technicianModel(dto);
    return created.save();
  }

  findAll() {
    return this.technicianModel.find().exec();
  }

  async findOne(id: string) {
    const technician = await this.technicianModel.findById(id).exec();
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    const technician = await this.technicianModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }

  async remove(id: string) {
    const technician = await this.technicianModel.findByIdAndDelete(id).exec();
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }
}


