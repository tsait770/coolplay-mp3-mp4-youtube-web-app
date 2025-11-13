# 📋 Supabase 数据库迁移完整指南

## 🎯 迁移目标

将数据库表结构从**旧项目**迁移到**新项目**，并更新应用程序配置。

---

## ✅ 第一步：环境变量验证（已完成）

环境变量已正确配置在 `.env` 文件中：

```bash
# 新项目配置（已配置）
EXPO_PUBLIC_SUPABASE_URL=https://ukpskaspdzinzpsdoodi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **状态：已完成** - 环境变量配置正确

---

## 🗄️ 第二步：数据库表结构迁移（需执行）

### 方法 A：使用 Supabase Dashboard（推荐 ✨）

这是**最简单快速**的方法，无需安装任何工具！

#### 1. 打开 Supabase SQL Editor

1. 访问新项目 Dashboard：https://supabase.com/dashboard/project/ukpskaspdzinzpsdoodi
2. 点击左侧菜单 **SQL Editor**
3. 点击 **New query** 按钮

#### 2. 复制并执行 Schema SQL

将 `database-schema-complete.sql` 的完整内容复制到 SQL Editor 中，然后点击 **Run** 按钮。

**重要提示：**
- 执行前请确认您已登录到**新项目** (ukpskaspdzinzpsdoodi)
- SQL 会自动创建所有需要的表、索引、触发器和 RLS 策略
- 执行时间约 3-5 秒

#### 3. 验证表已创建

执行以下 SQL 验证所有表已成功创建：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**预期结果：** 应该看到以下 6 个表：
- ✅ bookmarks
- ✅ bound_devices
- ✅ device_verifications
- ✅ folders
- ✅ profiles
- ✅ usage_logs

---

### 方法 B：使用 Supabase CLI（备选方案）

如果您更喜欢使用命令行工具：

#### 1. 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (使用 Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -L https://github.com/supabase/cli/releases/download/v1.123.4/supabase_1.123.4_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

#### 2. 登录 Supabase

```bash
supabase login
```

#### 3. 链接新项目

```bash
supabase link --project-ref ukpskaspdzinzpsdoodi
```

#### 4. 执行 Schema 迁移

```bash
supabase db push --db-url "postgresql://postgres.[your-password]@db.ukpskaspdzinzpsdoodi.supabase.co:5432/postgres" < database-schema-complete.sql
```

---

## 🔄 第三步：数据迁移（可选）

### ⚠️ 重要决策点

**问题：** 您是否需要迁移旧项目的数据到新项目？

- **选项 A：全新开始**（推荐 ✨）
  - 不迁移任何数据
  - 新项目从零开始
  - 更简洁、更安全
  - ✅ **推荐用于开发/测试环境**

- **选项 B：迁移现有数据**
  - 将旧项目的用户、书签等数据导入新项目
  - 需要额外的导出/导入步骤
  - ⚠️ **仅推荐在生产环境迁移时使用**

### 如果选择迁移数据（选项 B）

请在 Supabase SQL Editor 中执行以下步骤：

#### 1. 从旧项目导出数据

在**旧项目** (djahnunbkbrfetktossw) 的 SQL Editor 中运行：

```sql
-- 导出 profiles
COPY (SELECT * FROM public.profiles) TO STDOUT WITH CSV HEADER;

-- 导出 folders
COPY (SELECT * FROM public.folders) TO STDOUT WITH CSV HEADER;

-- 导出 bookmarks
COPY (SELECT * FROM public.bookmarks) TO STDOUT WITH CSV HEADER;

-- 导出 bound_devices
COPY (SELECT * FROM public.bound_devices) TO STDOUT WITH CSV HEADER;
```

#### 2. 导入数据到新项目

将导出的数据保存为 CSV 文件，然后在**新项目** SQL Editor 中：

1. 点击 **Table Editor**
2. 选择要导入的表
3. 点击 **Insert** → **Import data from CSV**
4. 上传对应的 CSV 文件

---

## ✅ 第四步：验证迁移结果

### 1. 重启应用程序

确保应用程序重新加载了新的环境变量：

```bash
# 停止当前运行的服务
# 清除缓存
npx expo start --clear

# 或者使用 bun
bun run start --clear
```

### 2. 运行连接测试

在应用程序中：
1. 导航到 **开发者选项** → **连接测试**
2. 点击 **开始测试** 按钮
3. 查看测试结果

**预期结果：**
- ✅ 环境变数驗證：成功
- ✅ Supabase 連接測試：成功
- ✅ 數據庫表驗證：成功（6/6 表已创建）

### 3. 测试核心功能

测试以下功能是否正常：
- [ ] 用户注册/登录
- [ ] 创建书签
- [ ] 创建文件夹
- [ ] 设备绑定
- [ ] 会员系统

---

## 🐛 常见问题排查

### 问题 1：环境变量未生效

**症状：** 测试显示 "环境变数缺失"

**解决方案：**
```bash
# 1. 确认 .env 文件存在
ls -la .env

# 2. 清除缓存并重启
npx expo start --clear

# 3. 如果仍然失败，尝试重新安装依赖
rm -rf node_modules
bun install
```

### 问题 2：表未创建

**症状：** 测试显示 "缺少 X 个表"

**解决方案：**
1. 重新在 Supabase SQL Editor 中执行 `database-schema-complete.sql`
2. 检查 SQL 执行是否有错误提示
3. 确认您在**新项目**的 Dashboard 中操作

### 问题 3：RLS 策略阻止访问

**症状：** "permission denied for table..."

**解决方案：**
```sql
-- 在 SQL Editor 中临时禁用 RLS（仅用于测试）
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders DISABLE ROW LEVEL SECURITY;

-- 测试完成后重新启用
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
```

### 问题 4：连接超时

**症状：** "Failed to fetch" 或 "Network request failed"

**解决方案：**
1. 检查网络连接
2. 验证 Supabase 项目状态（访问 Dashboard 确认项目是否运行）
3. 检查防火墙设置

---

## 📊 迁移检查清单

完成以下所有项目后，迁移即完成：

- [ ] ✅ 环境变量已更新（`.env` 文件）
- [ ] ✅ 数据库表结构已创建（6 个核心表）
- [ ] ✅ 索引已创建
- [ ] ✅ RLS 策略已启用
- [ ] ✅ 触发器已创建（auto profile creation, updated_at）
- [ ] ✅ 应用程序已重启
- [ ] ✅ 连接测试全部通过
- [ ] ✅ 核心功能测试通过

---

## 🎉 迁移完成后

恭喜！您已成功将数据库迁移到新项目。

**下一步建议：**
1. ✅ 配置 Supabase Authentication（Google, Email 等）
2. ✅ 设置 Storage buckets（如需上传文件）
3. ✅ 配置 Edge Functions（如需）
4. ✅ 设置备份策略
5. ✅ 监控数据库性能

---

## 📞 需要帮助？

如果在迁移过程中遇到问题：

1. 查看 Supabase Dashboard 的 **Logs** 页面
2. 检查应用程序控制台的错误信息
3. 运行 **连接测试** 获取详细诊断信息
4. 查看本指南的 **常见问题排查** 部分

---

**最后更新：** 2025年1月
**适用版本：** InstaPlay V7
**Supabase 项目：** ukpskaspdzinzpsdoodi
