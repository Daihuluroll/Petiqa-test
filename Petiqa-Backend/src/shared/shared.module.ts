import { Module } from '@nestjs/common';
import { LogUtilService } from './services/log-util.service';

@Module({
  providers: [LogUtilService],
  exports: [LogUtilService],
})
export class SharedModule {}
