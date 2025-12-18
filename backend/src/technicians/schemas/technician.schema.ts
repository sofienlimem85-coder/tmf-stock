import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TechnicianDocument = HydratedDocument<Technician>;

@Schema({ timestamps: true })
export class Technician {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  team!: string;

  @Prop()
  phone?: string;
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);


