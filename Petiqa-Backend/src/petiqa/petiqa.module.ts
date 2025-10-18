import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PetiqaController } from './petiqa.controller';
import { PetiqaService } from './petiqa.service';
import { SharedModule } from '../shared/shared.module';
import { LoggingInterceptor } from '../shared/interceptors/logging.interceptor';
import { PetModule } from '../pet/pet.module';

@Module({
  imports: [
    SharedModule,
    PetModule,
  ],
  controllers: [PetiqaController],
  providers: [
    PetiqaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class PetiqaModule {}
