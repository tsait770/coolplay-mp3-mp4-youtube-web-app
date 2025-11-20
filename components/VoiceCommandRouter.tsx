import { useEffect } from 'react';
import { globalPlayerManager, VoiceCommandPayload } from '@/lib/player/GlobalPlayerManager';

export interface VoiceCommandEvent extends Event {
  detail: {
    intent: string;
    action?: string;
    slot?: Record<string, any>;
  };
}

const mapLegacyCommandToPayload = (detail: VoiceCommandEvent['detail']): VoiceCommandPayload | null => {
  const { intent, action, slot } = detail;

  const intentMap: Record<string, VoiceCommandPayload['intent']> = {
    'playback_control': 'playback_control',
    'seek_control': 'seek_control',
    'volume_control': 'volume_control',
    'speed_control': 'speed_control',
    'fullscreen_control': 'fullscreen_control',
  };

  const mappedIntent = intentMap[intent];
  if (!mappedIntent) {
    console.warn('[VoiceCommandRouter] Unknown intent:', intent);
    return null;
  }

  return {
    intent: mappedIntent,
    action: action as any,
    slot: slot || undefined,
  };
};

export const VoiceCommandRouter = () => {
  useEffect(() => {
    const handleVoiceCommand = async (event: Event) => {
      const customEvent = event as VoiceCommandEvent;
      
      if (!customEvent.detail) {
        console.warn('[VoiceCommandRouter] Invalid voice command event');
        return;
      }

      console.log('[VoiceCommandRouter] Received voice command:', customEvent.detail);

      const payload = mapLegacyCommandToPayload(customEvent.detail);
      
      if (!payload) {
        console.warn('[VoiceCommandRouter] Failed to map command to payload');
        return;
      }

      const success = await globalPlayerManager.executeVoiceCommand(payload);

      if (success) {
        console.log('[VoiceCommandRouter] Command executed successfully');
      } else {
        console.warn('[VoiceCommandRouter] Command execution failed');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('voiceCommand', handleVoiceCommand);

      console.log('[VoiceCommandRouter] Registered voice command listener');
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('voiceCommand', handleVoiceCommand);
        console.log('[VoiceCommandRouter] Unregistered voice command listener');
      }
    };
  }, []);

  return null;
};
