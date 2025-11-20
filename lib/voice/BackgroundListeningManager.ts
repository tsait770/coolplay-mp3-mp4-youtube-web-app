import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface BackgroundListeningConfig {
  enableKeepAlive: boolean;
  keepAliveInterval: number;
  enableForegroundService: boolean;
  enableBackgroundAudio: boolean;
  enableWakeWord: boolean;
  wakeWords: string[];
}

export class BackgroundListeningManager {
  private config: BackgroundListeningConfig;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: any = null;
  private restartCallback: (() => Promise<void>) | null = null;
  private isActiveCallback: (() => boolean) | null = null;

  constructor(config: Partial<BackgroundListeningConfig> = {}) {
    this.config = {
      enableKeepAlive: config.enableKeepAlive ?? true,
      keepAliveInterval: config.keepAliveInterval ?? 5000,
      enableForegroundService: config.enableForegroundService ?? Platform.OS === 'android',
      enableBackgroundAudio: config.enableBackgroundAudio ?? Platform.OS === 'ios',
      enableWakeWord: config.enableWakeWord ?? false,
      wakeWords: config.wakeWords ?? ['hey coolplay', 'ok coolplay'],
    };
  }

  async start(
    restartCallback: () => Promise<void>,
    isActiveCallback: () => boolean
  ): Promise<void> {
    console.log('[BackgroundListeningManager] Starting background listening...');
    
    this.restartCallback = restartCallback;
    this.isActiveCallback = isActiveCallback;

    if (Platform.OS === 'ios') {
      await this.setupIOSBackgroundListening();
    } else if (Platform.OS === 'android') {
      await this.setupAndroidBackgroundListening();
    } else {
      await this.setupWebBackgroundListening();
    }

    if (this.config.enableKeepAlive) {
      this.startKeepAlive();
    }

    this.setupAppStateListener();
  }

  async stop(): Promise<void> {
    console.log('[BackgroundListeningManager] Stopping background listening...');
    
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (Platform.OS === 'android' && this.config.enableForegroundService) {
      await this.stopForegroundService();
    }
  }

  private async setupIOSBackgroundListening(): Promise<void> {
    console.log('[BackgroundListeningManager] Setting up iOS background listening');
    
    if (this.config.enableBackgroundAudio) {
      console.log('[BackgroundListeningManager] iOS: Background audio mode required');
      console.log('[BackgroundListeningManager] iOS: Please ensure UIBackgroundModes includes "audio" in app.json');
    }

    console.log('[BackgroundListeningManager] iOS: Using keep-alive mechanism for ASR restart');
  }

  private async setupAndroidBackgroundListening(): Promise<void> {
    console.log('[BackgroundListeningManager] Setting up Android background listening');
    
    if (this.config.enableForegroundService) {
      await this.startForegroundService();
    }

    console.log('[BackgroundListeningManager] Android: Foreground service active');
  }

  private async setupWebBackgroundListening(): Promise<void> {
    console.log('[BackgroundListeningManager] Setting up Web background listening');
    console.log('[BackgroundListeningManager] Web: Active tab required for continuous listening');
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('[BackgroundListeningManager] Tab hidden - ASR may stop');
        } else {
          console.log('[BackgroundListeningManager] Tab visible - checking ASR status');
          this.checkAndRestart();
        }
      });
    }
  }

  private startKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }

    console.log(
      `[BackgroundListeningManager] Starting keep-alive (interval: ${this.config.keepAliveInterval}ms)`
    );

    this.keepAliveTimer = setInterval(() => {
      this.checkAndRestart();
    }, this.config.keepAliveInterval);
  }

  private async checkAndRestart(): Promise<void> {
    if (!this.isActiveCallback || !this.restartCallback) {
      return;
    }

    const isActive = this.isActiveCallback();
    
    if (!isActive) {
      console.log('[BackgroundListeningManager] Keep-alive: ASR inactive, restarting...');
      
      try {
        await this.restartCallback();
        console.log('[BackgroundListeningManager] Keep-alive: ASR restarted successfully');
      } catch (error) {
        console.error('[BackgroundListeningManager] Keep-alive: Failed to restart ASR:', error);
      }
    }
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('[BackgroundListeningManager] App state changed:', nextAppState);
      
      if (nextAppState === 'active') {
        console.log('[BackgroundListeningManager] App resumed - checking ASR status');
        this.checkAndRestart();
      } else if (nextAppState === 'background') {
        console.log('[BackgroundListeningManager] App backgrounded');
        
        if (Platform.OS === 'android' && this.config.enableForegroundService) {
          console.log('[BackgroundListeningManager] Android: Foreground service should keep ASR alive');
        } else if (Platform.OS === 'ios' && this.config.enableBackgroundAudio) {
          console.log('[BackgroundListeningManager] iOS: Background audio mode should maintain session');
        } else {
          console.log('[BackgroundListeningManager] ASR may be suspended by system');
        }
      }
    });
  }

  private async startForegroundService(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('[BackgroundListeningManager] Notification permission not granted');
        return;
      }

      await Notifications.setNotificationChannelAsync('voice-control', {
        name: 'Voice Control',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: null,
        enableLights: false,
        enableVibrate: false,
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Voice Control Active',
          body: 'Listening for voice commands in the background',
          categoryIdentifier: 'voice-control',
          sound: null,
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: null,
      });

      console.log('[BackgroundListeningManager] Foreground service notification posted');
    } catch (error) {
      console.error('[BackgroundListeningManager] Failed to start foreground service:', error);
    }
  }

  private async stopForegroundService(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[BackgroundListeningManager] Foreground service notification dismissed');
    } catch (error) {
      console.error('[BackgroundListeningManager] Failed to stop foreground service:', error);
    }
  }

  updateConfig(config: Partial<BackgroundListeningConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    
    console.log('[BackgroundListeningManager] Config updated:', this.config);
    
    if (this.config.enableKeepAlive && !this.keepAliveTimer) {
      this.startKeepAlive();
    } else if (!this.config.enableKeepAlive && this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  getConfig(): BackgroundListeningConfig {
    return { ...this.config };
  }
}

let globalBackgroundManager: BackgroundListeningManager | null = null;

export function getGlobalBackgroundManager(): BackgroundListeningManager {
  if (!globalBackgroundManager) {
    globalBackgroundManager = new BackgroundListeningManager();
  }
  return globalBackgroundManager;
}

export function setGlobalBackgroundManager(manager: BackgroundListeningManager): void {
  globalBackgroundManager = manager;
}
