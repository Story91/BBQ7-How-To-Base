# 🎓 HowToBase Academy

**Learn Base blockchain through interactive tutorials and hands-on experience**

HowToBase Academy is a comprehensive educational platform that teaches all **Base Builder Tools** through interactive tutorials, designed for the Base BBQ hackathon. Master Smart Wallets, Spend Permissions, Sub Accounts, OnchainKit, MiniKit, and Paymaster through practical examples.

## 🚀 Features

### 📚 **Interactive Tutorials**
- **Smart Wallet**: Learn Coinbase Smart Wallet with Sub Accounts
- **Spend Permissions**: Set up automated subscriptions and recurring payments 
- **Token Swap**: Trade tokens with OnchainKit Swap component
- **Sponsored Transactions**: Use Paymaster for gasless transactions
- **NFT Minting**: Create and mint NFTs on Base
- **Basenames**: Register your onchain identity with .base.eth names
- **Crypto Commerce**: Accept crypto payments with Checkout component

### 🏆 **Achievement System**
- Track your learning progress
- Unlock achievements for completing tutorials
- Level up as you master Base features
- Streak tracking and XP system

### 🔧 **Base Builder Tools Showcase**
- **MiniKit**: Frame integration and notifications
- **OnchainKit**: Identity, Swap, Transaction components
- **Smart Wallet**: Sub Accounts and Spend Permissions
- **Paymaster**: Sponsored transactions on Base Sepolia
- **Base L2**: Fast and cheap blockchain interactions

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/HowToBase
cd HowToBase
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file with the following variables:

```bash
# OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_CDP_API_KEY=your_cdp_api_key_here
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="HowToBase Academy"
NEXT_PUBLIC_ONCHAINKIT_WALLET_CONFIG="smartWalletOnly"

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Paymaster (Base Sepolia Testnet)
NEXT_PUBLIC_PAYMASTER_URL="https://api.developer.coinbase.com/rpc/v1/base-sepolia/paymaster"

# Spender Wallet for Spend Permissions (Development Only!)
SPENDER_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
NEXT_PUBLIC_SPENDER_ADDRESS=0x1234567890123456789012345678901234567890

# Redis (Optional - for notifications)
REDIS_URL=redis://localhost:6379
```

### 3. Get API Keys

#### OnchainKit API Keys
1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Get your API keys for OnchainKit and CDP

#### WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

#### Spender Wallet (Development)
Generate a development wallet for spend permissions:
```bash
# If you have Foundry installed:
cast wallet new

# Or use any development wallet - NEVER production keys!
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start learning! 🎉

## 🔧 Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Base Sepolia (testnet for Sub Accounts support)
- **Wallet**: Coinbase Smart Wallet with Sub Accounts
- **SDK**: OnchainKit + MiniKit integration
- **Payments**: Paymaster for sponsored transactions
- **Identity**: OnchainKit Identity components for Basenames

## 🎯 Learning Path

### 🎖️ **Beginner (500 XP)**
1. **Wallet Connection** - Connect Coinbase Smart Wallet
2. **First Transaction** - Send your first transaction on Base
3. **Token Swap** - Trade tokens using OnchainKit

### 🏅 **Intermediate (1500 XP)** 
4. **Sponsored Transactions** - Use Paymaster for gasless txs
5. **NFT Minting** - Create your first NFT on Base
6. **Basename Registration** - Get your .base.eth identity

### 🏆 **Advanced (3000+ XP)**
7. **Spend Permissions** - Set up automated subscriptions
8. **Sub Accounts** - Create and manage sub-accounts
9. **Crypto Commerce** - Accept crypto payments
10. **Base Master** - Complete all tutorials

## 🌟 Key Features Demonstrated

### Smart Wallet + Sub Accounts
```typescript
const config = createConfig({
  connectors: [
    coinbaseWallet({
      preference: "smartWalletOnly",
      keysUrl: "https://keys-dev.coinbase.com/connect" // Testnet
    })
  ]
});
```

### Spend Permissions 
```typescript
const spendPermission = {
  account: userAddress,
  spender: spenderAddress,
  token: USDC_ADDRESS,
  allowance: parseUnits("10", 6), // 10 USDC
  period: 2592000, // 30 days
};
```

## 🧰 Components Structure

```
app/
├── components/
│   ├── Academy/
│   │   ├── HowToBaseAcademy.tsx     # Main academy interface
│   │   └── AchievementSystem.tsx    # Achievement tracking
│   ├── Tutorials/
│   │   ├── WalletTutorial.tsx       # Smart Wallet + Sub Accounts
│   │   ├── TransactionTutorial.tsx  # Sponsored transactions
│   │   ├── SwapTutorial.tsx         # Token swapping
│   │   ├── SpendPermissionsTutorial.tsx # Subscriptions
│   │   ├── MintTutorial.tsx         # NFT minting
│   │   ├── BasenamesTutorial.tsx    # Identity system
│   │   └── CheckoutTutorial.tsx     # Crypto commerce
│   └── Subscribe.tsx                # Spend permissions component
├── api/
│   └── collect-subscription/        # Process spend permissions
└── lib/
    ├── achievements.ts              # Achievement definitions
    ├── spender.ts                   # Wallet client for payments
    └── abi/SpendPermissionManager.ts # Contract interfaces
```

## 🔗 Important Links

- [Base Documentation](https://docs.base.org/)
- [OnchainKit Docs](https://docs.base.org/builders/onchainkit)
- [MiniKit Docs](https://docs.base.org/builderkits/minikit)
- [Smart Wallet Docs](https://docs.base.org/smart-wallet)
- [Spend Permissions Guide](https://docs.base.org/smart-wallet/guides/spend-permissions)
- [Sub Accounts Guide](https://docs.base.org/smart-wallet/guides/sub-accounts)

## 🚨 Important Notes

### Security ⚠️
- **NEVER** use production private keys in development
- All spender wallets are for demo purposes only
- Always verify contract addresses on testnet

### Network Configuration
- Uses **Base Sepolia** testnet for Sub Accounts support
- Paymaster configured for sponsored transactions
- Switch to Base mainnet for production (update providers.tsx)

### Sub Accounts Requirements
- Requires `wallet-sdk@canary` version
- Uses `keysUrl: "https://keys-dev.coinbase.com/connect"` for testnet
- Smart Wallet only preference required

## 🎉 Built for Base BBQ Hackathon

HowToBase Academy showcases the full power of Base Builder Tools in one comprehensive educational platform. Perfect for developers learning Base, educational institutions, and anyone wanting to understand the future of onchain development.

**Ready to become a Base Master?** 🚀

---

*Made with ❤️ for the Base ecosystem*
