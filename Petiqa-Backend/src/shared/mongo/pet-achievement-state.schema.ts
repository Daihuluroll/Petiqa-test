import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PetAchievementStateDocument = PetAchievementState & Document;

@Schema({
  collection: 'petiqa.achievement.state',
  timestamps: true,
  versionKey: false,
})
export class PetAchievementState {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  petId!: Types.ObjectId;

  @Prop({ required: true })
  achievementId!: string;

  @Prop({ default: false })
  completed!: boolean;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ default: false })
  claimed!: boolean;

  @Prop({ type: Date, default: null })
  claimedAt!: Date | null;
}

export const PetAchievementStateSchema =
  SchemaFactory.createForClass(PetAchievementState);
