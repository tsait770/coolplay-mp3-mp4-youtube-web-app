import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

const CORE_TABLES: string[] = [
  'profiles',
  'bookmarks',
  'folders',
  'subscriptions',
  'usage_logs',
  'device_verifications',
  'bound_devices',
];

const VOICE_TABLES: string[] = [
  'voice_usage_logs',
  'voice_control_settings',
  'voice_quota_usage',
];

const VOICE_CRITICAL_COLUMNS: Record<string, string[]> = {
  voice_control_settings: [
    'always_listening',
    'preferred_language',
    'confidence_threshold',
    'enable_feedback_sound',
    'enable_visual_feedback',
    'enable_haptic_feedback',
    'daily_quota',
    'monthly_quota',
  ],
  voice_usage_logs: ['command_text', 'intent', 'confidence', 'language', 'execution_status'],
  voice_quota_usage: ['period_type', 'period_start', 'period_end', 'commands_used', 'quota_limit'],
};

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

function logSection(title: string) {
  console.log(`\n${'-'.repeat(70)}`);
  console.log(`${title}`);
  console.log(`${'-'.repeat(70)}\n`);
}

function requireEnv(): TestResult {
  const hasUrl = SUPABASE_URL.startsWith('https://');
  const hasKey = SUPABASE_ANON_KEY.length > 20;

  if (!hasUrl || !hasKey) {
    return {
      name: 'Environment Variables',
      passed: false,
      details:
        'Missing Supabase credentials. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.',
    };
  }

  return {
    name: 'Environment Variables',
    passed: true,
    details: `URL: ${SUPABASE_URL}\nAnon key length: ${SUPABASE_ANON_KEY.length}`,
  };
}

async function checkConnection(client: SupabaseClient): Promise<TestResult> {
  try {
    const { error } = await client.from('profiles').select('id').limit(1);

    if (error) {
      return {
        name: 'Supabase Connectivity',
        passed: false,
        details: error.message,
      };
    }

    return {
      name: 'Supabase Connectivity',
      passed: true,
      details: 'Able to query profiles table successfully',
    };
  } catch (error) {
    return {
      name: 'Supabase Connectivity',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkTables(client: SupabaseClient, tables: string[], label: string): Promise<TestResult> {
  const missing: string[] = [];

  for (const table of tables) {
    const { error } = await client.from(table).select('id').limit(1);
    if (error) {
      missing.push(`${table}: ${error.message}`);
    }
  }

  if (missing.length > 0) {
    return {
      name: `${label} Tables`,
      passed: false,
      details: missing.join('\n'),
    };
  }

  return {
    name: `${label} Tables`,
    passed: true,
    details: `${tables.length} tables reachable`,
  };
}

async function checkVoiceColumns(client: SupabaseClient): Promise<TestResult> {
  const issues: string[] = [];

  for (const [table, columns] of Object.entries(VOICE_CRITICAL_COLUMNS)) {
    const selectList = columns.join(',');
    const { error } = await client.from(table).select(selectList).limit(1);

    if (error) {
      issues.push(`${table}: ${error.message}`);
    }
  }

  if (issues.length > 0) {
    return {
      name: 'Voice Schema Columns',
      passed: false,
      details: issues.join('\n'),
    };
  }

  return {
    name: 'Voice Schema Columns',
    passed: true,
    details: 'All critical columns queried successfully',
  };
}

async function checkRls(client: SupabaseClient): Promise<TestResult> {
  const tablesToProbe = ['voice_usage_logs', 'voice_control_settings'];
  const warnings: string[] = [];

  for (const table of tablesToProbe) {
    const { data, error } = await client.from(table).select('id').limit(1);

    if (error) {
      warnings.push(`${table}: ${error.message}`);
      continue;
    }

    if (data && data.length > 0) {
      warnings.push(`${table}: returned ${data.length} rows for anon user (RLS may be disabled)`);
    }
  }

  if (warnings.length > 0) {
    return {
      name: 'RLS Policies',
      passed: false,
      details: warnings.join('\n'),
    };
  }

  return {
    name: 'RLS Policies',
    passed: true,
    details: 'Anonymous access returned zero rows as expected',
  };
}

async function run() {
  logSection('Supabase Voice Control Automated Tests');

  const envResult = requireEnv();
  const results: TestResult[] = [envResult];

  if (!envResult.passed) {
    results.forEach((result) => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    });
    process.exit(1);
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  results.push(await checkConnection(client));
  results.push(await checkTables(client, CORE_TABLES, 'Core'));
  results.push(await checkTables(client, VOICE_TABLES, 'Voice'));
  results.push(await checkVoiceColumns(client));
  results.push(await checkRls(client));

  let passedCount = 0;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.details) {
      console.log(`   ${result.details.replace(/\n/g, '\n   ')}`);
    }
    if (result.passed) {
      passedCount += 1;
    }
  }

  console.log(`\nSummary: ${passedCount}/${results.length} tests passed`);

  if (passedCount === results.length) {
    console.log('🎉 Supabase voice-control schema looks good.');
    process.exit(0);
  }

  console.log('⚠️ Please address the failed checks above.');
  process.exit(1);
}

run().catch((error) => {
  console.error('Unexpected failure while running Supabase tests:', error);
  process.exit(1);
});
