# 翻譯同步機制使用指南

## 📋 概述

本專案建立了完整的翻譯 key 補齊機制，確保所有 12 種語言的翻譯檔案完整且同步。

## 🛠️ 可用腳本

### 1. 審計翻譯完整性
```bash
tsx scripts/auditTranslations.ts
```
- **功能**: 檢查所有語系檔的翻譯完整性
- **輸出**: 生成 `translation-audit-report.json` 報告
- **用途**: 定期檢查翻譯品質，發現缺失和空值

### 2. 同步缺失的 key
```bash
tsx scripts/syncMissingKeys.ts
```
- **功能**: 自動檢測並補齊所有語系檔中缺失的 key
- **特點**:
  - 為英文檔 (en.json) 自動生成人類可讀的預設文案
  - 為其他語系生成 `[語言名稱] 英文預設值` 的佔位符
  - 自動排序所有 key，保持檔案整潔
  - 修正空值或與 key 相同的翻譯值

### 3. 補齊 199 個特定缺失 key
```bash
tsx scripts/add199MissingKeys.ts
```
- **功能**: 專門補齊報告中發現的 199 個缺失 key
- **適用場景**: 快速補齊已知的缺失項目
- **輸出**: 更新所有語系檔，標記需要翻譯的項目

## 📊 目前狀態

根據最新分析報告：

- **原始碼使用的 key 總數**: 574 個
- **現有翻譯檔中的 key**: 681 個
- **完全缺失的 key**: 199 個
- **支援語言**: 12 種

## 🔄 工作流程

### 首次設置
```bash
# 1. 補齊 199 個已知缺失的 key
tsx scripts/add199MissingKeys.ts

# 2. 同步所有剩餘的缺失 key
tsx scripts/syncMissingKeys.ts

# 3. 驗證完整性
tsx scripts/auditTranslations.ts
```

### 日常維護
```bash
# 定期執行同步，確保沒有新的缺失
tsx scripts/syncMissingKeys.ts
```

## 📝 自動生成規則

### 英文預設值 (en.json)
- 單字母 key (如 `a`, `T`) → 轉為大寫 (`A`, `T`)
- 全大寫 key (如 `MEDIA_URL`) → 轉為標題格式 (`Media Url`)
- 蛇形命名 key (如 `about_app`) → 轉為標題格式 (`About App`)

### 其他語系佔位符
格式: `[語言名稱] 英文預設值`

範例:
- 繁體中文: `[繁體中文] About App`
- 日文: `[日本語] About App`
- 韓文: `[한국어] About App`

## ✅ 驗證清單

完成同步後，請確認：

- [ ] 執行 `tsx scripts/auditTranslations.ts` 無報錯
- [ ] 檢查 en.json 的英文預設值是否合理
- [ ] 確認其他語系的佔位符格式正確
- [ ] 在 UI 中測試新增的 key 是否正確顯示
- [ ] 將標記為 `[需要翻譯]` 的項目提交翻譯團隊

## 🎯 下一步建議

1. **建立 CI/CD 檢查**
   - 在 PR 中自動執行 `auditTranslations.ts`
   - 若發現缺失 key，阻止合併

2. **翻譯團隊協作**
   - 定期收集標記為 `[需要翻譯]` 的項目
   - 建立翻譯審核流程

3. **持續監控**
   - 每次新增功能後執行同步腳本
   - 定期審計翻譯品質

4. **文檔更新**
   - 記錄新增的 key 及其用途
   - 維護翻譯術語表

## 🔍 故障排除

### 執行腳本時出現錯誤
```bash
# 確保安裝了 tsx
npm install -g tsx

# 或使用 npx
npx tsx scripts/syncMissingKeys.ts
```

### 翻譯檔案格式錯誤
- 確保所有 JSON 檔案格式正確
- 使用 JSON 驗證工具檢查語法

### 某些 key 仍然缺失
- 執行完整同步: `tsx scripts/syncMissingKeys.ts`
- 檢查原始碼是否使用了未在翻譯檔中定義的 key

## 📞 支援

如有問題，請：
1. 檢查本文檔的故障排除部分
2. 執行 `tsx scripts/auditTranslations.ts` 查看詳細報告
3. 聯繫開發團隊尋求協助
