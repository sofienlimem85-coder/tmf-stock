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
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('technicians')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTechnicianDto) {
    return this.techniciansService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.techniciansService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.techniciansService.remove(id);
  }
}


