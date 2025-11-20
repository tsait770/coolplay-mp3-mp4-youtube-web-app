import { RefObject } from 'react';
import { WebView } from 'react-native-webview';
import { UniversalPlayerController, PlayerStatus, PlayerState } from './UniversalPlayerController';
import { PlayerAdapterRouter } from './PlayerAdapterRouter';

export type VoiceCommandIntent = 
  | 'playback_control'
  | 'seek_control'
  | 'volume_control'
  | 'speed_control'
  | 'fullscreen_control';

export type VoiceCommandAction = 
  | 'play'
  | 'pause'
  | 'stop'
  | 'next'
  | 'previous'
  | 'restart'
  | 'forward'
  | 'rewind'
  | 'volume_up'
  | 'volume_down'
  | 'mute'
  | 'unmute'
  | 'set_speed'
  | 'enter_fullscreen'
  | 'exit_fullscreen'
  | 'toggle_fullscreen';

export interface VoiceCommandPayload {
  intent: VoiceCommandIntent;
  action?: VoiceCommandAction;
  slot?: Record<string, any>;
}

export interface GlobalPlayerState {
  isActive: boolean;
  currentUrl: string | null;
  status: PlayerStatus | null;
  playlist: string[];
  currentIndex: number;
}

type PlayerEventListener = (state: GlobalPlayerState) => void;

class GlobalPlayerManager {
  private static instance: GlobalPlayerManager | null = null;
  private currentPlayer: UniversalPlayerController | null = null;
  private currentUrl: string | null = null;
  private webViewRef: RefObject<WebView> | null = null;
  private listeners: Set<PlayerEventListener> = new Set();
  private playlist: string[] = [];
  private currentIndex: number = 0;
  private state: GlobalPlayerState = {
    isActive: false,
    currentUrl: null,
    status: null,
    playlist: [],
    currentIndex: 0,
  };

  private constructor() {
    console.log('[GlobalPlayerManager] Instance created');
  }

  static getInstance(): GlobalPlayerManager {
    if (!GlobalPlayerManager.instance) {
      GlobalPlayerManager.instance = new GlobalPlayerManager();
    }
    return GlobalPlayerManager.instance;
  }

  setWebViewRef(ref: RefObject<WebView> | null): void {
    console.log('[GlobalPlayerManager] WebView ref set:', !!ref);
    this.webViewRef = ref;
  }

  loadVideo(url: string): boolean {
    console.log('[GlobalPlayerManager] Loading video:', url);

    if (this.currentPlayer) {
      this.disposeCurrentPlayer();
    }

    const adapter = PlayerAdapterRouter.createAdapter(url, this.webViewRef || undefined);

    if (!adapter) {
      console.error('[GlobalPlayerManager] Failed to create adapter for URL:', url);
      return false;
    }

    this.currentPlayer = adapter;
    this.currentUrl = url;

    adapter.subscribe((status) => {
      this.updateState({ status });
    });

    this.updateState({
      isActive: true,
      currentUrl: url,
    });

    return true;
  }

  async executeVoiceCommand(payload: VoiceCommandPayload): Promise<boolean> {
    console.log('[GlobalPlayerManager] Executing voice command:', payload);

    if (!this.currentPlayer || !this.currentPlayer.isReady()) {
      console.warn('[GlobalPlayerManager] No active player or player not ready');
      return false;
    }

    try {
      switch (payload.intent) {
        case 'playback_control':
          return await this.handlePlaybackControl(payload);
        case 'seek_control':
          return await this.handleSeekControl(payload);
        case 'volume_control':
          return await this.handleVolumeControl(payload);
        case 'speed_control':
          return await this.handleSpeedControl(payload);
        case 'fullscreen_control':
          return await this.handleFullscreenControl(payload);
        default:
          console.warn('[GlobalPlayerManager] Unknown intent:', payload.intent);
          return false;
      }
    } catch (error) {
      console.error('[GlobalPlayerManager] Error executing command:', error);
      return false;
    }
  }

  private async handlePlaybackControl(payload: VoiceCommandPayload): Promise<boolean> {
    if (!this.currentPlayer) return false;

    const action = payload.action || this.inferPlaybackAction(payload.slot);

    switch (action) {
      case 'play':
        await this.currentPlayer.play();
        return true;
      case 'pause':
        await this.currentPlayer.pause();
        return true;
      case 'stop':
        await this.currentPlayer.stop();
        return true;
      case 'restart':
        await this.currentPlayer.restart();
        return true;
      case 'next':
        await this.playNext();
        return true;
      case 'previous':
        await this.playPrevious();
        return true;
      default:
        console.warn('[GlobalPlayerManager] Unknown playback action:', action);
        return false;
    }
  }

  private async handleSeekControl(payload: VoiceCommandPayload): Promise<boolean> {
    if (!this.currentPlayer) return false;

    const action = payload.action || 'forward';
    const seconds = payload.slot?.seconds || 10;

    switch (action) {
      case 'forward':
        await this.currentPlayer.forward(seconds);
        return true;
      case 'rewind':
        await this.currentPlayer.rewind(seconds);
        return true;
      default:
        console.warn('[GlobalPlayerManager] Unknown seek action:', action);
        return false;
    }
  }

  private async handleVolumeControl(payload: VoiceCommandPayload): Promise<boolean> {
    if (!this.currentPlayer) return false;

    const action = payload.action || this.inferVolumeAction(payload.slot);
    const status = await this.currentPlayer.getStatus();

    switch (action) {
      case 'mute':
        await this.currentPlayer.setMuted(true);
        return true;
      case 'unmute':
        await this.currentPlayer.setMuted(false);
        return true;
      case 'volume_up':
        await this.currentPlayer.setVolume(Math.min(1, status.volume + 0.1));
        return true;
      case 'volume_down':
        await this.currentPlayer.setVolume(Math.max(0, status.volume - 0.1));
        return true;
      default:
        if (payload.slot?.level !== undefined) {
          const level = this.normalizeVolumeLevel(payload.slot.level);
          await this.currentPlayer.setVolume(level);
          return true;
        }
        return false;
    }
  }

  private async handleSpeedControl(payload: VoiceCommandPayload): Promise<boolean> {
    if (!this.currentPlayer) return false;

    const speed = payload.slot?.speed;
    if (typeof speed !== 'number') {
      console.warn('[GlobalPlayerManager] Invalid speed value:', speed);
      return false;
    }

    await this.currentPlayer.setPlaybackRate(speed);
    return true;
  }

  private async handleFullscreenControl(payload: VoiceCommandPayload): Promise<boolean> {
    if (!this.currentPlayer) return false;

    const action = payload.action || this.inferFullscreenAction(payload.slot);

    switch (action) {
      case 'enter_fullscreen':
        await this.currentPlayer.enterFullscreen();
        return true;
      case 'exit_fullscreen':
        await this.currentPlayer.exitFullscreen();
        return true;
      case 'toggle_fullscreen':
        await this.currentPlayer.toggleFullscreen();
        return true;
      default:
        await this.currentPlayer.toggleFullscreen();
        return true;
    }
  }

  private inferPlaybackAction(slot?: Record<string, any>): VoiceCommandAction | undefined {
    if (!slot) return undefined;
    
    if (slot.state === 'play') return 'play';
    if (slot.state === 'pause') return 'pause';
    if (slot.state === 'stop') return 'stop';
    if (slot.state === 'restart') return 'restart';
    
    return undefined;
  }

  private inferVolumeAction(slot?: Record<string, any>): VoiceCommandAction | undefined {
    if (!slot) return undefined;
    
    const level = slot.level;
    if (level === 'mute') return 'mute';
    if (level === 'unmute') return 'unmute';
    if (level === 'up') return 'volume_up';
    if (level === 'down') return 'volume_down';
    
    return undefined;
  }

  private inferFullscreenAction(slot?: Record<string, any>): VoiceCommandAction | undefined {
    if (!slot) return undefined;
    
    const state = slot.state;
    if (state === 'enter') return 'enter_fullscreen';
    if (state === 'exit') return 'exit_fullscreen';
    
    return 'toggle_fullscreen';
  }

  private normalizeVolumeLevel(level: any): number {
    if (typeof level === 'number') {
      return Math.max(0, Math.min(1, level));
    }
    
    if (level === 'max') return 1;
    if (level === 'mute') return 0;
    
    return 1;
  }

  setPlaylist(urls: string[], startIndex: number = 0): void {
    console.log('[GlobalPlayerManager] Setting playlist:', { count: urls.length, startIndex });
    
    this.playlist = urls;
    this.currentIndex = startIndex;
    
    this.updateState({
      playlist: urls,
      currentIndex: startIndex,
    });

    if (urls.length > 0 && startIndex >= 0 && startIndex < urls.length) {
      this.loadVideo(urls[startIndex]);
    }
  }

  async playNext(): Promise<boolean> {
    if (this.playlist.length === 0) {
      console.warn('[GlobalPlayerManager] No playlist set');
      return false;
    }

    const nextIndex = (this.currentIndex + 1) % this.playlist.length;
    this.currentIndex = nextIndex;

    this.updateState({ currentIndex: nextIndex });

    const nextUrl = this.playlist[nextIndex];
    return this.loadVideo(nextUrl);
  }

  async playPrevious(): Promise<boolean> {
    if (this.playlist.length === 0) {
      console.warn('[GlobalPlayerManager] No playlist set');
      return false;
    }

    const prevIndex = this.currentIndex - 1 < 0 
      ? this.playlist.length - 1 
      : this.currentIndex - 1;
    
    this.currentIndex = prevIndex;

    this.updateState({ currentIndex: prevIndex });

    const prevUrl = this.playlist[prevIndex];
    return this.loadVideo(prevUrl);
  }

  getCurrentPlayer(): UniversalPlayerController | null {
    return this.currentPlayer;
  }

  getState(): GlobalPlayerState {
    return { ...this.state };
  }

  subscribe(listener: PlayerEventListener): () => void {
    this.listeners.add(listener);
    
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(updates: Partial<GlobalPlayerState>): void {
    this.state = { ...this.state, ...updates };
    
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('[GlobalPlayerManager] Error in listener:', error);
      }
    });
  }

  private disposeCurrentPlayer(): void {
    if (this.currentPlayer) {
      console.log('[GlobalPlayerManager] Disposing current player');
      this.currentPlayer.dispose();
      this.currentPlayer = null;
    }
  }

  dispose(): void {
    console.log('[GlobalPlayerManager] Disposing manager');
    
    this.disposeCurrentPlayer();
    this.listeners.clear();
    this.playlist = [];
    this.currentIndex = 0;
    this.currentUrl = null;
    this.webViewRef = null;
    
    this.updateState({
      isActive: false,
      currentUrl: null,
      status: null,
      playlist: [],
      currentIndex: 0,
    });
  }
}

export const globalPlayerManager = GlobalPlayerManager.getInstance();
