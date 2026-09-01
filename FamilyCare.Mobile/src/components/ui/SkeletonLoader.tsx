import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({
  width = '100%',
  height = 20,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: theme.backgroundSelected,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 44, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return <SkeletonBox width={size} height={size} borderRadius={size / 2} style={style} />;
}

export function SkeletonCard({ height = 90, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, style]}>
      <SkeletonCircle size={40} style={{ marginRight: Spacing.three }} />
      <View style={{ flex: 1 }}>
        <SkeletonBox width="60%" height={16} borderRadius={Radius.xs} style={{ marginBottom: 8 }} />
        <SkeletonBox width="40%" height={12} borderRadius={Radius.xs} />
      </View>
    </View>
  );
}

export function SkeletonDashboard() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      {/* Header mock */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <SkeletonBox width="30%" height={14} borderRadius={Radius.xs} style={{ marginBottom: 6 }} />
          <SkeletonBox width="50%" height={22} borderRadius={Radius.xs} />
        </View>
        <SkeletonCircle size={36} />
      </View>

      {/* Hero Card mock */}
      <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <SkeletonBox width="45%" height={12} borderRadius={Radius.xs} style={{ marginBottom: 12 }} />
        <SkeletonBox width="65%" height={36} borderRadius={Radius.sm} style={{ marginBottom: 20 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonBox width="45%" height={32} borderRadius={Radius.md} />
          <SkeletonBox width="45%" height={32} borderRadius={Radius.md} />
        </View>
      </View>

      {/* Stats 4-Grid mock */}
      <View style={styles.grid}>
        <View style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <SkeletonCircle size={32} style={{ marginBottom: 10 }} />
          <SkeletonBox width="50%" height={18} borderRadius={Radius.xs} style={{ marginBottom: 6 }} />
          <SkeletonBox width="70%" height={10} borderRadius={Radius.xs} />
        </View>
        <View style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <SkeletonCircle size={32} style={{ marginBottom: 10 }} />
          <SkeletonBox width="50%" height={18} borderRadius={Radius.xs} style={{ marginBottom: 6 }} />
          <SkeletonBox width="70%" height={10} borderRadius={Radius.xs} />
        </View>
        <View style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <SkeletonCircle size={32} style={{ marginBottom: 10 }} />
          <SkeletonBox width="50%" height={18} borderRadius={Radius.xs} style={{ marginBottom: 6 }} />
          <SkeletonBox width="70%" height={10} borderRadius={Radius.xs} />
        </View>
        <View style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <SkeletonCircle size={32} style={{ marginBottom: 10 }} />
          <SkeletonBox width="50%" height={18} borderRadius={Radius.xs} style={{ marginBottom: 6 }} />
          <SkeletonBox width="70%" height={10} borderRadius={Radius.xs} />
        </View>
      </View>

      {/* List mock */}
      <View style={{ paddingHorizontal: Spacing.four, marginTop: Spacing.four }}>
        <SkeletonCard style={{ marginBottom: 12 }} />
        <SkeletonCard style={{ marginBottom: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
  },
  heroCard: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.four,
    gap: 12,
  },
  gridItem: {
    width: '48%',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
