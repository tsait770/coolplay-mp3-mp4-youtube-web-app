@echo off
REM 数据库迁移验证脚本 (Windows)
REM 使用方法: verify-migration.bat 或 双击运行

echo.
echo 🚀 开始验证数据库迁移...
echo.

bun run scripts/verify-migration.ts

pause
