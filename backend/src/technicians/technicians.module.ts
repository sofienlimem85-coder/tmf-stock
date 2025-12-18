import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Technician,
  TechnicianSchema,
} from './schemas/technician.schema';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Technician.name, schema: TechnicianSchema },
    ]),
  ],
  providers: [TechniciansService],
  controllers: [TechniciansController],
})
export class TechniciansModule {}


