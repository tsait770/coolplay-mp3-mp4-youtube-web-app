# ⚡ 数据库迁移 - 快速开始

## 🎯 只需 3 步，5 分钟完成迁移！

---

## 步骤 1️⃣：复制 SQL 脚本（30 秒）

1. 打开项目文件 `database-schema-complete.sql`
2. **全选并复制**所有内容（Ctrl+A → Ctrl+C）

---

## 步骤 2️⃣：执行 SQL（2 分钟）

### 方式 A：直接访问链接（最快 ⚡）

**点击这个链接直接打开新项目的 SQL Editor：**

👉 https://supabase.com/dashboard/project/ukpskaspdzinzpsdoodi/sql/new

### 方式 B：手动导航

1. 访问：https://supabase.com/dashboard
2. 选择项目：**ukpskaspdzinzpsdoodi** (CoolPlay原版MP4 YouTube網頁版APP)
3. 左侧菜单点击：**SQL Editor**
4. 点击：**New query**

### 执行 SQL

1. 将复制的 SQL 内容**粘贴**到编辑器中
2. 点击右下角绿色按钮：**Run** 或按 **Ctrl+Enter**
3. 等待 3-5 秒，看到 **Success!** ✅

---

## 步骤 3️⃣：验证结果（2 分钟）

### 在 Supabase Dashboard 中验证

1. 点击左侧菜单：**Table Editor**
2. 确认看到以下 7 个表：
   - ✅ profiles
   - ✅ bookmarks
   - ✅ folders
   - ✅ bound_devices
   - ✅ device_verifications
   - ✅ usage_logs
   - ✅ subscriptions

### 在应用中验证

```bash
# 1. 重启应用（清除缓存）
npx expo start --clear

# 或使用 bun
bun run start --clear
```

2. 打开应用，导航到：**设置** → **开发者选项** → **连接测试**
3. 点击 **开始测试**
4. 确认所有测试项都显示 ✅ 成功

---

## ✅ 完成！

如果所有测试通过，迁移已成功完成！🎉

---

## 🐛 如果出现问题

### 问题：表未创建

**快速修复：**
```sql
-- 在 SQL Editor 中执行这个查询
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

如果没有看到 7 个表，请重新执行步骤 2。

### 问题：应用连接失败

**快速修复：**
```bash
# 1. 确认环境变量
cat .env | grep SUPABASE

# 应该显示：
# EXPO_PUBLIC_SUPABASE_URL=https://ukpskaspdzinzpsdoodi.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. 如果不匹配，更新 .env 文件后重启
npx expo start --clear
```

### 问题：权限被拒绝

**快速修复：**

确认您在 Supabase Dashboard 中操作的是**新项目**：
- ✅ 正确：URL 包含 `ukpskaspdzinzpsdoodi`
- ❌ 错误：URL 包含 `djahnunbkbrfetktossw` (旧项目)

---

## 📚 需要详细说明？

查看完整文档：`DATABASE_MIGRATION_COMPLETE_GUIDE.md`

---

**预计总时间：5 分钟**  
**难度：⭐ 非常简单**
