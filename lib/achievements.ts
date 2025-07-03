export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  category: 'wallet' | 'transaction' | 'swap' | 'nft' | 'identity' | 'defi' | 'advanced';
  completed: boolean;
  completedAt?: Date;
}

export interface UserProgress {
  level: number;
  totalXP: number;
  completedAchievements: string[];
  currentStreak: number;
  longestStreak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Wallet & Connection
  {
    id: 'wallet_connected',
    title: 'First Connection',
    description: 'Connect your wallet to HowToBase',
    xp: 100,
    icon: '🔌',
    category: 'wallet',
    completed: false
  },
  {
    id: 'smart_wallet_created',
    title: 'Smart Wallet Master',
    description: 'Create your first Coinbase Smart Wallet',
    xp: 200,
    icon: '🧠',
    category: 'wallet',
    completed: false
  },

  // Transactions
  {
    id: 'first_transaction',
    title: 'Transaction Pioneer',
    description: 'Send your first transaction on Base',
    xp: 150,
    icon: '💸',
    category: 'transaction',
    completed: false
  },
  {
    id: 'sponsored_transaction',
    title: 'Gas-Free Hero',
    description: 'Complete a sponsored transaction using Paymaster',
    xp: 300,
    icon: '⛽',
    category: 'transaction',
    completed: false
  },

  // Swap & Trading
  {
    id: 'first_swap',
    title: 'Token Trader',
    description: 'Complete your first token swap',
    xp: 200,
    icon: '🔄',
    category: 'swap',
    completed: false
  },
  {
    id: 'swap_expert',
    title: 'Swap Expert',
    description: 'Complete 5 successful swaps',
    xp: 400,
    icon: '🏆',
    category: 'swap',
    completed: false
  },

  // NFT & Minting
  {
    id: 'first_nft_mint',
    title: 'NFT Creator',
    description: 'Mint your first NFT on Base',
    xp: 300,
    icon: '🎨',
    category: 'nft',
    completed: false
  },
  {
    id: 'nft_collection',
    title: 'Collector',
    description: 'Mint 3 different NFTs',
    xp: 500,
    icon: '🖼️',
    category: 'nft',
    completed: false
  },

  // Identity & Basenames
  {
    id: 'basename_registered',
    title: 'Identity Builder',
    description: 'Register your first Basename',
    xp: 250,
    icon: '🏷️',
    category: 'identity',
    completed: false
  },
  {
    id: 'profile_complete',
    title: 'Profile Master',
    description: 'Complete your onchain profile',
    xp: 200,
    icon: '👤',
    category: 'identity',
    completed: false
  },

  // DeFi & Earning
  {
    id: 'first_earn',
    title: 'Yield Farmer',
    description: 'Start earning yield on Base',
    xp: 300,
    icon: '🌾',
    category: 'defi',
    completed: false
  },
  {
    id: 'crypto_purchase',
    title: 'Crypto Shopper',
    description: 'Buy crypto using Checkout component',
    xp: 200,
    icon: '🛒',
    category: 'defi',
    completed: false
  },

  // Advanced Features
  {
    id: 'spend_permission',
    title: 'Subscription Master',
    description: 'Set up your first spend permission',
    xp: 400,
    icon: '🔐',
    category: 'advanced',
    completed: false
  },
  {
    id: 'sub_account',
    title: 'Account Manager',
    description: 'Create a sub-account',
    xp: 300,
    icon: '👥',
    category: 'advanced',
    completed: false
  },
  {
    id: 'notification_setup',
    title: 'Notification Ninja',
    description: 'Enable push notifications',
    xp: 150,
    icon: '📱',
    category: 'advanced',
    completed: false
  },

  // Master Achievement
  {
    id: 'base_master',
    title: 'Base Master',
    description: 'Complete all Base builder tutorials',
    xp: 1000,
    icon: '🚀',
    category: 'advanced',
    completed: false
  }
];

export const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Base Beginner', badge: '🌱' },
  { level: 2, xpRequired: 500, title: 'Chain Explorer', badge: '🔍' },
  { level: 3, xpRequired: 1200, title: 'DeFi Discoverer', badge: '💎' },
  { level: 4, xpRequired: 2000, title: 'NFT Enthusiast', badge: '🎨' },
  { level: 5, xpRequired: 3000, title: 'Swap Specialist', badge: '🔄' },
  { level: 6, xpRequired: 4500, title: 'Base Builder', badge: '🏗️' },
  { level: 7, xpRequired: 6500, title: 'Chain Master', badge: '⚡' },
  { level: 8, xpRequired: 9000, title: 'Base Legend', badge: '🌟' },
  { level: 9, xpRequired: 12000, title: 'Ecosystem Expert', badge: '🌐' },
  { level: 10, xpRequired: 16000, title: 'Base God', badge: '🔥' }
];

export function calculateLevel(xp: number): { level: number; title: string; badge: string; progress: number } {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (xp >= LEVELS[i].xpRequired && xp < LEVELS[i + 1].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1];
      break;
    }
  }
  
  if (xp >= LEVELS[LEVELS.length - 1].xpRequired) {
    currentLevel = LEVELS[LEVELS.length - 1];
    nextLevel = LEVELS[LEVELS.length - 1];
  }
  
  const progress = nextLevel.level === currentLevel.level ? 100 : 
    ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    badge: currentLevel.badge,
    progress: Math.min(progress, 100)
  };
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
}

export function completeAchievement(achievementId: string): Achievement | null {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (achievement && !achievement.completed) {
    achievement.completed = true;
    achievement.completedAt = new Date();
    return achievement;
  }
  return null;
} 