import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SymbolView, SFSymbol } from 'expo-symbols';

// Mapping from SF Symbols to Ionicons/Material icons
const iconMap: Record<string, { lib: 'ion' | 'mat'; name: any }> = {
  'house': { lib: 'ion', name: 'home-outline' },
  'house.fill': { lib: 'ion', name: 'home' },
  'person.2': { lib: 'ion', name: 'people-outline' },
  'person.2.fill': { lib: 'ion', name: 'people' },
  'person.fill': { lib: 'ion', name: 'person' },
  'person.crop.circle.fill': { lib: 'ion', name: 'person-circle' },
  'dollarsign.circle': { lib: 'ion', name: 'cash-outline' },
  'dollarsign.circle.fill': { lib: 'ion', name: 'cash' },
  'cross.case': { lib: 'mat', name: 'medical-bag' },
  'cross.case.fill': { lib: 'mat', name: 'medical-bag' },
  'ellipsis.circle': { lib: 'ion', name: 'ellipsis-horizontal-circle-outline' },
  'ellipsis.circle.fill': { lib: 'ion', name: 'ellipsis-horizontal-circle' },
  'bell.fill': { lib: 'ion', name: 'notifications' },
  'bell.badge.fill': { lib: 'ion', name: 'notifications-circle' },
  'mappin.and.ellipse': { lib: 'ion', name: 'navigate-circle' },
  'mappin.circle.fill': { lib: 'ion', name: 'location' },
  'map': { lib: 'ion', name: 'map-outline' },
  'map.fill': { lib: 'ion', name: 'map' },
  'gear': { lib: 'ion', name: 'settings-sharp' },
  'sun.max.fill': { lib: 'ion', name: 'sunny' },
  'moon.fill': { lib: 'ion', name: 'moon' },
  'plus': { lib: 'ion', name: 'add' },
  'plus.circle.fill': { lib: 'ion', name: 'add-circle' },
  'chevron.right': { lib: 'ion', name: 'chevron-forward' },
  'chevron.left': { lib: 'ion', name: 'chevron-back' },
  'chevron.up.chevron.down': { lib: 'ion', name: 'swap-vertical' },
  'checkmark.circle.fill': { lib: 'ion', name: 'checkmark-circle' },
  'xmark.circle.fill': { lib: 'ion', name: 'close-circle' },
  'arrow.right.square.fill': { lib: 'ion', name: 'log-out' },
  'exclamationmark.triangle.fill': { lib: 'ion', name: 'warning' },
  'banknote.fill': { lib: 'ion', name: 'wallet' },
  'briefcase.fill': { lib: 'ion', name: 'briefcase' },
  'laptopcomputer': { lib: 'ion', name: 'laptop' },
  'chart.line.uptrend.xyaxis': { lib: 'ion', name: 'trending-up' },
  'cart.fill': { lib: 'ion', name: 'cart' },
  'building.2.fill': { lib: 'ion', name: 'business' },
  'bolt.fill': { lib: 'ion', name: 'flash' },
  'car.fill': { lib: 'ion', name: 'car' },
  'book.fill': { lib: 'ion', name: 'book' },
  'fork.knife': { lib: 'ion', name: 'restaurant' },
  'tv.fill': { lib: 'ion', name: 'tv' },
  'creditcard.fill': { lib: 'ion', name: 'card' },
  'drop.fill': { lib: 'ion', name: 'water' },
  'wifi': { lib: 'ion', name: 'wifi' },
  'phone.fill': { lib: 'ion', name: 'call' },
  'shield.fill': { lib: 'ion', name: 'shield-checkmark' },
  'flame.fill': { lib: 'ion', name: 'flame' },
  'arrow.down.circle.fill': { lib: 'ion', name: 'arrow-down-circle' },
  'arrow.down.circle': { lib: 'ion', name: 'arrow-down-circle-outline' },
  'doc.plaintext.fill': { lib: 'ion', name: 'document-text' },
  'doc.plaintext': { lib: 'ion', name: 'document-text-outline' },
};

interface AppIconProps {
  name: SFSymbol | string;
  size?: number;
  tintColor?: any;
  style?: any;
}

export function AppIcon({ name, size = 24, tintColor = '#000', style }: AppIconProps) {
  // On iOS, SymbolView works natively. On Web & Android, use @expo/vector-icons
  if (Platform.OS === 'ios') {
    return <SymbolView name={name as SFSymbol} size={size} tintColor={tintColor} style={style} />;
  }

  const mapped = iconMap[name as string] || { lib: 'ion', name: 'ellipse' };

  if (mapped.lib === 'mat') {
    return <MaterialCommunityIcons name={mapped.name} size={size} color={tintColor} style={style} />;
  }

  return <Ionicons name={mapped.name} size={size} color={tintColor} style={style} />;
}
