const fs = require('fs');
const path = require('path');

const newKeys = {
  en: {
    please_read_carefully: 'Please read carefully before continuing',
    scroll_to_read_full_content: 'Scroll to read full content',
    privacy_policy_required: 'Privacy Policy Required',
    must_accept_privacy_policy: 'You must accept the privacy policy to use this app.',
    exit_app: 'Exit App',
    review_again: 'Review Again',
    privacy_contact: 'If you have any questions about our privacy practices, please contact us at:',
    developer_tools: 'Developer Tools',
    reset_consent_modal: 'Reset Privacy Consent',
    reset_consent_modal_button_desc: 'Clear stored consent to show the privacy policy again on next launch',
    reset_consent_modal_title: 'Reset Privacy Consent?',
    reset_consent_modal_desc: 'This will clear your consent acceptance. The privacy policy modal will appear again when you restart the app.',
    reset: 'Reset',
    consent_reset_success: 'Privacy consent has been reset. You will see the consent modal on next app start.',
    consent_reset_error: 'Failed to reset consent. Please try again.',
  },
  'zh-TW': {
    please_read_carefully: '請仔細閱讀後再繼續',
    scroll_to_read_full_content: '滑到底看完整內容',
    privacy_policy_required: '需要隱私權政策',
    must_accept_privacy_policy: '您必須接受隱私權政策才能使用此應用程式。',
    exit_app: '退出應用程式',
    review_again: '再次查看',
    privacy_contact: '如果您對我們的隱私政策有任何疑問，請聯絡我們：',
    developer_tools: '開發者工具',
    reset_consent_modal: '重置隱私權同意',
    reset_consent_modal_button_desc: '清除已儲存的同意以在下次啟動時再次顯示隱私權政策',
    reset_consent_modal_title: '重置隱私權同意？',
    reset_consent_modal_desc: '這將清除您的同意接受記錄。當您重新啟動應用程式時，隱私權政策彈窗將再次出現。',
    reset: '重置',
    consent_reset_success: '隱私權同意已重置。您將在下次啟動應用程式時看到同意彈窗。',
    consent_reset_error: '重置同意失敗。請再試一次。',
  },
  'zh-CN': {
    please_read_carefully: '请仔细阅读后再继续',
    scroll_to_read_full_content: '滑到底查看完整内容',
    privacy_policy_required: '需要隐私政策',
    must_accept_privacy_policy: '您必须接受隐私政策才能使用此应用程序。',
    exit_app: '退出应用程序',
    review_again: '再次查看',
    privacy_contact: '如果您对我们的隐私政策有任何疑问，请联系我们：',
  },
  ko: {
    please_read_carefully: '계속하기 전에 주의 깊게 읽어주세요',
    scroll_to_read_full_content: '전체 내용을 읽으려면 스크롤하세요',
    privacy_policy_required: '개인정보 보호정책 필요',
    must_accept_privacy_policy: '이 앱을 사용하려면 개인정보 보호정책에 동의해야 합니다.',
    exit_app: '앱 종료',
    review_again: '다시 검토',
    privacy_contact: '개인정보 보호 관행에 대해 궁금한 사항이 있으시면 다음으로 문의해 주세요:',
  },
  ja: {
    please_read_carefully: '続行する前に注意深くお読みください',
    scroll_to_read_full_content: '全内容を読むにはスクロールしてください',
    privacy_policy_required: 'プライバシーポリシーが必要です',
    must_accept_privacy_policy: 'このアプリを使用するには、プライバシーポリシーに同意する必要があります。',
    exit_app: 'アプリを終了',
    review_again: '再度確認',
    privacy_contact: 'プライバシー慣行についてご質問がある場合は、以下にお問い合わせください:',
  },
  es: {
    please_read_carefully: 'Lea atentamente antes de continuar',
    scroll_to_read_full_content: 'Desplácese para leer el contenido completo',
    privacy_policy_required: 'Política de privacidad requerida',
    must_accept_privacy_policy: 'Debe aceptar la política de privacidad para usar esta aplicación.',
    exit_app: 'Salir de la aplicación',
    review_again: 'Revisar nuevamente',
    privacy_contact: 'Si tiene alguna pregunta sobre nuestras prácticas de privacidad, contáctenos en:',
  },
  fr: {
    please_read_carefully: 'Veuillez lire attentivement avant de continuer',
    scroll_to_read_full_content: 'Faites défiler pour lire le contenu complet',
    privacy_policy_required: 'Politique de confidentialité requise',
    must_accept_privacy_policy: 'Vous devez accepter la politique de confidentialité pour utiliser cette application.',
    exit_app: 'Quitter l\'application',
    review_again: 'Réviser à nouveau',
    privacy_contact: 'Si vous avez des questions concernant nos pratiques de confidentialité, veuillez nous contacter à:',
  },
  de: {
    please_read_carefully: 'Bitte lesen Sie sorgfältig, bevor Sie fortfahren',
    scroll_to_read_full_content: 'Scrollen Sie, um den vollständigen Inhalt zu lesen',
    privacy_policy_required: 'Datenschutzrichtlinie erforderlich',
    must_accept_privacy_policy: 'Sie müssen die Datenschutzrichtlinie akzeptieren, um diese App zu verwenden.',
    exit_app: 'App beenden',
    review_again: 'Erneut überprüfen',
    privacy_contact: 'Wenn Sie Fragen zu unseren Datenschutzpraktiken haben, kontaktieren Sie uns bitte unter:',
  },
  ru: {
    please_read_carefully: 'Пожалуйста, внимательно прочитайте перед продолжением',
    scroll_to_read_full_content: 'Прокрутите, чтобы прочитать полное содержание',
    privacy_policy_required: 'Требуется политика конфиденциальности',
    must_accept_privacy_policy: 'Вы должны принять политику конфиденциальности, чтобы использовать это приложение.',
    exit_app: 'Выйти из приложения',
    review_again: 'Просмотреть снова',
    privacy_contact: 'Если у вас есть вопросы о наших методах обеспечения конфиденциальности, свяжитесь с нами:',
  },
  ar: {
    please_read_carefully: 'يرجى القراءة بعناية قبل المتابعة',
    scroll_to_read_full_content: 'قم بالتمرير لقراءة المحتوى الكامل',
    privacy_policy_required: 'سياسة الخصوصية مطلوبة',
    must_accept_privacy_policy: 'يجب عليك قبول سياسة الخصوصية لاستخدام هذا التطبيق.',
    exit_app: 'الخروج من التطبيق',
    review_again: 'المراجعة مرة أخرى',
    privacy_contact: 'إذا كانت لديك أي أسئلة حول ممارسات الخصوصية الخاصة بنا، يرجى الاتصال بنا على:',
  },
  pt: {
    please_read_carefully: 'Leia atentamente antes de continuar',
    scroll_to_read_full_content: 'Role para ler o conteúdo completo',
    privacy_policy_required: 'Política de privacidade necessária',
    must_accept_privacy_policy: 'Você deve aceitar a política de privacidade para usar este aplicativo.',
    exit_app: 'Sair do aplicativo',
    review_again: 'Revisar novamente',
    privacy_contact: 'Se você tiver alguma dúvida sobre nossas práticas de privacidade, entre em contato conosco em:',
  },
  'pt-BR': {
    please_read_carefully: 'Leia atentamente antes de continuar',
    scroll_to_read_full_content: 'Role para ler o conteúdo completo',
    privacy_policy_required: 'Política de privacidade necessária',
    must_accept_privacy_policy: 'Você deve aceitar a política de privacidade para usar este app.',
    exit_app: 'Sair do app',
    review_again: 'Revisar novamente',
    privacy_contact: 'Se você tiver alguma dúvida sobre nossas práticas de privacidade, entre em contato conosco em:',
  },
};

const languages = Object.keys(newKeys);

console.log('🚀 Adding privacy consent translation keys...\n');

languages.forEach(lang => {
  const filePath = path.join(__dirname, 'l10n', `${lang}.json`);
  
  try {
    let data = {};
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(fileContent);
      console.log(`📖 Loaded existing ${lang}.json`);
    } else {
      console.log(`⚠️  ${lang}.json not found, creating new file`);
    }
    
    const keysAdded = [];
    Object.keys(newKeys[lang]).forEach(key => {
      if (!data[key]) {
        data[key] = newKeys[lang][key];
        keysAdded.push(key);
      }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    if (keysAdded.length > 0) {
      console.log(`✅ Added ${keysAdded.length} new keys to ${lang}.json`);
    } else {
      console.log(`✓  ${lang}.json already up to date`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${lang}.json:`, error.message);
  }
});

console.log('\n✨ Privacy consent translation keys added successfully!');
console.log(`\n📊 Summary:`);
console.log(`   Languages processed: ${languages.length}`);
console.log(`   Keys per language: ${Object.keys(newKeys.en).length}`);
