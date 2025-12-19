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
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('movements')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  findAll() {
    return this.movementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMovementDto) {
    return this.movementsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMovementDto) {
    return this.movementsService.update(id, dto);
  }

  @Put(':id/loan-status')
  @Roles(UserRole.ADMIN)
  updateLoanStatus(
    @Param('id') id: string,
    @Body() body: { loanStatus: 'PRETE' | 'RENDU' },
  ) {
    return this.movementsService.update(id, { loanStatus: body.loanStatus });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.movementsService.remove(id);
  }
}


