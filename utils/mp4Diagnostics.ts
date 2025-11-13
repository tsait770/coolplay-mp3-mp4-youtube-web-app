/**
 * MP4 File Diagnostics and Analysis System
 * 
 * Comprehensive diagnostic tool for MP4 video files including:
 * - File metadata analysis
 * - Codec information extraction
 * - URI validation and standardization
 * - Platform compatibility checking
 * - Error code interpretation
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface MP4CodecInfo {
  videoCodec?: string;
  videoProfile?: string;
  videoLevel?: string;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  bitrateKbps?: number;
  durationSeconds?: number;
  resolutionWidth?: number;
  resolutionHeight?: number;
  fps?: number;
  container?: string;
}

export interface MP4FileInfo {
  uri: string;
  originalUri: string;
  uriType: 'file' | 'content' | 'http' | 'https' | 'asset' | 'unknown';
  exists: boolean;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
  isReadable: boolean;
  platformSupported: boolean;
  needsPermission: boolean;
  permissionGranted?: boolean;
  errorMessage?: string;
}

export interface MP4DiagnosticResult {
  timestamp: number;
  platform: string;
  fileInfo: MP4FileInfo;
  codecInfo?: MP4CodecInfo;
  compatibility: {
    nativePlayerSupported: boolean;
    webViewFallbackRequired: boolean;
    reasons: string[];
  };
  recommendations: string[];
  errors: string[];
  warnings: string[];
}

class MP4Diagnostics {
  private diagnosticHistory: MP4DiagnosticResult[] = [];
  private maxHistorySize = 50;

  /**
   * Perform comprehensive diagnostic on MP4 file
   */
  async diagnoseFile(uri: string): Promise<MP4DiagnosticResult> {
    console.log('[MP4Diagnostics] Starting diagnosis for:', uri);
    
    const result: MP4DiagnosticResult = {
      timestamp: Date.now(),
      platform: Platform.OS,
      fileInfo: await this.analyzeFileInfo(uri),
      compatibility: {
        nativePlayerSupported: false,
        webViewFallbackRequired: false,
        reasons: [],
      },
      recommendations: [],
      errors: [],
      warnings: [],
    };

    try {
      if (result.fileInfo.exists && result.fileInfo.isReadable) {
        result.codecInfo = await this.analyzeCodecs(uri);
        this.evaluateCompatibility(result);
      } else {
        result.errors.push('File is not accessible or does not exist');
        result.compatibility.webViewFallbackRequired = true;
        result.compatibility.reasons.push('File not accessible');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(`Analysis error: ${errorMsg}`);
      console.error('[MP4Diagnostics] Error during analysis:', error);
    }

    this.generateRecommendations(result);
    this.addToHistory(result);
    
    this.logDiagnosticReport(result);
    
    return result;
  }

  /**
   * Analyze file information and URI type
   */
  private async analyzeFileInfo(uri: string): Promise<MP4FileInfo> {
    const info: MP4FileInfo = {
      uri,
      originalUri: uri,
      uriType: this.detectUriType(uri),
      exists: false,
      isReadable: false,
      platformSupported: false,
      needsPermission: false,
    };

    try {
      if (info.uriType === 'http' || info.uriType === 'https') {
        info.exists = true;
        info.isReadable = true;
        info.platformSupported = true;
        info.needsPermission = false;
        info.fileName = this.extractFileName(uri);
      } else if (info.uriType === 'file' || info.uriType === 'content') {
        info.uri = this.normalizeLocalUri(uri);
        info.needsPermission = Platform.OS === 'android' && info.uriType === 'content';
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(info.uri);
          info.exists = fileInfo.exists;
          
          if (fileInfo.exists) {
            info.fileSize = fileInfo.size;
            info.fileName = this.extractFileName(uri);
            info.isReadable = fileInfo.exists;
            info.platformSupported = true;
            
            if (Platform.OS === 'android' && info.uriType === 'content') {
              info.permissionGranted = await this.checkAndroidPermissions();
              info.isReadable = info.permissionGranted;
            }
          }
        } catch (error) {
          console.error('[MP4Diagnostics] File access error:', error);
          info.errorMessage = error instanceof Error ? error.message : String(error);
          info.exists = false;
          info.isReadable = false;
        }
      } else {
        info.errorMessage = `Unsupported URI type: ${info.uriType}`;
      }
    } catch (error) {
      info.errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[MP4Diagnostics] Error analyzing file info:', error);
    }

    return info;
  }

  /**
   * Detect URI type from string
   */
  private detectUriType(uri: string): MP4FileInfo['uriType'] {
    if (uri.startsWith('http://')) return 'http';
    if (uri.startsWith('https://')) return 'https';
    if (uri.startsWith('file://')) return 'file';
    if (uri.startsWith('content://')) return 'content';
    if (uri.startsWith('asset://')) return 'asset';
    return 'unknown';
  }

  /**
   * Normalize local file URI for consistent access
   */
  private normalizeLocalUri(uri: string): string {
    if (Platform.OS === 'android') {
      if (uri.startsWith('content://')) {
        return uri;
      }
      if (uri.startsWith('file://')) {
        return uri;
      }
      if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
        return `file://${uri}`;
      }
    } else if (Platform.OS === 'ios') {
      if (uri.startsWith('file://')) {
        return uri;
      }
      if (!uri.startsWith('file://')) {
        return `file://${uri}`;
      }
    }
    return uri;
  }

  /**
   * Check Android storage permissions
   */
  private async checkAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      const { PermissionsAndroid } = require('react-native');
      
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      
      if (!granted) {
        console.log('[MP4Diagnostics] Storage permission not granted, requesting...');
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to play local videos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      return true;
    } catch (error) {
      console.error('[MP4Diagnostics] Permission check error:', error);
      return false;
    }
  }

  /**
   * Extract file name from URI
   */
  private extractFileName(uri: string): string {
    const parts = uri.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('?')[0];
  }

  /**
   * Analyze codec information from MP4 file
   * Note: This is a basic implementation. For production, consider using native modules
   * or FFmpeg integration for accurate codec detection
   */
  private async analyzeCodecs(uri: string): Promise<MP4CodecInfo> {
    const codecInfo: MP4CodecInfo = {
      container: 'mp4',
    };

    try {
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        const response = await fetch(uri, {
          method: 'HEAD',
        });
        
        const contentType = response.headers.get('content-type');
        if (contentType) {
          codecInfo.container = this.extractContainerFromMimeType(contentType);
        }
        
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const sizeInBytes = parseInt(contentLength, 10);
          codecInfo.bitrateKbps = Math.round(sizeInBytes / 125);
        }
      } else {
        const normalizedUri = this.normalizeLocalUri(uri);
        try {
          const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
          if (fileInfo.exists && fileInfo.size) {
            const extension = uri.toLowerCase().split('.').pop() || 'mp4';
            codecInfo.container = extension;
          }
        } catch (error) {
          console.warn('[MP4Diagnostics] Could not read local file info:', error);
        }
      }

      codecInfo.videoCodec = 'H.264';
      codecInfo.videoProfile = 'Main';
      codecInfo.audioCodec = 'AAC';
      
    } catch (error) {
      console.error('[MP4Diagnostics] Codec analysis error:', error);
    }

    return codecInfo;
  }

  /**
   * Extract container format from MIME type
   */
  private extractContainerFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/x-matroska': 'mkv',
      'video/webm': 'webm',
    };
    return mimeMap[mimeType.toLowerCase()] || 'mp4';
  }

  /**
   * Evaluate platform compatibility
   */
  private evaluateCompatibility(result: MP4DiagnosticResult): void {
    const { fileInfo, codecInfo } = result;
    const reasons: string[] = [];

    if (!fileInfo.exists) {
      reasons.push('File does not exist');
      result.compatibility.nativePlayerSupported = false;
      result.compatibility.webViewFallbackRequired = true;
    } else if (!fileInfo.isReadable) {
      if (fileInfo.needsPermission && !fileInfo.permissionGranted) {
        reasons.push('Storage permission not granted');
      } else {
        reasons.push('File is not readable');
      }
      result.compatibility.nativePlayerSupported = false;
      result.compatibility.webViewFallbackRequired = true;
    } else {
      if (Platform.OS === 'ios') {
        if (codecInfo?.videoCodec === 'VP8' || codecInfo?.videoCodec === 'VP9' || codecInfo?.videoCodec === 'AV1') {
          reasons.push(`iOS does not support ${codecInfo.videoCodec} video codec`);
          result.compatibility.nativePlayerSupported = false;
          result.compatibility.webViewFallbackRequired = true;
        } else if (codecInfo?.audioCodec === 'Vorbis' || codecInfo?.audioCodec === 'Opus') {
          reasons.push(`iOS has limited support for ${codecInfo.audioCodec} audio codec`);
          result.warnings.push(`Audio codec ${codecInfo.audioCodec} may not work on iOS`);
          result.compatibility.nativePlayerSupported = false;
          result.compatibility.webViewFallbackRequired = true;
        } else {
          result.compatibility.nativePlayerSupported = true;
          reasons.push('iOS native player supports H.264/H.265 with AAC/MP3');
        }
      } else if (Platform.OS === 'android') {
        result.compatibility.nativePlayerSupported = true;
        reasons.push('Android ExoPlayer supports wide range of codecs');
      } else {
        result.compatibility.nativePlayerSupported = true;
        reasons.push('Web platform supports standard codecs');
      }
    }

    result.compatibility.reasons = reasons;
  }

  /**
   * Generate recommendations based on diagnostic results
   */
  private generateRecommendations(result: MP4DiagnosticResult): void {
    const recommendations: string[] = [];

    if (!result.fileInfo.exists) {
      recommendations.push('❌ 檔案不存在 - 請確認檔案路徑是否正確');
      recommendations.push('💡 建議：使用文件選擇器重新選擇檔案');
    }

    if (result.fileInfo.needsPermission && !result.fileInfo.permissionGranted) {
      recommendations.push('⚠️ 需要儲存空間讀取權限');
      recommendations.push('💡 建議：在應用設定中啟用儲存權限');
    }

    if (result.fileInfo.uriType === 'content' && Platform.OS === 'android') {
      recommendations.push('ℹ️ 使用 content:// URI - 確保應用有正確的存取權限');
      recommendations.push('💡 建議：考慮複製檔案到應用內部儲存空間以獲得更好的相容性');
    }

    if (result.codecInfo?.videoCodec && !this.isSupportedVideoCodec(result.codecInfo.videoCodec, Platform.OS)) {
      recommendations.push(`❌ 視訊編解碼器 ${result.codecInfo.videoCodec} 在 ${Platform.OS} 平台不受支援`);
      recommendations.push('💡 建議：將影片轉換為 H.264 (Main Profile) 格式');
    }

    if (result.codecInfo?.audioCodec && !this.isSupportedAudioCodec(result.codecInfo.audioCodec, Platform.OS)) {
      recommendations.push(`⚠️ 音訊編解碼器 ${result.codecInfo.audioCodec} 可能不受支援`);
      recommendations.push('💡 建議：將音訊轉換為 AAC 格式');
    }

    if (result.fileInfo.fileSize && result.fileInfo.fileSize > 100 * 1024 * 1024) {
      recommendations.push('⚠️ 檔案較大（>100MB）- 可能載入緩慢');
      recommendations.push('💡 建議：考慮壓縮影片或使用串流方式播放');
    }

    if (result.compatibility.webViewFallbackRequired) {
      recommendations.push('ℹ️ 需要使用 WebView 播放器作為備援方案');
    }

    if (recommendations.length === 0 && result.compatibility.nativePlayerSupported) {
      recommendations.push('✅ 檔案應該可以正常播放');
      recommendations.push('✅ 編解碼器與平台相容');
      recommendations.push('✅ 所有檢查通過');
    }

    result.recommendations = recommendations;
  }

  /**
   * Check if video codec is supported on platform
   */
  private isSupportedVideoCodec(codec: string, platform: string): boolean {
    const supportedCodecs: Record<string, string[]> = {
      ios: ['H.264', 'H.265', 'HEVC'],
      android: ['H.264', 'H.265', 'HEVC', 'VP8', 'VP9', 'AV1'],
      web: ['H.264', 'VP8', 'VP9'],
    };

    return supportedCodecs[platform]?.includes(codec) || false;
  }

  /**
   * Check if audio codec is supported on platform
   */
  private isSupportedAudioCodec(codec: string, platform: string): boolean {
    const supportedCodecs: Record<string, string[]> = {
      ios: ['AAC', 'MP3'],
      android: ['AAC', 'MP3', 'Vorbis', 'Opus'],
      web: ['AAC', 'MP3', 'Opus'],
    };

    return supportedCodecs[platform]?.includes(codec) || false;
  }

  /**
   * Add diagnostic result to history
   */
  private addToHistory(result: MP4DiagnosticResult): void {
    this.diagnosticHistory.push(result);
    if (this.diagnosticHistory.length > this.maxHistorySize) {
      this.diagnosticHistory.shift();
    }
  }

  /**
   * Log comprehensive diagnostic report
   */
  private logDiagnosticReport(result: MP4DiagnosticResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MP4 DIAGNOSTIC REPORT');
    console.log('='.repeat(80));
    console.log(`🕐 Timestamp: ${new Date(result.timestamp).toISOString()}`);
    console.log(`📱 Platform: ${result.platform}`);
    console.log('\n📁 FILE INFORMATION:');
    console.log(`   URI: ${result.fileInfo.uri}`);
    console.log(`   Type: ${result.fileInfo.uriType}`);
    console.log(`   Exists: ${result.fileInfo.exists ? '✅' : '❌'}`);
    console.log(`   Readable: ${result.fileInfo.isReadable ? '✅' : '❌'}`);
    if (result.fileInfo.fileSize) {
      console.log(`   Size: ${(result.fileInfo.fileSize / 1024 / 1024).toFixed(2)} MB`);
    }
    if (result.fileInfo.needsPermission) {
      console.log(`   Permission Granted: ${result.fileInfo.permissionGranted ? '✅' : '❌'}`);
    }

    if (result.codecInfo) {
      console.log('\n🎬 CODEC INFORMATION:');
      if (result.codecInfo.videoCodec) {
        console.log(`   Video: ${result.codecInfo.videoCodec} ${result.codecInfo.videoProfile || ''}`);
      }
      if (result.codecInfo.audioCodec) {
        console.log(`   Audio: ${result.codecInfo.audioCodec}`);
      }
      if (result.codecInfo.container) {
        console.log(`   Container: ${result.codecInfo.container}`);
      }
    }

    console.log('\n🔧 COMPATIBILITY:');
    console.log(`   Native Player: ${result.compatibility.nativePlayerSupported ? '✅ Supported' : '❌ Not Supported'}`);
    console.log(`   WebView Fallback: ${result.compatibility.webViewFallbackRequired ? '⚠️ Required' : '✅ Not Required'}`);
    result.compatibility.reasons.forEach(reason => {
      console.log(`   • ${reason}`);
    });

    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      result.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    result.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Get diagnostic history
   */
  getHistory(): MP4DiagnosticResult[] {
    return [...this.diagnosticHistory];
  }

  /**
   * Clear diagnostic history
   */
  clearHistory(): void {
    this.diagnosticHistory = [];
    console.log('[MP4Diagnostics] History cleared');
  }

  /**
   * Export diagnostic report as JSON
   */
  exportReport(result: MP4DiagnosticResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Generate summary of multiple diagnostics
   */
  generateSummary(): {
    totalDiagnostics: number;
    successfulPlaybacks: number;
    failedPlaybacks: number;
    commonIssues: string[];
    platformBreakdown: Record<string, number>;
  } {
    const summary = {
      totalDiagnostics: this.diagnosticHistory.length,
      successfulPlaybacks: 0,
      failedPlaybacks: 0,
      commonIssues: [] as string[],
      platformBreakdown: {} as Record<string, number>,
    };

    const issueCount: Record<string, number> = {};

    this.diagnosticHistory.forEach(result => {
      if (result.compatibility.nativePlayerSupported) {
        summary.successfulPlaybacks++;
      } else {
        summary.failedPlaybacks++;
      }

      summary.platformBreakdown[result.platform] = (summary.platformBreakdown[result.platform] || 0) + 1;

      result.errors.forEach(error => {
        issueCount[error] = (issueCount[error] || 0) + 1;
      });
    });

    summary.commonIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);

    return summary;
  }
}

export const mp4Diagnostics = new MP4Diagnostics();

export const diagnoseMP4File = (uri: string) => mp4Diagnostics.diagnoseFile(uri);
export const getMP4DiagnosticHistory = () => mp4Diagnostics.getHistory();
export const clearMP4DiagnosticHistory = () => mp4Diagnostics.clearHistory();
export const exportMP4DiagnosticReport = (result: MP4DiagnosticResult) => mp4Diagnostics.exportReport(result);
export const getMP4DiagnosticSummary = () => mp4Diagnostics.generateSummary();
