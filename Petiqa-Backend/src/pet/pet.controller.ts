import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePetDto,
  UpdatePetNameDto,
  UpdatePetStatusDto,
  TickPetStatusDto,
  UpdateWalletDto,
  WalletTransactionsQueryDto,
  UpdateInventoryDto,
  UseInventoryItemDto,
  CompleteTaskDto,
  ActivityCompleteDto,
  CreateEventDto,
  ProgressQueryDto,
} from './dto';
import { PetService } from './pet.service';
import { WalletCurrency } from '../shared/mongo/pet-wallet-transaction.schema';

@ApiTags('pet')
@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet profile' })
  @ApiBody({
    description: 'Payload to create a pet profile',
    type: CreatePetDto,
    examples: {
      default: {
        summary: 'Create default pet',
        value: { petName: 'PixelPaws', character: 'Fox' },
      },
      withoutCharacter: {
        summary: 'Create without specifying character',
        value: { petName: 'MegaMutt' },
      },
    },
  })
  @ApiOkResponse({ description: 'Created pet profile' })
  createPet(@Body() dto: CreatePetDto) {
    return this.petService.createPet(dto);
  }

  @Get(':petId')
  @ApiOperation({ summary: 'Get pet profile by identifier' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiOkResponse({ description: 'Pet profile document' })
  getPet(@Param('petId') petId: string) {
    return this.petService.getPetById(petId);
  }

  @Patch(':petId/name')
  @ApiOperation({ summary: 'Update pet name or avatar' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: UpdatePetNameDto })
  @ApiOkResponse({ description: 'Updated pet profile' })
  updateIdentity(
    @Param('petId') petId: string,
    @Body() dto: UpdatePetNameDto,
  ) {
    return this.petService.updatePetIdentity(petId, dto);
  }

  @Get(':petId/status')
  @ApiOperation({ summary: 'Get lifecycle metrics for a pet' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiOkResponse({ description: 'Current status snapshot' })
  getStatus(@Param('petId') petId: string) {
    return this.petService.getPetStatus(petId);
  }

  @Patch(':petId/status')
  @ApiOperation({ summary: 'Adjust lifecycle metrics (set or increment)' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: UpdatePetStatusDto })
  @ApiOkResponse({ description: 'Updated status snapshot' })
  updateStatus(
    @Param('petId') petId: string,
    @Body() dto: UpdatePetStatusDto,
  ) {
    return this.petService.updatePetStatus(petId, dto);
  }

  @Post(':petId/status/tick')
  @ApiOperation({ summary: 'Apply automated lifecycle tick' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: TickPetStatusDto })
  @ApiOkResponse({ description: 'Updated status snapshot' })
  tickStatus(
    @Param('petId') petId: string,
    @Body() dto: TickPetStatusDto,
  ) {
    return this.petService.tickPetStatus(petId, dto);
  }

  @Get(':petId/wallet')
  @ApiOperation({ summary: 'Get wallet snapshot' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiOkResponse({ description: 'Wallet snapshot' })
  getWallet(@Param('petId') petId: string) {
    return this.petService.getWallet(petId);
  }

  @Patch(':petId/wallet')
  @ApiOperation({ summary: 'Adjust wallet balances' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: UpdateWalletDto })
  @ApiOkResponse({ description: 'Updated wallet snapshot' })
  updateWallet(
    @Param('petId') petId: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.petService.updateWallet(petId, dto);
  }

  @Get(':petId/wallet/transactions')
  @ApiOperation({ summary: 'List recent wallet transactions' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiQuery({
    name: 'currency',
    required: false,
    enum: WalletCurrency,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of entries to return',
  })
  @ApiOkResponse({ description: 'Wallet transaction history' })
  getWalletTransactions(
    @Param('petId') petId: string,
    @Query() query: WalletTransactionsQueryDto,
  ) {
    return this.petService.getWalletTransactions(
      petId,
      query.currency as WalletCurrency,
      query.limit,
    );
  }

  @Get(':petId/inventory')
  @ApiOperation({ summary: 'Get inventory summary' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiQuery({
    name: 'items',
    required: false,
    type: String,
    description: 'Comma separated list of item names to filter',
  })
  @ApiOkResponse({ description: 'Inventory entries' })
  getInventory(
    @Param('petId') petId: string,
    @Query('items') items?: string | string[],
  ) {
    const list = Array.isArray(items)
      ? items
      : items
      ? items.split(',').filter(Boolean)
      : undefined;
    return this.petService.getInventory(petId, list);
  }

  @Patch(':petId/inventory')
  @ApiOperation({ summary: 'Adjust inventory quantities' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: UpdateInventoryDto })
  @ApiOkResponse({ description: 'Updated inventory map' })
  updateInventory(
    @Param('petId') petId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.petService.updateInventory(petId, dto);
  }

  @Post(':petId/inventory/use')
  @ApiOperation({ summary: 'Consume inventory item' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: UseInventoryItemDto })
  @ApiOkResponse({ description: 'Inventory after consumption' })
  useInventory(
    @Param('petId') petId: string,
    @Body() dto: UseInventoryItemDto,
  ) {
    return this.petService.useInventoryItem(petId, dto);
  }

  @Get(':petId/tasks')
  @ApiOperation({ summary: 'Get current daily tasks' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiOkResponse({ description: 'Daily tasks' })
  getDailyTasks(@Param('petId') petId: string) {
    return this.petService.getDailyTasks(petId);
  }

  @Post(':petId/tasks/:taskId/complete')
  @ApiOperation({ summary: 'Complete a task and claim rewards' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiParam({ name: 'taskId', description: 'Task identifier' })
  @ApiBody({ type: CompleteTaskDto })
  @ApiOkResponse({ description: 'Updated task state' })
  completeTask(
    @Param('petId') petId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.petService.completeTask(petId, taskId, dto);
  }

  @Get(':petId/achievements')
  @ApiOperation({ summary: 'Get achievement state' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiOkResponse({ description: 'Achievement state documents' })
  getAchievements(@Param('petId') petId: string) {
    return this.petService.getAchievements(petId);
  }

  @Post(':petId/achievements/:achievementId/claim')
  @ApiOperation({ summary: 'Claim an achievement reward' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiParam({ name: 'achievementId', description: 'Achievement identifier' })
  @ApiOkResponse({ description: 'Updated achievement state' })
  claimAchievement(
    @Param('petId') petId: string,
    @Param('achievementId') achievementId: string,
  ) {
    return this.petService.claimAchievement(petId, achievementId);
  }

  @Post(':petId/activities/:activityId/complete')
  @ApiOperation({ summary: 'Record activity completion' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiParam({ name: 'activityId', description: 'Activity identifier' })
  @ApiBody({ type: ActivityCompleteDto })
  @ApiOkResponse({ description: 'Created activity log' })
  recordActivity(
    @Param('petId') petId: string,
    @Param('activityId') activityId: string,
    @Body() dto: ActivityCompleteDto,
  ) {
    return this.petService.recordActivityCompletion(petId, activityId, dto);
  }

  @Post(':petId/events')
  @ApiOperation({ summary: 'Log a pet event' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiBody({ type: CreateEventDto })
  @ApiOkResponse({ description: 'Created event log' })
  logEvent(@Param('petId') petId: string, @Body() dto: CreateEventDto) {
    return this.petService.logEvent(petId, dto);
  }

  @Get(':petId/progress')
  @ApiOperation({ summary: 'Get pet progress snapshot' })
  @ApiParam({ name: 'petId', description: 'Pet identifier' })
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    description: 'Comma separated list of sections to include',
  })
  @ApiOkResponse({ description: 'Aggregated progress data' })
  getProgress(@Param('petId') petId: string, @Query() query: ProgressQueryDto) {
    return this.petService.getProgress(petId, query);
  }
}
