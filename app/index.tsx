import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('[Index] Starting app initialization...');
        
        const hasConsented = await AsyncStorage.getItem('hasAcceptedConsent');
        
        if (!hasConsented) {
          console.log('[Index] First time user, consent will be handled by _layout');
          setIsChecking(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('[Index] Navigating to home...');
        router.replace('/(tabs)/home');
      } catch (err) {
        console.error('[Index] Initialization error:', err);
        setIsChecking(false);
      }
    };

    initApp();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary.accent} />
      <Text style={styles.loadingText}>
        {isChecking ? t('app_name') : t('welcome_to_coolplay')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.primary.bg,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.primary.text,
    marginTop: 20,
    fontWeight: '600' as const,
  },
});
