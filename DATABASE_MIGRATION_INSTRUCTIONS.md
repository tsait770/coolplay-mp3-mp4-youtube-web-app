# 數據庫遷移指南 (Database Migration Guide)

## 📋 概述

本指南將協助您將數據從舊的 Supabase 項目遷移到新的項目。

## 🎯 項目信息

### 新項目 (目標)
- **名稱**: CoolPlay原版MP4 YouTube網頁版APP
- **URL**: `https://ukpskaspdzinzpsdoodi.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcHNrYXNwZHppbnpwc2Rvb2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDA0MjgsImV4cCI6MjA3ODUxNjQyOH0.HdmSGe_YEs5hVFTgm7QMzmQu3xe8i95carC8wxSjGfU`

### 舊項目 (來源)
- **名稱**: Supabase_coolplay-app-all-1-clone
- **URL**: `https://djahnunbkbrfetktossw.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqYWhudW5ia2JyZmV0a3Rvc3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDUwMDYsImV4cCI6MjA3NzQ4MTAwNn0.7HrcPZ2z9xQPrRs-gDtQ8tQX4zT1_5rsHN-CGy0ePzg`

## ⚙️ 遷移步驟

### 第一步：創建數據庫架構

1. **登入新的 Supabase 項目**
   - 訪問: https://supabase.com/dashboard
   - 選擇項目: "CoolPlay原版MP4 YouTube網頁版APP"

2. **進入 SQL Editor**
   - 在左側菜單中點擊 "SQL Editor"
   - 點擊 "New query"

3. **執行數據庫架構腳本**
   - 複製 `database-schema-complete.sql` 文件的全部內容
   - 貼到 SQL Editor 中
   - 點擊 "Run" 執行

4. **驗證表已創建**
   - 在左側菜單點擊 "Table Editor"
   - 確認以下表已成功創建：
     - ✅ profiles
     - ✅ bookmarks
     - ✅ folders
     - ✅ bound_devices
     - ✅ device_verifications
     - ✅ usage_logs
     - ✅ subscriptions

### 第二步：(可選) 遷移數據

如果您需要從舊項目遷移用戶數據：

#### 方式一：使用 Supabase Dashboard

1. **從舊項目導出數據**
   - 登入舊項目: https://djahnunbkbrfetktossw.supabase.co
   - 進入 "Table Editor"
   - 對每個表：
     - 選擇表 → 點擊 "..." → "Export as CSV"
     - 保存 CSV 文件

2. **導入到新項目**
   - 登入新項目: https://ukpskaspdzinzpsdoodi.supabase.co
   - 進入 "Table Editor"
   - 對每個表：
     - 選擇表 → 點擊 "Insert" → "Import from CSV"
     - 選擇對應的 CSV 文件

#### 方式二：使用 SQL 腳本 (推薦，如果有 Service Role Key)

如果您有兩個項目的 **Service Role Key**，可以使用 PostgreSQL 工具直接遷移：

```bash
# 導出舊項目數據
pg_dump -h db.djahnunbkbrfetktossw.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  --schema=public \
  -f old_data.sql

# 導入到新項目
psql -h db.ukpskaspdzinzpsdoodi.supabase.co \
  -U postgres \
  -d postgres \
  -f old_data.sql
```

### 第三步：驗證配置

1. **檢查環境變量**
   - 打開 `.env` 文件
   - 確認以下值正確：
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://ukpskaspdzinzpsdoodi.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

2. **重啟應用程序**
   ```bash
   # 停止當前運行的應用
   # 清除緩存
   rm -rf .expo
   
   # 重新啟動
   npx expo start --clear
   ```

3. **測試連接**
   - 打開應用
   - 進入 "設定" → "開發者選項" → "連接測試"
   - 點擊 "開始測試"
   - 確認 "Supabase 連接測試" 顯示 ✅ 成功

## 🔍 故障排除

### 問題 1: "Could not find the table 'public.profiles'"
**解決方案**: 確保已在新項目中執行 `database-schema-complete.sql`

### 問題 2: RLS 策略錯誤
**解決方案**: 
1. 進入 Supabase Dashboard → Authentication → Policies
2. 確認每個表都有正確的 RLS 策略
3. 如果缺失，重新執行 schema 腳本

### 問題 3: 數據遷移失敗
**解決方案**:
1. 確保在導入數據前已創建表結構
2. 檢查外鍵約束 (如 user_id 必須先存在於 profiles 表)
3. 按順序導入：profiles → folders → bookmarks → 其他表

## ✅ 遷移完成檢查清單

- [ ] 新項目中已創建所有數據庫表
- [ ] RLS 策略已正確設置
- [ ] 索引已創建
- [ ] 觸發器和函數已創建
- [ ] (可選) 數據已從舊項目遷移
- [ ] `.env` 文件配置正確
- [ ] 應用程序連接測試通過
- [ ] 可以正常登入/註冊
- [ ] 可以創建和查看書籤

## 📞 需要幫助？

如果遇到問題，請提供：
1. 錯誤截圖
2. SQL Editor 中的錯誤消息
3. 應用程序控制台日誌

---

**最後更新**: 2025-01-13
