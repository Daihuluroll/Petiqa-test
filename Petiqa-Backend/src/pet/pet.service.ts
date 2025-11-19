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
      status: dto.initialStatus ?? {},
      initialStatus: dto.initialStatus ?? {},
      wallet: dto.initialWallet ?? {},
      inventory: dto.initialInventory ?? {},
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
   * Fetch a pet profile by petName (unique name). Returns the document or throws not-found.
   */
  async getPetByName(petName: string): Promise<PetProfileDocument> {
    const pet = await this.petModel.findOne({ petName });
    if (!pet) {
      this.logAndThrow(
        CommonError.PETIQA.PET_NOT_FOUND,
        `${this.getPetByName.name}: pet not found`,
        { petName },
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
    const updated = {
      energy: pet.status.energy ?? 100,
      happiness: pet.status.happiness ?? 100,
      hunger: pet.status.hunger ?? 100,
      health: pet.status.health ?? 100,
    };

    console.log('Updating status for pet', petId, 'current status:', pet.status, 'dto:', dto);

    if (dto.set) {
      console.log('dto.set values:', dto.set);
      if (dto.set.energy !== undefined) updated.energy = this.clamp(dto.set.energy);
      if (dto.set.happiness !== undefined) updated.happiness = this.clamp(dto.set.happiness);
      if (dto.set.hunger !== undefined) updated.hunger = this.clamp(dto.set.hunger);
      if (dto.set.health !== undefined) updated.health = this.clamp(dto.set.health);
      console.log('updated object after set:', updated);
    }

    if (dto.inc) {
      updated.energy = this.clamp(updated.energy + (dto.inc.energy ?? 0));
      updated.happiness = this.clamp(
        updated.happiness + (dto.inc.happiness ?? 0),
      );
      updated.hunger = this.clamp(updated.hunger + (dto.inc.hunger ?? 0));
      updated.health = this.clamp(updated.health + (dto.inc.health ?? 0));
    }

    pet.status.energy = updated.energy;
    pet.status.happiness = updated.happiness;
    pet.status.hunger = updated.hunger;
    pet.status.health = updated.health;
    pet.status.updatedAt = new Date();
    pet.markModified('status');
    console.log('Saving new status:', pet.status);
    await pet.save();
    console.log('Status saved successfully for pet', petId);
    return pet.status;
  }

  /**
   * Derive status drift for passive gameplay (e.g. every N minutes).
   */
  async tickPetStatus(
    petId: string,
    dto: TickPetStatusDto,
  ): Promise<StatusSnapshot> {
    const adjustment: UpdatePetStatusDto = {
      inc: {
        energy: Math.floor((dto.deltaMinutes ?? 0.5) * 10),
        hunger: Math.floor((dto.deltaMinutes ?? 0.5) * -10),
        happiness: Math.floor((dto.deltaMinutes ?? 0.5) * -20),
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
    const updated = {
      coins: pet.wallet.coins ?? 0,
      points: pet.wallet.points ?? 0,
    };

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

    pet.wallet.coins = updated.coins;
    pet.wallet.points = updated.points;
    pet.wallet.updatedAt = new Date();
    pet.markModified('wallet');
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
    let raw = pet.inventory;
    if (raw instanceof Map) {
      raw = Object.fromEntries(raw);
    } else if (!raw) {
      raw = {};
    }
    const result: Record<string, InventoryEntry> = {};
    for (const [key, value] of Object.entries(raw)) {
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
    let inventory = pet.inventory;
    if (inventory instanceof Map) {
      inventory = Object.fromEntries(inventory);
    } else if (!inventory) {
      inventory = {};
    }

    dto.adjustments.forEach((adj) => {
      const kind = this.getItemKind(adj.item);
      const existing = inventory[adj.item] ?? {
        name: adj.item,
        kind,
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

      inventory[adj.item] = {
        ...existing,
        quantity: newQuantity,
        updatedAt: new Date(),
      };
    });

    // Always assign the inventory to ensure it's an object
    pet.inventory = inventory;

    // Mark the entire inventory field as modified for object changes
    pet.markModified('inventory');

    console.log('Saving inventory for pet', petId, 'inventory size:', Object.keys(inventory).length);
    await pet.save();
    console.log('Inventory saved successfully for pet', petId);
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

    if (dto.applyEffects && dto.inc) {
      await this.updatePetStatus(petId, {
        inc: dto.inc,
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
      amount: Math.abs(delta),
      balanceAfter: balance,
      reason: dto.reason,
      metadata: { ...(dto.metadata ?? {}), type: delta > 0 ? 'credit' : 'debit' },
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

  private getItemKind(itemName: string): InventoryItemKind {
    const foodItems = ['Pet Food', 'Treats', 'Chocolate Cake', 'Salad', 'Sausage', 'Potato Chips', 'Pizza', 'Fruits'];
    const toyItems = ['Gaming Console', 'Football', 'Piano', 'Darts', 'Taiko Drum', 'Book'];
    const cosmeticItems = ['Top Hat', 'Police Hat', 'Soldier Helm', 'Bow Tie', 'Suit Tie', 'Gold Chain', 'Police Badge', 'Baseball Cap', 'Sunglasses'];
    const insuranceItems = ['Traveling', 'Medical', 'Accident'];

    if (foodItems.includes(itemName)) return InventoryItemKind.FOOD;
    if (toyItems.includes(itemName)) return InventoryItemKind.TOY;
    if (cosmeticItems.includes(itemName)) return InventoryItemKind.COSMETIC;
    if (insuranceItems.includes(itemName)) return InventoryItemKind.INSURANCE;
    return InventoryItemKind.MISC;
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
