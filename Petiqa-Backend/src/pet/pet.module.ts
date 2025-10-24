import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { PetProfile, PetProfileSchema } from '../shared/mongo/pet-profile.schema';
import {
  PetWalletTransaction,
  PetWalletTransactionSchema,
} from '../shared/mongo/pet-wallet-transaction.schema';
import { PetTaskCycle, PetTaskCycleSchema } from '../shared/mongo/pet-task-cycle.schema';
import {
  PetAchievementState,
  PetAchievementStateSchema,
} from '../shared/mongo/pet-achievement-state.schema';
import { PetEventLog, PetEventLogSchema } from '../shared/mongo/pet-event-log.schema';
import { PetActivityLog, PetActivityLogSchema } from '../shared/mongo/pet-activity-log.schema';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature(
      [
        { name: PetProfile.name, schema: PetProfileSchema },
        { name: PetWalletTransaction.name, schema: PetWalletTransactionSchema },
        { name: PetTaskCycle.name, schema: PetTaskCycleSchema },
        { name: PetAchievementState.name, schema: PetAchievementStateSchema },
        { name: PetEventLog.name, schema: PetEventLogSchema },
        { name: PetActivityLog.name, schema: PetActivityLogSchema },
      ],
      'petiqa',
    ),
  ],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
