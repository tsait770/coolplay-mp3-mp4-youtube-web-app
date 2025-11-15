# MP3 & DASH Quick Reference Guide 🚀

## 快速上手指南

### 🎵 播放 MP3 音頻

```typescript
import UniversalVideoPlayer from '@/components/UniversalVideoPlayer';

// 就這麼簡單！UniversalVideoPlayer 會自動偵測 MP3 並使用音頻播放器
<UniversalVideoPlayer
  url="https://example.com/song.mp3"
  autoPlay={true}
  onBackPress={() => router.back()}
/>
```

**支援的音頻格式：**
- .mp3 (MP3)
- .m4a (M4A/AAC)
- .wav (WAV)
- .flac (FLAC)
- .aac (AAC)

---

### 📹 播放 DASH 串流

```typescript
import UniversalVideoPlayer from '@/components/UniversalVideoPlayer';

// DASH 自動偵測，Android/Web 使用 DashPlayer，iOS 顯示相容性警告
<UniversalVideoPlayer
  url="https://example.com/stream.mpd"
  autoPlay={true}
  onError={(error) => {
    console.log('DASH error:', error);
  }}
  onBackPress={() => router.back()}
/>
```

**平台相容性：**
- ✅ Android: 完整支援（ExoPlayer）
- ✅ Web: 完整支援（dash.js）
- ⚠️ iOS: 有限支援（僅 H.264/H.265 + AAC/MP3）

---

### 🔊 語音控制使用

所有媒體類型（音頻、視頻、串流）自動支援語音控制：

```typescript
// 在任何播放器中，語音命令自動運作
// 無需額外配置

// 支援的命令：
// - "播放" / "play"
// - "暫停" / "pause"
// - "快轉" / "forward"
// - "倒退" / "rewind"
// - "靜音" / "mute"
// - "取消靜音" / "unmute"
// - "停止" / "stop"
```

---

### 🎯 自動格式偵測

```typescript
import { detectVideoSource } from '@/utils/videoSourceDetector';

// 偵測媒體類型
const sourceInfo = detectVideoSource(url);

console.log(sourceInfo.type); // 'audio', 'video', 'dash', 'hls', etc.
console.log(sourceInfo.isAudioOnly); // true/false
console.log(sourceInfo.streamType); // 'mp3', 'mp4', 'dash', 'hls', etc.
```

**偵測優先順序：**
1. 音頻格式 (mp3, m4a, wav, etc.)
2. 串流格式 (m3u8, mpd)
3. 視頻格式 (mp4, webm, etc.)
4. 平台 (YouTube, Vimeo, etc.)

---

### 📊 後端記錄 media_type

```typescript
import { trpc } from '@/lib/trpc';

// 記錄語音使用時，包含 media_type
await trpc.membership.logVoiceUsage.mutate({
  commandText: "播放",
  commandType: "play",
  language: "zh-TW",
  sourceUrl: "https://example.com/song.mp3",
  videoPlatform: "Direct Audio",
  mediaType: "MP3", // ← 新增欄位
  success: true,
});
```

---

### ⚠️ iOS DASH 最佳實踐

```typescript
// 建議：在 iOS 上，優先使用 HLS
const getRecommendedUrl = (dashUrl: string, hlsUrl: string) => {
  if (Platform.OS === 'ios' && hlsUrl) {
    return hlsUrl; // 優先使用 HLS
  }
  return dashUrl; // 其他平台可使用 DASH
};

// 使用範例
const url = getRecommendedUrl(
  'https://example.com/stream.mpd',
  'https://example.com/stream.m3u8'
);

<UniversalVideoPlayer url={url} />
```

---

### 🎨 自訂音頻播放器外觀

MP3Player 使用自訂設計，如需調整：

```typescript
// components/MP3Player.tsx

// 自訂顏色
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a', // 深色背景
  },
  albumArtPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // 專輯封面佔位符
  },
  playButton: {
    backgroundColor: Colors.accent.primary, // 主要按鈕顏色
  },
  // ...
});
```

---

### 🔍 除錯技巧

#### 啟用詳細日誌：
```typescript
// 在播放器中，所有動作都會記錄到 console
// 搜尋以下標籤：

console.log('[UniversalVideoPlayer]') // 主播放器
console.log('[MP3Player]')            // 音頻播放器
console.log('[DashPlayer]')           // DASH 播放器
console.log('[HlsPlayer]')            // HLS 播放器
console.log('[VideoSourceDetector]')  // 格式偵測
```

#### 常見問題解決：

**問題：MP3 沒有播放**
```typescript
// 檢查：
1. URL 是否正確？
2. 格式偵測是否為 'audio'？
   const source = detectVideoSource(url);
   console.log(source.type); // 應該是 'audio'
3. 是否有錯誤訊息？
```

**問題：iOS DASH 無法播放**
```typescript
// 預期行為：iOS DASH 可能無法播放
// 解決方案：
1. 確認串流使用 H.264/H.265 + AAC/MP3
2. 或改用 HLS (.m3u8) 格式
3. 檢查錯誤訊息是否提供建議
```

---

### 📦 相關檔案

**播放器元件：**
- `components/UniversalVideoPlayer.tsx` - 主入口
- `components/MP3Player.tsx` - 音頻播放器
- `components/DashPlayer.tsx` - DASH 播放器
- `components/HlsPlayer.tsx` - HLS 播放器
- `components/EnhancedMP4Player.tsx` - 增強 MP4 播放器

**工具函式：**
- `utils/videoSourceDetector.ts` - 格式偵測

**後端：**
- `backend/trpc/routes/membership/log-voice-usage/route.ts` - 語音使用記錄

**測試：**
- `app/media-format-test.tsx` - 測試頁面

**文檔：**
- `MP3_DASH_IMPLEMENTATION_COMPLETE.md` - 完整實作文檔
- `DASH_MP3_TESTING_GUIDE.md` - 測試指南

---

### 🎓 學習資源

**DASH 格式：**
- 官方規範: https://dashif.org/
- dash.js 文檔: https://github.com/Dash-Industry-Forum/dash.js

**HLS 格式：**
- Apple HLS 規範: https://developer.apple.com/streaming/
- hls.js 文檔: https://github.com/video-dev/hls.js

**音頻格式：**
- MP3: https://en.wikipedia.org/wiki/MP3
- AAC/M4A: https://en.wikipedia.org/wiki/Advanced_Audio_Coding

---

**版本:** 1.0  
**最後更新:** 2025-11-15
