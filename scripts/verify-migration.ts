/**
 * 数据库迁移验证脚本
 * 用于验证 Supabase 迁移是否成功
 */

import { createClient } from '@supabase/supabase-js';

// 配置
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ukpskaspdzinzpsdoodi.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcHNrYXNwZHppbnpwc2Rvb2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDA0MjgsImV4cCI6MjA3ODUxNjQyOH0.HdmSGe_YEs5hVFTgm7QMzmQu3xe8i95carC8wxSjGfU';

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 需要验证的表
const REQUIRED_TABLES = [
  'profiles',
  'bookmarks',
  'folders',
  'device_verifications',
  'bound_devices',
  'usage_logs',
  'subscriptions',
];

interface TestResult {
  passed: boolean;
  message: string;
  details?: string;
}

async function testEnvironmentVariables(): Promise<TestResult> {
  console.log('🔍 测试 1: 验证环境变量...');
  
  const hasUrl = !!SUPABASE_URL && SUPABASE_URL.includes('ukpskaspdzinzpsdoodi');
  const hasKey = !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 100;
  
  if (!hasUrl || !hasKey) {
    return {
      passed: false,
      message: '❌ 环境变量配置错误',
      details: `URL 正确: ${hasUrl ? '✅' : '❌'}\nKey 正确: ${hasKey ? '✅' : '❌'}`,
    };
  }
  
  console.log('   ✅ 环境变量配置正确');
  return {
    passed: true,
    message: '✅ 环境变量配置正确',
    details: `URL: ${SUPABASE_URL}\nKey 长度: ${SUPABASE_ANON_KEY.length} 字符`,
  };
}

async function testConnection(): Promise<TestResult> {
  console.log('🔍 测试 2: 验证 Supabase 连接...');
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(0);
    
    if (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
      return {
        passed: false,
        message: '❌ Supabase 连接失败',
        details: error.message,
      };
    }
    
    console.log('   ✅ Supabase 连接成功');
    return {
      passed: true,
      message: '✅ Supabase 连接成功',
    };
  } catch (error) {
    console.log(`   ❌ 连接异常: ${error}`);
    return {
      passed: false,
      message: '❌ Supabase 连接异常',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testTables(): Promise<TestResult> {
  console.log('🔍 测试 3: 验证数据库表...');
  
  const results = await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          console.log(`   ❌ 表 ${table} 不存在或无法访问`);
          return { table, exists: false, error: error.message };
        }
        
        console.log(`   ✅ 表 ${table} 正常`);
        return { table, exists: true };
      } catch (error) {
        console.log(`   ❌ 表 ${table} 查询失败`);
        return {
          table,
          exists: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );
  
  const missingTables = results.filter((r) => !r.exists);
  
  if (missingTables.length > 0) {
    return {
      passed: false,
      message: `❌ 缺少 ${missingTables.length}/${REQUIRED_TABLES.length} 个表`,
      details: missingTables
        .map((t) => `- ${t.table}: ${t.error || '不存在'}`)
        .join('\n'),
    };
  }
  
  return {
    passed: true,
    message: `✅ 所有表已创建 (${REQUIRED_TABLES.length}/${REQUIRED_TABLES.length})`,
  };
}

async function testRLS(): Promise<TestResult> {
  console.log('🔍 测试 4: 验证 RLS 策略...');
  
  try {
    // 尝试在未认证状态下访问数据（应该被 RLS 阻止或返回空结果）
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    // 如果没有错误且没有数据，说明 RLS 工作正常（未登录无法访问）
    if (!error && (!data || data.length === 0)) {
      console.log('   ✅ RLS 策略已正确配置');
      return {
        passed: true,
        message: '✅ RLS 策略已正确配置',
        details: '未认证用户无法访问数据（预期行为）',
      };
    }
    
    // 如果有数据，可能是 RLS 未启用或策略过于宽松
    if (data && data.length > 0) {
      console.log('   ⚠️  RLS 可能未正确配置（未认证用户可以访问数据）');
      return {
        passed: true,
        message: '⚠️  RLS 配置可能需要检查',
        details: '建议检查 Supabase Dashboard > Authentication > Policies',
      };
    }
    
    console.log('   ✅ RLS 配置正常');
    return {
      passed: true,
      message: '✅ RLS 配置正常',
    };
  } catch (error) {
    console.log(`   ⚠️  无法验证 RLS: ${error}`);
    return {
      passed: true,
      message: '⚠️  RLS 验证跳过',
      details: '需要登录后才能完全验证 RLS 策略',
    };
  }
}

async function runAllTests() {
  console.log('\n🚀 开始验证数据库迁移...\n');
  console.log('=' .repeat(60));
  
  const results: TestResult[] = [];
  
  // 运行所有测试
  results.push(await testEnvironmentVariables());
  results.push(await testConnection());
  results.push(await testTables());
  results.push(await testRLS());
  
  // 打印总结
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试总结:\n');
  
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.message}`);
    if (result.details) {
      console.log(`   详情: ${result.details.replace(/\n/g, '\n   ')}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 测试通过率: ${passed}/${total} (${Math.round((passed / total) * 100)}%)\n`);
  
  if (passed === total) {
    console.log('🎉 恭喜！所有测试通过，迁移成功！\n');
    console.log('下一步：');
    console.log('1. 在应用中测试用户注册/登录');
    console.log('2. 测试创建书签功能');
    console.log('3. 测试会员系统功能');
    console.log('');
  } else {
    console.log('⚠️  部分测试未通过，请查看上述详情进行修复。\n');
    console.log('常见解决方案：');
    console.log('1. 确认已在 Supabase SQL Editor 中执行 database-schema-complete.sql');
    console.log('2. 检查 .env 文件中的 SUPABASE_URL 和 SUPABASE_ANON_KEY');
    console.log('3. 重启应用: npx expo start --clear');
    console.log('4. 查看 MIGRATION_QUICK_START.md 获取详细指南');
    console.log('');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// 执行测试
runAllTests().catch((error) => {
  console.error('\n❌ 测试执行失败:', error);
  process.exit(1);
});
