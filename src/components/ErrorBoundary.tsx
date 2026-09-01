import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, AppButton, AppCard } from '@/components/ui';
import { Spacing } from '@/theme/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Unhandled UI Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppCard style={styles.card} variant="raised">
            <Ionicons name="alert-circle-sharp" size={48} color="#EF4444" />
            <AppText variant="titleMedium" align="center">
              Something went wrong
            </AppText>
            <AppText variant="bodySmall" color="secondary" align="center">
              An unhandled error occurred in the application display. You can retry to recover.
            </AppText>
            <AppButton
              title="Try Again"
              variant="primary"
              size="md"
              onPress={this.handleReset}
            />
          </AppCard>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    maxWidth: 400,
  },
});
