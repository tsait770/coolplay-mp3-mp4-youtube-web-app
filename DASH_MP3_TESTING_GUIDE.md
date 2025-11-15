# DASH & MP3 實作測試指南

## 🎯 測試目標

驗證新增的 DASH (.mpd) 和 MP3 (.mp3) 播放功能，確保：
1. 所有媒體格式正確播放
2. 語音控制在所有格式下運作正常
3. 現有功能（YouTube、Vimeo、HLS、MP4）不受影響
4. 跨平台相容性符合預期

---

## 📱 測試環境準備

### 方法一：使用測試頁面
1. 在應用程式中導航至：`/media-format-test`
2. 頁面會顯示所有可測試的媒體格式
3. 點選任一格式開始測試

### 方法二：直接使用播放器頁面
1. 前往應用程式的播放器頁面
2. 手動輸入以下測試 URL

---

## 🧪 測試案例

### 一、音頻格式測試

#### 1.1 MP3 播放測試
**測試 URL:**
```
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
```

**預期行為：**
- ✅ 顯示音頻播放器介面（而非視頻播放器）
- ✅ 大型專輯封面佔位符（音樂圖標）
- ✅ 播放控制正常（播放/暫停/快轉/倒退）
- ✅ 進度條與時間顯示準確
- ✅ 音量控制正常

**語音控制測試：**
```
說 "播放" → 應開始播放
說 "暫停" → 應暫停播放
說 "快轉" → 應快轉 10 秒
說 "倒退" → 應倒退 10 秒
說 "靜音" → 應靜音
說 "取消靜音" → 應恢復音量
```

**平台測試：**
- [ ] Android - MP3 播放正常
- [ ] iOS - MP3 播放正常
- [ ] Web - MP3 播放正常

---

### 二、DASH 串流測試

#### 2.1 Android DASH 測試
**測試 URL:**
```
https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd
```

**預期行為：**
- ✅ 使用 DashPlayer 組件
- ✅ 串流載入並開始播放
- ✅ 畫質自動切換（根據網路）
- ✅ 播放控制正常

**檢查點：**
- [ ] 載入時間 < 5 秒
- [ ] 無緩衝卡頓
- [ ] 控制響應即時

#### 2.2 iOS DASH 測試
**測試 URL:**
```
https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd
```

**預期行為：**
- ⚠️ 可能顯示編解碼器不相容錯誤
- ⚠️ 如果串流使用 H.264 + AAC，可能正常播放
- ✅ 錯誤訊息清晰且具建設性
- ✅ 建議使用 HLS 替代

**錯誤訊息範例：**
```
DASH 格式不相容

此 DASH 串流使用的編解碼器與 iOS 不相容。

建議：請改用 HLS (.m3u8) 格式以獲得最佳播放體驗。
```

**檢查點：**
- [ ] 錯誤訊息友善且清楚
- [ ] 不會崩潰或卡住
- [ ] 提供 HLS 替代建議

#### 2.3 Web DASH 測試
**測試 URL:**
```
https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd
```

**預期行為：**
- ✅ 使用 dash.js 播放
- ✅ 串流載入並播放
- ✅ 控制正常運作

---

### 三、現有格式回歸測試

#### 3.1 HLS 測試（確保無回歸）
**測試 URL:**
```
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

**預期行為：**
- ✅ 使用 HlsPlayer 組件（與之前相同）
- ✅ 播放流暢無卡頓
- ✅ 所有功能與之前一致

**檢查點：**
- [ ] Android - HLS 播放正常
- [ ] iOS - HLS 播放正常
- [ ] Web - HLS 播放正常

#### 3.2 MP4 測試（確保無回歸）
**測試 URL:**
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

**預期行為：**
- ✅ 使用 EnhancedMP4Player 組件（與之前相同）
- ✅ 增強功能全部正常（A-B循環、速度調整、螢幕鎖定）
- ✅ 所有功能與之前一致

**檢查點：**
- [ ] Android - MP4 播放正常
- [ ] iOS - MP4 播放正常
- [ ] Web - MP4 播放正常
- [ ] A-B 循環功能正常
- [ ] 播放速度調整正常
- [ ] 螢幕鎖定功能正常

#### 3.3 YouTube 測試（確保無回歸）
**測試 URL:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**預期行為：**
- ✅ 使用 YouTubePlayerStandalone 組件（與之前相同）
- ✅ 載入並播放正常
- ✅ 語音控制正常

---

### 四、語音控制整合測試

#### 4.1 跨格式語音控制
**測試流程：**
1. 開啟 MP3 檔案，測試語音控制
2. 切換至 DASH 串流，測試語音控制
3. 切換至 MP4 視頻，測試語音控制
4. 切換至 YouTube 視頻，測試語音控制

**語音命令清單：**
| 命令 | 預期行為 |
|------|---------|
| "播放" | 開始播放 |
| "暫停" | 暫停播放 |
| "快轉" | 快轉 10 秒 |
| "倒退" | 倒退 10 秒 |
| "靜音" | 靜音 |
| "取消靜音" | 恢復音量 |
| "停止" | 停止並回到開頭 |

**檢查點：**
- [ ] 所有命令在 MP3 上正常
- [ ] 所有命令在 DASH 上正常
- [ ] 所有命令在 MP4 上正常
- [ ] 所有命令在 YouTube 上正常
- [ ] 命令識別率 > 85%
- [ ] 命令執行延遲 < 500ms

#### 4.2 後端記錄驗證
**驗證步驟：**
1. 執行數種語音控制命令
2. 檢查 Supabase `voice_logs` 資料表
3. 確認 `media_type` 欄位正確記錄

**預期記錄範例：**
```sql
SELECT command_type, media_type, video_platform, executed_at 
FROM voice_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

**預期結果：**
| command_type | media_type | video_platform | executed_at |
|--------------|------------|----------------|-------------|
| play | MP3 | Direct Audio | 2025-11-15 ... |
| pause | DASH | DASH Stream | 2025-11-15 ... |
| forward | MP4 | Direct Video | 2025-11-15 ... |
| play | HLS | HLS Stream | 2025-11-15 ... |

---

### 五、會員權限測試

#### 5.1 免費版測試
**測試帳號：** Free tier 使用者

**應該可播放：**
- [ ] YouTube
- [ ] Vimeo
- [ ] MP4
- [ ] MP3

**應該被阻止：**
- [ ] DASH
- [ ] HLS
- [ ] 成人平台

**預期錯誤訊息：**
```
此格式需要 Basic 或 Premium 會員。
免費版支援 MP4、WebM、OGG、OGV、MP3、M4A、WAV、YouTube 和 Vimeo。
```

#### 5.2 Premium 測試
**測試帳號：** Premium tier 使用者

**應該可播放：**
- [ ] 所有格式（MP3, MP4, HLS, DASH, YouTube, Vimeo, 等）
- [ ] 無任何限制

---

### 六、錯誤處理測試

#### 6.1 無效 URL 測試
**測試 URL:**
```
https://invalid-url-that-does-not-exist.com/video.mp4
```

**預期行為：**
- ✅ 顯示清晰的錯誤訊息
- ✅ 不崩潰或卡住
- ✅ 可以返回上一頁

#### 6.2 iOS DASH 編解碼器不相容測試
**測試 URL:**
```
https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd
```
（如果此串流使用 VP9 編解碼器）

**預期行為（僅 iOS）：**
- ✅ 嘗試播放
- ⚠️ 如果不相容，顯示清晰錯誤
- ✅ 建議使用 HLS
- ✅ 不崩潰

---

## 📊 測試結果記錄表

### Platform: Android
| 格式 | 播放 | 控制 | 語音 | 錯誤處理 | 狀態 |
|------|------|------|------|----------|------|
| MP3 | ☐ | ☐ | ☐ | ☐ | - |
| MP4 | ☐ | ☐ | ☐ | ☐ | - |
| HLS | ☐ | ☐ | ☐ | ☐ | - |
| DASH | ☐ | ☐ | ☐ | ☐ | - |
| YouTube | ☐ | ☐ | ☐ | ☐ | - |

### Platform: iOS
| 格式 | 播放 | 控制 | 語音 | 錯誤處理 | 狀態 |
|------|------|------|------|----------|------|
| MP3 | ☐ | ☐ | ☐ | ☐ | - |
| MP4 | ☐ | ☐ | ☐ | ☐ | - |
| HLS | ☐ | ☐ | ☐ | ☐ | - |
| DASH | ☐ | ☐ | ☐ | ☐ | ⚠️ 預期有限 |
| YouTube | ☐ | ☐ | ☐ | ☐ | - |

### Platform: Web
| 格式 | 播放 | 控制 | 語音 | 錯誤處理 | 狀態 |
|------|------|------|------|----------|------|
| MP3 | ☐ | ☐ | ☐ | ☐ | - |
| MP4 | ☐ | ☐ | ☐ | ☐ | - |
| HLS | ☐ | ☐ | ☐ | ☐ | - |
| DASH | ☐ | ☐ | ☐ | ☐ | - |
| YouTube | ☐ | ☐ | ☐ | ☐ | - |

---

## 🐛 問題回報格式

如發現問題，請使用以下格式記錄：

```
問題編號: #001
日期: 2025-11-15
平台: iOS / Android / Web
格式: MP3 / MP4 / HLS / DASH
嚴重性: 🔴 Critical / 🟡 Major / 🟢 Minor

描述:
[詳細描述問題]

重現步驟:
1. ...
2. ...
3. ...

預期行為:
[應該發生什麼]

實際行為:
[實際發生什麼]

截圖/日誌:
[如有可能，附上截圖或控制台日誌]
```

---

## ✅ 驗收標準

### 必須通過（Critical）：
- [ ] MP3 在所有平台可正常播放
- [ ] DASH 在 Android/Web 可正常播放
- [ ] iOS DASH 不相容時顯示清晰錯誤
- [ ] 語音控制在所有格式下運作
- [ ] 現有格式（YouTube、Vimeo、HLS、MP4）完全不受影響

### 應該通過（Major）：
- [ ] 音頻播放器 UI 符合設計規範
- [ ] 所有錯誤訊息清晰友善
- [ ] 載入狀態正確顯示
- [ ] 返回按鈕在所有播放器中正常

### 建議通過（Minor）：
- [ ] 播放器切換流暢無閃爍
- [ ] 進度條拖曳精準
- [ ] 時間顯示格式統一

---

## 📝 測試報告範本

```markdown
# 測試報告 - DASH & MP3 實作

**測試日期:** YYYY-MM-DD
**測試人員:** [姓名]
**版本:** v1.0

## 測試摘要
- 總測試案例: X
- 通過: Y
- 失敗: Z
- 跳過: W

## 詳細結果

### Android 測試
[結果]

### iOS 測試
[結果]

### Web 測試
[結果]

## 發現的問題
1. [問題描述]
2. ...

## 建議
1. [改進建議]
2. ...

## 結論
[整體評價與是否可上線]
```

---

## 🚀 快速測試腳本

在應用程式中，可使用以下代碼快速測試：

```typescript
// 測試所有格式
const testAllFormats = async () => {
  const formats = [
    { name: 'MP3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { name: 'MP4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { name: 'HLS', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { name: 'DASH', url: 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd' },
  ];

  for (const format of formats) {
    console.log(`Testing ${format.name}...`);
    // 依序測試每個格式
  }
};
```

---

## 📞 支援

如遇到問題或需要協助：
1. 檢查控制台日誌（尋找 `[UniversalVideoPlayer]`、`[MP3Player]`、`[DashPlayer]` 標籤）
2. 查閱 `MP3_DASH_IMPLEMENTATION_COMPLETE.md` 文件
3. 確認網路連線正常
4. 確認會員權限正確

---

**文件版本:** 1.0  
**最後更新:** 2025-11-15  
**狀態:** ✅ 準備測試
