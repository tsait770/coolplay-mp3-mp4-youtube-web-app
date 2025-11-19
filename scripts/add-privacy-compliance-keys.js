const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const __filename = fileURLToPath(import.meta.url || 'file://' + __filename);
const __dirname = path.dirname(__filename);

const newKeys = {
  // Privacy Policy - General
  "privacy_policy": "Privacy Policy",
  "last_updated": "Last Updated",
  "introduction": "Introduction",
  "privacy_policy_intro": "This application (hereinafter referred to as \"this App\") values user privacy and personal data protection. This policy explains how we collect, use, store, and protect your data. Please read it carefully before using this App.",
  
  // Data Collection
  "information_we_collect": "Information We Collect",
  "information_we_collect_desc": "We collect the following types of data when you use our app:",
  "account_information": "Account Information: Email address, user ID (collected through Supabase)",
  "usage_data": "Usage Data: Playback history, bookmarks, voice command usage",
  "device_information": "Device Information: Device model, OS version, app version, error logs (anonymized)",
  "voice_data": "Voice Data: Voice recordings for command recognition (temporary)",
  
  // Voice Data Processing (A-5 Requirements)
  "voice_data_collection": "Voice Data Processing",
  "voice_data_title": "Voice Data Usage and Storage",
  "voice_data_desc": "When you enable voice control features, this App will temporarily record voice commands for recognition purposes.",
  "voice_collected_data": "Purpose: Voice data is used solely for real-time voice recognition and command execution (e.g., play, pause, search videos), and will not be used for any other undisclosed purposes",
  "voice_processing_method": "Upload Policy: By default, voice recognition is processed locally (client-side); if server-side processing is required for accuracy, we will explicitly notify you and obtain your consent before uploading",
  "voice_storage_duration": "Retention Period: If uploaded to server, voice clips are retained for the shortest necessary time (default 30 days), and automatically deleted after expiration",
  "voice_third_party": "Third-party Services: We may use platform-native speech recognition APIs (Apple Speech, Google Speech) which have their own privacy policies",
  "voice_opt_out": "User Rights: You can request access, correction, or deletion of your uploaded voice data at any time by contacting privacy@coolplay.com",
  "voice_not_for_training": "Model Training: Voice data will NOT be used for model training or service improvement unless explicitly notified and your consent is obtained",
  
  // Usage Scenarios (A-3 Requirements)
  "usage_scenarios": "Data Collection and Usage Scenarios",
  "usage_scenarios_desc": "We collect and use your data in the following scenarios:",
  "usage_login": "Login/Registration: Email and user ID for account authentication",
  "usage_subscription": "Subscription: Transaction ID and subscription status (processed via Stripe/PayPal, we do not store credit card information)",
  "usage_voice_control": "Voice Control: Temporary voice recordings for command recognition",
  "usage_streaming": "Video Streaming: IP address and device info may be sent to third-party content providers (e.g., YouTube, TikTok) when playing their content",
  
  // How We Use Information
  "how_we_use_information": "How We Use Your Information",
  "how_we_use_information_desc": "We use collected information to:",
  "provide_services": "Provide and maintain our services",
  "improve_app": "Improve app performance and user experience",
  "communicate_with_you": "Communicate with you about updates and features",
  
  // Third-party Services
  "third_party_services": "Third-party Services",
  "third_party_services_desc": "This App integrates third-party services. When you use these features, data may be shared with these providers:",
  "youtube_api_notice": "This App uses YouTube API Services. By using video streaming features, you agree to be bound by YouTube's Terms of Service and Google's Privacy Policy.",
  
  // Voice Streaming Platform (A-2 Requirements)
  "voice_streaming_platform": "Video Streaming and Third-party Content",
  "voice_streaming_desc": "This App integrates video playback features from third-party platforms such as YouTube, TikTok, etc.",
  "no_download_commitment": "Compliance Commitment: This App strictly complies with YouTube API Terms of Service, Google Play policies, and TikTok platform regulations. We do not provide any functionality to download, copy, or modify third-party video content",
  "no_modification_commitment": "Data Sharing: When you play third-party content, your IP address, device information, etc. will be directly transmitted to that content provider (e.g., YouTube/Google) for them to provide services, count views, and display ads",
  "comply_platform_terms": "Platform Terms: We do not store, cache, or redistribute video content. All content is streamed directly from the original platform",
  "third_party_data_sharing": "Data Transmission: Your device information and IP address are shared with content providers when streaming their content. We have no control over how they process this data.",
  
  // Advertising Directory (A-4 Requirements)
  "advertising_directory": "Advertising",
  "advertising_directory_desc": "Embedded ads in the app (including ads provided by third-party platforms) may use your device advertising ID to provide personalized ads.",
  "ad_id_usage": "Advertising ID: We may use Google AD ID or similar identifiers for analytics and ad personalization",
  "personalized_ads": "Personalized Ads: Advertisers may use your device info to show relevant ads",
  "opt_out_ads": "Opt-out: You can reset or limit ad tracking through your device settings at any time",
  
  // Data Storage
  "data_storage": "Data Storage and Security",
  "data_storage_desc": "We use industry-standard security measures to protect your data. Your data is stored securely on Supabase servers with encryption and access controls.",
  
  // Permissions Required
  "permissions_required": "Permissions Required",
  "permissions_required_desc": "This App requires the following permissions:",
  "microphone_permission": "Microphone (Required)",
  "microphone_permission_desc": "Used for voice control and command recognition",
  "storage_permission": "Storage (Optional)",
  "storage_permission_desc": "Only used when you choose to upload local video files",
  "internet_permission": "Internet (Required)",
  "internet_permission_desc": "Required for streaming video content and syncing data",
  
  // Your Rights
  "your_rights": "Your Rights",
  "your_rights_desc": "Under GDPR, CCPA, and other privacy laws, you have the right to:",
  "access_your_data": "Access and review your personal data",
  "delete_your_data": "Request deletion of your personal data",
  "opt_out": "Opt-out of data collection for analytics",
  "revoke_permissions": "Revoke permissions at any time through device settings",
  
  // COPPA Compliance
  "coppa_compliance": "Children's Privacy (COPPA)",
  "coppa_compliance_desc": "This App complies with the Children's Online Privacy Protection Act (COPPA).",
  "age_restriction": "Age Restriction: This App is not intended for children under 13 years old",
  "parental_consent_required": "Parental Consent: If we discover that a user is under 13, we will require verified parental consent before allowing continued use",
  "coppa_data_protection": "Data Protection: We do not knowingly collect personal information from children under 13 without parental consent",
  "coppa_contact": "If you believe we have collected information from a child under 13 without consent, please contact us immediately",
  
  // Age Verification
  "age_verification": "Age Verification",
  "age_verification_required": "Age verification is required to access this content",
  "age_verification_desc": "Please verify your age to continue",
  "verify_age": "Verify Age",
  "date_of_birth": "Date of Birth",
  "age_verified": "Age Verified",
  "under_age_warning": "You must be 18 or older to access adult content",
  "parental_consent": "Parental Consent",
  "parental_consent_desc": "Users under 13 require parental consent",
  "parental_email": "Parent/Guardian Email",
  "request_parental_consent": "Request Parental Consent",
  
  // Contact
  "contact_us": "Contact Us",
  "privacy_contact": "If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:",
  
  // Consent Modal
  "welcome_to_coolplay": "Welcome to CoolPlay",
  "consent_terms_intro": "To provide you with the best experience, we need your consent to collect and process certain data.",
  "user_agreement": "User Agreement",
  "data_collection_summary": "Data Collection",
  "voice_data_brief": "Voice recordings for command recognition (temporary, deleted after 30 days)",
  "usage_data_brief": "Usage statistics for improving app performance (anonymized)",
  "device_info_brief": "Device information for compatibility and troubleshooting",
  "third_party_compliance": "Third-party Platform Compliance",
  "youtube_compliance_brief": "We comply with YouTube API Terms and do not download or modify content",
  "tiktok_compliance_brief": "We comply with TikTok platform policies and user privacy",
  "your_rights_summary": "Your Rights",
  "access_delete_data": "Access, correct, or delete your personal data",
  "revoke_consent": "Revoke consent at any time through app settings",
  "by_continuing_you_agree": "By continuing, you agree to our",
  "and": "and",
  "terms_of_service": "Terms of Service",
  "accept_and_continue": "Accept and Continue",
  "decline": "Decline",
  
  // Developer Options
  "reset_consent": "Reset Consent Status",
  "reset_consent_desc": "Clear consent status for testing purposes",
  "consent_reset_success": "Consent status has been reset",
};

const l10nDir = path.join(__dirname, '..', 'l10n');
const files = fs.readdirSync(l10nDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(l10nDir, file);
  const lang = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let added = 0;
  Object.keys(newKeys).forEach(key => {
    if (!lang[key]) {
      lang[key] = newKeys[key];
      added++;
    }
  });
  
  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(lang, null, 2) + '\n', 'utf8');
    console.log(`✅ ${file}: Added ${added} keys`);
  } else {
    console.log(`⏭️  ${file}: No new keys needed`);
  }
});

console.log('\n✨ Privacy compliance translation keys added successfully!');
