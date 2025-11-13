/**
 * MP4 Diagnostics Test Utilities
 * 
 * Test harness for MP4 file diagnosis and permission system
 */

import { diagnoseMP4File, getMP4DiagnosticHistory, getMP4DiagnosticSummary } from './mp4Diagnostics';
import { checkStoragePermission, normalizeFileUri, validateFileAccess } from './filePermissions';

/**
 * Test Suite for MP4 Diagnostics
 */
export class MP4DiagnosticsTest {
  /**
   * Test standard MP4 file from remote URL
   */
  static async testRemoteMP4() {
    console.log('\n🧪 Test 1: Remote MP4 File');
    console.log('='.repeat(50));
    
    const testUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd',
    ];

    for (const url of testUrls) {
      console.log(`\n📁 Testing: ${url}`);
      try {
        const result = await diagnoseMP4File(url);
        console.log(`✅ Result: ${result.compatibility.nativePlayerSupported ? 'Supported' : 'Not Supported'}`);
        console.log(`   Codecs: ${result.codecInfo?.videoCodec} + ${result.codecInfo?.audioCodec}`);
        console.log(`   Recommendations: ${result.recommendations.length} items`);
      } catch (error) {
        console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Test local file with different URI formats
   */
  static async testLocalFileURI() {
    console.log('\n🧪 Test 2: Local File URI Normalization');
    console.log('='.repeat(50));

    const testUris = [
      '/storage/emulated/0/Download/video.mp4',
      'file:///storage/emulated/0/Download/video.mp4',
      'content://media/external/video/123',
      'file:///var/mobile/Containers/Data/video.mp4',
    ];

    for (const uri of testUris) {
      console.log(`\n📋 Testing URI: ${uri}`);
      const normalized = normalizeFileUri(uri);
      console.log(`   Scheme: ${normalized.scheme}`);
      console.log(`   Normalized: ${normalized.normalized}`);
      console.log(`   Needs Permission: ${normalized.needsPermission}`);
      console.log(`   Valid: ${normalized.isValid}`);
    }
  }

  /**
   * Test permission system
   */
  static async testPermissionSystem() {
    console.log('\n🧪 Test 3: Permission System');
    console.log('='.repeat(50));

    try {
      const permissionStatus = await checkStoragePermission();
      console.log('📱 Permission Status:');
      console.log(`   Granted: ${permissionStatus.granted}`);
      console.log(`   Type: ${permissionStatus.permissionType}`);
      console.log(`   Can Request: ${permissionStatus.canRequest}`);
      console.log(`   Needs Manual Grant: ${permissionStatus.needsManualGrant}`);
      
      if (permissionStatus.errorMessage) {
        console.log(`   Error: ${permissionStatus.errorMessage}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Test file access validation
   */
  static async testFileAccessValidation() {
    console.log('\n🧪 Test 4: File Access Validation');
    console.log('='.repeat(50));

    const testFiles = [
      'file:///storage/emulated/0/Download/test.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'content://media/external/video/123',
    ];

    for (const file of testFiles) {
      console.log(`\n📁 Testing: ${file}`);
      try {
        const access = await validateFileAccess(file);
        console.log(`   Accessible: ${access.accessible}`);
        console.log(`   Exists: ${access.exists}`);
        console.log(`   Readable: ${access.readable}`);
        if (access.size) {
          console.log(`   Size: ${(access.size / 1024 / 1024).toFixed(2)} MB`);
        }
        if (access.errorMessage) {
          console.log(`   Error: ${access.errorMessage}`);
        }
      } catch (error) {
        console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Test diagnostic history and summary
   */
  static async testDiagnosticHistory() {
    console.log('\n🧪 Test 5: Diagnostic History & Summary');
    console.log('='.repeat(50));

    // Run a few diagnostics first
    const testUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'file:///storage/emulated/0/test.mp4',
    ];

    for (const url of testUrls) {
      try {
        await diagnoseMP4File(url);
      } catch (error) {
        // Ignore errors for history test
      }
    }

    // Get history
    const history = getMP4DiagnosticHistory();
    console.log(`\n📚 Diagnostic History: ${history.length} entries`);
    
    // Get summary
    const summary = getMP4DiagnosticSummary();
    console.log('\n📊 Summary:');
    console.log(`   Total Diagnostics: ${summary.totalDiagnostics}`);
    console.log(`   Successful: ${summary.successfulPlaybacks}`);
    console.log(`   Failed: ${summary.failedPlaybacks}`);
    console.log(`   Platform Breakdown:`, summary.platformBreakdown);
    console.log(`   Common Issues:`, summary.commonIssues);
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('\n🚀 MP4 Diagnostics Test Suite');
    console.log('='.repeat(80));
    console.log('Starting comprehensive test suite...\n');

    try {
      await this.testRemoteMP4();
      await this.testLocalFileURI();
      await this.testPermissionSystem();
      await this.testFileAccessValidation();
      await this.testDiagnosticHistory();

      console.log('\n\n✅ All tests completed!');
      console.log('='.repeat(80));
    } catch (error) {
      console.error('\n\n❌ Test suite failed:', error);
      console.log('='.repeat(80));
    }
  }

  /**
   * Quick diagnostic test for a specific file
   */
  static async quickTest(uri: string) {
    console.log('\n🔍 Quick Diagnostic Test');
    console.log('='.repeat(80));
    console.log(`Testing: ${uri}\n`);

    try {
      // Step 1: URI Normalization
      console.log('Step 1: URI Normalization');
      const normalized = normalizeFileUri(uri);
      console.log(`✅ Normalized: ${normalized.normalized}`);
      console.log(`   Scheme: ${normalized.scheme}`);
      console.log(`   Valid: ${normalized.isValid}`);

      // Step 2: Permission Check
      if (normalized.needsPermission) {
        console.log('\nStep 2: Permission Check');
        const permission = await checkStoragePermission();
        console.log(`${permission.granted ? '✅' : '❌'} Permission: ${permission.permissionType}`);
      }

      // Step 3: File Access
      console.log('\nStep 3: File Access Validation');
      const access = await validateFileAccess(uri);
      console.log(`${access.accessible ? '✅' : '❌'} Accessible: ${access.accessible}`);
      if (access.size) {
        console.log(`   Size: ${(access.size / 1024 / 1024).toFixed(2)} MB`);
      }

      // Step 4: Full Diagnosis
      console.log('\nStep 4: Full MP4 Diagnosis');
      const diagnosis = await diagnoseMP4File(uri);
      console.log(`${diagnosis.compatibility.nativePlayerSupported ? '✅' : '❌'} Native Player Support: ${diagnosis.compatibility.nativePlayerSupported}`);
      
      if (diagnosis.codecInfo) {
        console.log(`   Video: ${diagnosis.codecInfo.videoCodec} ${diagnosis.codecInfo.videoProfile || ''}`);
        console.log(`   Audio: ${diagnosis.codecInfo.audioCodec}`);
      }

      console.log('\n💡 Recommendations:');
      diagnosis.recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });

      if (diagnosis.errors.length > 0) {
        console.log('\n❌ Errors:');
        diagnosis.errors.forEach(err => {
          console.log(`   ${err}`);
        });
      }

      console.log('\n' + '='.repeat(80));
      return diagnosis;
    } catch (error) {
      console.error('\n❌ Quick test failed:', error);
      console.log('='.repeat(80));
      throw error;
    }
  }
}

/**
 * Export convenience functions
 */
export const runMP4DiagnosticTests = () => MP4DiagnosticsTest.runAllTests();
export const quickTestMP4 = (uri: string) => MP4DiagnosticsTest.quickTest(uri);
export const testRemoteMP4 = () => MP4DiagnosticsTest.testRemoteMP4();
export const testLocalURI = () => MP4DiagnosticsTest.testLocalFileURI();
export const testPermissions = () => MP4DiagnosticsTest.testPermissionSystem();
