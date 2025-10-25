export interface PetStatus {
  energy: number;
  happiness: number;
  hunger: number;
  health: number;
}

export interface PetWallet {
  coins: number;
  points: number;
}

export interface InventoryItem {
  name: string;
  kind: string;
  quantity: number;
}

export interface PetData {
  petName: string;
  character?: string | null;
  status: PetStatus;
  wallet: PetWallet;
  inventory: Record<string, InventoryItem>;
}
