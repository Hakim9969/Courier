import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CourierService } from './courier.service';
import { CreateCourierDto } from './dtos/create-courier.dto';
import { UpdateCourierDto } from './dtos/update-courier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../common/guards/roles-guard';
import { Roles } from '../common/decorators/roles-decorator';
import { ICourier } from './interfaces/courier.interface';

@Controller('couriers')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createCourierDto: CreateCourierDto): Promise<ICourier> {
    return this.courierService.create(createCourierDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(): Promise<ICourier[]> {
    return this.courierService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  search(@Query('q') query: string): Promise<ICourier[]> {
    return this.courierService.search(query);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  getProfile(@Request() req): Promise<ICourier> {
    return this.courierService.findOne(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  updateProfile(@Request() req, @Body() updateCourierDto: UpdateCourierDto): Promise<ICourier> {
    return this.courierService.update(req.user.sub, updateCourierDto);
  }

  @Patch('availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  updateAvailability(@Request() req, @Body() body: { isAvailable: boolean }): Promise<ICourier> {
    return this.courierService.updateAvailability(req.user.sub, body.isAvailable);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string): Promise<ICourier> {
    return this.courierService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateCourierDto: UpdateCourierDto): Promise<ICourier> {
    return this.courierService.update(id, updateCourierDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string): Promise<void> {
    return this.courierService.softDelete(id);
  }
}