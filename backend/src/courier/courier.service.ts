import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourierDto } from './dtos/create-courier.dto';
import { ICourier } from './interfaces/courier.interface';
import { UpdateCourierDto } from './dtos/update-courier.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourierDto): Promise<ICourier> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ 
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
        role: 'COURIER',
        isAvailable: true
      }
    });
    return user as ICourier;
  }

  async findAll(): Promise<ICourier[]> {
    const users = await this.prisma.user.findMany({
      where: { 
        role: 'COURIER',
        deletedAt: null 
      },
    });
    return users as ICourier[];
  }

  async findOne(id: string): Promise<ICourier> {
    const courier = await this.prisma.user.findFirst({
      where: { 
        id,
        role: 'COURIER'
      },
    });
    if (!courier || courier.deletedAt) {
      throw new NotFoundException('Courier not found');
    }
    return courier as ICourier;
  }

  async update(id: string, dto: UpdateCourierDto): Promise<ICourier> {
    const courier = await this.findOne(id);
    const updatedUser = await this.prisma.user.update({
      where: { id: courier.id },
      data: dto,
    });
    return updatedUser as ICourier;
  }

  async softDelete(id: string): Promise<void> {
    const courier = await this.findOne(id);
    await this.prisma.user.update({
      where: { id: courier.id },
      data: { deletedAt: new Date() },
    });
  }

  async search(query: string): Promise<ICourier[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: 'COURIER',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        deletedAt: null,
      },
      take: 10, // Limit results
    });
    return users as ICourier[];
  }

  async updateAvailability(courierId: string, isAvailable: boolean): Promise<ICourier> {
    const courier = await this.findOne(courierId);
    const updatedUser = await this.prisma.user.update({
      where: { id: courier.id },
      data: { isAvailable },
    });
    return updatedUser as ICourier;
  }
}