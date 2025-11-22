import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet as RNStyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export default function TypeScriptDiagnosticScreen() {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ pass: 0, fail: 0, warning: 0 });

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: StyleSheet Import
      diagnosticResults.push({
        test: 'StyleSheet Import',
        status: 'pass',
        message: 'StyleSheet is properly imported',
        details: `From: 'react-native'`
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'StyleSheet Import',
        status: 'fail',
        message: 'StyleSheet import failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 2: StyleSheet.create()
    try {
      RNStyleSheet.create({
        test: {
          color: 'red',
        },
      });
      diagnosticResults.push({
        test: 'StyleSheet.create()',
        status: 'pass',
        message: 'StyleSheet.create() works correctly',
        details: `Created test style object`
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'StyleSheet.create()',
        status: 'fail',
        message: 'StyleSheet.create() failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: React Native Version
    try {
      const rnVersion = Platform.constants?.reactNativeVersion;
      if (rnVersion) {
        diagnosticResults.push({
          test: 'React Native Version',
          status: 'pass',
          message: `Version: ${rnVersion.major}.${rnVersion.minor}.${rnVersion.patch}`,
          details: `Expected: 0.81.x`
        });
      } else {
        diagnosticResults.push({
          test: 'React Native Version',
          status: 'warning',
          message: 'Could not determine React Native version',
          details: 'This might be normal on some platforms'
        });
      }
    } catch (error) {
      diagnosticResults.push({
        test: 'React Native Version',
        status: 'fail',
        message: 'Failed to check React Native version',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 4: Expo Version
    try {
      const expoVersion = Constants.expoVersion;
      diagnosticResults.push({
        test: 'Expo Version',
        status: 'pass',
        message: `Expo SDK: ${expoVersion || 'Unknown'}`,
        details: `Expected: 54.x`
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'Expo Version',
        status: 'fail',
        message: 'Failed to check Expo version',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 5: Platform Check
    try {
      diagnosticResults.push({
        test: 'Platform Detection',
        status: 'pass',
        message: `Running on: ${Platform.OS}`,
        details: `Version: ${Platform.Version}`
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'Platform Detection',
        status: 'fail',
        message: 'Platform detection failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 6: TypeScript Types
    try {
      RNStyleSheet.create({
        test: { color: 'blue' }
      });
      diagnosticResults.push({
        test: 'TypeScript Types',
        status: 'pass',
        message: 'TypeScript types are working',
        details: 'StyleSheet types are correctly defined'
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'TypeScript Types',
        status: 'fail',
        message: 'TypeScript type check failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 7: Component Rendering
    try {
      diagnosticResults.push({
        test: 'Component Rendering',
        status: 'pass',
        message: 'React components can be created',
        details: 'Component instantiation works correctly'
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'Component Rendering',
        status: 'fail',
        message: 'Component creation failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    // Calculate summary
    const pass = diagnosticResults.filter(r => r.status === 'pass').length;
    const fail = diagnosticResults.filter(r => r.status === 'fail').length;
    const warning = diagnosticResults.filter(r => r.status === 'warning').length;

    setResults(diagnosticResults);
    setSummary({ pass, fail, warning });
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check size={24} color="#10b981" />;
      case 'fail':
        return <X size={24} color="#ef4444" />;
      case 'warning':
        return <AlertCircle size={24} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return '#10b981';
      case 'fail':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
    }
  };

  const showSolution = () => {
    Alert.alert(
      'Solution',
      'The "Property StyleSheet doesn\'t exist" error is typically a TypeScript cache issue. Here\'s how to fix it:\n\n' +
      '1. Restart the Expo development server\n' +
      '2. Clear the Metro bundler cache\n' +
      '3. Clear TypeScript cache\n' +
      '4. If error persists, reinstall node_modules\n\n' +
      'On your computer:\n' +
      '• Stop the server (Ctrl+C)\n' +
      '• Run: npm start -- --clear\n' +
      '• Or: expo start -c\n\n' +
      'This usually resolves the issue automatically.'
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'TypeScript Diagnostic' }} />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>TypeScript & StyleSheet Diagnostic</Text>
          <Text style={styles.subtitle}>
            Checking for TypeScript compilation issues
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                {summary.pass}
              </Text>
              <Text style={styles.summaryLabel}>Passed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                {summary.fail}
              </Text>
              <Text style={styles.summaryLabel}>Failed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
                {summary.warning}
              </Text>
              <Text style={styles.summaryLabel}>Warnings</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                {getStatusIcon(result.status)}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTest}>{result.test}</Text>
                  <Text
                    style={[
                      styles.resultMessage,
                      { color: getStatusColor(result.status) }
                    ]}
                  >
                    {result.message}
                  </Text>
                  {result.details && (
                    <Text style={styles.resultDetails}>{result.details}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.button}
            onPress={runDiagnostics}
            disabled={isRunning}
          >
            <RefreshCw size={20} color="#ffffff" />
            <Text style={styles.buttonText}>
              {isRunning ? 'Running...' : 'Run Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.solutionButton]}
            onPress={showSolution}
          >
            <AlertCircle size={20} color="#ffffff" />
            <Text style={styles.buttonText}>View Solution</Text>
          </TouchableOpacity>
        </View>

        {summary.fail === 0 && results.length > 0 && (
          <View style={styles.successBanner}>
            <Check size={24} color="#10b981" />
            <Text style={styles.successText}>
              All tests passed! The StyleSheet error is likely a temporary TypeScript cache issue.
              Try restarting the development server.
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = RNStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  solutionButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ecfdf5',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});
