#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

console.log('📦 執行同意翻譯鍵添加...\n');

try {
  const scriptPath = path.join(__dirname, 'add-consent-translations.js');
  execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
  console.log('\n✅ 翻譯鍵已成功添加！');
} catch (error) {
  console.error('\n❌ 執行失敗:', error.message);
  process.exit(1);
}
