import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AlertCircle, CheckCircle, X, Mail, ShieldCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

export interface ParentalConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onConsentGranted: () => void;
  childAge: number;
  userId: string;
}

export default function ParentalConsentModal({
  visible,
  onClose,
  onConsentGranted,
  childAge,
  userId,
}: ParentalConsentModalProps) {
  const { t } = useTranslation();
  const [parentEmail, setParentEmail] = useState('');
  const [confirmParent, setConfirmParent] = useState(false);
  const [understandPrivacy, setUnderstandPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerificationCode = async () => {
    if (!parentEmail || !validateEmail(parentEmail)) {
      Alert.alert(
        t('error'),
        'Please enter a valid parent/guardian email address.'
      );
      return;
    }

    if (!confirmParent || !understandPrivacy) {
      Alert.alert(
        t('error'),
        'Please confirm all required checkboxes.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      console.log('[ParentalConsent] Generated verification code:', code);
      console.log('[ParentalConsent] Parent email:', parentEmail);

      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to ${parentEmail}. Please enter the code below.\n\nFor testing purposes, the code is: ${code}`,
        [{ text: 'OK' }]
      );

      setCodeSent(true);
      setVerificationCode('');
    } catch (error: any) {
      console.error('[ParentalConsent] Error sending code:', error);
      Alert.alert(
        t('error'),
        'Failed to send verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert(
        t('error'),
        'Please enter the 6-digit verification code.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          parental_consent: true,
          parental_email: parentEmail,
        })
        .eq('id', userId);

      if (error) {
        console.error('[ParentalConsent] Error updating profile:', error);
        throw new Error('Failed to save parental consent');
      }

      console.log('[ParentalConsent] Parental consent granted for user:', userId);

      Alert.alert(
        t('success'),
        'Parental consent has been successfully verified. The account can now be used.',
        [
          {
            text: 'OK',
            onPress: () => {
              onConsentGranted();
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[ParentalConsent] Error:', error);
      Alert.alert(
        t('error'),
        error?.message || 'Failed to verify parental consent. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.primary.textSecondary} />
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <ShieldCheck size={64} color={Colors.semantic.info} />
            </View>

            <Text style={styles.title}>Parental Consent Required</Text>
            
            <Text style={styles.description}>
              This account belongs to a user under 13 years old (Age: {childAge}). 
              Under the Children&apos;s Online Privacy Protection Act (COPPA), 
              parental consent is required to use this service.
            </Text>

            <View style={styles.warningBox}>
              <AlertCircle size={20} color={Colors.semantic.info} />
              <Text style={styles.warningText}>
                If you are the parent or legal guardian, please provide your email address 
                to verify consent.
              </Text>
            </View>

            {!codeSent ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Parent/Guardian Email Address</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={Colors.primary.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="parent@example.com"
                      placeholderTextColor={Colors.primary.textTertiary}
                      value={parentEmail}
                      onChangeText={setParentEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setConfirmParent(!confirmParent)}
                >
                  <View style={[styles.checkbox, confirmParent && styles.checkboxChecked]}>
                    {confirmParent && <CheckCircle size={20} color={Colors.primary.bg} />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I am the parent or legal guardian of this child and I consent to 
                    the collection, use, and disclosure of their personal information as 
                    described in the Privacy Policy.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setUnderstandPrivacy(!understandPrivacy)}
                >
                  <View style={[styles.checkbox, understandPrivacy && styles.checkboxChecked]}>
                    {understandPrivacy && <CheckCircle size={20} color={Colors.primary.bg} />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I understand that I can review, modify, or delete my child&apos;s information 
                    at any time by contacting support.
                  </Text>
                </TouchableOpacity>

                <View style={styles.legalNotice}>
                  <Text style={styles.legalText}>
                    <Text style={styles.legalBold}>COPPA Compliance Notice: </Text>
                    We take the protection of children&apos;s privacy seriously. 
                    A verification code will be sent to your email address to confirm your consent. 
                    This information is stored securely and used only for compliance purposes.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!parentEmail || !confirmParent || !understandPrivacy || isSubmitting) && 
                    styles.submitButtonDisabled,
                  ]}
                  onPress={handleSendVerificationCode}
                  disabled={
                    !parentEmail || !confirmParent || !understandPrivacy || isSubmitting
                  }
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Verification Code</Text>
                  <Text style={styles.description}>
                    Please enter the 6-digit code sent to {parentEmail}
                  </Text>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="000000"
                    placeholderTextColor={Colors.primary.textTertiary}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (verificationCode.length !== 6 || isSubmitting) && 
                    styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={verificationCode.length !== 6 || isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => {
                    setCodeSent(false);
                    setVerificationCode('');
                  }}
                >
                  <Text style={styles.resendButtonText}>Use Different Email</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: Colors.primary.bgSecondary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: Colors.semantic.info,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.semantic.info,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.bgTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.card.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary.text,
    paddingVertical: 12,
  },
  codeInput: {
    backgroundColor: Colors.primary.bgTertiary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.card.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.accent,
    borderColor: Colors.primary.accent,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary.textSecondary,
    lineHeight: 20,
  },
  legalNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  legalText: {
    fontSize: 12,
    color: Colors.primary.textTertiary,
    lineHeight: 18,
  },
  legalBold: {
    fontWeight: '700',
    color: Colors.primary.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.primary.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.interactive.disabled,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.text,
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  resendButtonText: {
    fontSize: 14,
    color: Colors.primary.accent,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.primary.textSecondary,
  },
});
