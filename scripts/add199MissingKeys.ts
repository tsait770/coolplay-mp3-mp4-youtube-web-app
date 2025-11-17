import { promises as fs } from 'fs';
import path from 'path';

const localeDir = path.resolve(__dirname, '..', 'l10n');
const locales = ['en', 'zh-TW', 'zh-CN', 'es', 'pt-BR', 'pt', 'de', 'fr', 'ru', 'ar', 'ja', 'ko'];

const MISSING_199_KEYS = [
  'Authorization',
  'Error',
  'Info',
  'Login',
  'MEDIA_HEADERS',
  'MEDIA_URL',
  'Player',
  'STRIPE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'Save',
  'Settings',
  'Subscription',
  'Success',
  'T',
  'a',
  'about_app',
  'about_experimental_features',
  'acceptance_of_terms',
  'acceptance_of_terms_desc',
  'access_token',
  'access_your_data',
  'account_information',
  'add_device_instructions',
  'admin_panel_desc',
  'advanced_voice_recognition',
  'advanced_voice_recognition_desc',
  'ai_auto_categorization',
  'ai_auto_categorization_desc',
  'ai_feature_warning',
  'all',
  'all_rights_reserved',
  'api_configuration',
  'api_documentation',
  'api_documentation_info',
  'api_endpoint',
  'api_key',
  'api_key_copied',
  'api_key_generated',
  'api_settings',
  'api_settings_desc',
  'app_description',
  'app_information',
  'authorization',
  'auto',
  'available_experimental_features',
  'best_value',
  'beta_feature_warning',
  'beta_video_player',
  'beta_video_player_desc',
  'build_number',
  'cancel_subscription',
  'categories',
  'category_management_desc',
  'changes_to_terms',
  'changes_to_terms_desc',
  'charging_only_sync',
  'communicate_with_you',
  'compliance_measures',
  'confirm_clear_logs',
  'connect_with_us',
  'count',
  'credits',
  'current_devices',
  'data_storage',
  'data_storage_desc',
  'data_usage',
  'debug_logs',
  'debug_logs_desc',
  'delete_your_data',
  'developer_options_subtitle',
  'device_information',
  'device_limit_reached',
  'device_limit_reached_info',
  'device_limit_reached_message',
  'device_removed_successfully',
  'disclaimer',
  'disclaimer_desc',
  'email_support',
  'enable',
  'enter_api_endpoint',
  'enter_api_key',
  'experimental_features',
  'experimental_features_desc',
  'experimental_features_info',
  'experimental_features_warning',
  'expo_version',
  'file_successfully',
  'free_tier_info',
  'generate_key',
  'gesture_controls_desc',
  'hourly',
  'how_we_use_information',
  'how_we_use_information_desc',
  'id',
  'important_notice',
  'improve_app',
  'information_we_collect',
  'information_we_collect_desc',
  'input',
  'intellectual_property',
  'intellectual_property_desc',
  'introduction',
  'key',
  'last_sync',
  'last_updated',
  'legal',
  'limitation_of_liability',
  'limitation_of_liability_desc',
  'loaded',
  'logs_copied_to_clipboard',
  'manage_devices',
  'manual',
  'membership_tier',
  'microphone_permission_denied',
  'monthly',
  'most_popular',
  'no_abuse',
  'no_circumvent',
  'no_copyright_violation',
  'no_logs_available',
  'no_sync',
  'offline_mode',
  'offline_mode_desc',
  'open_source_licenses',
  'opt_out',
  'paid_plans_info',
  'platform',
  'privacy_contact',
  'privacy_policy',
  'privacy_policy_intro',
  'prohibited_activities',
  'prohibited_activities_desc',
  'provide_services',
  'refresh_token',
  'remove_device_to_add_new',
  'renews_on',
  'save_25_percent',
  'save_battery',
  'save_mobile_data',
  'save_per_year',
  'script',
  'style',
  'subscribe',
  'sync_complete',
  'sync_conditions',
  'sync_disabled',
  'sync_every_day',
  'sync_every_hour',
  'sync_failed',
  'sync_manually',
  'sync_now',
  'sync_when_changed',
  'synced',
  'syncing',
  'terms_contact',
  'terms_of_service',
  'test_mode',
  'test_mode_desc',
  'third_party_intro',
  'third_party_notice',
  'third_party_services',
  'third_party_services_desc',
  'unlock_premium_features',
  'usage_data',
  'use_of_service',
  'use_of_service_desc',
  'user_content',
  'user_content_desc',
  'valid_promotional_code',
  'valid_referral_code',
  'version',
  'video_platform',
  'view_documentation',
  'vimeo_service_desc',
  'voiceCommand',
  'voiceError',
  'warning',
  'website',
  'wifi_only_sync',
  'window',
  'yearly',
  'your_rights',
  'your_rights_desc',
  'youtube_ads_intact',
  'youtube_api_compliant',
  'youtube_api_notice',
  'youtube_branding_preserved',
  'youtube_compliance_notice',
  'youtube_content',
  'youtube_data_usage',
  'youtube_embed_only',
  'youtube_no_ad_removal',
  'youtube_no_download',
  'youtube_official_embed',
  'youtube_respect_restrictions',
  'youtube_service_desc',
  'youtube_tos_binding',
  'youtube_user_initiated',
];

type TranslationData = Record<string, string>;

async function loadLocaleFile(locale: string): Promise<TranslationData> {
  const filePath = path.join(localeDir, `${locale}.json`);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as TranslationData;
}

async function saveLocaleFile(locale: string, data: TranslationData): Promise<void> {
  const filePath = path.join(localeDir, `${locale}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function generateEnglishDefault(key: string): string {
  if (key.length === 1) {
    return key.toUpperCase();
  }
  
  if (key === key.toUpperCase()) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function main() {
  console.log('🔧 開始補齊 199 個缺失的翻譯 key...\n');
  console.log(`📋 待補齊的 key 數量: ${MISSING_199_KEYS.length}\n`);
  
  for (const locale of locales) {
    const data = await loadLocaleFile(locale);
    let addedCount = 0;
    
    for (const key of MISSING_199_KEYS) {
      if (!(key in data)) {
        if (locale === 'en') {
          data[key] = generateEnglishDefault(key);
        } else {
          data[key] = `[需要翻譯] ${generateEnglishDefault(key)}`;
        }
        addedCount++;
      }
    }
    
    const sortedData: TranslationData = {};
    Object.keys(data)
      .sort()
      .forEach((k) => {
        sortedData[k] = data[k];
      });
    
    await saveLocaleFile(locale, sortedData);
    console.log(`✅ ${locale.padEnd(8)} - 新增 ${addedCount.toString().padStart(3)} 個 key`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 199 個缺失的 key 已成功補齊到所有語系檔！');
  console.log('='.repeat(60) + '\n');
  
  console.log('📝 後續步驟建議：');
  console.log('   1. 檢視 en.json，確認英文預設文案是否合理');
  console.log('   2. 將標記為 [需要翻譯] 的項目提交給翻譯團隊');
  console.log('   3. 執行 `npm run audit-translations` 驗證完整性');
  console.log('   4. 在 UI 中測試新增的 key 是否正確顯示\n');
}

main().catch((error) => {
  console.error('❌ 補齊失敗:', error);
  process.exitCode = 1;
});
