import { NativeModules, NativeEventEmitter } from 'react-native';
import { UnifiedPlayerControlLayer } from './UnifiedPlayerControlLayer';
import { SupabaseClient } from '@supabase/supabase-js'; // Assuming Supabase is set up

// Get the native module based on platform
const VoiceModule = NativeModules.VoiceModuleiOS || NativeModules.VoiceModuleAndroid;
const VoiceEventEmitter = new NativeEventEmitter(VoiceModule);

// Supabase setup (Placeholder - actual setup should be in a provider)
const supabase = new SupabaseClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Define the required voice commands and their corresponding player actions
const COMMAND_MAP = {
    'play': 'play',
    'pause': 'pause',
    'stop': 'stop',
    'seek to': 'seek', // Requires additional parsing
    'forward ten': 'forward10',
    'forward twenty': 'forward20',
    'rewind ten': 'rewind10',
    'rewind twenty': 'rewind20',
    'volume up': 'volumeUp',
    'volume down': 'volumeDown',
    'volume max': 'volumeMax',
    'mute': 'mute',
    'unmute': 'unmute',
    'next': 'next',
    'previous': 'previous',
    // Add Chinese, Japanese, Korean commands here
    '播放': 'play',
    '暫停': 'pause',
    '停止': 'stop',
    '快進十秒': 'forward10',
    '快進二十秒': 'forward20',
    '後退十秒': 'rewind10',
    '後退二十秒': 'rewind20',
    '下一首': 'next',
    '上一首': 'previous',
};

class VoiceManager {
    constructor() {
        this.playerControl = new UnifiedPlayerControlLayer();
        this.isListening = false;
        this.listeners = [];
        this.setupListeners();
    }

    setupListeners() {
        this.listeners.push(VoiceEventEmitter.addListener('onSpeechResult', this.handleSpeechResult));
        this.listeners.push(VoiceEventEmitter.addListener('onSpeechError', this.handleSpeechError));
        this.listeners.push(VoiceEventEmitter.addListener('onSpeechStatus', this.handleSpeechStatus));
    }

    removeListeners() {
        this.listeners.forEach(listener => listener.remove());
    }

    // --- Public Methods ---

    async requestAuthorization() {
        if (VoiceModule.requestAuthorization) {
            return VoiceModule.requestAuthorization();
        }
        // Android permissions are usually handled by React Native/Expo
        return true;
    }

    startListening(locale = 'en-US') {
        if (!VoiceModule) {
            console.error("VoiceModule not available.");
            return;
        }
        VoiceModule.startListening(locale);
        this.isListening = true;
    }

    stopListening() {
        if (!VoiceModule) return;
        VoiceModule.stopListening();
        this.isListening = false;
    }

    // --- Event Handlers ---

    handleSpeechStatus = (event) => {
        console.log('Voice Status:', event.status);
        // Handle auto-restart logic here if needed (e.g., after END_OF_SPEECH)
    }

    handleSpeechError = (error) => {
        console.error('Voice Error:', error);
        // Handle error-based auto-restart or UI feedback
    }

    handleSpeechResult = async ({ text, confidence, isFinal }) => {
        if (!text) return;

        // 1. NLP and Normalization (Simple keyword matching for now)
        const normalizedText = text.toLowerCase().trim();
        let action = null;
        let param = null;

        for (const [command, playerAction] of Object.entries(COMMAND_MAP)) {
            if (normalizedText.includes(command)) {
                action = playerAction;
                // Simple parsing for 'seek to XX'
                if (action === 'seek') {
                    const match = normalizedText.match(/seek to (\d+)/);
                    if (match) {
                        param = parseInt(match[1], 10);
                    }
                }
                break;
            }
        }

        if (!action) {
            console.log(`No matching command found for: ${text}`);
            return;
        }

        // 2. Confidence Judgment
        if (confidence < 0.60) {
            console.log(`Command rejected due to low confidence (${confidence}): ${text}`);
            return;
        }

        if (confidence >= 0.60 && confidence <= 0.85) {
            // TODO: Implement confirmation UI flow
            console.log(`Confirmation needed for: ${text} (Confidence: ${confidence})`);
            // For now, we'll treat it as confirmed
        }

        // 3. Execute Action
        const success = await this.executePlayerAction(action, param);

        // 4. Supabase Sync (Log and Deduct Quota)
        await this.logAndDeductQuota(action, confidence, success, text);
    }

    async executePlayerAction(action, param) {
        try {
            switch (action) {
                case 'play':
                    this.playerControl.play();
                    break;
                case 'pause':
                    this.playerControl.pause();
                    break;
                case 'stop':
                    this.playerControl.stop();
                    break;
                case 'seek':
                    if (param !== null) this.playerControl.seek(param);
                    break;
                case 'forward10':
                    this.playerControl.seekRelative(10);
                    break;
                case 'rewind10':
                    this.playerControl.seekRelative(-10);
                    break;
                // ... implement all other actions
                default:
                    console.warn(`Action not implemented: ${action}`);
                    return false;
            }
            return true;
        } catch (e) {
            console.error(`Error executing player action ${action}:`, e);
            return false;
        }
    }

    async logAndDeductQuota(command, confidence, success, rawText) {
        const platform = Platform.OS;
        const user_id = (await supabase.auth.getSession())?.user?.id; // Get current user ID

        if (!user_id) {
            console.warn("User not logged in, skipping quota deduction/logging.");
            return;
        }

        const deduction_amount = success ? 1 : 0; // Only deduct on successful execution

        try {
            // Call the Edge Function
            const { data, error } = await supabase.functions.invoke('handleVoiceEvent', {
                body: JSON.stringify({
                    user_id,
                    platform,
                    command,
                    confidence,
                    success,
                    deduction_amount,
                    meta: { rawText }
                }),
                method: 'POST',
            });

            if (error) {
                console.error("Supabase Edge Function error:", error);
            } else {
                console.log("Supabase sync successful. Remaining quota:", data.remaining_quota);
            }
        } catch (e) {
            console.error("Error calling Supabase Edge Function:", e);
        }
    }
}

export default new VoiceManager();
