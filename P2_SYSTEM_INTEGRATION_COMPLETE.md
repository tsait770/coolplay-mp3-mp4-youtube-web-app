# P2 系统整合完成报告

## 完成的任务

### 1. 创建全局播放器管理器 (GlobalPlayerManager)

**文件**: `lib/player/GlobalPlayerManager.ts`

**功能**:
- 统一管理所有播放器实例
- 接收语音指令并路由到当前播放器
- 支持播放列表管理（下一首、上一首）
- 状态管理和事件监听
- WebView 引用管理

**核心 API**:
```typescript
globalPlayerManager.loadVideo(url: string): boolean
globalPlayerManager.executeVoiceCommand(payload: VoiceCommandPayload): Promise<boolean>
globalPlayerManager.setPlaylist(urls: string[], startIndex?: number): void
globalPlayerManager.playNext(): Promise<boolean>
globalPlayerManager.playPrevious(): Promise<boolean>
globalPlayerManager.setWebViewRef(ref: RefObject<WebView>): void
globalPlayerManager.subscribe(listener: (state: GlobalPlayerState) => void): () => void
```

### 2. 创建整合的 VoiceControlProviderV2

**文件**: `providers/VoiceControlProviderV2.tsx`

**功能**:
- 使用新的 ASRAdapter 处理语音识别
- 使用 CommandParser 解析语音指令
- 自动将解析后的指令发送到 GlobalPlayerManager
- 支持持续监听模式（always listening）
- Keep-alive 机制防止 ASR 中断
- 使用次数统计

**与旧版本的区别**:
- ✅ 使用统一的 ASRAdapter（支持 Web Speech API 和 MediaRecorder）
- ✅ 使用 CommandParser 进行智能指令解析
- ✅ 直接与 GlobalPlayerManager 集成
- ✅ 更好的错误处理和重启逻辑
- ✅ 信心度阈值处理

### 3. 创建 VoiceCommandRouter 组件

**文件**: `components/VoiceCommandRouter.tsx`

**功能**:
- 监听 window 的 'voiceCommand' 事件（兼容旧版本）
- 将旧版本的事件格式映射到新的 VoiceCommandPayload
- 路由命令到 GlobalPlayerManager

**用途**: 向后兼容现有的语音控制流程

### 4. 创建 GlobalPlayerProvider

**文件**: `providers/GlobalPlayerProvider.tsx`

**功能**:
- 提供 React Context 访问 GlobalPlayerManager
- 状态同步和更新
- 提供便捷的 Hook: `useGlobalPlayer()`

**使用示例**:
```typescript
const { loadVideo, playNext, playPrevious, currentUrl, status } = useGlobalPlayer();
```

---

## 集成指南

### 步骤 1: 更新 app/_layout.tsx

在根布局中添加新的 Provider：

```typescript
import { VoiceControlProviderV2 } from '@/providers/VoiceControlProviderV2';
import { GlobalPlayerProvider } from '@/providers/GlobalPlayerProvider';
import { VoiceCommandRouter } from '@/components/VoiceCommandRouter';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPlayerProvider>
        <VoiceControlProviderV2>
          <VoiceCommandRouter />
          {/* 其他内容 */}
        </VoiceControlProviderV2>
      </GlobalPlayerProvider>
    </QueryClientProvider>
  );
}
```

### 步骤 2: 在播放器页面中使用

**app/(tabs)/player.tsx**:

```typescript
import { useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useGlobalPlayer } from '@/providers/GlobalPlayerProvider';
import { useVoiceControlV2 } from '@/providers/VoiceControlProviderV2';

export default function PlayerScreen() {
  const webViewRef = useRef<WebView>(null);
  const { 
    loadVideo, 
    setWebViewRef, 
    currentUrl, 
    status,
    playNext,
    playPrevious,
  } = useGlobalPlayer();
  
  const {
    startListening,
    stopListening,
    isListening,
    lastCommand,
    confidence,
  } = useVoiceControlV2();

  useEffect(() => {
    // 设置 WebView 引用，用于 YouTube/Vimeo 等需要 iframe 的播放器
    setWebViewRef(webViewRef);
  }, []);

  const handleLoadVideo = (url: string) => {
    const success = loadVideo(url);
    if (!success) {
      console.error('Failed to load video');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 播放器 UI */}
      <WebView ref={webViewRef} />
      
      {/* 语音控制按钮 */}
      <Button 
        title={isListening ? "停止" : "开始语音控制"} 
        onPress={isListening ? stopListening : startListening} 
      />
      
      {/* 显示最后的语音指令 */}
      {lastCommand && (
        <Text>最后指令: {lastCommand} ({(confidence * 100).toFixed(0)}%)</Text>
      )}
    </View>
  );
}
```

### 步骤 3: 设置播放列表（可选）

```typescript
const { setPlaylist, playNext, playPrevious } = useGlobalPlayer();

// 设置播放列表
setPlaylist([
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://vimeo.com/123456789',
  'https://example.com/video.mp4',
], 0); // 从第一个视频开始

// 播放下一首
await playNext();

// 播放上一首
await playPrevious();
```

---

## 语音指令支持

所有语音指令现在都会自动路由到当前播放器：

### 播放控制
- "播放" / "play"
- "暂停" / "pause"
- "停止" / "stop"
- "重新播放" / "restart"
- "下一部影片" / "next video"
- "上一部影片" / "previous video"

### 进度控制
- "快转 10 秒" / "forward 10 seconds"
- "倒转 20 秒" / "rewind 20 seconds"
- 支持 Regex 自动识别秒数

### 音量控制
- "音量最大" / "max volume"
- "静音" / "mute"
- "取消静音" / "unmute"
- "音量调高" / "volume up"
- "音量调低" / "volume down"

### 播放速度
- "0.5 倍速" / "0.5x speed"
- "正常速度" / "normal speed"
- "1.5 倍速" / "1.5x speed"
- "2 倍速" / "2x speed"

### 全屏控制
- "进入全屏" / "enter fullscreen"
- "离开全屏" / "exit fullscreen"

---

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    VoiceControlProviderV2                    │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │  ASRAdapter  │→│ CommandParser │→│ GlobalPlayerMgr  │ │
│  └──────────────┘  └───────────────┘  └──────────────────┘ │
│         ↓                  ↓                    ↓           │
│  Web Speech API    Intent + Slot      executeVoiceCommand  │
│  MediaRecorder     Regex Match        路由到当前播放器     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   GlobalPlayerManager                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  当前播放器: UniversalPlayerController                 │ │
│  │  - NativePlayerAdapter (MP4/HLS/DASH)                 │ │
│  │  - WebViewPlayerAdapter (YouTube/Vimeo/Adult)         │ │
│  └────────────────────────────────────────────────────────┘ │
│  Playlist Management | Next/Previous | State Management    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   GlobalPlayerProvider                       │
│         提供 React Context 和 useGlobalPlayer Hook          │
└─────────────────────────────────────────────────────────────┘
```

---

## 关键特性

### 1. 统一的播放器接口
所有播放器（MP4、HLS、DASH、YouTube、Vimeo 等）都实现 `UniversalPlayerController` 接口，语音指令无需区分播放器类型。

### 2. 智能指令解析
- 精确匹配
- Regex 参数提取（自动识别秒数、倍速）
- 模糊匹配（Levenshtein 距离）
- 多语言支持（12 种语言）

### 3. 跨平台 ASR
- Web: 优先使用 Web Speech API
- Web (fallback): MediaRecorder + 云端转录
- Mobile: MediaRecorder + 云端转录

### 4. Keep-Alive 机制
当启用 always listening 模式时，会定期检查 ASR 状态，如果中断会自动重启。

### 5. 状态管理
- 全局播放器状态
- 语音控制状态
- 使用次数统计
- 播放列表管理

---

## 下一步建议

### P3 任务：UI/UX 优化
1. 创建语音指令 UI 反馈组件
   - 显示识别的语音文字
   - 显示解析的 Intent
   - 显示信心度
   - 动画效果（播放、暂停、快转等）

2. 创建语音控制设置页面
   - 开启/关闭 always listening
   - 查看使用次数
   - 语言选择
   - 信心度阈值调整

3. 添加 TTS 语音反馈
   - 成功执行指令后的语音提示
   - 错误提示
   - 静音模式选项

### P4 任务：测试和优化
1. 添加单元测试
   - CommandParser 测试
   - GlobalPlayerManager 测试
   - 各个 Adapter 测试

2. 性能优化
   - 减少不必要的 re-render
   - 优化内存使用
   - 改进 ASR 重启逻辑

3. 错误处理
   - 更详细的错误信息
   - 错误恢复机制
   - 用户友好的错误提示

---

## 文件清单

### 新增文件
- ✅ `lib/player/GlobalPlayerManager.ts` - 全局播放器管理器
- ✅ `providers/VoiceControlProviderV2.tsx` - 整合的语音控制 Provider
- ✅ `providers/GlobalPlayerProvider.tsx` - 全局播放器 Provider
- ✅ `components/VoiceCommandRouter.tsx` - 语音指令路由组件

### 依赖的现有文件
- ✅ `lib/voice/CommandParser.ts` - 指令解析器
- ✅ `lib/voice/ASRAdapter.ts` - ASR 适配器
- ✅ `lib/player/UniversalPlayerController.ts` - 播放器接口
- ✅ `lib/player/PlayerAdapterRouter.ts` - 播放器路由
- ✅ `lib/player/adapters/NativePlayerAdapter.ts` - 原生播放器
- ✅ `lib/player/adapters/WebViewPlayerAdapter.ts` - WebView 播放器

### 更新的文件
- ✅ `lib/player/index.ts` - 导出 GlobalPlayerManager

---

## 总结

P2 系统整合任务已完成，实现了：

1. ✅ 创建全局播放器管理器，统一管理所有播放器实例
2. ✅ 整合 VoiceControlProvider 与 CommandParser/ASRAdapter
3. ✅ 建立语音指令到播放器动作的完整路由机制
4. ✅ 提供 React Context 和 Hook 便于在应用中使用
5. ✅ 支持播放列表和 next/previous 功能
6. ✅ 向后兼容现有的语音控制流程

系统现在已经具备完整的语音控制能力，可以支持所有支持的视频格式（MP4、MP3、HLS、DASH、YouTube、Vimeo、Twitch 等），并且可以通过语音指令控制播放、进度、音量、速度和全屏。

接下来可以进行 P3（UI/UX 优化）和 P4（测试和优化）任务。
