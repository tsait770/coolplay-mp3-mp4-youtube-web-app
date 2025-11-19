@echo off
REM CoolPlay Privacy Compliance Translation Update Script
REM 隱私合規翻譯更新腳本

echo 🔄 Updating privacy compliance translations...
echo 正在更新隱私合規翻譯...

node scripts/add-privacy-compliance-keys.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Translation update completed successfully!
    echo ✅ 翻譯更新成功完成！
    echo.
    echo 📋 Next steps / 下一步:
    echo 1. Review the changes in l10n/*.json files
    echo    檢查 l10n/*.json 文件的變更
    echo 2. Test the app on real devices
    echo    在真實設備上測試應用程式
    echo 3. Verify privacy policy displays correctly in all languages
    echo    驗證隱私政策在所有語言中正確顯示
) else (
    echo.
    echo ❌ Translation update failed!
    echo ❌ 翻譯更新失敗！
    echo Please check the error messages above.
    echo 請檢查上方的錯誤訊息。
    exit /b 1
)
