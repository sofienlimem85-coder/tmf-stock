import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ToolLoanDocument = HydratedDocument<ToolLoan>;

export type ToolLoanStatus = 'EN_COURS' | 'RETARD' | 'DISPONIBLE';

@Schema({ timestamps: true })
export class ToolLoan {
  @Prop({ required: true })
  toolName!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ unique: true, sparse: true })
  serialNumber?: string;

  @Prop()
  technicianId?: string;

  @Prop({ required: true, default: () => new Date() })
  loanedAt!: Date;

  @Prop()
  dueDate?: Date;

  @Prop({ required: true, enum: ['EN_COURS', 'RETARD', 'DISPONIBLE'] })
  status!: ToolLoanStatus;

  @Prop()
  notes?: string;
}

export const ToolLoanSchema = SchemaFactory.createForClass(ToolLoan);


