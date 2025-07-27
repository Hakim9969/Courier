import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IParcel } from './interfaces/parcel.interface';
import { GeoService } from 'src/common/geo/geo.service';
import { UpdateParcelDto } from './dtos/update-parcel.dto';
import { CreateParcelDto } from './dtos/create-parcel.dto';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class ParcelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
    private readonly mailerService: MailerService,
  ) {}

  async create(dto: CreateParcelDto): Promise<IParcel> {
    try {
      const pickup = await this.geoService.geocode(dto.pickupAddress);
      const destination = await this.geoService.geocode(dto.destination);

      return this.prisma.parcel.create({
        data: {
          ...dto,
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
        },
      });
    } catch (error) {
      console.error('Parcel creation error:', error);
      throw new InternalServerErrorException('Parcel creation failed');
    }
  }

  async findAll(): Promise<IParcel[]> {
    return this.prisma.parcel.findMany({
      where: { deletedAt: null },
    });
  }

  async findOne(id: string): Promise<IParcel> {
    const parcel = await this.prisma.parcel.findUnique({ where: { id } });
    if (!parcel || parcel.deletedAt) {
      throw new NotFoundException('Parcel not found');
    }
    return parcel;
  }

  async update(id: string, dto: UpdateParcelDto): Promise<IParcel> {
    await this.findOne(id); // Ensure exists

    return this.prisma.parcel.update({
      where: { id },
      data: { ...dto },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id); // Ensure exists

    await this.prisma.parcel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async assignCourier(parcelId: string, courierId: string): Promise<IParcel> {
    console.log(`Attempting to assign courier ${courierId} to parcel ${parcelId}`);
    
    const [parcel, courier] = await Promise.all([
      this.prisma.parcel.findUnique({ where: { id: parcelId } }),
      this.prisma.courier.findUnique({ where: { id: courierId } }),
    ]);

    console.log('Parcel found:', parcel);
    console.log('Courier found:', courier);

    if (!parcel) throw new NotFoundException('Parcel not found');
    if (!courier) throw new NotFoundException('Courier not found');
    if (!courier.isAvailable)
      throw new BadRequestException('Courier is not available');

    console.log('All validations passed, updating courier availability...');

    // Update courier's availability
    await this.prisma.courier.update({
      where: { id: courierId },
      data: { isAvailable: false },
    });

    console.log('Courier availability updated, assigning to parcel...');

    // Assign courier to parcel
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { assignedCourierId: courierId },
    });

    console.log('Parcel updated:', updatedParcel);

    //  Notify customer
    const customer = await this.prisma.user.findUnique({
      where: { id: parcel.senderId },
    });
    
    console.log('Customer found for email:', customer);
    
    if (customer) {
      try {
        await this.mailerService.sendCourierAssignmentEmail(
          customer.email,
          courier.name,
          parcel.id,
        );
        console.log('Assignment email sent successfully');
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
      }
    }

    return updatedParcel;
  }
}