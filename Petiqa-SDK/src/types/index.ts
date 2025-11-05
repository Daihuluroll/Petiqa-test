export interface PetStatus {
  energy: number;
  happiness: number;
  hunger: number;
  health: number;
}

export interface Wallet {
  coins: number;
  points: number;
}

export interface InventoryItem {
  name: string;
  kind: 'food' | 'toy' | 'material' | 'insurance' | 'misc';
  quantity: number;
}

export interface Inventory {
  [key: string]: InventoryItem;
}

export interface PetData {
  petName: string;
  character: string;
  status: PetStatus;
  wallet: Wallet;
  inventory: Inventory;
}

export interface PetiqaTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  button: string;
  buttonText: string;
}

export interface PetiqaSDKConfig {
  apiBaseUrl: string;
  theme?: PetiqaTheme;
  onExit?: () => void;
  onSave?: (gameState: PetData) => void;
}