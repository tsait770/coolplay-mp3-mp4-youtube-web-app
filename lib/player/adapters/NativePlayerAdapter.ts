import {
  UniversalPlayerController,
  PlayerState,
  PlayerStatus,
  PlayerType,
  VideoSourceConfig,
} from '../UniversalPlayerController';

export class NativePlayerAdapter implements UniversalPlayerController {
  private player: any;
  private listeners: Set<(status: PlayerStatus) => void> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentState: PlayerState = PlayerState.IDLE;
  private url: string;
  private config?: VideoSourceConfig;

  constructor(urlOrPlayer: string | any, config?: VideoSourceConfig) {
    if (typeof urlOrPlayer === 'string') {
      // 如果第一個參數是 URL 字串
      console.log('[NativePlayerAdapter] Initializing with URL:', urlOrPlayer);
      this.url = urlOrPlayer;
      this.config = config;
      // Player 實例將由外部設置或延遲初始化
      this.player = null;
    } else {
      // 如果第一個參數是 player 對象
      console.log('[NativePlayerAdapter] Initializing with player instance');
      this.player = urlOrPlayer;
      this.url = '';
      this.config = config;
    }
    this.currentState = PlayerState.IDLE;
    this.startStatusMonitoring();
  }

  // 設置 player 實例的方法
  setPlayer(player: any): void {
    this.player = player;
    if (player) {
      this.currentState = PlayerState.READY;
    }
  }

  getPlayerType(): PlayerType {
    return PlayerType.NATIVE;
  }

  private startStatusMonitoring(): void {
    this.intervalId = setInterval(() => {
      this.notifyListeners();
    }, 250);
  }

  private stopStatusMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private notifyListeners(): void {
    this.getStatus().then(status => {
      this.listeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          console.error('[NativePlayerAdapter] Error in listener:', error);
        }
      });
    });
  }

  async play(): Promise<void> {
    try {
      if (this.player && typeof this.player.play === 'function') {
        this.player.play();
        this.currentState = PlayerState.PLAYING;
        console.log('[NativePlayerAdapter] Play started');
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error playing:', error);
      this.currentState = PlayerState.ERROR;
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.player && typeof this.player.pause === 'function') {
        this.player.pause();
        this.currentState = PlayerState.PAUSED;
        console.log('[NativePlayerAdapter] Paused');
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error pausing:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.player && typeof this.player.pause === 'function') {
        this.player.pause();
        this.player.currentTime = 0;
        this.currentState = PlayerState.IDLE;
        console.log('[NativePlayerAdapter] Stopped');
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error stopping:', error);
      throw error;
    }
  }

  async seek(time: number): Promise<void> {
    try {
      if (this.player) {
        const duration = this.player.duration || 0;
        const clampedTime = Math.max(0, Math.min(time, duration));
        this.player.currentTime = clampedTime;
        console.log('[NativePlayerAdapter] Seeked to:', clampedTime);
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error seeking:', error);
      throw error;
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      if (this.player) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.player.volume = clampedVolume;
        console.log('[NativePlayerAdapter] Volume set to:', clampedVolume);
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error setting volume:', error);
      throw error;
    }
  }

  async setPlaybackRate(rate: number): Promise<void> {
    try {
      if (this.player) {
        const clampedRate = Math.max(0.25, Math.min(2.0, rate));
        this.player.playbackRate = clampedRate;
        console.log('[NativePlayerAdapter] Playback rate set to:', clampedRate);
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error setting playback rate:', error);
      throw error;
    }
  }

  async setMuted(muted: boolean): Promise<void> {
    try {
      if (this.player) {
        this.player.muted = muted;
        console.log('[NativePlayerAdapter] Muted:', muted);
      }
    } catch (error) {
      console.error('[NativePlayerAdapter] Error setting muted:', error);
      throw error;
    }
  }

  async toggleMute(): Promise<void> {
    try {
      const status = await this.getStatus();
      await this.setMuted(!status.muted);
    } catch (error) {
      console.error('[NativePlayerAdapter] Error toggling mute:', error);
      throw error;
    }
  }

  async forward(seconds: number): Promise<void> {
    try {
      const status = await this.getStatus();
      await this.seek(status.currentTime + seconds);
    } catch (error) {
      console.error('[NativePlayerAdapter] Error forwarding:', error);
      throw error;
    }
  }

  async rewind(seconds: number): Promise<void> {
    try {
      const status = await this.getStatus();
      await this.seek(Math.max(0, status.currentTime - seconds));
    } catch (error) {
      console.error('[NativePlayerAdapter] Error rewinding:', error);
      throw error;
    }
  }

  async restart(): Promise<void> {
    try {
      await this.seek(0);
      await this.play();
    } catch (error) {
      console.error('[NativePlayerAdapter] Error restarting:', error);
      throw error;
    }
  }

  async toggleFullscreen(): Promise<void> {
    // Native player fullscreen toggle
    console.log('[NativePlayerAdapter] Toggle fullscreen requested');
  }

  isReady(): boolean {
    return this.currentState === PlayerState.READY || 
           this.currentState === PlayerState.PLAYING || 
           this.currentState === PlayerState.PAUSED;
  }

  async enterFullscreen(): Promise<void> {
    console.log('[NativePlayerAdapter] Enter fullscreen requested');
  }

  async exitFullscreen(): Promise<void> {
    console.log('[NativePlayerAdapter] Exit fullscreen requested');
  }

  async getStatus(): Promise<PlayerStatus> {
    try {
      const isPlaying = this.player?.playing || false;
      const currentTime = this.player?.currentTime || 0;
      const duration = this.player?.duration || 0;
      
      if (isPlaying && this.currentState !== PlayerState.PLAYING) {
        this.currentState = PlayerState.PLAYING;
      } else if (!isPlaying && this.currentState === PlayerState.PLAYING) {
        if (currentTime >= duration && duration > 0) {
          this.currentState = PlayerState.ENDED;
        } else {
          this.currentState = PlayerState.PAUSED;
        }
      }

      return {
        state: this.currentState,
        currentTime,
        duration,
        volume: this.player?.volume || 1.0,
        muted: this.player?.muted || false,
        playbackRate: this.player?.playbackRate || 1.0,
        isFullscreen: false,
      };
    } catch (error) {
      console.error('[NativePlayerAdapter] Error getting status:', error);
      return {
        state: PlayerState.ERROR,
        currentTime: 0,
        duration: 0,
        volume: 1.0,
        muted: false,
        playbackRate: 1.0,
        isFullscreen: false,
        error: String(error),
      };
    }
  }

  subscribe(listener: (status: PlayerStatus) => void): () => void {
    this.listeners.add(listener);
    console.log('[NativePlayerAdapter] Listener subscribed. Total:', this.listeners.size);
    
    return () => {
      this.listeners.delete(listener);
      console.log('[NativePlayerAdapter] Listener unsubscribed. Total:', this.listeners.size);
    };
  }

  dispose(): void {
    console.log('[NativePlayerAdapter] Disposing...');
    this.stopStatusMonitoring();
    this.listeners.clear();
    
    if (this.player) {
      try {
        if (typeof this.player.pause === 'function') {
          this.player.pause();
        }
      } catch (error) {
        console.error('[NativePlayerAdapter] Error disposing player:', error);
      }
    }
  }
}
