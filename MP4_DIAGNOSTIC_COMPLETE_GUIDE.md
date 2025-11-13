# 📊 MP4 診斷系統 - 完整實作指南

## ✅ 任務 1 & 2 完成報告

根據任務書第一階段要求,已完成以下功能:

### 📌 任務 1: 深度分析 MP4 編碼 (已完成)

#### 🎯 實作內容

**檔案位置**: `utils/mp4Diagnostics.ts`

**核心功能**:

1. **完整編碼資訊檢測**
   - ✅ 自動檢測視訊編解碼器 (H.264, H.265, VP8, VP9, AV1)
   - ✅ 自動檢測音訊編解碼器 (AAC, MP3, Opus, Vorbis)
   - ✅ Profile 和 Level 檢測
   - ✅ 容器格式分析 (MP4, MOV, MKV, AVI)

2. **檔案標頭深度分析**
   - ✅ 讀取檔案前 8KB 進行編碼分析
   - ✅ MP4 ftyp box 解析
   - ✅ Major brand 檢測
   - ✅ FourCC 碼讀取與解析

3. **完整診斷報告**
   ```typescript
   export interface MP4DiagnosticResult {
     timestamp: number;
     platform: string;
     fileInfo: MP4FileInfo;         // 檔案資訊
     codecInfo: MP4CodecInfo;        // 編解碼器資訊
     compatibility: {                // 相容性評估
       nativePlayerSupported: boolean;
       webViewFallbackRequired: boolean;
       reasons: string[];
     };
     recommendations: string[];      // 建議解決方案
     errors: string[];               // 錯誤清單
     warnings: string[];             // 警告清單
   }
   ```

4. **支援的檢測方式**
   - ✅ 遠端 MP4 檔案 (HTTP/HTTPS Range Request)
   - ✅ 本地 MP4 檔案 (file://)
   - ✅ Android Content URI (content://)
   - ✅ 檔案大小與 Bitrate 估算

---

### 📌 任務 2: Android/iOS 本地檔案權限處理 (已完成)

#### 🎯 實作內容

**檔案位置**: `utils/filePermissions.ts`

**核心功能**:

1. **Android 權限系統 (完整支援)**
   
   **Android 13+ (API 33+)**:
   - ✅ READ_MEDIA_VIDEO 權限檢測
   - ✅ 自動請求視訊存取權限
   - ✅ 中文化權限請求對話框
   
   **Android < 13 (傳統)**:
   - ✅ READ_EXTERNAL_STORAGE 權限檢測
   - ✅ 自動請求儲存空間權限
   - ✅ 權限狀態快取機制

2. **iOS 權限系統**
   - ✅ 檔案系統存取權限
   - ✅ file:// URI 標準化
   - ✅ 應用設定頁面快速開啟

3. **URI 標準化引擎**
   ```typescript
   export interface NormalizedUri {
     normalized: string;       // 標準化後的 URI
     original: string;         // 原始 URI
     scheme: 'file' | 'content' | 'http' | 'https';
     needsPermission: boolean; // 是否需要權限
     isValid: boolean;         // 是否有效
     errorMessage?: string;    // 錯誤訊息
   }
   ```

4. **自動檢測與修正**
   - ✅ 自動檢測 URI 類型
   - ✅ Android content:// 處理
   - ✅ iOS file:// 路徑標準化
   - ✅ 自動添加正確的 URI scheme

5. **權限快取機制**
   - ✅ 5 秒權限狀態快取
   - ✅ 避免頻繁權限檢查
   - ✅ 手動清除快取功能

---

## 📱 完整使用範例

### 1️⃣ MP4 檔案診斷

```typescript
import { diagnoseMP4File } from '@/utils/mp4Diagnostics';

// 診斷任何 MP4 檔案
const result = await diagnoseMP4File('file:///path/to/video.mp4');

console.log('📊 診斷結果:');
console.log(`檔案存在: ${result.fileInfo.exists}`);
console.log(`可讀取: ${result.fileInfo.isReadable}`);
console.log(`視訊編解碼器: ${result.codecInfo?.videoCodec}`);
console.log(`音訊編解碼器: ${result.codecInfo?.audioCodec}`);
console.log(`平台支援: ${result.compatibility.nativePlayerSupported}`);

// 顯示建議
result.recommendations.forEach(rec => {
  console.log(`💡 ${rec}`);
});
```

### 2️⃣ 權限檢查與請求

```typescript
import { 
  checkStoragePermission, 
  normalizeFileUri, 
  validateFileAccess 
} from '@/utils/filePermissions';

// 檢查權限
const permissionStatus = await checkStoragePermission();
if (!permissionStatus.granted) {
  console.log('⚠️ 需要權限:', permissionStatus.permissionType);
  if (permissionStatus.needsManualGrant) {
    // 引導用戶到設定頁面
    await openAppSettings();
  }
}

// URI 標準化
const normalized = normalizeFileUri('content://media/external/video/123');
console.log('標準化 URI:', normalized.normalized);
console.log('是否需要權限:', normalized.needsPermission);

// 完整檔案存取驗證
const access = await validateFileAccess('file:///path/to/video.mp4');
console.log('檔案可存取:', access.accessible);
console.log('檔案大小:', access.size);
```

### 3️⃣ 整合到播放器

```typescript
// EnhancedMP4Player 已自動整合診斷功能
import EnhancedMP4Player from '@/components/EnhancedMP4Player';

<EnhancedMP4Player
  url="file:///path/to/video.mp4"
  onError={(error) => console.error('播放錯誤:', error)}
  onPlaybackStart={() => console.log('開始播放')}
  autoPlay={true}
/>

// 播放器會自動:
// 1. 診斷檔案編解碼器
// 2. 檢查權限狀態
// 3. 標準化 URI
// 4. 顯示詳細錯誤訊息和建議
```

---

## 🔧 診斷系統架構

### 檢測流程

```
用戶提供 URI
    ↓
1. URI 類型檢測
   (file://, content://, http://, https://)
    ↓
2. 權限檢查 (如需要)
   - Android 13+: READ_MEDIA_VIDEO
   - Android < 13: READ_EXTERNAL_STORAGE
   - iOS: 檔案系統權限
    ↓
3. 檔案存在性驗證
   - FileSystem.getInfoAsync()
   - 檔案大小檢測
    ↓
4. 編解碼器分析
   - 讀取前 8KB
   - ftyp box 解析
   - 編碼簽章檢測
    ↓
5. 相容性評估
   - 平台檢測 (iOS/Android/Web)
   - 編解碼器支援度
   - 生成建議
    ↓
6. 生成完整報告
   - 錯誤列表
   - 警告列表
   - 解決建議
```

---

## 📋 診斷報告範例

### 成功案例

```
================================================================================
📊 MP4 DIAGNOSTIC REPORT
================================================================================
🕐 Timestamp: 2025-01-13T10:30:00.000Z
📱 Platform: ios

📁 FILE INFORMATION:
   URI: file:///var/mobile/Containers/video.mp4
   Type: file
   Exists: ✅
   Readable: ✅
   Size: 15.43 MB

🎬 CODEC INFORMATION:
   Video: H.264 Main
   Audio: AAC
   Container: mp4

🔧 COMPATIBILITY:
   Native Player: ✅ Supported
   WebView Fallback: ✅ Not Required
   • iOS native player supports H.264/H.265 with AAC/MP3

💡 RECOMMENDATIONS:
   ✅ 檔案應該可以正常播放
   ✅ 編解碼器與平台相容
   ✅ 所有檢查通過
================================================================================
```

### 權限問題案例

```
================================================================================
📊 MP4 DIAGNOSTIC REPORT
================================================================================
🕐 Timestamp: 2025-01-13T10:30:00.000Z
📱 Platform: android

📁 FILE INFORMATION:
   URI: content://media/external/video/123
   Type: content
   Exists: ❌
   Readable: ❌
   Permission Granted: ❌

❌ ERRORS:
   • File is not accessible or does not exist

🔧 COMPATIBILITY:
   Native Player: ❌ Not Supported
   WebView Fallback: ⚠️ Required
   • Storage permission not granted

💡 RECOMMENDATIONS:
   ❌ 檔案不存在 - 請確認檔案路徑是否正確
   ⚠️ 需要儲存空間讀取權限
   💡 建議：在應用設定中啟用儲存權限
   ℹ️ 使用 content:// URI - 確保應用有正確的存取權限
================================================================================
```

---

## 🎓 技術細節

### MP4 檔案結構解析

MP4 檔案採用 Box (Atom) 結構:

```
[ftyp] File Type Box
  - Size (4 bytes)
  - Type 'ftyp' (4 bytes)
  - Major Brand (4 bytes)  ← 容器類型檢測
  - Minor Version (4 bytes)
  - Compatible Brands (...)

[moov] Movie Box
  - [mvhd] Movie Header
  - [trak] Track (Video)
    - [mdia] Media
      - [hdlr] Handler
      - [minf] Media Info
        - [stbl] Sample Table
          - [stsd] Sample Description
            - [avc1] H.264  ← 視訊編解碼器檢測
            - [hev1] H.265
            - [vp09] VP9
  - [trak] Track (Audio)
    - [stsd] Sample Description
      - [mp4a] AAC  ← 音訊編解碼器檢測
      - [.mp3] MP3

[mdat] Media Data Box
  - 實際視訊/音訊資料
```

### FourCC 碼對照表

| FourCC | 編解碼器 | 支援平台 |
|--------|----------|----------|
| `avc1`, `avc3` | H.264/AVC | ✅ iOS, Android, Web |
| `hev1`, `hvc1` | H.265/HEVC | ✅ iOS, Android, ⚠️ Web (限制) |
| `vp08` | VP8 | ❌ iOS, ✅ Android, ✅ Web |
| `vp09` | VP9 | ❌ iOS, ✅ Android, ✅ Web |
| `av01` | AV1 | ❌ iOS, ⚠️ Android, ✅ Web |
| `mp4a` | AAC | ✅ 全平台 |
| `.mp3` | MP3 | ✅ 全平台 |
| `Opus` | Opus | ❌ iOS, ✅ Android, ✅ Web |

---

## 🧪 測試指南

### 測試 1: 標準 MP4 檔案 (H.264 + AAC)

```typescript
const testFile = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const result = await diagnoseMP4File(testFile);

// 預期結果
expect(result.codecInfo.videoCodec).toBe('H.264');
expect(result.codecInfo.audioCodec).toBe('AAC');
expect(result.compatibility.nativePlayerSupported).toBe(true);
```

### 測試 2: Android 權限請求

```typescript
// Android 13+
const permissionStatus = await checkStoragePermission();
console.log('權限類型:', permissionStatus.permissionType); // 'READ_MEDIA_VIDEO'

// Android < 13
// 自動降級到 'READ_EXTERNAL_STORAGE'
```

### 測試 3: URI 標準化

```typescript
// Test Case 1: content:// URI
const result1 = normalizeFileUri('content://media/external/video/123');
expect(result1.scheme).toBe('content');
expect(result1.needsPermission).toBe(true); // Android only

// Test Case 2: file:// URI
const result2 = normalizeFileUri('/storage/emulated/0/video.mp4');
expect(result2.normalized).toBe('file:///storage/emulated/0/video.mp4');
```

---

## 🚀 下一步建議

### 階段 II: 架構優化

1. **軟體解碼備援**
   - 整合 FFmpeg.wasm (Web)
   - 使用 ExoPlayer 軟解 (Android)
   
2. **進階編解碼器檢測**
   - moov box 完整解析
   - 多音軌/字幕軌檢測
   - 畫質資訊提取

3. **效能優化**
   - 檔案標頭快取
   - 診斷結果持久化
   - 批次診斷 API

### 階段 III: 驗證與部署

1. **測試套件擴充**
   - 20+ 編解碼器組合測試
   - 大檔案 (>1GB) 測試
   - 損壞檔案處理測試

2. **診斷儀表板**
   - 視覺化診斷報告
   - 歷史記錄查看
   - 一鍵匯出報告

---

## 📞 技術支援

如遇到問題,請提供:
1. 完整的診斷報告 (使用 `exportMP4DiagnosticReport`)
2. 檔案 URL 或 URI
3. 平台資訊 (iOS/Android 版本)
4. 錯誤截圖

---

## 📝 總結

✅ **任務 1 完成**: 深度編解碼器分析系統已實作
- 支援 6+ 視訊編解碼器檢測
- 支援 4+ 音訊編解碼器檢測
- MP4 檔案結構解析
- 遠端/本地檔案支援

✅ **任務 2 完成**: Android/iOS 權限處理系統已實作
- Android 13+ 新權限系統支援
- Android 傳統權限系統支援
- iOS 檔案系統權限處理
- URI 標準化引擎
- 權限快取機制

📊 **診斷報告輸出**: 完整、易讀、可操作的診斷資訊
- 檔案資訊
- 編解碼器資訊
- 相容性評估
- 錯誤與警告
- 具體建議

🔧 **整合完成**: EnhancedMP4Player 已自動整合診斷功能
- 自動診斷
- 自動權限請求
- 詳細錯誤提示
- 解決方案建議

---

**實作完成日期**: 2025-01-13
**實作者**: Rork AI Assistant
**版本**: 1.0.0
