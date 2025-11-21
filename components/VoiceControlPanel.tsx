import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Platform } from 'react-native';
import { Mic, MicOff, Shield, TrendingUp } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useVoiceControlV2 } from '@/providers/VoiceControlProviderV2';
import { useVoiceQuota, useVoiceSettings } from '@/hooks/useVoiceQuota';
import { VoiceFeedback } from '@/components/VoiceFeedback';
import { VoiceListeningIndicator } from '@/components/VoiceListeningIndicator';

export function VoiceControlPanel() {
  const { t } = useTranslation();
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Always call hooks - never conditional
  const voiceControl = useVoiceControlV2();
  const quotaResult = useVoiceQuota();
  const settingsResult = useVoiceSettings();
  
  const quota = quotaResult?.quota || { 
    canUseVoice: false, 
    hasUnlimitedAccess: false, 
    dailyUsed: 0, 
    dailyLimit: 50, 
    dailyRemaining: 50, 
    monthlyUsed: 0, 
    monthlyLimit: 1000, 
    monthlyRemaining: 1000 
  };
  
  const quotaLoading = quotaResult?.loading || false;
  const settings = settingsResult?.settings || null;
  const settingsLoading = settingsResult?.loading || false;
  const updateSettings = settingsResult?.updateSettings || (() => Promise.resolve(false));

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleSuccess = () => setShowFeedback(true);
    const handleFailed = () => setShowFeedback(true);

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      try {
        window.addEventListener('voiceCommandSuccess', handleSuccess);
        window.addEventListener('voiceCommandFailed', handleFailed);

        return () => {
          if (typeof window.removeEventListener === 'function') {
            window.removeEventListener('voiceCommandSuccess', handleSuccess);
            window.removeEventListener('voiceCommandFailed', handleFailed);
          }
        };
      } catch (error) {
        console.error('[VoiceControlPanel] Event listener error:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (voiceControl?.isProcessing) {
      setShowFeedback(true);
    }
  }, [voiceControl?.isProcessing]);

  const handleToggleListening = async () => {
    if (!voiceControl) {
      console.error('[VoiceControlPanel] Voice control not available');
      alert(t('voiceControl.notAvailable') || 'Voice control not available');
      return;
    }
    
    try {
      if (voiceControl.isListening) {
        if (typeof voiceControl.stopListening === 'function') {
          await voiceControl.stopListening();
        }
      } else {
        if (!quota.canUseVoice && !quota.hasUnlimitedAccess) {
          alert(t('voiceControl.quotaExceeded') || 'Voice quota exceeded');
          return;
        }
        if (typeof voiceControl.startListening === 'function') {
          await voiceControl.startListening();
        }
      }
    } catch (error) {
      console.error('[VoiceControlPanel] Toggle listening error:', error);
      alert(error instanceof Error ? error.message : 'Failed to toggle voice control');
    }
  };

  const handleToggleAlwaysListening = async () => {
    if (!voiceControl) {
      console.error('[VoiceControlPanel] Voice control not available');
      alert(t('voiceControl.notAvailable') || 'Voice control not available');
      return;
    }
    
    try {
      if (!voiceControl.alwaysListening && !quota.canUseVoice && !quota.hasUnlimitedAccess) {
        alert(t('voiceControl.quotaExceeded') || 'Voice quota exceeded');
        return;
      }
      if (typeof voiceControl.toggleAlwaysListening === 'function') {
        await voiceControl.toggleAlwaysListening();
      }
      if (settings && typeof updateSettings === 'function') {
        await updateSettings({ alwaysListening: !voiceControl.alwaysListening });
      }
    } catch (error) {
      console.error('[VoiceControlPanel] Toggle always listening error:', error);
      alert(error instanceof Error ? error.message : 'Failed to toggle always listening');
    }
  };

  // Show error if voice control is not available
  if (!voiceControl) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Mic size={48} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>{t('voiceControl.notAvailable') || 'Voice Control Unavailable'}</Text>
        <Text style={styles.errorMessage}>{t('voiceControl.notAvailableMessage') || 'Voice control is not available on this device or browser.'}</Text>
      </View>
    );
  }

  if (quotaLoading || settingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
      </View>
    );
  }

  const quotaPercentage = quota.hasUnlimitedAccess
    ? 100
    : quota.dailyLimit > 0
    ? (quota.dailyUsed / quota.dailyLimit) * 100
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <VoiceFeedback
        visible={showFeedback}
        command={voiceControl.lastCommand || null}
        intent={voiceControl.lastIntent || null}
        confidence={voiceControl.confidence || 0}
        isProcessing={voiceControl.isProcessing || false}
      />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Mic size={28} color="#3B82F6" />
        </View>
        <Text style={styles.title}>{t('voiceControl.title') || 'Voice Control'}</Text>
      </View>

      <View style={styles.indicatorContainer}>
        <VoiceListeningIndicator
          isListening={voiceControl.isListening || false}
          alwaysListening={voiceControl.alwaysListening || false}
          onPress={handleToggleListening}
        />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>
            {voiceControl.isListening
              ? t('voiceFeedback.listening') || 'Listening...'
              : t('voiceControl.startListening') || 'Tap to start'}
          </Text>
          {voiceControl.lastCommand && (
            <Text style={styles.lastCommandText}>
              {t('voiceControl.lastCommand') || 'Last command'}: {voiceControl.lastCommand}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp size={20} color="#3B82F6" />
          <Text style={styles.cardTitle}>{t('voiceControl.usageStats') || 'Usage Statistics'}</Text>
        </View>
        
        <View style={styles.quotaBar}>
          <View style={[styles.quotaFill, { width: `${Math.min(100, quotaPercentage)}%` }]} />
        </View>

        {quota.hasUnlimitedAccess ? (
          <Text style={styles.unlimitedText}>{t('voiceControl.unlimited') || 'Unlimited'}</Text>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('voiceControl.dailyUsed') || 'Daily Used'}</Text>
              <Text style={styles.statValue}>
                {quota.dailyUsed} / {quota.dailyLimit}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('voiceControl.dailyRemaining') || 'Daily Remaining'}</Text>
              <Text style={styles.statValue}>{quota.dailyRemaining}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('voiceControl.monthlyUsed') || 'Monthly Used'}</Text>
              <Text style={styles.statValue}>
                {quota.monthlyUsed} / {quota.monthlyLimit}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('voiceControl.monthlyRemaining') || 'Monthly Remaining'}</Text>
              <Text style={styles.statValue}>{quota.monthlyRemaining}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Shield size={20} color="#3B82F6" />
          <Text style={styles.cardTitle}>{t('voiceControl.settings') || 'Settings'}</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('voiceControl.alwaysListening') || 'Always Listening'}</Text>
            <Text style={styles.settingDesc}>{t('voiceControl.alwaysListeningDesc') || 'Keep voice control active'}</Text>
          </View>
          <Switch
            value={voiceControl.alwaysListening || false}
            onValueChange={handleToggleAlwaysListening}
            trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
            thumbColor={voiceControl.alwaysListening ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        {settings && (
          <>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('voiceControl.visualFeedback') || 'Visual Feedback'}</Text>
              </View>
              <Switch
                value={settings.enableVisualFeedback}
                onValueChange={(value) => {
                  updateSettings({ enableVisualFeedback: value });
                }}
                trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
                thumbColor={settings.enableVisualFeedback ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t('voiceControl.hapticFeedback') || 'Haptic Feedback'}</Text>
              </View>
              <Switch
                value={settings.enableHapticFeedback}
                onValueChange={(value) => {
                  updateSettings({ enableHapticFeedback: value });
                }}
                trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
                thumbColor={settings.enableHapticFeedback ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            voiceControl.isListening ? styles.buttonActive : styles.buttonInactive,
            (!quota.canUseVoice && !quota.hasUnlimitedAccess) && styles.buttonDisabled,
          ]}
          onPress={handleToggleListening}
          disabled={!quota.canUseVoice && !quota.hasUnlimitedAccess}
        >
          {voiceControl.isListening ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {voiceControl.isListening
              ? t('voiceControl.stopListening') || 'Stop Listening'
              : t('voiceControl.startListening') || 'Start Listening'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  lastCommandText: {
    fontSize: 13,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    marginLeft: 8,
  },
  quotaBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  quotaFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  unlimitedText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#EF4444',
  },
  buttonInactive: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
