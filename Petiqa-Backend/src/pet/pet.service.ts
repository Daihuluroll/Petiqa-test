import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LogUtilService } from '../shared/services/log-util.service';
import { CustomException } from '../shared/exceptions/custom.exception';
import { CommonError } from '../shared/errors/common.error';
import { ErrorDto } from '../shared/exceptions/error.dto';
import {
  PetProfile,
  PetProfileDocument,
  InventoryEntry,
  InventoryItemKind,
  StatusSnapshot,
  WalletSnapshot,
} from '../shared/mongo/pet-profile.schema';
import {
  PetWalletTransaction,
  PetWalletTransactionDocument,
  WalletCurrency,
} from '../shared/mongo/pet-wallet-transaction.schema';
import {
  PetTaskCycle,
  PetTaskCycleDocument,
  PetTaskState,
} from '../shared/mongo/pet-task-cycle.schema';
import {
  PetAchievementState,
  PetAchievementStateDocument,
} from '../shared/mongo/pet-achievement-state.schema';
import {
  PetEventLog,
  PetEventLogDocument,
} from '../shared/mongo/pet-event-log.schema';
import {
  PetActivityLog,
  PetActivityLogDocument,
} from '../shared/mongo/pet-activity-log.schema';
import {
  CreatePetDto,
  UpdatePetNameDto,
  UpdatePetStatusDto,
  TickPetStatusDto,
  UpdateWalletDto,
  UpdateInventoryDto,
  UseInventoryItemDto,
  CompleteTaskDto,
  ActivityCompleteDto,
  CreateEventDto,
  ProgressQueryDto,
} from './dto';

@Injectable()
export class PetService {
  constructor(
    private readonly logger: LogUtilService,
    @InjectModel(PetProfile.name, 'petiqa')
    private readonly petModel: Model<PetProfileDocument>,
    @InjectModel(PetWalletTransaction.name, 'petiqa')
    private readonly walletTxModel: Model<PetWalletTransactionDocument>,
    @InjectModel(PetTaskCycle.name, 'petiqa')
    private readonly taskCycleModel: Model<PetTaskCycleDocument>,
    @InjectModel(PetAchievementState.name, 'petiqa')
    private readonly achievementModel: Model<PetAchievementStateDocument>,
    @InjectModel(PetEventLog.name, 'petiqa')
    private readonly eventLogModel: Model<PetEventLogDocument>,
    @InjectModel(PetActivityLog.name, 'petiqa')
    private readonly activityLogModel: Model<PetActivityLogDocument>,
  ) {
    this.logger.setContext(PetService.name);
  }

  /**
   * Create a brand new pet profile with the provided defaults.
   */
  async createPet(dto: CreatePetDto): Promise<PetProfileDocument> {
    const existing = await this.petModel.exists({ petName: dto.petName });
    if (existing) {
      this.logAndThrow(
        {
          ...CommonError.PETIQA.PET_ALREADY_EXISTS,
          message: 'Pet name already taken',
        },
        `${this.createPet.name}: duplicate pet name`,
        { petName: dto.petName },
      );
    }

    const pet = new this.petModel({
      petName: dto.petName,
      character: dto.character ?? null,
      inventory: new Map<string, InventoryEntry>(),
    });

    return pet.save();
  }

  /**
   * Fetch a pet profile by id or throw a not-found exception.
   */
  async getPetById(petId: string): Promise<PetProfileDocument> {
    const pet = await this.petModel.findById(this.toObjectId(petId));
    if (!pet) {
      this.logAndThrow(
        CommonError.PETIQA.PET_NOT_FOUND,
        `${this.getPetById.name}: pet not found`,
        { petId },
      );
    }
    return pet;
  }

  /**
   * Update pet identity (name/character) while ensuring uniqueness.
   */
  async updatePetIdentity(
    petId: string,
    dto: UpdatePetNameDto,
  ): Promise<PetProfileDocument> {
    const pet = await this.getPetById(petId);

    if (dto.petName && dto.petName !== pet.petName) {
      const exists = await this.petModel.exists({ petName: dto.petName });
      if (exists) {
        this.logAndThrow(
          {
            ...CommonError.PETIQA.PET_ALREADY_EXISTS,
            message: 'Pet name already taken',
          },
          `${this.updatePetIdentity.name}: duplicate pet name`,
          { petId, petName: dto.petName },
        );
      }
      pet.petName = dto.petName;
    }

    if (dto.character !== undefined) {
      pet.character = dto.character ?? null;
    }

    return pet.save();
  }

  /**
   * Return the current snapshot of lifecycle metrics.
   */
  async getPetStatus(petId: string): Promise<StatusSnapshot> {
    const pet = await this.getPetById(petId);
    return pet.status;
  }

  /**
   * Apply direct (set) or incremental (inc) updates to lifecycle metrics.
   */
  async updatePetStatus(
    petId: string,
    dto: UpdatePetStatusDto,
  ): Promise<StatusSnapshot> {
    if (!dto.set && !dto.inc) {
      this.logAndThrow(
        CommonError.PETIQA.NO_STATUS_UPDATES,
        `${this.updatePetStatus.name}: empty status update payload`,
        { petId, dto },
      );
    }

    const pet = await this.getPetById(petId);
    const updated = { ...pet.status };

    if (dto.set) {
      updated.energy = this.clamp(dto.set.energy ?? updated.energy);
      updated.happiness = this.clamp(dto.set.happiness ?? updated.happiness);
      updated.hunger = this.clamp(dto.set.hunger ?? updated.hunger);
      updated.health = this.clamp(dto.set.health ?? updated.health);
    }

    if (dto.inc) {
      updated.energy = this.clamp(updated.energy + (dto.inc.energy ?? 0));
      updated.happiness = this.clamp(
        updated.happiness + (dto.inc.happiness ?? 0),
      );
      updated.hunger = this.clamp(updated.hunger + (dto.inc.hunger ?? 0));
      updated.health = this.clamp(updated.health + (dto.inc.health ?? 0));
    }

    pet.status = { ...updated, updatedAt: new Date() };
    await pet.save();
    return pet.status;
  }

  /**
   * Derive status drift for passive gameplay (e.g. every N minutes).
   */
  async tickPetStatus(
    petId: string,
    dto: TickPetStatusDto,
  ): Promise<StatusSnapshot> {
    const minutes = dto.deltaMinutes ?? 5;
    const decay = Math.floor(minutes / 5);
    const adjustment: UpdatePetStatusDto = {
      inc: {
        energy: Math.min(5, decay),
        hunger: -decay,
        happiness: -decay,
      },
      source: 'tick',
    };
    return this.updatePetStatus(petId, adjustment);
  }

  /**
   * Return the latest wallet snapshot.
   */
  async getWallet(petId: string): Promise<WalletSnapshot> {
    const pet = await this.getPetById(petId);
    return pet.wallet;
  }

  /**
   * Apply wallet changes (set or increment) and persist transaction rows.
   */
  async updateWallet(
    petId: string,
    dto: UpdateWalletDto,
  ): Promise<WalletSnapshot> {
    if (!dto.set && !dto.inc) {
      this.logAndThrow(
        CommonError.PETIQA.NO_WALLET_UPDATES,
        `${this.updateWallet.name}: empty wallet update payload`,
        { petId, dto },
      );
    }

    const pet = await this.getPetById(petId);
    const original = { ...pet.wallet };
    const updated = { ...pet.wallet };

    if (dto.set) {
      if (dto.set.coins !== undefined) {
        updated.coins = Math.max(0, dto.set.coins);
      }
      if (dto.set.points !== undefined) {
        updated.points = Math.max(0, dto.set.points);
      }
    }

    if (dto.inc) {
      if (dto.inc.coins) {
        updated.coins = Math.max(0, updated.coins + dto.inc.coins);
      }
      if (dto.inc.points) {
        updated.points = Math.max(0, updated.points + dto.inc.points);
      }
    }

    pet.wallet = { ...updated, updatedAt: new Date() };
    await pet.save();

    await this.persistWalletTransaction(
      pet._id,
      WalletCurrency.COIN,
      updated.coins - original.coins,
      updated.coins,
      dto,
    );
    await this.persistWalletTransaction(
      pet._id,
      WalletCurrency.POINT,
      updated.points - original.points,
      updated.points,
      dto,
    );

    return pet.wallet;
  }

  /**
   * Retrieve wallet transactions (optionally filtered by currency).
   */
  async getWalletTransactions(
    petId: string,
    currency?: WalletCurrency,
    limit = 50,
  ): Promise<PetWalletTransactionDocument[]> {
    const query: Record<string, any> = {
      petId: this.toObjectId(petId),
    };
    if (currency) {
      query.currency = currency;
    }

    return this.walletTxModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Return inventory entries. Supports optional item filtering.
   */
  async getInventory(
    petId: string,
    items?: string[],
  ): Promise<Record<string, InventoryEntry>> {
    const pet = await this.getPetById(petId);
    const raw = pet.inventory ?? new Map<string, InventoryEntry>();
    const result: Record<string, InventoryEntry> = {};
    for (const [key, value] of raw.entries()) {
      if (!items || items.includes(key)) {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Apply incremental adjustments to inventory quantities.
   */
  async updateInventory(
    petId: string,
    dto: UpdateInventoryDto,
  ): Promise<Record<string, InventoryEntry>> {
    const pet = await this.getPetById(petId);
    const inventory = pet.inventory ?? new Map<string, InventoryEntry>();

    dto.adjustments.forEach((adj) => {
      const existing = inventory.get(adj.item) ?? {
        name: adj.item,
        kind: InventoryItemKind.MISC,
        quantity: 0,
        updatedAt: new Date(),
      };
      const newQuantity = existing.quantity + adj.delta;
      if (newQuantity < 0) {
        this.logAndThrow(
          {
            ...CommonError.PETIQA.INVENTORY_NEGATIVE_DELTA,
            message: `Cannot reduce ${adj.item} below zero (requested delta: ${adj.delta})`,
          },
          `${this.updateInventory.name}: invalid inventory delta`,
          {
            petId,
            item: adj.item,
            delta: adj.delta,
            currentQuantity: existing.quantity,
          },
        );
      }

      inventory.set(adj.item, {
        ...existing,
        quantity: newQuantity,
        updatedAt: new Date(),
      });
    });

    pet.inventory = inventory;
    await pet.save();
    return this.getInventory(petId);
  }

  /**
   * Consume inventory entries and optionally cascade status updates.
   */
  async useInventoryItem(
    petId: string,
    dto: UseInventoryItemDto,
  ): Promise<Record<string, InventoryEntry>> {
    const quantity = dto.quantity ?? 1;
    const adjustments = [{ item: dto.item, delta: -quantity }];
    const result = await this.updateInventory(petId, { adjustments });

    if (dto.applyEffects) {
      await this.updatePetStatus(petId, {
        inc: { energy: 5, happiness: 2 },
        source: 'item',
      });
    }

    return result;
  }

  /**
   * Return daily task state for the current cycle (today).
   */
  async getDailyTasks(petId: string): Promise<PetTaskState[]> {
    const cycle = await this.ensureTaskCycle(petId);
    return cycle.tasks ?? [];
  }

  /**
   * Mark a task complete and award its reward if configured.
   */
  async completeTask(
    petId: string,
    taskId: string,
    dto: CompleteTaskDto,
  ): Promise<PetTaskState> {
    const cycle = await this.ensureTaskCycle(petId);
    const tasks = cycle.tasks ?? [];
    const target = tasks.find((t) => t.taskId === taskId);
    if (!target) {
      this.logAndThrow(
        CommonError.PETIQA.TASK_NOT_FOUND,
        `${this.completeTask.name}: task missing`,
        { petId, taskId },
      );
    }
    if (target.rewardClaimed) {
      return target;
    }

    target.completed = true;
    target.completedAt = new Date();
    target.rewardClaimed = true;
    target.claimedAt = new Date();

    await this.updateWallet(petId, {
      inc:
        target.rewardCurrency === 'coin'
          ? { coins: target.rewardAmount }
          : { points: target.rewardAmount },
      reason: `Task reward: ${taskId}`,
      metadata: { source: dto.source ?? 'task' },
    });

    await cycle.save();
    return target;
  }

  /**
   * Retrieve achievement state documents.
   */
  async getAchievements(
    petId: string,
  ): Promise<PetAchievementStateDocument[]> {
    return this.achievementModel
      .find({ petId: this.toObjectId(petId) })
      .sort({ achievementId: 1 })
      .exec();
  }

  /**
   * Mark an achievement as claimed/completed.
   */
  async claimAchievement(
    petId: string,
    achievementId: string,
  ): Promise<PetAchievementStateDocument> {
    const doc =
      (await this.achievementModel.findOne({
        petId: this.toObjectId(petId),
        achievementId,
      })) ??
      new this.achievementModel({
        petId: this.toObjectId(petId),
        achievementId,
      });

    doc.completed = true;
    doc.claimed = true;
    doc.completedAt = doc.completedAt ?? new Date();
    doc.claimedAt = new Date();
    await doc.save();
    return doc;
  }

  /**
   * Persist an activity completion log, applying effects where required.
   */
  async recordActivityCompletion(
    petId: string,
    activityId: string,
    dto: ActivityCompleteDto,
  ): Promise<PetActivityLogDocument> {
    if (dto.effects?.status) {
      await this.updatePetStatus(petId, {
        inc: dto.effects.status,
        source: 'activity',
      });
    }

    if (dto.effects?.wallet) {
      for (const walletChange of dto.effects.wallet) {
        const currency =
          walletChange.currency === WalletCurrency.POINT
            ? WalletCurrency.POINT
            : WalletCurrency.COIN;
        await this.updateWallet(petId, {
          inc:
            currency === WalletCurrency.COIN
              ? { coins: walletChange.amount }
              : { points: walletChange.amount },
          reason: `Activity reward: ${activityId}`,
          metadata: dto.metadata,
        });
      }
    }

    if (dto.effects?.inventory) {
      await this.updateInventory(petId, {
        adjustments: dto.effects.inventory.map((i) => ({
          item: i.item,
          delta: i.delta,
        })),
      });
    }

    const log = new this.activityLogModel({
      petId: this.toObjectId(petId),
      activityId,
      result: dto.result,
      effects: dto.effects,
      metadata: dto.metadata ?? {},
    });

    await log.save();
    return log;
  }

  /**
   * Append an event log entry for a pet.
   */
  async logEvent(
    petId: string,
    dto: CreateEventDto,
  ): Promise<PetEventLogDocument> {
    const event = new this.eventLogModel({
      petId: this.toObjectId(petId),
      type: dto.type,
      description: dto.description,
      effects: dto.effects ?? {},
      metadata: dto.metadata ?? {},
    });
    await event.save();
    return event;
  }

  /**
   * Aggregate progress sections for dashboards.
   */
  async getProgress(
    petId: string,
    dto: ProgressQueryDto,
  ): Promise<Record<string, unknown>> {
    const include =
      dto.include ?? ['status', 'wallet', 'inventory', 'tasks', 'achievements'];
    const response: Record<string, unknown> = {};

    if (include.includes('status')) {
      response.status = await this.getPetStatus(petId);
    }

    if (include.includes('wallet')) {
      response.wallet = await this.getWallet(petId);
    }

    if (include.includes('inventory')) {
      response.inventory = await this.getInventory(petId);
    }

    if (include.includes('tasks')) {
      response.tasks = await this.getDailyTasks(petId);
    }

    if (include.includes('achievements')) {
      response.achievements = await this.getAchievements(petId);
    }

    return response;
  }

  // Constrain status adjustments within allowed range to avoid underflow/overflow.
  private clamp(value: number, min = 0, max = 100): number {
    return Math.min(max, Math.max(min, value));
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      this.logAndThrow(
        CommonError.PETIQA.INVALID_IDENTIFIER,
        `${this.toObjectId.name}: invalid identifier`,
        { id },
      );
    }
    return new Types.ObjectId(id);
  }

  private async persistWalletTransaction(
    petId: Types.ObjectId,
    currency: WalletCurrency,
    delta: number,
    balance: number,
    dto: UpdateWalletDto,
  ) {
    if (!delta) {
      return;
    }
    await this.walletTxModel.create({
      petId,
      currency,
      amount: delta,
      balanceAfter: balance,
      reason: dto.reason,
      metadata: dto.metadata ?? {},
    });
  }

  private async ensureTaskCycle(
    petId: string,
  ): Promise<PetTaskCycleDocument> {
    const cycleKey = new Date().toISOString().substring(0, 10);
    return (
      (await this.taskCycleModel.findOne({
        petId: this.toObjectId(petId),
        cycleKey,
      })) ??
      (await this.taskCycleModel.create({
        petId: this.toObjectId(petId),
        cycleKey,
        tasks: [],
      }))
    );
  }

  private logAndThrow(
    error: ErrorDto,
    logMessage: string,
    details?: Record<string, unknown>,
  ): never {
    this.logger.error(logMessage, details ? JSON.stringify(details) : undefined);
    throw new CustomException(details ? { ...error, details } : error);
  }
}
