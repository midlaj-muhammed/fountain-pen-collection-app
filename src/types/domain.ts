/**
 * Shared domain types. Every feature module imports from here so the data
 * shape is consistent end-to-end. These mirror the Firestore schema in
 * SPEC.md §7.3.
 */

import type { Timestamp } from 'firebase/firestore';

// ── Common ────────────────────────────────────────────────

export type Id = string;
export type ISODate = string; // 'YYYY-MM-DD' for calendar use
export type ServerTimestamp = Timestamp;

// ── User ──────────────────────────────────────────────────

export type User = {
  uid: Id;
  displayName: string;
  email: string;
  photoURL: string | null;
  emailVerified: boolean;
  plan: 'free' | 'pro';
  createdAt: ServerTimestamp;
  updatedAt: ServerTimestamp;
  settings: UserSettings;
};

export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
  reminderEnabled: boolean;
  reminderHour: number; // 0–23, local
  reorderAlertEnabled: boolean;
};

// ── Pens ──────────────────────────────────────────────────

export type NibSize = 'EF' | 'F' | 'M' | 'B' | 'BB' | 'Custom';
export type NibMaterial = 'steel' | 'gold' | 'other';

export type PenNib = {
  size: NibSize;
  material: NibMaterial;
  customLabel: string | null;
};

export type Pen = {
  id: Id;
  brand: string;
  model: string;
  nib: PenNib;
  color: string; // hex of pen body
  photoURL: string | null;
  acquiredAt: ServerTimestamp | null;
  retired: boolean;
  currentInkId: Id | null;
  notes: string;
  totalSessions: number;
  createdAt: ServerTimestamp;
  updatedAt: ServerTimestamp;
  deletedAt: ServerTimestamp | null;
};

// ── Inks ──────────────────────────────────────────────────

/** Ink level in 5 steps (matches the 5-dot indicator from Figma). */
export type InkLevelPct = 0 | 20 | 40 | 60 | 80 | 100;

export type Ink = {
  id: Id;
  brand: string;
  name: string;
  colorHex: string;
  bottleSizeMl: number;
  currentLevelPct: InkLevelPct;
  isCartridge: boolean;
  photoURL: string | null;
  acquiredAt: ServerTimestamp | null;
  empty: boolean;
  totalSessions: number;
  lastUsedAt: ServerTimestamp | null;
  notes: string;
  createdAt: ServerTimestamp;
  updatedAt: ServerTimestamp;
  deletedAt: ServerTimestamp | null;
};

// ── Sessions ──────────────────────────────────────────────

export type Session = {
  id: Id;
  date: ServerTimestamp;
  durationMin: number;
  penId: Id;
  inkId: Id;
  inkDriedOut: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  notes: string;
  createdAt: ServerTimestamp;
  updatedAt: ServerTimestamp;
  deletedAt: ServerTimestamp | null;
};

// ── Nib swaps ─────────────────────────────────────────────

export type NibSwap = {
  id: Id;
  penId: Id;
  date: ServerTimestamp;
  fromNib: PenNib;
  toNib: PenNib;
  notes: string;
  createdAt: ServerTimestamp;
};

// ── Wishlist ──────────────────────────────────────────────

export type WishlistItem = {
  id: Id;
  type: 'pen' | 'ink';
  brand: string;
  name: string;
  notes: string;
  createdAt: ServerTimestamp;
  deletedAt: ServerTimestamp | null;
};
