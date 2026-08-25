import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { locationSharingService, FamilyMemberLocation, MyLocationStatus } from '@/services/locationSharingService';
import { signalRService } from '@/services/signalRService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LoadingState } from '@/components/ui/LoadingState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';
import { LeafletMapView } from '@/components/map/LeafletMapView.web';

export default function FamilyLocationScreenWeb() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<FamilyMemberLocation[]>([]);
  const [myStatus, setMyStatus] = useState<MyLocationStatus | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const loadData = async () => {
    try {
      const [familyLocs, myLoc] = await Promise.all([
        locationSharingService.getFamilyLocations(),
        locationSharingService.getMyStatus(),
      ]);
      setLocations(familyLocs);
      setMyStatus(myLoc);
      setIsSharing(myLoc.isSharing);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      signalRService.startConnection();

      const unsubUpdate = signalRService.onLocationUpdated((payload) => {
        setLocations((prev) => {
          const index = prev.findIndex((l) => l.familyMemberId === payload.familyMemberId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...payload };
            return updated;
          }
          return [...prev, payload];
        });
      });

      const unsubSharing = signalRService.onLocationSharingChanged((payload) => {
        if (!payload.isSharing) {
          setLocations((prev) => prev.filter((l) => l.familyMemberId !== payload.familyMemberId));
        } else {
          loadData();
        }
      });

      return () => {
        unsubUpdate();
        unsubSharing();
      };
    }, [])
  );

  const captureBrowserLocation = (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 10,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleToggleSharing = async (value: boolean) => {
    setIsSyncing(true);
    try {
      if (value) {
        const coords = await captureBrowserLocation();
        await locationSharingService.updateLocation(coords);
      }
      const res = await locationSharingService.toggleSharing(value);
      setIsSharing(res.isSharing);
      loadData();
    } catch (error: any) {
      setIsSharing(!value);
      Alert.alert(t('error'), error.message || 'Failed to update location sharing.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const coords = await captureBrowserLocation();
      await locationSharingService.updateLocation(coords);
      Alert.alert('Success', 'GPS coordinates sent to family map!');
      loadData();
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Failed to capture GPS.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AppIcon name="chevron.left" tintColor={theme.text} size={24} />
        </TouchableOpacity>
        <ThemedText type="default" style={styles.title}>{t('locationTracking')}</ThemedText>
      </ThemedView>

      {/* Sharing Privacy Toggle Card */}
      <ThemedView style={[styles.privacyCard, { backgroundColor: theme.background }]}>
        <View style={styles.privacyIconBox}>
          <AppIcon
            name="mappin.and.ellipse"
            tintColor={isSharing ? '#10b981' : '#94a3b8'}
            size={24}
          />
        </View>
        <View style={styles.privacyInfo}>
          <ThemedText style={styles.privacyTitle}>Share My Location</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isSharing ? 'Sharing is ON (Visible to Family)' : 'Sharing is OFF (Private)'}
          </ThemedText>
        </View>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#667eea" />
        ) : (
          <Switch
            value={isSharing}
            onValueChange={handleToggleSharing}
            trackColor={{ false: '#cbd5e1', true: '#a5b4fc' }}
            thumbColor={isSharing ? '#667eea' : '#f1f5f9'}
          />
        )}
      </ThemedView>

      {/* Manual GPS Update Button if sharing is ON */}
      {isSharing && (
        <TouchableOpacity
          onPress={handleManualSync}
          style={styles.syncGpsBtn}
          disabled={isSyncing}
        >
          <AppIcon name="bolt.fill" tintColor="#fff" size={16} style={{ marginRight: 6 }} />
          <ThemedText style={styles.syncGpsText}>
            {isSyncing ? 'Updating GPS...' : 'Broadcast Current GPS Now'}
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Leaflet + OpenStreetMap Map View */}
      <View style={styles.mapWrapper}>
        <LeafletMapView locations={locations} style={{ height: 320 }} />
      </View>

      {/* Active Family Members Location List */}
      <ThemedView style={[styles.familyListCard, { backgroundColor: theme.background }]}>
        <View style={styles.listHeaderRow}>
          <ThemedText type="default" style={styles.listTitle}>
            Live Family Members ({locations.length})
          </ThemedText>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>SIGNALR LIVE</ThemedText>
          </View>
        </View>

        {locations.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={{ paddingVertical: Spacing.two }}>
            No family members are currently sharing their location. When they enable sharing, their live pins will appear automatically.
          </ThemedText>
        ) : (
          locations.map((item) => (
            <View key={item.familyMemberId} style={styles.memberRow}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.memberDetails}>
                <ThemedText style={styles.memberName}>{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.relationship} • Lat: {Number(item.latitude).toFixed(4)}, Lng: {Number(item.longitude).toFixed(4)}
                </ThemedText>
                <ThemedText type="small" style={styles.timeAgo}>
                  Last updated: {new Date(item.updatedAt).toLocaleTimeString()}
                </ThemedText>
              </View>
              <View style={styles.sharingPill}>
                <ThemedText style={styles.sharingPillText}>SHARING</ThemedText>
              </View>
            </View>
          ))
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: 'transparent',
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 24, fontWeight: 'bold' },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    padding: Spacing.four,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  privacyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  privacyInfo: { flex: 1 },
  privacyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  syncGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    paddingVertical: 10,
    borderRadius: 12,
  },
  syncGpsText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  mapWrapper: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  familyListCard: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.six,
    padding: Spacing.four,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  listTitle: { fontSize: 18, fontWeight: 'bold' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  liveText: { color: '#166534', fontSize: 10, fontWeight: 'bold' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  memberDetails: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  timeAgo: { color: '#64748b', marginTop: 2, fontSize: 12 },
  sharingPill: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sharingPillText: { color: '#4338ca', fontSize: 10, fontWeight: 'bold' },
});
