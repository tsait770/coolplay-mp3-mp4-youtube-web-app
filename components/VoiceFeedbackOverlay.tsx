import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Mic, Volume2, Play, SkipForward, Maximize } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VoiceFeedbackOverlayProps {
  isListening: boolean;
  isProcessing: boolean;
  lastCommand: string | null;
  lastIntent: string | null;
  confidence: number;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.85) return '#10b981';
  if (confidence >= 0.6) return '#f59e0b';
  return '#ef4444';
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.85) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
};

const getIntentIcon = (intent: string | null) => {
  const iconProps = { size: 24, color: '#ffffff' };
  
  switch (intent) {
    case 'playback_control':
      return <Play {...iconProps} />;
    case 'volume_control':
      return <Volume2 {...iconProps} />;
    case 'seek_control':
      return <SkipForward {...iconProps} />;
    case 'fullscreen_control':
      return <Maximize {...iconProps} />;
    default:
      return <Mic {...iconProps} />;
  }
};

export const VoiceFeedbackOverlay: React.FC<VoiceFeedbackOverlayProps> = ({
  isListening,
  isProcessing,
  lastCommand,
  lastIntent,
  confidence,
}) => {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (lastCommand && confidence > 0) {
      setShowFeedback(true);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFeedback(false);
      });
    }
  }, [lastCommand, confidence, fadeAnim]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  if (!isListening && !showFeedback) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 16 }]} pointerEvents="none">
      {isListening && (
        <Animated.View 
          style={[
            styles.listeningIndicator,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Mic size={20} color="#ffffff" />
          <Text style={styles.listeningText}>
            {isProcessing ? 'Processing...' : 'Listening...'}
          </Text>
        </Animated.View>
      )}

      {showFeedback && lastCommand && (
        <Animated.View 
          style={[
            styles.feedbackCard,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.feedbackHeader}>
            <View style={styles.intentIcon}>
              {getIntentIcon(lastIntent)}
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.commandText} numberOfLines={1}>
                {lastCommand}
              </Text>
              <View style={styles.confidenceRow}>
                <View 
                  style={[
                    styles.confidenceBadge, 
                    { backgroundColor: getConfidenceColor(confidence) }
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {confidence < 0.6 && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                Low confidence - please try again
              </Text>
            </View>
          )}
          
          {confidence >= 0.6 && confidence < 0.85 && (
            <View style={[styles.warningBanner, { backgroundColor: '#f59e0b20' }]}>
              <Text style={[styles.warningText, { color: '#f59e0b' }]}>
                Command recognized, executing...
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  listeningText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  feedbackCard: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackContent: {
    flex: 1,
    gap: 4,
  },
  commandText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  warningBanner: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ef444420',
  },
  warningText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
});
