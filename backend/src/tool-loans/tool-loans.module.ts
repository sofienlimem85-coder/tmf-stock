import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ToolLoan, ToolLoanSchema } from './schemas/tool-loan.schema';
import { ToolLoansService } from './tool-loans.service';
import { ToolLoansController } from './tool-loans.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ToolLoan.name, schema: ToolLoanSchema }]),
  ],
  providers: [ToolLoansService],
  controllers: [ToolLoansController],
})
export class ToolLoansModule {}


