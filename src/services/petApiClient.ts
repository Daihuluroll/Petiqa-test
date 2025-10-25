import axios, {AxiosInstance} from 'axios';
import {getApiBaseUrl} from '../config/dataSource';
import type {InventoryItem, PetData, PetStatus, PetWallet} from '../types/pet';

type RemoteStatus = Partial<PetStatus> & {updatedAt?: string};
type RemoteWallet = Partial<PetWallet> & {updatedAt?: string};
type RemoteInventoryEntry = InventoryItem & {updatedAt?: string};

type RemotePetProfile = {
  _id: string;
  petName: string;
  character?: string | null;
  status?: RemoteStatus;
  wallet?: RemoteWallet;
  inventory?: Record<string, RemoteInventoryEntry> | Map<string, RemoteInventoryEntry>;
};

const createClient = (): AxiosInstance =>
  axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const mapStatus = (status?: RemoteStatus): PetStatus => ({
  energy: status?.energy ?? 0,
  happiness: status?.happiness ?? 0,
  hunger: status?.hunger ?? 0,
  health: status?.health ?? 0,
});

const mapWallet = (wallet?: RemoteWallet): PetWallet => ({
  coins: wallet?.coins ?? 0,
  points: wallet?.points ?? 0,
});

const mapInventory = (
  inventory?: Record<string, RemoteInventoryEntry> | Map<string, RemoteInventoryEntry>,
): Record<string, InventoryItem> => {
  if (!inventory) {
    return {};
  }

  const result: Record<string, InventoryItem> = {};

  if (inventory instanceof Map) {
    inventory.forEach((value, key) => {
      result[key] = {
        name: value.name ?? key,
        kind: value.kind ?? 'misc',
        quantity: value.quantity ?? 0,
      };
    });
    return result;
  }

  Object.keys(inventory).forEach(key => {
    const entry = inventory[key];
    if (!entry) {
      return;
    }
    result[key] = {
      name: entry.name ?? key,
      kind: entry.kind ?? 'misc',
      quantity: entry.quantity ?? 0,
    };
  });

  return result;
};

const normalizeProfile = (profile: RemotePetProfile): PetData & {id: string} => ({
  id: profile._id,
  petName: profile.petName,
  character: profile.character ?? null,
  status: mapStatus(profile.status),
  wallet: mapWallet(profile.wallet),
  inventory: mapInventory(profile.inventory),
});

export type CreatePetPayload = {
  petName: string;
  character?: string | null;
  initialStatus?: PetStatus;
  initialWallet?: PetWallet;
  initialInventory?: Record<string, InventoryItem>;
};

export const createPetProfile = async (
  payload: CreatePetPayload,
): Promise<PetData & {id: string}> => {
  const client = createClient();
  const response = await client.post<RemotePetProfile>('/pet', {
    petName: payload.petName,
    character: payload.character ?? null,
    initialStatus: payload.initialStatus,
    initialWallet: payload.initialWallet,
    initialInventory: payload.initialInventory,
  });
  return normalizeProfile(response.data);
};

export const fetchPetProfile = async (petId: string): Promise<PetData & {id: string}> => {
  const client = createClient();
  const response = await client.get<RemotePetProfile>(`/pet/${petId}`);
  return normalizeProfile(response.data);
};

export const fetchPetStatus = async (
  petId: string,
): Promise<PetStatus> => {
  const client = createClient();
  const response = await client.get<RemoteStatus>(`/pet/${petId}/status`);
  return mapStatus(response.data);
};

export const updatePetStatus = async (
  petId: string,
  updates: Partial<PetStatus>,
): Promise<PetStatus> => {
  const client = createClient();
  const response = await client.patch<{status?: RemoteStatus; energy?: number}>(
    `/pet/${petId}/status`,
    {
      set: updates,
      source: 'manual',
    },
  );

  const payload = (response.data as {status?: RemoteStatus})?.status ?? (response.data as RemoteStatus);
  return mapStatus(payload);
};

export const incrementPetStatus = async (
  petId: string,
  deltas: Partial<PetStatus>,
  source: string = 'manual',
): Promise<PetStatus> => {
  const client = createClient();
  const response = await client.patch<{status?: RemoteStatus}>(
    `/pet/${petId}/status`,
    {
      inc: deltas,
      source,
    },
  );
  const payload = response.data.status ?? (response.data as RemoteStatus);
  return mapStatus(payload);
};

export const fetchWallet = async (petId: string): Promise<PetWallet> => {
  const client = createClient();
  const response = await client.get<RemoteWallet>(`/pet/${petId}/wallet`);
  return mapWallet(response.data);
};

export const updateWallet = async (
  petId: string,
  updates: {coins?: number; points?: number},
  reason?: string,
): Promise<PetWallet> => {
  const client = createClient();
  const response = await client.patch<{wallet?: RemoteWallet}>(
    `/pet/${petId}/wallet`,
    {
      set: updates,
      reason,
    },
  );
  const payload = response.data.wallet ?? (response.data as RemoteWallet);
  return mapWallet(payload);
};

export const incrementWallet = async (
  petId: string,
  deltas: {coins?: number; points?: number},
  reason?: string,
): Promise<PetWallet> => {
  const client = createClient();
  const response = await client.patch<{wallet?: RemoteWallet}>(
    `/pet/${petId}/wallet`,
    {
      inc: deltas,
      reason,
    },
  );
  const payload = response.data.wallet ?? (response.data as RemoteWallet);
  return mapWallet(payload);
};

export const fetchInventory = async (
  petId: string,
  items?: string[],
): Promise<Record<string, InventoryItem>> => {
  const client = createClient();
  const query =
    items && items.length > 0 ? `?items=${encodeURIComponent(items.join(','))}` : '';
  const response = await client.get<Record<string, RemoteInventoryEntry>>(
    `/pet/${petId}/inventory${query}`,
  );
  return mapInventory(response.data);
};

export const updateInventory = async (
  petId: string,
  adjustments: {item: string; delta: number}[],
  reason?: string,
): Promise<Record<string, InventoryItem>> => {
  const client = createClient();
  const response = await client.patch<Record<string, RemoteInventoryEntry>>(
    `/pet/${petId}/inventory`,
    {
      adjustments,
      reason,
    },
  );
  return mapInventory(response.data);
};

export const useInventoryItem = async (
  petId: string,
  item: string,
  quantity = 1,
): Promise<Record<string, InventoryItem>> => {
  const client = createClient();
  const response = await client.post<Record<string, RemoteInventoryEntry>>(
    `/pet/${petId}/inventory/use`,
    {
      item,
      quantity,
      applyEffects: true,
    },
  );
  return mapInventory(response.data);
};

export const updateIdentity = async (
  petId: string,
  payload: {petName?: string; character?: string | null},
): Promise<void> => {
  const client = createClient();
  await client.patch(`/pet/${petId}/name`, payload);
};
