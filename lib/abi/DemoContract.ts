// Demo contract for transaction tutorials on Base Sepolia
// This is a simple storage contract that stores a number
export const demoContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3" as const;

// Simple demo contract ABI
export const demoContractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256"
      }
    ],
    name: "setValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getValue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_increment",
        type: "uint256"
      }
    ],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "reset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "ValueChanged",
    type: "event"
  }
] as const;

// Demo contract function encodings for common operations
export const demoContractCalls = {
  setValue: (value: number) => ({
    to: demoContractAddress,
    data: `0x55241077${value.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: BigInt(0),
  }),
  
  increment: (amount: number) => ({
    to: demoContractAddress,
    data: `0x7cf5dab0${amount.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: BigInt(0),
  }),
  
  reset: () => ({
    to: demoContractAddress,
    data: "0xd826f88f" as `0x${string}`,
    value: BigInt(0),
  })
}; 