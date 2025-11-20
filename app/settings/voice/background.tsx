import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Info, Smartphone, Monitor, Zap } from 'lucide-react-native';
import { useVoiceControlV2 } from '@/providers/VoiceControlProviderV2';


export default function BackgroundListeningScreen() {
  const insets = useSafeAreaInsets();

  const voiceControl = useVoiceControlV2();
  const [settings, setSettings] = useState({
    enableKeepAlive: true,
    keepAliveInterval: 5000,
    enableNotification: Platform.OS === 'android',
  });

  const handleToggleAlwaysListening = async () => {
    if (!voiceControl.alwaysListening) {
      Alert.alert(
        'Enable Background Listening',
        Platform.select({
          ios: 'Background listening on iOS requires audio permissions and may drain battery faster. The app will attempt to keep voice recognition active.',
          android: 'Background listening on Android will show a persistent notification to keep the service running.',
          web: 'Background listening on web requires the browser tab to remain active.',
          default: 'Background listening may consume more battery.',
        }),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              await voiceControl.toggleAlwaysListening();
            },
          },
        ]
      );
    } else {
      await voiceControl.toggleAlwaysListening();
    }
  };

  const getPlatformGuidance = () => {
    switch (Platform.OS) {
      case 'ios':
        return {
          icon: <Smartphone size={24} color="#3b82f6" />,
          title: 'iOS Background Listening',
          description:
            'Voice recognition may be interrupted when the app is in the background. For best results:\n\n• Keep the app in foreground\n• Use "Hey Siri" integration (coming soon)\n• Enable background audio permissions',
          limitations: [
            'System may suspend voice recognition',
            'Background audio permission required',
            'Battery usage may increase',
          ],
        };
      case 'android':
        return {
          icon: <Smartphone size={24} color="#10b981" />,
          title: 'Android Background Listening',
          description:
            'Uses a foreground service with persistent notification to keep voice recognition active.\n\n• Notification shown when active\n• Better battery optimization\n• Reliable background operation',
          limitations: [
            'Persistent notification required',
            'May be stopped on low memory',
            'Requires notification permission',
          ],
        };
      case 'web':
        return {
          icon: <Monitor size={24} color="#f59e0b" />,
          title: 'Web Background Listening',
          description:
            'Browser limitations require the tab to remain active for continuous voice recognition.\n\n• Keep browser tab active\n• Use keyboard shortcuts as backup\n• Consider using mobile app for better experience',
          limitations: [
            'Tab must remain active',
            'May be paused when tab hidden',
            'Browser permission required',
          ],
        };
      default:
        return {
          icon: <Zap size={24} color="#6b7280" />,
          title: 'Background Listening',
          description: 'Platform-specific limitations apply.',
          limitations: [],
        };
    }
  };

  const guidance = getPlatformGuidance();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Background Listening',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#ffffff',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.platformCard}>
          <View style={styles.platformHeader}>
            {guidance.icon}
            <Text style={styles.platformTitle}>{guidance.title}</Text>
          </View>
          <Text style={styles.platformDescription}>{guidance.description}</Text>
          
          {guidance.limitations.length > 0 && (
            <>
              <Text style={styles.limitationsTitle}>Limitations:</Text>
              {guidance.limitations.map((limitation, index) => (
                <View key={index} style={styles.limitationItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.limitationText}>{limitation}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Always Listening</Text>
              <Text style={styles.settingDescription}>
                Keep voice recognition active in the background
              </Text>
            </View>
            <Switch
              value={voiceControl.alwaysListening}
              onValueChange={handleToggleAlwaysListening}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Restart</Text>
              <Text style={styles.settingDescription}>
                Automatically restart voice recognition if interrupted
              </Text>
            </View>
            <Switch
              value={settings.enableKeepAlive}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, enableKeepAlive: value }))
              }
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          </View>

          {Platform.OS === 'android' && (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Notification</Text>
                <Text style={styles.settingDescription}>
                  Display persistent notification when active (Android only)
                </Text>
              </View>
              <Switch
                value={settings.enableNotification}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, enableNotification: value }))
                }
                trackColor={{ false: '#374151', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Info size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Background listening may impact battery life. We recommend enabling it only when needed.
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Current Status</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Voice Control:</Text>
            <Text style={[styles.statValue, { color: voiceControl.isListening ? '#10b981' : '#6b7280' }]}>
              {voiceControl.isListening ? 'Active' : 'Inactive'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Commands:</Text>
            <Text style={styles.statValue}>{voiceControl.usageCount}</Text>
          </View>

          {voiceControl.lastCommand && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Last Command:</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {voiceControl.lastCommand}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  platformCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  platformDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
    marginTop: 8,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    marginTop: 6,
  },
  limitationText: {
    flex: 1,
    fontSize: 13,
    color: '#9ca3af',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  settingDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#1e3a8a20',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#93c5fd',
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});
