import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovementDocument = HydratedDocument<Movement>;

export type MovementType = 'ENTREE' | 'SORTIE';
export type LoanStatus = 'PRETE' | 'RENDU';

@Schema({ timestamps: true })
export class Movement {
  @Prop({ required: true })
  productId!: string;

  @Prop()
  technicianId?: string;

  @Prop({ required: true, min: 0 })
  quantity!: number;

  @Prop({ required: true, enum: ['ENTREE', 'SORTIE'] })
  type!: MovementType;

  @Prop()
  comment?: string;

  @Prop()
  invoiceNumber?: string;

  @Prop()
  invoiceAttachment?: string;

  @Prop({ enum: ['PRETE', 'RENDU'], default: null })
  loanStatus?: LoanStatus;
}

export const MovementSchema = SchemaFactory.createForClass(Movement);


