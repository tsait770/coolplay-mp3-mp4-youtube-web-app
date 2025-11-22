import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { iosErrorReporter, type ErrorReport } from '@/utils/iosErrorReporter';

export const IOSErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);

  useEffect(() => {
    // Subscribe to new errors
    const unsubscribe = iosErrorReporter.onError((error) => {
      setErrors(prev => [error, ...prev].slice(0, 10));
    });

    // Load existing errors
    setErrors(iosErrorReporter.getErrors());

    return unsubscribe;
  }, []);

  if (!__DEV__ || Platform.OS !== 'ios') {
    return null;
  }

  const errorCount = errors.length;

  return (
    <>
      {errorCount > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowModal(true)}
        >
          <AlertCircle size={24} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{errorCount}</Text>
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Error Monitor</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {errors.map((error, index) => (
              <TouchableOpacity
                key={index}
                style={styles.errorCard}
                onPress={() => setSelectedError(error)}
              >
                <View style={styles.errorHeader}>
                  <Text style={styles.errorType}>{error.errorType}</Text>
                  <Text style={styles.errorTime}>
                    {error.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.errorMessage} numberOfLines={2}>
                  {error.message}
                </Text>
              </TouchableOpacity>
            ))}

            {errors.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No errors detected</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                iosErrorReporter.clearErrors();
                setErrors([]);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedError && (
          <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setSelectedError(null)}
          >
            <View style={styles.detailsContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Error Details</Text>
                <TouchableOpacity onPress={() => setSelectedError(null)}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailsContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{selectedError.errorType}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Message</Text>
                  <Text style={styles.detailValue}>{selectedError.message}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Platform</Text>
                  <Text style={styles.detailValue}>
                    {selectedError.platform} {selectedError.platformVersion}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {selectedError.timestamp.toLocaleString()}
                  </Text>
                </View>

                {selectedError.stack && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Stack Trace</Text>
                    <ScrollView horizontal>
                      <Text style={styles.stackTrace}>{selectedError.stack}</Text>
                    </ScrollView>
                  </View>
                )}

                {selectedError.componentStack && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Component Stack</Text>
                    <ScrollView horizontal>
                      <Text style={styles.stackTrace}>
                        {selectedError.componentStack}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            </View>
          </Modal>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  errorTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  errorMessage: {
    fontSize: 14,
    color: '#d1d5db',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  detailsContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  stackTrace: {
    fontSize: 12,
    color: '#d1d5db',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
});
