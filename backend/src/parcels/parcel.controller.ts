import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ParcelService } from './parcel.service';
import { RolesGuard } from 'src/common/guards/roles-guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { Roles } from 'src/common/decorators/roles-decorator';
import { CreateParcelDto } from './dtos/create-parcel.dto';
import { IParcel } from './interfaces/parcel.interface';
import { UpdateParcelDto } from './dtos/update-parcel.dto';
import { AssignCourierDto } from './dtos/assign-courier.dto';
import { Role } from 'generated/prisma';

@Controller('parcels')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Get('test')
  test(): string {
    console.log('Backend - Test endpoint called');
    return 'Backend is working!';
  }

  @Get('my-parcels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findMyParcels(@Request() req): Promise<IParcel[]> {
    return this.parcelService.findMyParcels(req.user.sub);
  }

  @Get('assigned-parcels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COURIER)
  findAssignedParcels(@Request() req): Promise<IParcel[]> {
    return this.parcelService.findAssignedParcels(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateParcelDto): Promise<IParcel> {
    console.log('ParcelController - Create endpoint called with DTO:', JSON.stringify(dto, null, 2));
    return this.parcelService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(): Promise<IParcel[]> {
    return this.parcelService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string): Promise<IParcel> {
    return this.parcelService.findOne(id);
  }

  @Patch('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  assignCourier(@Body() dto: AssignCourierDto): Promise<IParcel> {
    return this.parcelService.assignCourier(dto.parcelId, dto.courierId);
  }

  @Patch('update-status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COURIER)
  updateParcelStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req,
  ): Promise<IParcel> {
    return this.parcelService.updateParcelStatusByCourier(id, req.user.sub, body.status);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateParcelDto,
  ): Promise<IParcel> {
    return this.parcelService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string): Promise<void> {
    return this.parcelService.softDelete(id);
  }
}