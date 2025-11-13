#!/bin/bash

# 数据库迁移验证脚本
# 使用方法: ./verify-migration.sh 或 bash verify-migration.sh

echo ""
echo "🚀 开始验证数据库迁移..."
echo ""

# 运行验证脚本
bun run scripts/verify-migration.ts
