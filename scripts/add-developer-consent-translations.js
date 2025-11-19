#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const newKeys = {
  en: {
    reset_first_time_consent: 'Reset First-Time Consent',
    reset_consent_description: 'Clear consent data to show the welcome modal again (for testing)',
    reset_consent_warning: 'This will reset all consent settings. You will see the welcome modal again on next app start. Continue?',
    consent_reset_success: 'Consent has been reset successfully. Please restart the app.',
    consent_reset_failed: 'Failed to reset consent',
    developer_tools: 'Developer Tools',
    reset: 'Reset',
  },
  'zh-TW': {
    reset_first_time_consent: '重置首次使用同意',
    reset_consent_description: '清除同意數據以再次顯示歡迎畫面（用於測試）',
    reset_consent_warning: '這將重置所有同意設定。您將在下次應用啟動時再次看到歡迎畫面。是否繼續？',
    consent_reset_success: '同意已成功重置。請重新啟動應用程式。',
    consent_reset_failed: '重置同意失敗',
    developer_tools: '開發者工具',
    reset: '重置',
  },
  'zh-CN': {
    reset_first_time_consent: '重置首次使用同意',
    reset_consent_description: '清除同意数据以再次显示欢迎画面（用于测试）',
    reset_consent_warning: '这将重置所有同意设置。您将在下次应用启动时再次看到欢迎画面。是否继续？',
    consent_reset_success: '同意已成功重置。请重新启动应用程序。',
    consent_reset_failed: '重置同意失败',
    developer_tools: '开发者工具',
    reset: '重置',
  },
  ko: {
    reset_first_time_consent: '초기 동의 재설정',
    reset_consent_description: '동의 데이터를 지워 환영 화면을 다시 표시 (테스트용)',
    reset_consent_warning: '모든 동의 설정이 재설정됩니다. 다음 앱 시작 시 환영 화면이 다시 표시됩니다. 계속하시겠습니까?',
    consent_reset_success: '동의가 성공적으로 재설정되었습니다. 앱을 다시 시작해 주세요.',
    consent_reset_failed: '동의 재설정 실패',
    developer_tools: '개발자 도구',
    reset: '재설정',
  },
  ja: {
    reset_first_time_consent: '初回同意をリセット',
    reset_consent_description: '同意データをクリアしてウェルカム画面を再表示 (テスト用)',
    reset_consent_warning: 'すべての同意設定がリセットされます。次回のアプリ起動時にウェルカム画面が再表示されます。続行しますか？',
    consent_reset_success: '同意が正常にリセットされました。アプリを再起動してください。',
    consent_reset_failed: '同意のリセットに失敗しました',
    developer_tools: '開発者ツール',
    reset: 'リセット',
  },
  es: {
    reset_first_time_consent: 'Restablecer consentimiento inicial',
    reset_consent_description: 'Borrar datos de consentimiento para mostrar la pantalla de bienvenida nuevamente (para pruebas)',
    reset_consent_warning: 'Esto restablecerá todas las configuraciones de consentimiento. Verá la pantalla de bienvenida nuevamente en el próximo inicio. ¿Continuar?',
    consent_reset_success: 'El consentimiento se ha restablecido correctamente. Por favor, reinicie la aplicación.',
    consent_reset_failed: 'Error al restablecer el consentimiento',
    developer_tools: 'Herramientas para desarrolladores',
    reset: 'Restablecer',
  },
  fr: {
    reset_first_time_consent: 'Réinitialiser le consentement initial',
    reset_consent_description: 'Effacer les données de consentement pour afficher à nouveau l\'écran de bienvenue (pour les tests)',
    reset_consent_warning: 'Cela réinitialisera tous les paramètres de consentement. Vous verrez à nouveau l\'écran de bienvenue au prochain démarrage. Continuer ?',
    consent_reset_success: 'Le consentement a été réinitialisé avec succès. Veuillez redémarrer l\'application.',
    consent_reset_failed: 'Échec de la réinitialisation du consentement',
    developer_tools: 'Outils de développement',
    reset: 'Réinitialiser',
  },
  de: {
    reset_first_time_consent: 'Erstzustimmung zurücksetzen',
    reset_consent_description: 'Zustimmungsdaten löschen, um den Willkommensbildschirm erneut anzuzeigen (zum Testen)',
    reset_consent_warning: 'Dies setzt alle Zustimmungseinstellungen zurück. Sie sehen beim nächsten Start erneut den Willkommensbildschirm. Fortfahren?',
    consent_reset_success: 'Die Zustimmung wurde erfolgreich zurückgesetzt. Bitte starten Sie die App neu.',
    consent_reset_failed: 'Zurücksetzen der Zustimmung fehlgeschlagen',
    developer_tools: 'Entwickler-Tools',
    reset: 'Zurücksetzen',
  },
  ru: {
    reset_first_time_consent: 'Сбросить первоначальное согласие',
    reset_consent_description: 'Очистить данные согласия для повторного отображения экрана приветствия (для тестирования)',
    reset_consent_warning: 'Это сбросит все настройки согласия. При следующем запуске вы снова увидите экран приветствия. Продолжить?',
    consent_reset_success: 'Согласие успешно сброшено. Пожалуйста, перезапустите приложение.',
    consent_reset_failed: 'Не удалось сбросить согласие',
    developer_tools: 'Инструменты разработчика',
    reset: 'Сбросить',
  },
  ar: {
    reset_first_time_consent: 'إعادة تعيين الموافقة الأولية',
    reset_consent_description: 'مسح بيانات الموافقة لإظهار شاشة الترحيب مرة أخرى (للاختبار)',
    reset_consent_warning: 'سيؤدي هذا إلى إعادة تعيين جميع إعدادات الموافقة. ستظهر شاشة الترحيب مرة أخرى عند بدء التطبيق التالي. هل تريد المتابعة؟',
    consent_reset_success: 'تم إعادة تعيين الموافقة بنجاح. يرجى إعادة تشغيل التطبيق.',
    consent_reset_failed: 'فشل في إعادة تعيين الموافقة',
    developer_tools: 'أدوات المطورين',
    reset: 'إعادة تعيين',
  },
  pt: {
    reset_first_time_consent: 'Redefinir consentimento inicial',
    reset_consent_description: 'Limpar dados de consentimento para mostrar a tela de boas-vindas novamente (para testes)',
    reset_consent_warning: 'Isso redefinirá todas as configurações de consentimento. Você verá a tela de boas-vindas novamente no próximo início. Continuar?',
    consent_reset_success: 'O consentimento foi redefinido com sucesso. Por favor, reinicie o aplicativo.',
    consent_reset_failed: 'Falha ao redefinir o consentimento',
    developer_tools: 'Ferramentas do desenvolvedor',
    reset: 'Redefinir',
  },
  'pt-BR': {
    reset_first_time_consent: 'Redefinir consentimento inicial',
    reset_consent_description: 'Limpar dados de consentimento para mostrar a tela de boas-vindas novamente (para testes)',
    reset_consent_warning: 'Isso redefinirá todas as configurações de consentimento. Você verá a tela de boas-vindas novamente no próximo início. Continuar?',
    consent_reset_success: 'O consentimento foi redefinido com sucesso. Por favor, reinicie o app.',
    consent_reset_failed: 'Falha ao redefinir o consentimento',
    developer_tools: 'Ferramentas do desenvolvedor',
    reset: 'Redefinir',
  },
};

const languages = Object.keys(newKeys);

console.log('🚀 添加開發者同意翻譯鍵...\n');

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'l10n', `${lang}.json`);
  
  try {
    let data = {};
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(fileContent);
      console.log(`📖 載入 ${lang}.json`);
    } else {
      console.log(`⚠️  ${lang}.json 未找到，創建新文件`);
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
      console.log(`✅ 添加了 ${keysAdded.length} 個新鍵到 ${lang}.json`);
    } else {
      console.log(`✓  ${lang}.json 已是最新`);
    }
  } catch (error) {
    console.error(`❌ 處理 ${lang}.json 時出錯:`, error.message);
  }
});

console.log('\n✨ 開發者同意翻譯鍵添加完成！');
