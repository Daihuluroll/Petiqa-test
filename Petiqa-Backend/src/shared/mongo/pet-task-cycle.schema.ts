import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskRewardCurrency {
  COIN = 'coin',
  POINT = 'point',
}

@Schema({ _id: false })
export class PetTaskState {
  @Prop({ required: true })
  taskId!: string;

  @Prop({ default: false })
  completed!: boolean;

  @Prop({ default: false })
  rewardClaimed!: boolean;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ type: Date, default: null })
  claimedAt!: Date | null;

  @Prop({ enum: TaskRewardCurrency, required: true })
  rewardCurrency!: TaskRewardCurrency;

  @Prop({ min: 0, required: true })
  rewardAmount!: number;
}

export const PetTaskStateSchema = SchemaFactory.createForClass(PetTaskState);

@Schema({
  collection: 'petiqa.task.cycles',
  timestamps: true,
  autoIndex: true,
  versionKey: false,
})
export class PetTaskCycle {
  @Prop({ type: Types.ObjectId, ref: 'PetProfile', index: true, required: true })
  petId!: Types.ObjectId;

  @Prop({ required: true })
  cycleKey!: string;

  @Prop({ type: [PetTaskStateSchema], default: [] })
  tasks!: PetTaskState[];
}

export type PetTaskCycleDocument = PetTaskCycle & Document;
export const PetTaskCycleSchema = SchemaFactory.createForClass(PetTaskCycle);
PetTaskCycleSchema.index({ petId: 1, cycleKey: 1 }, { unique: true });
