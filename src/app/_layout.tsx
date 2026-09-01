import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0F172A',
            },
            headerTintColor: '#F8FAFC',
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: '#090D16',
            },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="search"
            options={{
              title: 'Search Channels',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="channel/[id]"
            options={{
              title: 'Channel Info',
            }}
          />
          <Stack.Screen
            name="player/[id]"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
