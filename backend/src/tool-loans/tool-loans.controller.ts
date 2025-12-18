import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ToolLoansService } from './tool-loans.service';
import { CreateToolLoanDto } from './dto/create-tool-loan.dto';
import { UpdateToolLoanDto } from './dto/update-tool-loan.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('tool-loans')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class ToolLoansController {
  constructor(private readonly toolLoansService: ToolLoansService) {}

  @Get()
  findAll() {
    return this.toolLoansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolLoansService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateToolLoanDto) {
    return this.toolLoansService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateToolLoanDto) {
    return this.toolLoansService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toolLoansService.remove(id);
  }
}


