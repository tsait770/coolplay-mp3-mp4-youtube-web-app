const fs = require('fs');
const path = require('path');

const NEW_TRANSLATIONS = {
  select_video_title: {
    en: "Select Video",
    "zh-TW": "選擇影片",
    "zh-CN": "选择视频",
    es: "Seleccionar Video",
    "pt-BR": "Selecionar Vídeo",
    pt: "Selecionar Vídeo",
    de: "Video auswählen",
    fr: "Sélectionner une vidéo",
    ru: "Выбрать видео",
    ar: "تحديد الفيديو",
    ja: "ビデオを選択",
    ko: "비디오 선택"
  },
  select_video_subtitle: {
    en: "Select Video Subtitle",
    "zh-TW": "選擇影片字幕",
    "zh-CN": "选择视频字幕",
    es: "Seleccionar Subtítulo de Video",
    "pt-BR": "Selecionar Legenda do Vídeo",
    pt: "Selecionar Legenda do Vídeo",
    de: "Video-Untertitel auswählen",
    fr: "Sélectionner le sous-titre de la vidéo",
    ru: "Выбрать субтитры видео",
    ar: "تحديد ترجمة الفيديو",
    ja: "ビデオの字幕を選択",
    ko: "비디오 자막 선택"
  },
  select_video_button: {
    en: "Select Video",
    "zh-TW": "選擇影片",
    "zh-CN": "选择视频",
    es: "Seleccionar Video",
    "pt-BR": "Selecionar Vídeo",
    pt: "Selecionar Vídeo",
    de: "Video auswählen",
    fr: "Sélectionner une vidéo",
    ru: "Выбрать видео",
    ar: "تحديد الفيديو",
    ja: "ビデオを選択",
    ko: "비디오 선택"
  },
  watch_platform_youtube: {
    en: "Watch Platform: YouTube",
    "zh-TW": "觀看平台：YouTube",
    "zh-CN": "观看平台：YouTube",
    es: "Plataforma de visualización: YouTube",
    "pt-BR": "Plataforma de visualização: YouTube",
    pt: "Plataforma de visualização: YouTube",
    de: "Plattform ansehen: YouTube",
    fr: "Plateforme de visionnage : YouTube",
    ru: "Платформа просмотра: YouTube",
    ar: "منصة المشاهدة: YouTube",
    ja: "視聴プラットフォーム：YouTube",
    ko: "시청 플랫폼: YouTube"
  },
  account_settings_header: {
    en: "ACCOUNT SETTINGS",
    "zh-TW": "帳號設定",
    "zh-CN": "账户设置",
    es: "AJUSTES DE CUENTA",
    "pt-BR": "CONFIGURAÇÕES DA CONTA",
    pt: "CONFIGURAÇÕES DA CONTA",
    de: "KONTOEINSTELLUNGEN",
    fr: "PARAMÈTRES DU COMPTE",
    ru: "НАСТРОЙКИ АККАУНТА",
    ar: "إعدادات الحساب",
    ja: "アカウント設定",
    ko: "계정 설정"
  },
  account_information: {
    en: "Account Information",
    "zh-TW": "帳號資訊",
    "zh-CN": "账户信息",
    es: "Información de la Cuenta",
    "pt-BR": "Informações da Conta",
    pt: "Informações da Conta",
    de: "Kontoinformationen",
    fr: "Informations du compte",
    ru: "Информация об аккаунте",
    ar: "معلومات الحساب",
    ja: "アカウント情報",
    ko: "계정 정보"
  },
  appearance_language_header: {
    en: "APPEARANCE & LANGUAGE",
    "zh-TW": "外觀與語言",
    "zh-CN": "外观与语言",
    es: "APARIENCIA E IDIOMA",
    "pt-BR": "APARÊNCIA E IDIOMA",
    pt: "APARÊNCIA E IDIOMA",
    de: "AUSSEHEN & SPRACHE",
    fr: "APPARENCE ET LANGUE",
    ru: "ВНЕШНИЙ ВИД И ЯЗЫК",
    ar: "المظهر واللغة",
    ja: "外観と言語",
    ko: "모양 및 언어"
  },
  data_management_header: {
    en: "DATA MANAGEMENT",
    "zh-TW": "資料管理",
    "zh-CN": "数据管理",
    es: "GESTIÓN DE DATOS",
    "pt-BR": "GERENCIAMENTO DE DADOS",
    pt: "GESTÃO DE DADOS",
    de: "DATENVERWALTUNG",
    fr: "GESTION DES DONNÉES",
    ru: "УПРАВЛЕНИЕ ДАННЫМИ",
    ar: "إدارة البيانات",
    ja: "データ管理",
    ko: "데이터 관리"
  },
  data_management_option: {
    en: "Data Management",
    "zh-TW": "資料管理",
    "zh-CN": "数据管理",
    es: "Gestión de Datos",
    "pt-BR": "Gerenciamento de Dados",
    pt: "Gestão de Dados",
    de: "Datenverwaltung",
    fr: "Gestion des données",
    ru: "Управление данными",
    ar: "إدارة البيانات",
    ja: "データ管理",
    ko: "데이터 관리"
  },
  smart_classification_header: {
    en: "SMART CLASSIFICATION",
    "zh-TW": "智慧分類",
    "zh-CN": "智能分类",
    es: "CLASIFICACIÓN INTELIGENTE",
    "pt-BR": "CLASSIFICAÇÃO INTELIGENTE",
    pt: "CLASSIFICAÇÃO INTELIGENTE",
    de: "SMARTE KLASSIFIZIERUNG",
    fr: "CLASSIFICATION INTELLIGENTE",
    ru: "УМНАЯ КЛАССИФИКАЦИЯ",
    ar: "التصنيف الذكي",
    ja: "スマート分類",
    ko: "스마트 분류"
  },
  classification_overview: {
    en: "Classification Overview",
    "zh-TW": "分類概覽",
    "zh-CN": "分类概览",
    es: "Resumen de Clasificación",
    "pt-BR": "Visão Geral da Classificação",
    pt: "Visão Geral da Classificação",
    de: "Klassifizierungsübersicht",
    fr: "Aperçu de la classification",
    ru: "Обзор классификации",
    ar: "نظرة عامة على التصنيف",
    ja: "分類概要",
    ko: "분류 개요"
  },
  advanced_classification_settings: {
    en: "Advanced Classification Settings",
    "zh-TW": "進階分類設定",
    "zh-CN": "高级分类设置",
    es: "Configuración Avanzada de Clasificación",
    "pt-BR": "Configurações Avançadas de Classificação",
    pt: "Configurações Avançadas de Classificação",
    de: "Erweiterte Klassifizierungseinstellungen",
    fr: "Paramètres de classification avancés",
    ru: "Расширенные настройки классификации",
    ar: "إعدادات التصنيف المتقدمة",
    ja: "高度な分類設定",
    ko: "고급 분류 설정"
  },
  sync_settings_header: {
    en: "SYNC SETTINGS",
    "zh-TW": "同步設定",
    "zh-CN": "同步设置",
    es: "AJUSTES DE SINCRONIZACIÓN",
    "pt-BR": "CONFIGURAÇÕES DE SINCRONIZAÇÃO",
    pt: "CONFIGURAÇÕES DE SINCRONIZAÇÃO",
    de: "SYNCEINSTELLUNGEN",
    fr: "PARAMÈTRES DE SYNCHRONISATION",
    ru: "НАСТРОЙКИ СИНХРОНИЗАЦИИ",
    ar: "إعدادات المزامنة",
    ja: "同期設定",
    ko: "동기화 설정"
  },
  sync_settings_option: {
    en: "Sync Settings",
    "zh-TW": "同步設定",
    "zh-CN": "同步设置",
    es: "Ajustes de Sincronización",
    "pt-BR": "Configurações de Sincronização",
    pt: "Configurações de Sincronização",
    de: "Synceinstellungen",
    fr: "Paramètres de synchronisation",
    ru: "Настройки синхронизации",
    ar: "إعدادات المزامنة",
    ja: "同期設定",
    ko: "동기화 설정"
  },
  notification_settings_header: {
    en: "NOTIFICATION SETTINGS",
    "zh-TW": "通知設定",
    "zh-CN": "通知设置",
    es: "AJUSTES DE NOTIFICACIÓN",
    "pt-BR": "CONFIGURAÇÕES DE NOTIFICAÇÃO",
    pt: "CONFIGURAÇÕES DE NOTIFICAÇÃO",
    de: "BENACHRICHTIGUNGSEINSTELLUNGEN",
    fr: "PARAMÈTRES DE NOTIFICATION",
    ru: "НАСТРОЙКИ УВЕДОМЛЕНИЙ",
    ar: "إعدادات الإشعارات",
    ja: "通知設定",
    ko: "알림 설정"
  },
  notification_management: {
    en: "Notification Management",
    "zh-TW": "通知管理",
    "zh-CN": "通知管理",
    es: "Gestión de Notificaciones",
    "pt-BR": "Gerenciamento de Notificações",
    pt: "Gestão de Notificações",
    de: "Benachrichtigungsverwaltung",
    fr: "Gestion des notifications",
    ru: "Управление уведомлениями",
    ar: "إدارة الإشعارات",
    ja: "通知管理",
    ko: "알림 관리"
  },
  privacy_security_header: {
    en: "PRIVACY & SECURITY",
    "zh-TW": "隱私與安全",
    "zh-CN": "隐私与安全",
    es: "PRIVACIDAD Y SEGURIDAD",
    "pt-BR": "PRIVACIDADE E SEGURANÇA",
    pt: "PRIVACIDADE E SEGURANÇA",
    de: "DATENSCHUTZ & SICHERHEIT",
    fr: "CONFIDENTIALITÉ ET SÉCURITÉ",
    ru: "КОНФИДЕНЦИАЛЬНОСТЬ И БЕЗОПАСНОСТЬ",
    ar: "الخصوصية والأمان",
    ja: "プライバシーとセキュリティ",
    ko: "개인 정보 보호 및 보안"
  },
  help_support_header: {
    en: "HELP & SUPPORT",
    "zh-TW": "幫助與支援",
    "zh-CN": "帮助与支持",
    es: "AYUDA Y SOPORTE",
    "pt-BR": "AJUDA E SUPORTE",
    pt: "AJUDA E SUPORTE",
    de: "HILFE & SUPPORT",
    fr: "AIDE ET SUPPORT",
    ru: "ПОМОЩЬ И ПОДДЕРЖКА",
    ar: "المساعدة والدعم",
    ja: "ヘルプとサポート",
    ko: "도움말 및 지원"
  },
  developer_options_header: {
    en: "DEVELOPER OPTIONS",
    "zh-TW": "開發者選項",
    "zh-CN": "开发者选项",
    es: "OPCIONES DE DESARROLLADOR",
    "pt-BR": "OPÇÕES DO DESENVOLVEDOR",
    pt: "OPÇÕES DO DESENVOLVEDOR",
    de: "ENTWICKLEROPTIONEN",
    fr: "OPTIONS DÉVELOPPEUR",
    ru: "ПАРАМЕТРЫ РАЗРАБОТЧИКА",
    ar: "خيارات المطور",
    ja: "開発者オプション",
    ko: "개발자 옵션"
  },
  bitcoin_secure_key: {
    en: "Bitcoin Secure Key",
    "zh-TW": "比特幣安全金鑰",
    "zh-CN": "比特币安全密钥",
    es: "Clave Segura de Bitcoin",
    "pt-BR": "Chave de Segurança Bitcoin",
    pt: "Chave de Segurança Bitcoin",
    de: "Bitcoin Sicherheitsschlüssel",
    fr: "Clé sécurisée Bitcoin",
    ru: "Безопасный ключ Bitcoin",
    ar: "مفتاح بيتكوين الآمن",
    ja: "ビットコイン秘密鍵",
    ko: "비트코인 보안 키"
  },
  wallet_1: {
    en: "Wallet 1",
    "zh-TW": "錢包 1",
    "zh-CN": "钱包 1",
    es: "Billetera 1",
    "pt-BR": "Carteira 1",
    pt: "Carteira 1",
    de: "Wallet 1",
    fr: "Portefeuille 1",
    ru: "Кошелек 1",
    ar: "المحفظة 1",
    ja: "ウォレット 1",
    ko: "지갑 1"
  },
  wallet_2: {
    en: "Wallet 2",
    "zh-TW": "錢包 2",
    "zh-CN": "钱包 2",
    es: "Billetera 2",
    "pt-BR": "Carteira 2",
    pt: "Carteira 2",
    de: "Wallet 2",
    fr: "Portefeuille 2",
    ru: "Кошелек 2",
    ar: "المحفظة 2",
    ja: "ウォレット 2",
    ko: "지갑 2"
  },
  wallet_3: {
    en: "Wallet 3",
    "zh-TW": "錢包 3",
    "zh-CN": "钱包 3",
    es: "Billetera 3",
    "pt-BR": "Carteira 3",
    pt: "Carteira 3",
    de: "Wallet 3",
    fr: "Portefeuille 3",
    ru: "Кошелек 3",
    ar: "المحفظة 3",
    ja: "ウォレット 3",
    ko: "지갑 3"
  },
  wallet_4: {
    en: "Wallet 4",
    "zh-TW": "錢包 4",
    "zh-CN": "钱包 4",
    es: "Billetera 4",
    "pt-BR": "Carteira 4",
    pt: "Carteira 4",
    de: "Wallet 4",
    fr: "Portefeuille 4",
    ru: "Кошелек 4",
    ar: "المحفظة 4",
    ja: "ウォレット 4",
    ko: "지갑 4"
  },
  import_button: {
    en: "Import",
    "zh-TW": "匯入",
    "zh-CN": "导入",
    es: "Importar",
    "pt-BR": "Importar",
    pt: "Importar",
    de: "Importieren",
    fr: "Importer",
    ru: "Импорт",
    ar: "استيراد",
    ja: "インポート",
    ko: "가져오기"
  },
  enter_key_placeholder: {
    en: "Enter mnemonic, xprv or paste private key",
    "zh-TW": "輸入助記詞、xprv 或貼上私鑰",
    "zh-CN": "输入助记词、xprv 或粘贴私钥",
    es: "Ingresa mnemónico, xprv o pega la clave privada",
    "pt-BR": "Insira mnemônico, xprv ou cole a chave privada",
    pt: "Insira mnemónico, xprv ou cole a chave privada",
    de: "Mnemonic, xprv eingeben oder privaten Schlüssel einfügen",
    fr: "Entrez mnémonique, xprv ou collez la clé privée",
    ru: "Введите мнемонику, xprv или вставьте приватный ключ",
    ar: "أدخل الكلمات المفتاحية، xprv أو الصق المفتاح الخاص",
    ja: "ニーモニック、xprvを入力するか、秘密鍵を貼り付けます",
    ko: "니모닉, xprv 또는 개인 키 붙여넣기"
  },
  favorite_bookmarks_header: {
    en: "FAVORITE BOOKMARKS",
    "zh-TW": "常用書籤",
    "zh-CN": "常用书签",
    es: "MARCADORES FAVORITOS",
    "pt-BR": "FAVORITOS",
    pt: "FAVORITOS",
    de: "FAVORITEN",
    fr: "MARQUE-PAGES FAVORIS",
    ru: "ИЗБРАННЫЕ ЗАКЛАДКИ",
    ar: "الإشارات المرجعية المفضلة",
    ja: "お気に入り",
    ko: "즐겨찾는 북마크"
  },
  management_header: {
    en: "MANAGEMENT",
    "zh-TW": "管理",
    "zh-CN": "管理",
    es: "GESTIÓN",
    "pt-BR": "GERENCIAMENTO",
    pt: "GESTÃO",
    de: "VERWALTUNG",
    fr: "GESTION",
    ru: "УПРАВЛЕНИЕ",
    ar: "الإدارة",
    ja: "管理",
    ko: "관리"
  },
  custom_voice_commands_title: {
    en: "Custom Voice Commands",
    "zh-TW": "自訂語音指令",
    "zh-CN": "自定义语音命令",
    es: "Comandos de Voz Personalizados",
    "pt-BR": "Comandos de Voz Personalizados",
    pt: "Comandos de Voz Personalizados",
    de: "Benutzerdefinierte Sprachbefehle",
    fr: "Commandes vocales personnalisées",
    ru: "Пользовательские голосовые команды",
    ar: "أوامر صوتية مخصصة",
    ja: "カスタム音声コマンド",
    ko: "사용자 지정 음성 명령어"
  },
  custom_command_label: {
    en: "Custom Command",
    "zh-TW": "自訂指令",
    "zh-CN": "自定义命令",
    es: "Comando Personalizado",
    "pt-BR": "Comando Personalizado",
    pt: "Comando Personalizado",
    de: "Benutzerdefinierter Befehl",
    fr: "Commande personnalisée",
    ru: "Пользовательская команда",
    ar: "أمر مخصص",
    ja: "カスタムコマンド",
    ko: "사용자 지정 명령어"
  },
  custom_command_placeholder: {
    en: "Enter custom command",
    "zh-TW": "輸入自訂指令",
    "zh-CN": "输入自定义命令",
    es: "Ingrese comando personalizado",
    "pt-BR": "Insira comando personalizado",
    pt: "Insira comando personalizado",
    de: "Benutzerdefinierten Befehl eingeben",
    fr: "Entrer une commande personnalisée",
    ru: "Введите пользовательскую команду",
    ar: "أدخل أمرًا مخصصًا",
    ja: "カスタムコマンドを入力",
    ko: "사용자 지정 명령어 입력"
  },
  corresponding_action_label: {
    en: "Corresponding Action",
    "zh-TW": "對應動作",
    "zh-CN": "对应动作",
    es: "Acción Correspondiente",
    "pt-BR": "Ação Correspondente",
    pt: "Ação Correspondente",
    de: "Entsprechende Aktion",
    fr: "Action correspondante",
    ru: "Соответствующее действие",
    ar: "الإجراء المقابل",
    ja: "対応するアクション",
    ko: "해당 동작"
  },
  select_action_placeholder: {
    en: "Select Action",
    "zh-TW": "選擇動作",
    "zh-CN": "选择动作",
    es: "Seleccionar Acción",
    "pt-BR": "Selecionar Ação",
    pt: "Selecionar Ação",
    de: "Aktion auswählen",
    fr: "Sélectionner une action",
    ru: "Выбрать действие",
    ar: "تحديد الإجراء",
    ja: "アクションを選択",
    ko: "동작 선택"
  },
  add_button: {
    en: "Add",
    "zh-TW": "新增",
    "zh-CN": "添加",
    es: "Agregar",
    "pt-BR": "Adicionar",
    pt: "Adicionar",
    de: "Hinzufügen",
    fr: "Ajouter",
    ru: "Добавить",
    ar: "إضافة",
    ja: "追加",
    ko: "추가"
  },
  saved_commands_header: {
    en: "SAVED COMMANDS",
    "zh-TW": "已儲存指令",
    "zh-CN": "已保存命令",
    es: "COMANDOS GUARDADOS",
    "pt-BR": "COMANDOS SALVOS",
    pt: "COMANDOS GUARDADOS",
    de: "GESPEICHERTE BEFEHLE",
    fr: "COMMANDES ENREGISTRÉES",
    ru: "СОХРАНЕННЫЕ КОМАНДЫ",
    ar: "الأوامر المحفوظة",
    ja: "保存されたコマンド",
    ko: "저장된 명령어"
  },
  replay_command: {
    en: "Replay",
    "zh-TW": "重新播放",
    "zh-CN": "重播",
    es: "Reproducir de Nuevo",
    "pt-BR": "Reproduzir Novamente",
    pt: "Reproduzir Novamente",
    de: "Wiederholen",
    fr: "Rejouer",
    ru: "Повтор",
    ar: "إعادة التشغيل",
    ja: "リプレイ",
    ko: "다시 재생"
  },
  commands_count_5: {
    en: "5 commands",
    "zh-TW": "5 個指令",
    "zh-CN": "5 个命令",
    es: "5 comandos",
    "pt-BR": "5 comandos",
    pt: "5 comandos",
    de: "5 Befehle",
    fr: "5 commandes",
    ru: "5 команд",
    ar: "5 أوامر",
    ja: "5個のコマンド",
    ko: "5개 명령어"
  },
  commands_count_2: {
    en: "2 commands",
    "zh-TW": "2 個指令",
    "zh-CN": "2 个命令",
    es: "2 comandos",
    "pt-BR": "2 comandos",
    pt: "2 comandos",
    de: "2 Befehle",
    fr: "2 commandes",
    ru: "2 команды",
    ar: "2 أوامر",
    ja: "2個のコマンド",
    ko: "2개 명령어"
  },
  commands_count_6: {
    en: "6 commands",
    "zh-TW": "6 個指令",
    "zh-CN": "6 个命令",
    es: "6 comandos",
    "pt-BR": "6 comandos",
    pt: "6 comandos",
    de: "6 Befehle",
    fr: "6 commandes",
    ru: "6 команд",
    ar: "6 أوامر",
    ja: "6個のコマンド",
    ko: "6개 명령어"
  }
};

const languages = ['en', 'zh-TW', 'zh-CN', 'es', 'pt-BR', 'pt', 'de', 'fr', 'ru', 'ar', 'ja', 'ko'];
const l10nDir = path.join(__dirname, '..', 'l10n');

let totalKeysAdded = 0;
let totalKeysSkipped = 0;

languages.forEach(lang => {
  const filePath = path.join(l10nDir, `${lang}.json`);
  
  let data = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(content);
  }

  let keysAdded = 0;
  let keysSkipped = 0;

  Object.keys(NEW_TRANSLATIONS).forEach(key => {
    if (!data[key]) {
      data[key] = NEW_TRANSLATIONS[key][lang];
      keysAdded++;
    } else {
      keysSkipped++;
    }
  });

  const sortedData = {};
  Object.keys(data).sort().forEach(key => {
    sortedData[key] = data[key];
  });

  fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2) + '\n', 'utf8');
  
  console.log(`[${lang}] Added: ${keysAdded}, Skipped: ${keysSkipped}`);
  totalKeysAdded += keysAdded;
  totalKeysSkipped += keysSkipped;
});

console.log('\n=== Summary ===');
console.log(`Total keys added across all languages: ${totalKeysAdded}`);
console.log(`Total keys skipped (already exist): ${totalKeysSkipped}`);
console.log('\n✅ Translation keys synchronization complete!');
