import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppCard, AppBadge, AppButton } from '@/components/ui';
import { Spacing } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import {
  getOrCreateDeviceId,
  getAppSettings,
  resetAppSettings,
  clearFavorites,
  clearRecentlyWatched,
  clearChannelCache,
} from '@/storage';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [deviceId, setDeviceId] = useState<string>('Loading...');
  const [clearing, setClearing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateDeviceId().then((id) => setDeviceId(id));
    getAppSettings();
  }, []);

  const handleClearAllLocalData = async () => {
    setClearing(true);
    try {
      await resetAppSettings();
      await clearFavorites();
      await clearRecentlyWatched();
      await clearChannelCache();
      setStatusMsg('All local cache & settings reset cleanly.');
    } catch (error) {
      console.error(error);
      setStatusMsg('Failed clearing data');
    } finally {
      setClearing(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <AppCard style={styles.sectionCard}>
          <View style={styles.row}>
            <Ionicons name="phone-portrait-sharp" size={20} color={colors.primaryLight} />
            <View style={styles.rowText}>
              <AppText variant="bodyLarge">Device Identification</AppText>
              <AppText variant="caption" color="secondary" numberOfLines={1} style={styles.codeText}>
                ID: {deviceId}
              </AppText>
            </View>
            <AppBadge label="LOCAL ONLY" status="info" />
          </View>
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <View style={styles.row}>
            <Ionicons name="cloud-offline-sharp" size={20} color={colors.statusAvailable} />
            <View style={styles.rowText}>
              <AppText variant="bodyLarge">Storage Architecture</AppText>
              <AppText variant="caption" color="secondary">
                AsyncStorage / FileSystem / SecureStore
              </AppText>
            </View>
            <AppBadge label="NO CLOUD DB" status="available" />
          </View>
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-sharp" size={20} color={colors.primaryLight} />
            <View style={styles.rowText}>
              <AppText variant="bodyLarge">Privacy & Security</AppText>
              <AppText variant="caption" color="secondary">
                No remote account, email, or login required
              </AppText>
            </View>
            <AppBadge label="ANONYMOUS" status="available" />
          </View>
        </AppCard>

        {statusMsg ? (
          <AppText variant="bodySmall" color="accent" align="center">
            {statusMsg}
          </AppText>
        ) : null}

        <AppButton
          title="Reset Local Cache & Data"
          variant="outline"
          size="md"
          loading={clearing}
          leftIcon={<Ionicons name="trash-bin-sharp" size={18} color={colors.statusUnavailable} />}
          onPress={handleClearAllLocalData}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionCard: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  codeText: {
    fontFamily: 'monospace',
  },
});
