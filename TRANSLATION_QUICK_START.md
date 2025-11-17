# 🌍 翻譯同步系統 - 快速開始

## 🎯 快速執行

### Windows 用戶
```bash
sync-all-translations.bat
```

### Mac/Linux 用戶
```bash
chmod +x sync-all-translations.sh
./sync-all-translations.sh
```

### 手動執行
```bash
# 1. 補齊 199 個缺失 key
npx tsx scripts/add199MissingKeys.ts

# 2. 同步所有缺失 key
npx tsx scripts/syncMissingKeys.ts

# 3. 審計翻譯完整性
npx tsx scripts/auditTranslations.ts
```

## 📊 系統概覽

### 問題現狀
- ❌ 199 個 key 在所有語系中完全缺失
- ⚠️ 部分 key 在某些語系中缺失或為空值
- 📈 總共需要支援 574 個 key × 12 種語言

### 解決方案
✅ 自動檢測缺失的 key  
✅ 為英文生成人類可讀的預設值  
✅ 為其他語系生成標記的佔位符  
✅ 自動排序保持檔案整潔  
✅ 生成審計報告供檢查

## 🔧 核心腳本

| 腳本 | 功能 | 執行時機 |
|------|------|----------|
| `add199MissingKeys.ts` | 補齊 199 個已知缺失 key | 首次設置 |
| `syncMissingKeys.ts` | 全面同步所有缺失 key | 每次開發後 |
| `auditTranslations.ts` | 審計翻譯完整性 | 定期檢查 |

## 📝 翻譯佔位符格式

### 英文 (en.json)
```json
{
  "about_app": "About App",
  "api_settings": "Api Settings"
}
```

### 其他語系
```json
{
  "about_app": "[繁體中文] About App",
  "api_settings": "[繁體中文] Api Settings"
}
```

## ✅ 執行後檢查清單

- [ ] 查看執行輸出，確認無錯誤
- [ ] 檢查 `translation-audit-report.json`
- [ ] 在 UI 中測試新增的 key
- [ ] 將佔位符提交給翻譯團隊
- [ ] 提交更新後的翻譯檔案

## 🎯 下一步建議

### 立即執行
1. 執行完整同步流程
2. 驗證 UI 中的翻譯顯示
3. 標記需要專業翻譯的項目

### 短期目標 (1-2 週)
1. 完成所有佔位符的翻譯
2. 建立翻譯審核流程
3. 在 CI/CD 中加入自動檢查

### 長期規劃
1. 建立翻譯管理平台
2. 實施持續翻譯更新機制
3. 收集用戶反饋優化翻譯

## 📚 詳細文檔

更多資訊請參考: [TRANSLATION_SYNC_GUIDE.md](./TRANSLATION_SYNC_GUIDE.md)

## 🆘 常見問題

**Q: 執行腳本時提示找不到 tsx？**  
A: 執行 `npm install -g tsx` 或使用 `npx tsx` 前綴

**Q: 為什麼有些 key 的預設值看起來奇怪？**  
A: 這是自動生成的，請手動調整 en.json 中的英文值

**Q: 如何判斷翻譯是否完成？**  
A: 執行 `auditTranslations.ts`，檢查報告中的 missing 和 empty 數量

**Q: 可以只更新特定語言嗎？**  
A: 可以手動編輯對應的 JSON 檔案，但建議使用腳本保持一致性

---

💡 **提示**: 建議在每次 PR 前執行一次完整同步流程，確保翻譯同步！
