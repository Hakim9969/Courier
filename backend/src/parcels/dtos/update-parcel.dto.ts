import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ParcelStatus, WeightCategory } from 'generated/prisma';

export class UpdateParcelDto {
  @IsEnum(ParcelStatus)
  @IsOptional()
  status?: ParcelStatus;

  @IsUUID()
  @IsOptional()
  assignedCourierId?: string;

  @IsString()
  @IsOptional()
  receiverName?: string;

  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  pickupAddress?: string;

  @IsEnum(WeightCategory)
  @IsOptional()
  weightCategory?: WeightCategory;
}