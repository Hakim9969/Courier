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
      console.log('ParcelService - Starting parcel creation with DTO:', JSON.stringify(dto, null, 2));
      
      const pickup = await this.geoService.geocode(dto.pickupAddress);
      const destination = await this.geoService.geocode(dto.destination);
      
      console.log('ParcelService - Geocoding completed. Pickup:', pickup, 'Destination:', destination);

      // Create the parcel
      const parcel = await this.prisma.parcel.create({
        data: {
          ...dto,
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedCourier: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log('ParcelService - Parcel created successfully:', JSON.stringify(parcel, null, 2));

      // Send email notifications
      console.log('ParcelService - Starting to send email notifications...');
      await this.sendParcelCreationEmails(parcel);

      return parcel;
    } catch (error) {
      console.error('Parcel creation error:', error);
      throw new InternalServerErrorException('Parcel creation failed');
    }
  }

  private async sendParcelCreationEmails(parcel: any): Promise<void> {
    try {
      console.log('ParcelService - sendParcelCreationEmails called with parcel:', JSON.stringify(parcel, null, 2));
      
      // Send email to sender
      if (parcel.sender?.email) {
        console.log('ParcelService - Sending email to sender:', parcel.sender.email);
        await this.mailerService.sendParcelCreationEmail(
          parcel.sender.email,
          parcel.sender.name,
          parcel.id,
          parcel.sender.name,
          parcel.receiverName,
          parcel.pickupAddress,
          parcel.destination,
          parcel.weightCategory
        );
        console.log('ParcelService - Email sent to sender successfully');
      } else {
        console.log('ParcelService - No sender email found or sender is null');
      }

      // Send email to receiver (if they have an account)
      if (parcel.receiver?.email) {
        console.log('ParcelService - Sending email to receiver:', parcel.receiver.email);
        await this.mailerService.sendParcelCreationEmail(
          parcel.receiver.email,
          parcel.receiver.name,
          parcel.id,
          parcel.sender.name,
          parcel.receiverName,
          parcel.pickupAddress,
          parcel.destination,
          parcel.weightCategory
        );
        console.log('ParcelService - Email sent to receiver successfully');
      } else {
        console.log('ParcelService - No receiver email found or receiver is null');
      }

      // Send email to assigned courier (if assigned)
      if (parcel.assignedCourier?.email) {
        console.log('ParcelService - Sending email to assigned courier:', parcel.assignedCourier.email);
        await this.mailerService.sendCourierParcelAssignmentEmail(
          parcel.assignedCourier.email,
          parcel.assignedCourier.name,
          parcel.id,
          parcel.sender.name,
          parcel.receiverName,
          parcel.pickupAddress,
          parcel.destination
        );
        console.log('ParcelService - Email sent to courier successfully');
      } else {
        console.log('ParcelService - No assigned courier or courier email not found');
      }

      console.log('ParcelService - All parcel creation emails sent successfully');
    } catch (error) {
      console.error('ParcelService - Failed to send parcel creation emails:', error);
      // Don't throw error here to avoid failing the parcel creation
      // Email sending failure shouldn't prevent parcel creation
    }
  }

  async findAll(): Promise<IParcel[]> {
    return this.prisma.parcel.findMany({
      where: { deletedAt: null },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findMyParcels(userId: string): Promise<IParcel[]> {
    console.log('Backend - findMyParcels service called with userId:', userId);
    
    const parcels = await this.prisma.parcel.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        deletedAt: null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    

    
    // Convert dates to ISO strings for frontend compatibility
    return parcels.map(parcel => ({
      ...parcel,
      createdAt: parcel.createdAt instanceof Date ? parcel.createdAt.toISOString() : parcel.createdAt,
      updatedAt: parcel.updatedAt instanceof Date ? parcel.updatedAt.toISOString() : parcel.updatedAt,
    })) as any;
  }

  async findAssignedParcels(courierId: string): Promise<IParcel[]> {
    const parcels = await this.prisma.parcel.findMany({
      where: {
        assignedCourierId: courierId,
        deletedAt: null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    

    
    // Convert dates to ISO strings for frontend compatibility
    return parcels.map(parcel => ({
      ...parcel,
      createdAt: parcel.createdAt instanceof Date ? parcel.createdAt.toISOString() : parcel.createdAt,
      updatedAt: parcel.updatedAt instanceof Date ? parcel.updatedAt.toISOString() : parcel.updatedAt,
    })) as any;
  }

  async findOne(id: string): Promise<IParcel> {
    const parcel = await this.prisma.parcel.findUnique({ 
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    if (!parcel || parcel.deletedAt) {
      throw new NotFoundException('Parcel not found');
    }
    return parcel;
  }

  async update(id: string, dto: UpdateParcelDto): Promise<IParcel> {
    await this.findOne(id); // Ensure exists

    // If addresses are being updated, geocode them
    let updateData: any = { ...dto };
    if (dto.pickupAddress || dto.destination) {
      if (dto.pickupAddress) {
        const pickup = await this.geoService.geocode(dto.pickupAddress);
        updateData = { ...updateData, pickupLat: pickup.lat, pickupLng: pickup.lng };
      }
      if (dto.destination) {
        const destination = await this.geoService.geocode(dto.destination);
        updateData = { ...updateData, destinationLat: destination.lat, destinationLng: destination.lng };
      }
    }

    return this.prisma.parcel.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
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
    // Check if parcel exists
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        assignedCourier: true
      }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Check if courier exists
    const courier = await this.prisma.user.findUnique({
      where: { id: courierId }
    });

    if (!courier || courier.role !== 'COURIER') {
      throw new NotFoundException('Courier not found');
    }

    // Update parcel with assigned courier
    return this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        assignedCourierId: courierId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async updateParcelStatusByCourier(parcelId: string, courierId: string, status: string): Promise<IParcel> {
    // Check if parcel exists and is assigned to this courier
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        assignedCourier: true
      }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    if (parcel.assignedCourierId !== courierId) {
      throw new BadRequestException('You can only update status of parcels assigned to you');
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    // Update parcel status
    return this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        status: status as any
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedCourier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }
}