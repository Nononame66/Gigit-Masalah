/* ==========================================================
   Gigit Masalah (Fish It Style) - LocalStorage Save System
   Tracks Coins, Level, XP, Rods, Baits, and Fishdex
   ========================================================== */

const STORAGE_KEY = 'GIGIT_MASALAH_SAVE_V3';

const DEFAULT_STATE = {
  coins: 500,
  level: 1,
  xp: 0,
  maxXp: 100,
  equippedRod: 'rod_wooden',
  unlockedRods: ['rod_wooden'],
  equippedBait: 'worm',
  baits: {
    worm: 25,
    glowing: 5,
    golden: 0,
    magnet: 0
  },
  fishdex: {},
  inventory: {},
  stats: {
    totalCaught: 0,
    totalCoinsEarned: 0
  },
  soundEnabled: true
};

export class StorageManager {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          fishdex: (parsed && parsed.fishdex && typeof parsed.fishdex === 'object')
            ? parsed.fishdex
            : {},
          inventory: (parsed && parsed.inventory && typeof parsed.inventory === 'object')
            ? parsed.inventory
            : {}
        };
      }
    } catch (e) {
      console.warn('Failed to load save state, resetting:', e);
    }
    return { ...DEFAULT_STATE };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  addCoins(amount) {
    this.state.coins += amount;
    if (amount > 0) {
      this.state.stats.totalCoinsEarned += amount;
    }
    this.save();
    return this.state.coins;
  }

  deductCoins(amount) {
    if (this.state.coins >= amount) {
      this.state.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  addXp(amount) {
    this.state.xp += amount;
    let leveledUp = false;
    while (this.state.xp >= this.state.maxXp) {
      this.state.xp -= this.state.maxXp;
      this.state.level += 1;
      this.state.maxXp = Math.round(this.state.maxXp * 1.5);
      leveledUp = true;
    }
    this.save();
    return leveledUp;
  }

  unlockRod(rodId) {
    if (!this.state.unlockedRods.includes(rodId)) {
      this.state.unlockedRods.push(rodId);
      this.save();
    }
  }

  equipRod(rodId) {
    if (this.state.unlockedRods.includes(rodId)) {
      this.state.equippedRod = rodId;
      this.save();
    }
  }

  addBait(baitId, count) {
    this.state.baits[baitId] = (this.state.baits[baitId] || 0) + count;
    this.save();
  }

  useBait() {
    const current = this.state.equippedBait;
    if (this.state.baits[current] > 0) {
      this.state.baits[current]--;
      this.save();
      return true;
    }
    return false;
  }

  equipBait(baitId) {
    if (this.state.baits[baitId] !== undefined) {
      this.state.equippedBait = baitId;
      this.save();
    }
  }

  recordFishCatch(fishId, weight) {
    if (!this.state.fishdex[fishId]) {
      this.state.fishdex[fishId] = { unlocked: true, count: 1, maxWeight: weight };
    } else {
      const entry = this.state.fishdex[fishId];
      entry.unlocked = true;
      entry.count += 1;
      if (weight > entry.maxWeight) {
        entry.maxWeight = weight;
      }
    }
    this.state.stats.totalCaught += 1;
    this.save();
  }

  addToInventory(item) {
    const key = item.id;
    if (!key) return;
    const existing = this.state.inventory[key];
    if (existing) {
      existing.count += 1;
      existing.lastWeight = item.weight;
    } else {
      this.state.inventory[key] = {
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        rarity: item.rarity,
        rarityColor: item.rarityColor,
        price: item.price,
        desc: item.desc,
        isJunk: !!item.isJunk,
        count: 1,
        lastWeight: item.weight
      };
    }
    this.save();
  }

  removeFromInventory(itemId, qty = 1) {
    const entry = this.state.inventory[itemId];
    if (!entry) return false;
    entry.count -= qty;
    if (entry.count <= 0) delete this.state.inventory[itemId];
    this.save();
    return true;
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.save();
    return this.state.soundEnabled;
  }
}

export const storage = new StorageManager();
