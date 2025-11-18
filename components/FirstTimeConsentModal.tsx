import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
} from 'react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

interface FirstTimeConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function FirstTimeConsentModal({
  visible,
  onAccept,
  onDecline,
}: FirstTimeConsentModalProps) {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setShowScrollHint(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://coolplay.app/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://coolplay.app/terms');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('privacy_policy')}</Text>
            <Text style={styles.subtitle}>{t('please_read_carefully')}</Text>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <Text style={styles.lastUpdated}>{t('last_updated')}: 2025-01-11</Text>

            <Text style={styles.sectionTitle}>1. {t('introduction')}</Text>
            <Text style={styles.paragraph}>{t('privacy_policy_intro')}</Text>

            <Text style={styles.sectionTitle}>2. {t('information_we_collect')}</Text>
            <Text style={styles.paragraph}>{t('information_we_collect_desc')}</Text>
            <Text style={styles.bulletPoint}>• {t('account_information')}</Text>
            <Text style={styles.bulletPoint}>• {t('usage_data')}</Text>
            <Text style={styles.bulletPoint}>• {t('device_information')}</Text>
            <Text style={styles.bulletPoint}>• {t('voice_data')}</Text>

            <Text style={styles.sectionTitle}>3. {t('voice_data_collection')}</Text>
            <View style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>{t('voice_data_title')}</Text>
              <Text style={styles.highlightText}>• {t('voice_collected_data')}</Text>
              <Text style={styles.highlightText}>• {t('voice_processing_method')}</Text>
              <Text style={styles.highlightText}>• {t('voice_storage_duration')}</Text>
              <Text style={styles.highlightText}>• {t('voice_third_party')}</Text>
              <Text style={styles.highlightText}>• {t('voice_opt_out')}</Text>
            </View>

            <Text style={styles.sectionTitle}>4. {t('third_party_services')}</Text>
            <Text style={styles.paragraph}>{t('third_party_services_desc')}</Text>
            <View style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>YouTube API Services</Text>
              <Text style={styles.highlightText}>{t('youtube_api_notice')}</Text>
            </View>

            <Text style={styles.sectionTitle}>5. {t('data_storage')}</Text>
            <Text style={styles.paragraph}>{t('data_storage_desc')}</Text>

            <Text style={styles.sectionTitle}>6. {t('permissions_required')}</Text>
            <Text style={styles.paragraph}>{t('permissions_required_desc')}</Text>
            <Text style={styles.bulletPoint}>• {t('microphone_permission')}: {t('microphone_permission_desc')}</Text>
            <Text style={styles.bulletPoint}>• {t('storage_permission')}: {t('storage_permission_desc')}</Text>
            <Text style={styles.bulletPoint}>• {t('internet_permission')}: {t('internet_permission_desc')}</Text>

            <Text style={styles.sectionTitle}>7. {t('your_rights')}</Text>
            <Text style={styles.paragraph}>{t('your_rights_desc')}</Text>
            <Text style={styles.bulletPoint}>• {t('access_your_data')}</Text>
            <Text style={styles.bulletPoint}>• {t('delete_your_data')}</Text>
            <Text style={styles.bulletPoint}>• {t('revoke_permissions')}</Text>

            <Text style={styles.sectionTitle}>8. {t('contact_us')}</Text>
            <Text style={styles.paragraph}>{t('privacy_contact')}</Text>
            <Text style={styles.contactInfo}>support@coolplay.com</Text>

            <View style={styles.bottomPadding} />
          </ScrollView>

          {showScrollHint && (
            <View style={styles.scrollHint}>
              <Text style={styles.scrollHintText}>↓ {t('scroll_to_read_full_content')} ↓</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                !hasScrolledToBottom && styles.disabledButton,
              ]}
              onPress={onAccept}
              disabled={!hasScrolledToBottom}
            >
              <Text
                style={[
                  styles.acceptButtonText,
                  !hasScrolledToBottom && styles.disabledButtonText,
                ]}
              >
                {t('accept_and_continue')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Text style={styles.declineButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end' as const,
  },
  modalContainer: {
    width: '100%',
    height: '92%',
    backgroundColor: Colors.primary.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
    backgroundColor: Colors.primary.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.primary.text,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
    textAlign: 'center' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lastUpdated: {
    fontSize: 11,
    color: Colors.primary.textSecondary,
    fontStyle: 'italic' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary.text,
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 6,
  },
  highlightBox: {
    backgroundColor: `${Colors.primary.accent}12`,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.accent,
    padding: 16,
    borderRadius: 10,
    marginVertical: 12,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary.text,
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  contactInfo: {
    fontSize: 14,
    color: Colors.primary.accent,
    fontWeight: '600' as const,
    marginTop: 8,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 40,
  },
  scrollHint: {
    position: 'absolute' as const,
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center' as const,
    paddingVertical: 12,
    backgroundColor: `${Colors.primary.accent}20`,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primary.accent,
  },
  scrollHintText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary.accent,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
    backgroundColor: Colors.primary.bg,
  },
  acceptButton: {
    backgroundColor: Colors.primary.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.primary.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: Colors.card.border,
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  acceptButtonText: {
    color: Colors.primary.text,
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  disabledButtonText: {
    color: Colors.primary.textSecondary,
  },
  declineButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  declineButtonText: {
    color: Colors.primary.textSecondary,
    fontSize: 15,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
});
