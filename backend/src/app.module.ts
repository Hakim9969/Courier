import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourierModule } from './courier/courier.module';
import { ParcelModule } from './parcels/parcel.module';
import { AppMailerModule } from './mailer/mailer.module';
import { ParcelEventsModule } from './parcel-events/parcel-events.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, CourierModule, ParcelModule, AppMailerModule, ParcelEventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
