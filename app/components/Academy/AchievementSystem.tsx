"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNotification } from '@coinbase/onchainkit/minikit';
import { 
  Achievement, 
  UserProgress, 
  ACHIEVEMENTS, 
  calculateLevel, 
  getAchievementsByCategory, 
  completeAchievement 
} from '@/lib/achievements';

interface AchievementSystemProps {
  className?: string;
}

export function AchievementSystem({ className = "" }: AchievementSystemProps) {
  const { address } = useAccount();
  const sendNotification = useNotification();
  
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    totalXP: 0,
    completedAchievements: [],
    currentStreak: 0,
    longestStreak: 0
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category']>('wallet');
  
  // Calculate current level info
  const levelInfo = calculateLevel(userProgress.totalXP);
  
  // Get achievements by category
  const categorizedAchievements = getAchievementsByCategory(selectedCategory);
  
  // Handle achievement completion
  const handleAchievementComplete = async (achievementId: string) => {
    const completedAchievement = completeAchievement(achievementId);
    if (completedAchievement) {
      const newProgress = {
        ...userProgress,
        totalXP: userProgress.totalXP + completedAchievement.xp,
        completedAchievements: [...userProgress.completedAchievements, achievementId]
      };
      
      setUserProgress(newProgress);
      setAchievements([...ACHIEVEMENTS]);
      
      // Send notification for achievement unlock
      await sendNotification({
        title: "Achievement Unlocked! 🎉",
        body: `${completedAchievement.icon} ${completedAchievement.title} (+${completedAchievement.xp} XP)`
      });
    }
  };
  
  // Auto-complete wallet connection achievement
  useEffect(() => {
    if (address && !userProgress.completedAchievements.includes('wallet_connected')) {
      handleAchievementComplete('wallet_connected');
    }
  }, [address]);
  
  const categories = [
    { id: 'wallet', name: 'Wallet', icon: '🔌' },
    { id: 'transaction', name: 'Transactions', icon: '💸' },
    { id: 'swap', name: 'Swap', icon: '🔄' },
    { id: 'nft', name: 'NFTs', icon: '🎨' },
    { id: 'identity', name: 'Identity', icon: '🏷️' },
    { id: 'defi', name: 'DeFi', icon: '🌾' },
    { id: 'advanced', name: 'Advanced', icon: '🚀' }
  ] as const;
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level Progress Header */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{levelInfo.badge}</div>
            <div>
              <h3 className="text-xl font-bold text-[var(--app-foreground)]">
                Level {levelInfo.level}
              </h3>
              <p className="text-[var(--app-foreground-muted)]">{levelInfo.title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--app-accent)]">
              {userProgress.totalXP} XP
            </div>
            <div className="text-sm text-[var(--app-foreground-muted)]">
              {userProgress.completedAchievements.length}/{ACHIEVEMENTS.length} Complete
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-[var(--app-gray)] rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-hover)] h-3 rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progress}%` }}
          />
        </div>
        <div className="text-sm text-[var(--app-foreground-muted)] mt-2">
          {levelInfo.progress.toFixed(1)}% to next level
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-[var(--app-accent)] text-white'
                : 'bg-[var(--app-card-bg)] text-[var(--app-foreground)] hover:bg-[var(--app-gray)]'
            }`}
          >
            <span>{category.icon}</span>
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>
      
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorizedAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onComplete={() => handleAchievementComplete(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  onComplete: () => void;
}

function AchievementCard({ achievement, onComplete }: AchievementCardProps) {
  const isCompleted = achievement.completed;
  
  return (
    <div className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border transition-all ${
      isCompleted 
        ? 'border-[var(--app-accent)] bg-[var(--app-accent-light)]' 
        : 'border-[var(--app-card-border)] hover:border-[var(--app-accent)]'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`text-2xl ${isCompleted ? 'grayscale-0' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold ${
              isCompleted ? 'text-[var(--app-accent)]' : 'text-[var(--app-foreground)]'
            }`}>
              {achievement.title}
            </h4>
            <p className="text-sm text-[var(--app-foreground-muted)] mt-1">
              {achievement.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${
            isCompleted ? 'text-[var(--app-accent)]' : 'text-[var(--app-foreground-muted)]'
          }`}>
            +{achievement.xp} XP
          </div>
          {isCompleted && (
            <div className="text-xs text-[var(--app-accent)] mt-1">
              ✓ Complete
            </div>
          )}
        </div>
      </div>
      
      {isCompleted && achievement.completedAt && (
        <div className="mt-3 pt-3 border-t border-[var(--app-card-border)]">
          <div className="text-xs text-[var(--app-foreground-muted)]">
            Completed on {achievement.completedAt.toLocaleDateString()}
          </div>
        </div>
      )}
      
      {!isCompleted && (
        <button
          onClick={onComplete}
          className="mt-3 w-full px-4 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:bg-[var(--app-accent-hover)] transition-colors text-sm font-medium"
        >
          Complete Achievement
        </button>
      )}
    </div>
  );
}

export default AchievementSystem; 