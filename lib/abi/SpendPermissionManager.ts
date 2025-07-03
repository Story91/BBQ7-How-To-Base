// SpendPermissionManager contract address on Base Sepolia
// Official SpendPermissionManager address from Base documentation
export const spendPermissionManagerAddress = "0x000100abaad02f1cfC8Bbe32bD5a564817339E72" as const;

// Simplified ABI for SpendPermissionManager - add more methods as needed
export const spendPermissionManagerABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          },
          {
            internalType: "address",
            name: "spender",
            type: "address"
          },
          {
            internalType: "address",
            name: "token",
            type: "address"
          },
          {
            internalType: "uint160",
            name: "allowance",
            type: "uint160"
          },
          {
            internalType: "uint48",
            name: "period",
            type: "uint48"
          },
          {
            internalType: "uint48",
            name: "start",
            type: "uint48"
          },
          {
            internalType: "uint48",
            name: "end",
            type: "uint48"
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes"
          }
        ],
        internalType: "struct SpendPermission",
        name: "spendPermission",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      }
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          },
          {
            internalType: "address",
            name: "spender",
            type: "address"
          },
          {
            internalType: "address",
            name: "token",
            type: "address"
          },
          {
            internalType: "uint160",
            name: "allowance",
            type: "uint160"
          },
          {
            internalType: "uint48",
            name: "period",
            type: "uint48"
          },
          {
            internalType: "uint48",
            name: "start",
            type: "uint48"
          },
          {
            internalType: "uint48",
            name: "end",
            type: "uint48"
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes"
          }
        ],
        internalType: "struct SpendPermission",
        name: "spendPermission",
        type: "tuple"
      },
      {
        internalType: "uint160",
        name: "value",
        type: "uint160"
      }
    ],
    name: "spend",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const; 