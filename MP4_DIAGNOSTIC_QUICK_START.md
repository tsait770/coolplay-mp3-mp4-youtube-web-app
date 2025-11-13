# 📱 MP4 診斷系統 - 快速開始指南

## 🎯 任務 1 & 2 已完成

根據您的任務書要求,已完成以下功能:

### ✅ 任務 1: 深度分析 MP4 編碼

**檔案位置**: `utils/mp4Diagnostics.ts`

**核心功能**:
- 自動檢測視訊編解碼器 (H.264, H.265, VP8, VP9, AV1)
- 自動檢測音訊編解碼器 (AAC, MP3, Opus, Vorbis)
- MP4 檔案結構解析 (ftyp box, moov box)
- 遠端與本地檔案支援
- 完整診斷報告生成

### ✅ 任務 2: Android/iOS 本地檔案權限處理

**檔案位置**: `utils/filePermissions.ts`

**核心功能**:
- Android 13+ 權限系統 (READ_MEDIA_VIDEO)
- Android 傳統權限系統 (READ_EXTERNAL_STORAGE)
- iOS 檔案系統權限
- URI 標準化引擎 (file://, content://)
- 權限快取機制

---

## 🚀 使用方式

### 1️⃣ 基本使用 - 診斷任何 MP4 檔案

```typescript
import { diagnoseMP4File } from '@/utils/mp4Diagnostics';

// 診斷本地檔案
const result = await diagnoseMP4File('file:///path/to/video.mp4');

// 診斷遠端檔案
const result2 = await diagnoseMP4File('https://example.com/video.mp4');

// 診斷 Android content URI
const result3 = await diagnoseMP4File('content://media/external/video/123');

// 查看結果
console.log('檔案資訊:', result.fileInfo);
console.log('編解碼器:', result.codecInfo);
console.log('平台支援:', result.compatibility.nativePlayerSupported);
console.log('建議:', result.recommendations);
```

### 2️⃣ 權限檢查

```typescript
import { checkStoragePermission, openAppSettings } from '@/utils/filePermissions';

// 檢查權限
const permission = await checkStoragePermission();

if (!permission.granted) {
  console.log('需要權限:', permission.permissionType);
  
  if (permission.needsManualGrant) {
    // 引導用戶到設定頁面
    await openAppSettings();
  }
}
```

### 3️⃣ URI 標準化

```typescript
import { normalizeFileUri } from '@/utils/filePermissions';

// 各種 URI 格式自動標準化
const uri1 = normalizeFileUri('/storage/emulated/0/video.mp4');
// 結果: file:///storage/emulated/0/video.mp4

const uri2 = normalizeFileUri('content://media/external/video/123');
// 保持原樣,並標記需要權限

console.log('標準化 URI:', uri1.normalized);
console.log('需要權限:', uri1.needsPermission);
```

### 4️⃣ 快速測試

```typescript
import { quickTestMP4 } from '@/utils/mp4DiagnosticsTest';

// 執行完整測試
const diagnosis = await quickTestMP4('file:///path/to/video.mp4');

// 自動輸出:
// 1. URI 標準化結果
// 2. 權限檢查狀態
// 3. 檔案存取驗證
// 4. 完整 MP4 診斷
// 5. 建議與錯誤資訊
```

---

## 📊 診斷報告範例

### 成功案例

```typescript
const result = await diagnoseMP4File('https://example.com/video.mp4');

// 輸出:
// ================================================================================
// 📊 MP4 DIAGNOSTIC REPORT
// ================================================================================
// 🕐 Timestamp: 2025-01-13T10:30:00.000Z
// 📱 Platform: ios
//
// 📁 FILE INFORMATION:
//    URI: https://example.com/video.mp4
//    Type: https
//    Exists: ✅
//    Readable: ✅
//    Size: 15.43 MB
//
// 🎬 CODEC INFORMATION:
//    Video: H.264 Main
//    Audio: AAC
//    Container: mp4
//
// 🔧 COMPATIBILITY:
//    Native Player: ✅ Supported
//    WebView Fallback: ✅ Not Required
//
// 💡 RECOMMENDATIONS:
//    ✅ 檔案應該可以正常播放
//    ✅ 編解碼器與平台相容
//    ✅ 所有檢查通過
// ================================================================================
```

### 權限問題案例

```typescript
const result = await diagnoseMP4File('content://media/external/video/123');

// 輸出包含:
// ❌ ERRORS:
//    • File is not accessible or does not exist
//
// 💡 RECOMMENDATIONS:
//    ⚠️ 需要儲存空間讀取權限
//    💡 建議:在應用設定中啟用儲存權限
//    ℹ️ 使用 content:// URI - 確保應用有正確的存取權限
```

---

## 🧪 測試功能

### 執行完整測試套件

```typescript
import { runMP4DiagnosticTests } from '@/utils/mp4DiagnosticsTest';

// 執行所有測試
await runMP4DiagnosticTests();

// 測試包括:
// 1. 遠端 MP4 檔案測試
// 2. 本地 URI 標準化測試
// 3. 權限系統測試
// 4. 檔案存取驗證測試
// 5. 診斷歷史與統計測試
```

### 個別測試

```typescript
import { 
  testRemoteMP4, 
  testLocalURI, 
  testPermissions 
} from '@/utils/mp4DiagnosticsTest';

// 只測試遠端檔案
await testRemoteMP4();

// 只測試 URI 標準化
await testLocalURI();

// 只測試權限系統
await testPermissions();
```

---

## 🔧 整合到播放器

### EnhancedMP4Player (已自動整合)

```typescript
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

### UniversalVideoPlayer (也已整合)

```typescript
import UniversalVideoPlayer from '@/components/UniversalVideoPlayer';

<UniversalVideoPlayer
  url="https://example.com/video.mp4"
  onError={(error) => console.error(error)}
  autoPlay={true}
/>
```

---

## 📋 支援的檔案格式與編解碼器

### 視訊編解碼器

| 編解碼器 | iOS | Android | Web | 檢測支援 |
|---------|-----|---------|-----|---------|
| H.264/AVC | ✅ | ✅ | ✅ | ✅ |
| H.265/HEVC | ✅ | ✅ | ⚠️ | ✅ |
| VP8 | ❌ | ✅ | ✅ | ✅ |
| VP9 | ❌ | ✅ | ✅ | ✅ |
| AV1 | ❌ | ⚠️ | ✅ | ✅ |

### 音訊編解碼器

| 編解碼器 | iOS | Android | Web | 檢測支援 |
|---------|-----|---------|-----|---------|
| AAC | ✅ | ✅ | ✅ | ✅ |
| MP3 | ✅ | ✅ | ✅ | ✅ |
| Opus | ❌ | ✅ | ✅ | ✅ |
| Vorbis | ❌ | ✅ | ⚠️ | ✅ |

### URI 格式

| 格式 | 平台 | 權限需求 | 支援 |
|-----|------|----------|------|
| `http://` | 全平台 | 無 | ✅ |
| `https://` | 全平台 | 無 | ✅ |
| `file://` | 全平台 | iOS: 無, Android: 有 | ✅ |
| `content://` | Android | 是 | ✅ |
| `asset://` | 全平台 | 無 | ⚠️ |

---

## 🆘 常見問題

### Q1: 為什麼本地檔案無法播放?

**A**: 可能原因:
1. **權限未授予** - 執行 `checkStoragePermission()` 檢查
2. **URI 格式錯誤** - 使用 `normalizeFileUri()` 標準化
3. **檔案不存在** - 執行 `diagnoseMP4File()` 確認檔案存在
4. **編解碼器不支援** - 查看診斷報告的 `codecInfo`

**解決方案**:
```typescript
const diagnosis = await diagnoseMP4File(uri);
console.log('問題:', diagnosis.errors);
console.log('建議:', diagnosis.recommendations);
```

### Q2: Android content:// URI 如何處理?

**A**: content:// URI 需要特殊處理:

```typescript
// 1. 檢查權限
const permission = await checkStoragePermission();
if (!permission.granted) {
  await openAppSettings();
}

// 2. 標準化 URI (保持原樣,但標記需要權限)
const normalized = normalizeFileUri('content://...');

// 3. 診斷檔案
const diagnosis = await diagnoseMP4File('content://...');
```

### Q3: 如何知道檔案的編解碼器?

**A**: 使用診斷功能:

```typescript
const result = await diagnoseMP4File(uri);

console.log('視訊編解碼器:', result.codecInfo?.videoCodec);
console.log('視訊 Profile:', result.codecInfo?.videoProfile);
console.log('音訊編解碼器:', result.codecInfo?.audioCodec);
console.log('容器格式:', result.codecInfo?.container);
```

### Q4: 診斷報告太詳細,如何簡化?

**A**: 只提取需要的資訊:

```typescript
const result = await diagnoseMP4File(uri);

// 簡化版
const simplified = {
  canPlay: result.compatibility.nativePlayerSupported,
  video: result.codecInfo?.videoCodec,
  audio: result.codecInfo?.audioCodec,
  errors: result.errors,
  tips: result.recommendations.slice(0, 3), // 只顯示前 3 個建議
};

console.log(simplified);
```

---

## 📞 技術支援

遇到問題時,請提供完整的診斷報告:

```typescript
import { diagnoseMP4File, exportMP4DiagnosticReport } from '@/utils/mp4Diagnostics';

const diagnosis = await diagnoseMP4File(problematicUri);
const report = exportMP4DiagnosticReport(diagnosis);

// 將 report (JSON 格式) 提供給技術支援
console.log(report);
```

---

## 📝 總結

✅ **任務 1 & 2 已完成**
- 深度 MP4 編碼分析系統
- Android/iOS 權限處理系統
- URI 標準化引擎
- 完整診斷報告

🔧 **已整合到播放器**
- EnhancedMP4Player
- UniversalVideoPlayer

🧪 **測試工具完備**
- 完整測試套件
- 快速診斷工具
- 個別功能測試

📚 **文件齊全**
- 使用指南
- API 文件
- 常見問題

**開始使用**:
```typescript
import { quickTestMP4 } from '@/utils/mp4DiagnosticsTest';

// 測試您的檔案
await quickTestMP4('您的影片 URI');
```

---

**實作完成日期**: 2025-01-13  
**版本**: 1.0.0
