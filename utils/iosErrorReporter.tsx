import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface ErrorReport {
  timestamp: Date;
  platform: string;
  platformVersion: string | number;
  errorType: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent?: string;
  additionalInfo?: Record<string, any>;
}

class IOSErrorReporter {
  private errors: ErrorReport[] = [];
  private maxErrors = 50;
  private listeners: ((error: ErrorReport) => void)[] = [];

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          errorType: 'UnhandledPromiseRejection',
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
        });
      });

      const originalErrorHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.reportError({
          errorType: isFatal ? 'FatalError' : 'Error',
          message: error.message || 'Unknown error',
          stack: error.stack,
        });

        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      });
    }
  }

  reportError(error: {
    errorType: string;
    message: string;
    stack?: string;
    componentStack?: string;
    additionalInfo?: Record<string, any>;
  }): void {
    const report: ErrorReport = {
      timestamp: new Date(),
      platform: Platform.OS,
      platformVersion: Platform.Version,
      userAgent: Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...error,
    };

    this.errors.unshift(report);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.listeners.forEach(listener => listener(report));

    if (__DEV__) {
      console.error('[iOS Error Reporter]', report);
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  onError(callback: (error: ErrorReport) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getErrorSummary(): {
    total: number;
    byType: Record<string, number>;
    recent: ErrorReport[];
  } {
    const byType: Record<string, number> = {};
    
    this.errors.forEach(error => {
      byType[error.errorType] = (byType[error.errorType] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType,
      recent: this.errors.slice(0, 5),
    };
  }

  exportErrorsAsJSON(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  exportErrorsAsText(): string {
    return this.errors
      .map(error => {
        const lines = [
          `[${error.timestamp.toISOString()}]`,
          `Type: ${error.errorType}`,
          `Platform: ${error.platform} ${error.platformVersion}`,
          `Message: ${error.message}`,
        ];

        if (error.stack) {
          lines.push(`Stack: ${error.stack}`);
        }

        if (error.componentStack) {
          lines.push(`Component Stack: ${error.componentStack}`);
        }

        if (error.additionalInfo) {
          lines.push(`Additional Info: ${JSON.stringify(error.additionalInfo)}`);
        }

        return lines.join('\n');
      })
      .join('\n\n---\n\n');
  }
}

export const iosErrorReporter = new IOSErrorReporter();

export class IOSErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    iosErrorReporter.reportError({
      errorType: 'ReactError',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>
            Something went wrong
          </Text>
          <Text style={errorStyles.message}>
            An error has been logged and reported
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={errorStyles.button}
          >
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  message: {
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
});
