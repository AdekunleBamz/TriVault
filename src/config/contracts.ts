export const TRIVAULT_ADDRESS = '0xC3319C80FF4fC435ca8827C35A013E64B762ff48' as const

export const TRIVAULT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_creator', type: 'address' },
      { internalType: 'address', name: '_vault1', type: 'address' },
      { internalType: 'address', name: '_vault2', type: 'address' },
      { internalType: 'address', name: '_vault3', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AlreadySealed', type: 'error' },
  { inputs: [], name: 'InsufficientFee', type: 'error' },
  { inputs: [], name: 'InvalidVaultNumber', type: 'error' },
  { inputs: [], name: 'OnlyCreator', type: 'error' },
  { inputs: [], name: 'WithdrawFailed', type: 'error' },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'FeesWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'uint8', name: 'vaultNumber', type: 'uint8' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'SealCollected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint8', name: 'vaultNumber', type: 'uint8' },
      { indexed: true, internalType: 'address', name: 'newAddress', type: 'address' },
    ],
    name: 'VaultUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CREATOR_FEE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'vaultNumber', type: 'uint8' }],
    name: 'collectSeal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'creator',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStats',
    outputs: [
      { internalType: 'uint256', name: 'totalFees', type: 'uint256' },
      { internalType: 'uint256', name: 'vault1Count', type: 'uint256' },
      { internalType: 'uint256', name: 'vault2Count', type: 'uint256' },
      { internalType: 'uint256', name: 'vault3Count', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserSeals',
    outputs: [{ internalType: 'bool[3]', name: '', type: 'bool[3]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'vaultNumber', type: 'uint8' }],
    name: 'getVaultAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'hasAllSeals',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalFeesCollected',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'vaultNumber', type: 'uint8' },
      { internalType: 'address', name: 'newAddress', type: 'address' },
    ],
    name: 'updateVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint8', name: '', type: 'uint8' },
    ],
    name: 'userSeals',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vault1',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vault2',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vault3',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    name: 'vaultInteractions',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

// Vault info for UI display
export const VAULTS = [
  {
    id: 1,
    name: 'Stability Vault',
    description: 'Collect the Stability Seal',
    icon: '💵',
    color: 'from-blue-500 to-blue-600',
    address: '0xC068ccf7fD5859297BE0c0F6D224a1AE51d4151A',
  },
  {
    id: 2,
    name: 'Diamond Vault',
    description: 'Collect the Diamond Seal',
    icon: '💎',
    color: 'from-purple-500 to-purple-600',
    address: '0x532506Ad401e6281f6c4E73aEb857A94d766932B',
  },
  {
    id: 3,
    name: 'Bridge Vault',
    description: 'Collect the Bridge Seal',
    icon: '🌉',
    color: 'from-indigo-500 to-indigo-600',
    address: '0x46A0c736E18Bf42fD8e7112AB6904641602EE1Eb',
  },
] as const

// Creator fee in ETH
export const CREATOR_FEE = '0.00001'
