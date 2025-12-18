import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ToolLoan, ToolLoanDocument } from './schemas/tool-loan.schema';
import { CreateToolLoanDto } from './dto/create-tool-loan.dto';
import { UpdateToolLoanDto } from './dto/update-tool-loan.dto';

@Injectable()
export class ToolLoansService {
  constructor(
    @InjectModel(ToolLoan.name)
    private readonly toolLoanModel: Model<ToolLoanDocument>,
  ) {}

  create(dto: CreateToolLoanDto) {
    const toCreate: Partial<ToolLoan> = {
      toolName: dto.toolName,
      category: dto.category,
      serialNumber: dto.serialNumber,
      technicianId: dto.technicianId,
      status: dto.status,
      notes: dto.notes,
    };

    if (dto.loanedAt) {
      toCreate.loanedAt = new Date(dto.loanedAt);
    }
    if (dto.dueDate) {
      toCreate.dueDate = new Date(dto.dueDate);
    }

    const created = new this.toolLoanModel(toCreate);
    return created.save();
  }

  findAll() {
    return this.toolLoanModel.find().exec();
  }

  async findOne(id: string) {
    const loan = await this.toolLoanModel.findById(id).exec();
    if (!loan) {
      throw new NotFoundException('Tool loan not found');
    }
    return loan;
  }

  async update(id: string, dto: UpdateToolLoanDto) {
    const toUpdate: Partial<ToolLoan> = {
      toolName: dto.toolName,
      category: dto.category,
      serialNumber: dto.serialNumber,
      technicianId: dto.technicianId,
      status: dto.status,
      notes: dto.notes,
    };

    if (dto.loanedAt) {
      toUpdate.loanedAt = new Date(dto.loanedAt);
    }
    if (dto.dueDate) {
      toUpdate.dueDate = new Date(dto.dueDate);
    }

    const loan = await this.toolLoanModel
      .findByIdAndUpdate(id, toUpdate, { new: true })
      .exec();
    if (!loan) {
      throw new NotFoundException('Tool loan not found');
    }
    return loan;
  }

  async remove(id: string) {
    const loan = await this.toolLoanModel.findByIdAndDelete(id).exec();
    if (!loan) {
      throw new NotFoundException('Tool loan not found');
    }
    return loan;
  }
}


