#!/bin/bash

echo "🚀 開始執行翻譯同步流程..."
echo ""

echo "📋 步驟 1/3: 補齊 199 個已知缺失的 key"
echo "================================================"
npx tsx scripts/add199MissingKeys.ts
echo ""

echo "📋 步驟 2/3: 同步所有剩餘的缺失 key"
echo "================================================"
npx tsx scripts/syncMissingKeys.ts
echo ""

echo "📋 步驟 3/3: 審計翻譯完整性"
echo "================================================"
npx tsx scripts/auditTranslations.ts
echo ""

echo "✅ 翻譯同步流程完成！"
echo ""
echo "📄 請查看 translation-audit-report.json 了解詳細結果"
echo "📖 更多資訊請參考 TRANSLATION_SYNC_GUIDE.md"
