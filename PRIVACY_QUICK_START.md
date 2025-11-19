# 🚀 隱私合規快速啟動指南
# Privacy Compliance Quick Start Guide

**立即開始 / Get Started Immediately**

---

## ✅ 已完成項目 / Completed Items

所有高優先級的隱私與合規任務已完成！
All high-priority privacy and compliance tasks are complete!

- ✅ 移除硬編碼金鑰 / Removed hardcoded keys
- ✅ 後端安全驗證 / Backend security verified  
- ✅ 隱私政策更新 / Privacy policy updated
- ✅ 首次同意流程 / First-time consent flow
- ✅ COPPA 合規 / COPPA compliance
- ✅ 開發者測試工具 / Developer testing tools

---

## 🔴 立即執行 (必須) / Execute Immediately (Required)

### 1️⃣ 更新翻譯 / Update Translations

**Windows**:
```cmd
update-privacy-translations.bat
```

**Mac/Linux**:
```bash
chmod +x update-privacy-translations.sh
./update-privacy-translations.sh
```

**或直接執行 / Or run directly**:
```bash
node scripts/add-privacy-compliance-keys.js
```

### 2️⃣ 啟動應用程式測試 / Start App Testing

```bash
# 清除快取 / Clear cache
npx expo start -c

# 或 / Or
npm start -- --clear
```

### 3️⃣ 測試首次啟動流程 / Test First Launch

1. 清除應用程式資料
2. 啟動應用程式
3. 驗證同意彈窗顯示
4. 測試接受/拒絕功能

---

## 🟡 重要但非緊急 / Important But Not Urgent

### 4️⃣ Git 歷史清理 (如果曾提交敏感金鑰)

⚠️ **警告：這會重寫 Git 歷史！執行前先備份！**

```bash
# 備份專案 / Backup project first!
cp -r . ../coolplay-backup

# 清理 .env 檔案歷史 / Clean .env history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 清理 refs
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 強制推送 (小心！) / Force push (careful!)
# git push origin --force --all
```

### 5️⃣ 旋轉 API 金鑰 (如果曾暴露)

**Supabase**:
1. 前往 https://supabase.com/dashboard
2. 選擇您的專案
3. Settings > API > 重新產生 Anon Key
4. 更新 `.env` 中的 `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Stripe**:
1. 前往 https://dashboard.stripe.com/apikeys
2. 撤銷舊金鑰
3. 建立新金鑰
4. 更新 `.env` 中的 `STRIPE_SECRET_KEY`

---

## 📱 真實設備測試 / Real Device Testing

### iOS 測試 / iOS Testing
```bash
# 啟動開發伺服器 / Start dev server
npx expo start

# 掃描 QR Code 或
# Scan QR Code or press 'i' for iOS simulator
```

### Android 測試 / Android Testing
```bash
# 啟動開發伺服器 / Start dev server
npx expo start

# 掃描 QR Code 或
# Scan QR Code or press 'a' for Android emulator
```

### 測試清單 / Test Checklist
- [ ] 首次啟動顯示同意彈窗
- [ ] 拒絕同意後無法進入
- [ ] 接受同意後正常進入
- [ ] 隱私政策頁面完整顯示
- [ ] COPPA 章節存在
- [ ] 語音資料章節完整
- [ ] 開發者選項可重置同意
- [ ] 切換語言測試翻譯

---

## 🌐 多語言驗證 / Multi-language Verification

測試以下語言的隱私政策顯示：
Test privacy policy display in these languages:

1. English (en)
2. 繁體中文 (zh-TW)
3. 简体中文 (zh-CN)
4. 日本語 (ja)
5. 한국어 (ko)
6. Español (es)
7. Português (pt-BR)
8. Deutsch (de)
9. Français (fr)
10. Русский (ru)
11. العربية (ar)

---

## 📋 快速檢查清單 / Quick Checklist

### 技術安全 / Technical Security
- [x] 無硬編碼金鑰
- [x] 後端敏感操作隔離
- [x] 無影片下載功能
- [ ] Git 歷史已清理 (如需要)
- [ ] API 金鑰已旋轉 (如需要)

### 隱私政策 / Privacy Policy
- [x] 基礎政策完整
- [x] 語音資料章節 (A-5)
- [x] 使用場景說明 (A-3)
- [x] 第三方內容 (A-2)
- [x] 廣告政策 (A-4)
- [x] COPPA 合規
- [ ] 翻譯已更新

### 用戶同意 / User Consent
- [x] 首次同意彈窗
- [x] 同意狀態儲存
- [x] 阻止邏輯實作
- [x] 開發者重置功能
- [ ] 真實設備測試

---

## 🎯 下一階段 / Next Phase

完成上述步驟後，繼續執行：
After completing above, proceed with:

1. **準備應用商店提交 / Prepare Store Submission**
   - 準備隱私政策 URL
   - 準備服務條款 URL
   - 更新 app.json 描述
   - 準備截圖與說明

2. **CI/CD 整合 / CI/CD Integration**
   - 建立合規檢查腳本
   - 整合到 GitHub Actions
   - 自動化測試流程

3. **權限優化 / Permission Optimization**
   - 自定義權限說明彈窗
   - 優化權限請求時機
   - 審查權限描述文案

---

## 📞 需要幫助？ / Need Help?

**開發者郵箱**: tsait770@gmail.com

**常見問題**:
- Q: 翻譯腳本執行失敗？
- A: 確保 Node.js 已安裝，並且在專案根目錄執行

- Q: 同意彈窗不顯示？
- A: 清除應用程式資料或使用開發者選項重置

- Q: 如何測試拒絕同意？
- A: 點擊「Decline」按鈕，應該看到警告訊息

---

## 📄 詳細文件 / Detailed Documentation

完整實施報告：`PRIVACY_COMPLIANCE_COMPLETE.md`

包含：
- 所有已完成任務詳細說明
- 代碼變更記錄
- 測試清單
- 合規性檢查表
- 部署指南

---

**版本**: 1.0  
**日期**: 2025-11-19  
**狀態**: ✅ 可執行 / Ready to Execute
