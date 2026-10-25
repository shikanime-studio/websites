export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const en = {
  "app.description": "Cosplay photoshoot commissions, planned end to end",
  "nav.commissions": "Commissions",
  "nav.newCommission": "New commission",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.signingIn": "Signing in…",
  "nav.notifications": "Notifications",
  "nav.selectLanguage": "Select language",

  "landing.eyebrow": "Cosplay photoshoot commissions",
  "landing.titleTop": "Shoots,",
  "landing.titleAccent": "simplified.",
  "landing.body":
    "Find your photographer. Book the date. Get the photos.",
  "landing.ctaPrimary": "Start a shoot",
  "landing.note": "Sign in with Google",
  "landing.previewCommission": "Commission #128",
  "landing.previewMap": "Tokyo Big Sight",

  "landing.stage.requestedBody":
    "The brief lands. The photographer is notified in the app.",
  "landing.stage.acceptedBody":
    "The photographer says yes. The shoot is on, without a price thread.",
  "landing.stage.scheduledBody":
    "Date, place and a calendar link are agreed and stored on the commission.",
  "landing.stage.completedBody":
    "The shoot happened. Photos are being selected and prepared.",
  "landing.stage.deliveredBody":
    "The first upload marks delivery and notifies the client.",


  "landing.feature4Body":
    "JPEG, PNG, WebP or AVIF up to 25 MiB per photo, stored against the commission.",



  "landing.footerDocs": "Documentation",
  "landing.footerRights": "© {year} Shikanime Studio",

  "home.hero": "Cosplay shoots, planned properly.",
  "home.heroBody":
    "Request a photoshoot commission, agree on place and time with Google Maps and Calendar, receive your photos, and track every step — all in one place.",
  "home.signInHint": "Sign in with Google to see your commissions.",
  "home.title": "Commissions",
  "home.subtitle": "Every shoot, from request to delivery.",
  "home.loading": "Loading…",
  "home.emptyTitle": "No commissions yet",
  "home.emptyBody": "Create one to plan your first shoot.",
  "home.nothingHere": "Nothing here",
  "home.dateTbd": "Date TBD",
  "home.filterAll": "All",
  "home.search": "Search a title, character or place",
  "home.searchEmpty": "Try another title, character or place.",
  "home.noResultsTitle": "No commission matches this search.",
  "home.clearSearch": "Clear search",
  "home.errorTitle": "The board did not load",
  "home.errorBody":
    "The server did not answer. Check your connection and try again.",
  "home.retry": "Try again",
  "home.summary": "Pipeline",
  "home.showing": "{count} shown",
  "home.updated": "Updated {date}",
  "home.newCommissionCta": "Plan a shoot",

  "status.requested": "Requested",
  "status.accepted": "Accepted",
  "status.scheduled": "Scheduled",
  "status.completed": "Shoot completed",
  "status.delivered": "Photos delivered",
  "status.moveToNext": "Move to {status}",
  "status.final": "This commission is fully delivered.",

  "form.title": "New commission",
  "form.intro":
    "Request a cosplay photoshoot. The photographer is notified and can accept, schedule, and deliver from here.",
  "form.sectionShoot": "The shoot",
  "form.sectionBrief": "The brief",
  "form.fieldTitle": "Title",
  "form.fieldTitlePlaceholder": "C108 Saturday outdoor shoot",
  "form.fieldPhotographer": "Photographer email",
  "form.fieldPhotographerHint":
    "Must match an existing Hikari account, or the request is refused.",
  "form.fieldCharacter": "Character / series",
  "form.fieldCharacterPlaceholder": "Kaguya from Kaguya-sama",
  "form.fieldDate": "Shooting date",
  "form.fieldLocation": "Location",
  "form.fieldLocationPlaceholder": "Tokyo Big Sight, East Hall 8",
  "form.fieldNotes": "Notes for the photographer",
  "form.fieldNotesPlaceholder":
    "What you want shot, references, timing constraints…",
  "form.fieldRequired": "This field is required.",
  "form.optional": "optional",
  "form.cancel": "Cancel",
  "form.submit": "Send request",
  "form.sending": "Sending…",
  "form.createFailed": "Failed to create commission",
  "form.asideTitle": "What happens next",
  "form.aside1": "The photographer gets an in-app notification.",
  "form.aside2": "They accept, then set a date and a place.",
  "form.aside3": "Photos arrive on the commission page.",
  "form.asideNote":
    "You can follow every stage from the board. Nothing is sent by email yet.",

  "detail.brief": "Brief",
  "detail.location": "Location",
  "detail.locationTbd": "Location TBD",
  "detail.openMaps": "Open in Google Maps",
  "detail.calendar": "Calendar",
  "detail.addToCalendar": "Add to Google Calendar",
  "detail.dateTbd": "Date TBD",
  "detail.characterTbd": "Character TBD",
  "detail.status": "Status",
  "detail.progress": "Progress",
  "detail.progressHint": "A commission moves forward one stage at a time.",
  "detail.nextStep": "Next step",
  "detail.photos": "Photos",
  "detail.noPhotos": "No photos yet. The gallery fills up after the shoot.",
  "detail.uploadCta": "Upload photos",
  "detail.deliveryReady": "Delivery ready — the client has been notified.",
  "detail.photoAlt": "Shoot {id}",
  "detail.uploadHint":
    "JPEG, PNG, WebP or AVIF, up to 25 MiB. First upload after the shoot marks delivery ready and notifies the client.",
  "detail.allCommissions": "All commissions",
  "detail.signInToView": "Sign in to view this commission.",
  "detail.notFound": "Commission not found.",
  "detail.notFoundBody":
    "It may have been removed, or the link may belong to another account.",
  "detail.statusChangeFailed": "Status change failed",
  "detail.uploadFailed": "Upload failed",
  "detail.errorTitle": "This commission did not load",
  "detail.errorBody": "The server did not answer. Try again in a moment.",

  "notif.empty": "No notifications yet.",
  "notif.title": "Notifications",
  "notif.unread": "{count} unread",
  "notif.markAllRead": "Mark all as read",
  "notif.commission_requested": "New commission request",
  "notif.commission_accepted": "Commission accepted",
  "notif.commission_scheduled": "Commission scheduled",
  "notif.commission_completed": "Shoot completed",
  "notif.commission_delivered": "Photos delivered",
  "notif.photos_added": "New photos",
  "notif.photos_ready": "Photos ready",

  "error.title": "Something went wrong.",
  "error.body":
    "The page hit an unexpected error. Your commissions are still saved.",
  "error.retry": "Try again",
  "error.reload": "Reload the page",

  "notfound.title": "This page does not exist.",
  "notfound.body": "Head back to your commissions.",
  "notfound.home": "Back to Hikari",

  "detail.statusUpdated": "Status updated",
  "detail.uploaded": "Photos uploaded",

  "landing.howTitle": "How it works",
  "landing.howHeading": "From first message to final files.",
  "landing.shareEyebrow": "The shared link",
  "landing.step1Title": "Tell us the shoot",
  "landing.step1Body": "Idea, character, references. Two minutes, one form.",
  "landing.step2Title": "Lock the date",
  "landing.step2Body": "Pick a time and place. Everyone gets a calendar invite.",
  "landing.step3Title": "Follow the edit",
  "landing.step3Body": "One private link shows progress, previews and the final files.",
  "landing.shareTitle": "One link for the whole shoot.",
  "landing.shareBody": "Send it to your model, your helpers, your client. They see the date, the place, the crew and every preview as it lands. No account needed.",
  "landing.sharePoint1": "Calendar-ready date, time and address",
  "landing.sharePoint2": "Progress from booking to delivery",
  "landing.sharePoint3": "A private gallery that fills up",
  "landing.closingTitle": "Ready when you are.",
  "landing.closingBody": "Bring the idea. We will handle the date, the place and the photos.",
} as const;

export type MessageKey = keyof typeof en;

const fr: Record<MessageKey, string> = {
  "app.description":
    "Commissions de séances photo cosplay, planifiées de bout en bout",
  "nav.commissions": "Commissions",
  "nav.newCommission": "Nouvelle commission",
  "nav.signIn": "Connexion",
  "nav.signOut": "Déconnexion",
  "nav.signingIn": "Connexion…",
  "nav.notifications": "Notifications",
  "nav.selectLanguage": "Choisir la langue",

  "landing.eyebrow": "Commissions photo cosplay",
  "landing.titleTop": "Le shooting,",
  "landing.titleAccent": "simplifié.",
  "landing.body":
    "Trouvez votre photographe. Fixez la date. Recevez les photos.",
  "landing.ctaPrimary": "Lancer un shooting",
  "landing.note": "Connexion avec Google",
  "landing.previewCommission": "Commission n° 128",
  "landing.previewMap": "Tokyo Big Sight",

  "landing.stage.requestedBody":
    "Le brief arrive. Le photographe reçoit une notification dans l'application.",
  "landing.stage.acceptedBody":
    "Le photographe accepte. La séance existe, sans négociation de tarif.",
  "landing.stage.scheduledBody":
    "Date, lieu et lien calendrier sont fixés et enregistrés sur la commission.",
  "landing.stage.completedBody":
    "La séance a eu lieu. Les photos sont sélectionnées et préparées.",
  "landing.stage.deliveredBody":
    "Le premier envoi marque la livraison et prévient le client.",


  "landing.feature4Body":
    "JPEG, PNG, WebP ou AVIF jusqu'à 25 Mio par photo, stockées avec la commission.",



  "landing.footerDocs": "Documentation",
  "landing.footerRights": "© {year} Shikanime Studio",

  "home.hero": "Les shootings cosplay, bien planifiés.",
  "home.heroBody":
    "Demandez une commission de séance photo, convenez du lieu et de l'heure avec Google Maps et Calendar, recevez vos photos et suivez chaque étape — au même endroit.",
  "home.signInHint": "Connectez-vous avec Google pour voir vos commissions.",
  "home.title": "Commissions",
  "home.subtitle": "Chaque shooting, de la demande à la livraison.",
  "home.loading": "Chargement…",
  "home.emptyTitle": "Aucune commission pour l'instant",
  "home.emptyBody": "Créez-en une pour planifier votre premier shooting.",
  "home.nothingHere": "Rien ici",
  "home.dateTbd": "Date à définir",
  "home.filterAll": "Toutes",
  "home.search": "Titre, personnage ou lieu",
  "home.searchEmpty": "Essayez un autre titre, personnage ou lieu.",
  "home.noResultsTitle": "Aucune commission ne correspond à cette recherche.",
  "home.clearSearch": "Effacer la recherche",
  "home.errorTitle": "Le tableau n'a pas chargé",
  "home.errorBody":
    "Le serveur n'a pas répondu. Vérifiez la connexion et réessayez.",
  "home.retry": "Réessayer",
  "home.summary": "Pipeline",
  "home.showing": "{count} affichées",
  "home.updated": "Mise à jour {date}",
  "home.newCommissionCta": "Planifier une séance",

  "status.requested": "Demandée",
  "status.accepted": "Acceptée",
  "status.scheduled": "Planifiée",
  "status.completed": "Shooting terminé",
  "status.delivered": "Photos livrées",
  "status.moveToNext": "Passer à {status}",
  "status.final": "Cette commission est entièrement livrée.",

  "form.title": "Nouvelle commission",
  "form.intro":
    "Demandez une séance photo cosplay. Le photographe est notifié et peut accepter, planifier et livrer depuis ici.",
  "form.sectionShoot": "La séance",
  "form.sectionBrief": "Le brief",
  "form.fieldTitle": "Titre",
  "form.fieldTitlePlaceholder": "Shooting extérieur samedi C108",
  "form.fieldPhotographer": "E-mail du photographe",
  "form.fieldPhotographerHint":
    "Doit correspondre à un compte Hikari existant, sinon la demande est refusée.",
  "form.fieldCharacter": "Personnage / série",
  "form.fieldCharacterPlaceholder": "Kaguya de Kaguya-sama",
  "form.fieldDate": "Date du shooting",
  "form.fieldLocation": "Lieu",
  "form.fieldLocationPlaceholder": "Tokyo Big Sight, Hall Est 8",
  "form.fieldNotes": "Notes pour le photographe",
  "form.fieldNotesPlaceholder":
    "Ce que vous voulez shooter, références, contraintes horaires…",
  "form.fieldRequired": "Ce champ est obligatoire.",
  "form.optional": "facultatif",
  "form.cancel": "Annuler",
  "form.submit": "Envoyer la demande",
  "form.sending": "Envoi…",
  "form.createFailed": "Échec de la création de la commission",
  "form.asideTitle": "La suite",
  "form.aside1": "Le photographe reçoit une notification dans l'app.",
  "form.aside2": "Il accepte, puis fixe une date et un lieu.",
  "form.aside3": "Les photos arrivent sur la page de la commission.",
  "form.asideNote":
    "Chaque étape se suit depuis le tableau. Rien n'est encore envoyé par e-mail.",

  "detail.brief": "Brief",
  "detail.location": "Lieu",
  "detail.locationTbd": "Lieu à définir",
  "detail.openMaps": "Ouvrir dans Google Maps",
  "detail.calendar": "Calendrier",
  "detail.addToCalendar": "Ajouter à Google Calendar",
  "detail.dateTbd": "Date à définir",
  "detail.characterTbd": "Personnage à définir",
  "detail.status": "Statut",
  "detail.progress": "Progression",
  "detail.progressHint":
    "Une commission avance une étape à la fois, dans un seul sens.",
  "detail.nextStep": "Prochaine étape",
  "detail.photos": "Photos",
  "detail.noPhotos":
    "Pas encore de photos. La galerie se remplit après la séance.",
  "detail.uploadCta": "Envoyer des photos",
  "detail.deliveryReady": "Livraison prête — le client a été notifié.",
  "detail.photoAlt": "Shooting {id}",
  "detail.uploadHint":
    "JPEG, PNG, WebP ou AVIF, jusqu'à 25 Mio. Le premier envoi après la séance marque la livraison prête et notifie le client.",
  "detail.allCommissions": "Toutes les commissions",
  "detail.signInToView": "Connectez-vous pour voir cette commission.",
  "detail.notFound": "Commission introuvable.",
  "detail.notFoundBody":
    "Elle a peut-être été supprimée, ou le lien appartient à un autre compte.",
  "detail.statusChangeFailed": "Échec du changement de statut",
  "detail.uploadFailed": "Échec de l'envoi",
  "detail.errorTitle": "Cette commission n'a pas chargé",
  "detail.errorBody": "Le serveur n'a pas répondu. Réessayez dans un instant.",

  "notif.empty": "Aucune notification pour l'instant.",
  "notif.title": "Notifications",
  "notif.unread": "{count} non lues",
  "notif.markAllRead": "Tout marquer comme lu",
  "notif.commission_requested": "Nouvelle demande de commission",
  "notif.commission_accepted": "Commission acceptée",
  "notif.commission_scheduled": "Commission planifiée",
  "notif.commission_completed": "Shooting terminé",
  "notif.commission_delivered": "Photos livrées",
  "notif.photos_added": "Nouvelles photos",
  "notif.photos_ready": "Photos prêtes",

  "error.title": "Quelque chose a cassé.",
  "error.body":
    "La page a rencontré une erreur inattendue. Vos commissions sont conservées.",
  "error.retry": "Réessayer",
  "error.reload": "Recharger la page",

  "notfound.title": "Cette page n'existe pas.",
  "notfound.body": "Retournez à vos commissions.",
  "notfound.home": "Retour à Hikari",

  "detail.statusUpdated": "Statut mis à jour",
  "detail.uploaded": "Photos envoyées",

  "landing.howTitle": "Comment ça marche",
  "landing.howHeading": "Du premier message aux fichiers finaux.",
  "landing.shareEyebrow": "Le lien partagé",
  "landing.step1Title": "Racontez la séance",
  "landing.step1Body": "Idée, personnage, références. Deux minutes, un formulaire.",
  "landing.step2Title": "Fixez la date",
  "landing.step2Body": "Choisissez l'heure et le lieu. Chacun reçoit l'invitation calendrier.",
  "landing.step3Title": "Suivez le montage",
  "landing.step3Body": "Un lien privé montre l'avancement, les aperçus et les fichiers finaux.",
  "landing.shareTitle": "Un lien pour toute la séance.",
  "landing.shareBody": "Envoyez-le au modèle, aux assistants, au client. Ils voient la date, le lieu, l'équipe et chaque aperçu dès qu'il arrive. Sans compte.",
  "landing.sharePoint1": "Date, heure et adresse prêtes pour le calendrier",
  "landing.sharePoint2": "L'avancement, de la réservation à la livraison",
  "landing.sharePoint3": "Une galerie privée qui se remplit",
  "landing.closingTitle": "Quand vous voulez.",
  "landing.closingBody": "Apportez l'idée. On s'occupe de la date, du lieu et des photos.",
};

const ja: Record<MessageKey, string> = {
  "app.description": "コスプレ撮影の依頼を、最初から最後まで計画",
  "nav.commissions": "撮影依頼",
  "nav.newCommission": "新規依頼",
  "nav.signIn": "ログイン",
  "nav.signOut": "ログアウト",
  "nav.signingIn": "ログイン中…",
  "nav.notifications": "通知",
  "nav.selectLanguage": "言語を選ぶ",

  "landing.eyebrow": "コスプレ撮影の依頼",
  "landing.titleTop": "撮影を、",
  "landing.titleAccent": "シンプルに。",
  "landing.body":
    "撮影者を探す。日付を決める。写真を受け取る。",
  "landing.ctaPrimary": "撮影をはじめる",
  "landing.note": "Google でログイン",
  "landing.previewCommission": "依頼 #128",
  "landing.previewMap": "東京ビッグサイト",

  "landing.stage.requestedBody":
    "依頼が届くと、撮影者にアプリ内通知が届きます。",
  "landing.stage.acceptedBody":
    "撮影者が受諾。価格のやり取りなしで撮影が決まります。",
  "landing.stage.scheduledBody":
    "日時・場所・カレンダーリンクが合意され、依頼に保存されます。",
  "landing.stage.completedBody":
    "撮影が終わり、写真を選んで準備している段階です。",
  "landing.stage.deliveredBody":
    "最初のアップロードで納品となり、依頼者に通知されます。",


  "landing.feature4Body":
    "JPEG・PNG・WebP・AVIF を 1 枚 25MiB まで、依頼に紐づけて保存。",



  "landing.footerDocs": "ドキュメント",
  "landing.footerRights": "© {year} Shikanime Studio",

  "home.hero": "コスプレ撮影を、きちんと計画。",
  "home.heroBody":
    "撮影依頼を出して、Google マップとカレンダーで場所と時間を決め、写真を受け取り、進捗をひとつの場所で追跡できます。",
  "home.signInHint": "Google でログインすると依頼の一覧が見えます。",
  "home.title": "撮影依頼",
  "home.subtitle": "依頼から納品まで、すべての撮影を。",
  "home.loading": "読み込み中…",
  "home.emptyTitle": "まだ依頼はありません",
  "home.emptyBody": "最初の撮影を計画するために作成しましょう。",
  "home.nothingHere": "何もありません",
  "home.dateTbd": "日時未定",
  "home.filterAll": "すべて",
  "home.search": "題名・キャラクター・場所で検索",
  "home.searchEmpty": "別の題名・キャラクター・場所でお試しください。",
  "home.noResultsTitle": "この検索に一致する依頼はありません。",
  "home.clearSearch": "検索をクリア",
  "home.errorTitle": "ボードを読み込めませんでした",
  "home.errorBody":
    "サーバーから応答がありません。接続を確認して、もう一度お試しください。",
  "home.retry": "再試行",
  "home.summary": "パイプライン",
  "home.showing": "{count} 件を表示",
  "home.updated": "{date} に更新",
  "home.newCommissionCta": "撮影を計画する",

  "status.requested": "依頼中",
  "status.accepted": "受諾済み",
  "status.scheduled": "撮影決定",
  "status.completed": "撮影完了",
  "status.delivered": "写真納品済み",
  "status.moveToNext": "{status} へ進める",
  "status.final": "この依頼は納品まで完了しています。",

  "form.title": "新規依頼",
  "form.intro":
    "コスプレ撮影を依頼します。撮影者に通知が届き、ここから受諾・日程調整・納品ができます。",
  "form.sectionShoot": "撮影について",
  "form.sectionBrief": "概要",
  "form.fieldTitle": "タイトル",
  "form.fieldTitlePlaceholder": "C108 土曜 屋外撮影",
  "form.fieldPhotographer": "撮影者のメールアドレス",
  "form.fieldPhotographerHint":
    "既存の Hikari アカウントと一致しない場合、依頼は拒否されます。",
  "form.fieldCharacter": "キャラクター / 作品",
  "form.fieldCharacterPlaceholder": "かぐや様は告らせたい のかぐや",
  "form.fieldDate": "撮影日時",
  "form.fieldLocation": "場所",
  "form.fieldLocationPlaceholder": "東京ビッグサイト 東 8 ホール",
  "form.fieldNotes": "撮影者へのメモ",
  "form.fieldNotesPlaceholder": "撮ってほしい内容、参考資料、時間の制約など…",
  "form.fieldRequired": "この項目は必須です。",
  "form.optional": "任意",
  "form.cancel": "キャンセル",
  "form.submit": "依頼を送る",
  "form.sending": "送信中…",
  "form.createFailed": "依頼の作成に失敗しました",
  "form.asideTitle": "このあとの流れ",
  "form.aside1": "撮影者にアプリ内通知が届きます。",
  "form.aside2": "受諾後、日時と場所が決まります。",
  "form.aside3": "写真は依頼ページに届きます。",
  "form.asideNote":
    "進み具合はボードから確認できます。現時点でメール送信はありません。",

  "detail.brief": "概要",
  "detail.location": "場所",
  "detail.locationTbd": "場所未定",
  "detail.openMaps": "Google マップで開く",
  "detail.calendar": "カレンダー",
  "detail.addToCalendar": "Google カレンダーに追加",
  "detail.dateTbd": "日時未定",
  "detail.characterTbd": "キャラクター未定",
  "detail.status": "ステータス",
  "detail.progress": "進捗",
  "detail.progressHint": "依頼は一度にひとつだけ、前へ進みます。",
  "detail.nextStep": "次のステップ",
  "detail.photos": "写真",
  "detail.noPhotos": "まだ写真はありません。撮影後にギャラリーが埋まります。",
  "detail.uploadCta": "写真をアップロード",
  "detail.deliveryReady": "納品準備完了 — 依頼者に通知しました。",
  "detail.photoAlt": "撮影 {id}",
  "detail.uploadHint":
    "JPEG・PNG・WebP・AVIF、各 25MiB まで。撮影完了後の最初のアップロードで納品準備完了となり、依頼者に通知します。",
  "detail.allCommissions": "すべての依頼",
  "detail.signInToView": "この依頼を見るにはログインしてください。",
  "detail.notFound": "依頼が見つかりません。",
  "detail.notFoundBody":
    "削除されたか、別のアカウントのリンクかもしれません。",
  "detail.statusChangeFailed": "ステータス変更に失敗しました",
  "detail.uploadFailed": "アップロードに失敗しました",
  "detail.errorTitle": "この依頼を読み込めませんでした",
  "detail.errorBody": "サーバーから応答がありません。少し後で再試行してください。",

  "notif.empty": "通知はまだありません。",
  "notif.title": "通知",
  "notif.unread": "未読 {count} 件",
  "notif.markAllRead": "すべて既読にする",
  "notif.commission_requested": "新しい撮影依頼",
  "notif.commission_accepted": "依頼が受諾されました",
  "notif.commission_scheduled": "撮影日が決定しました",
  "notif.commission_completed": "撮影が完了しました",
  "notif.commission_delivered": "写真が納品されました",
  "notif.photos_added": "新しい写真",
  "notif.photos_ready": "写真の準備ができました",

  "error.title": "問題が発生しました。",
  "error.body": "予期しないエラーが起きました。依頼は保存されています。",
  "error.retry": "再試行",
  "error.reload": "ページを再読み込み",

  "notfound.title": "このページは存在しません。",
  "notfound.body": "依頼の一覧に戻りましょう。",
  "notfound.home": "Hikari に戻る",

  "detail.statusUpdated": "ステータスを更新しました",
  "detail.uploaded": "写真をアップロードしました",

  "landing.howTitle": "流れ",
  "landing.howHeading": "最初のメッセージから完成データまで。",
  "landing.shareEyebrow": "共有リンク",
  "landing.step1Title": "撮影を伝える",
  "landing.step1Body": "アイデア、キャラクター、参考資料。フォームは2分で完了。",
  "landing.step2Title": "日程を決める",
  "landing.step2Body": "時間と場所を選ぶと、全員にカレンダー招待が届きます。",
  "landing.step3Title": "編集を追う",
  "landing.step3Body": "プライベートリンクで進捗、プレビュー、完成データを確認。",
  "landing.shareTitle": "撮影のすべてを、1つのリンクで。",
  "landing.shareBody": "モデル、ヘルパー、クライアントに送るだけ。日時、場所、参加者、届いたプレビューが見られます。アカウント不要。",
  "landing.sharePoint1": "カレンダー登録できる日時と住所",
  "landing.sharePoint2": "予約から納品までの進捗",
  "landing.sharePoint3": "少しずつ増えるプライベートギャラリー",
  "landing.closingTitle": "いつでもどうぞ。",
  "landing.closingBody": "アイデアをお持ちください。日程、場所、写真はこちらで。",
};

export const CATALOGS: Record<LanguageCode, Record<MessageKey, { defaultMessage: string }>> = {
  en: Object.fromEntries(
    Object.entries(en).map(([key, defaultMessage]) => [key, { defaultMessage }]),
  ) as Record<MessageKey, { defaultMessage: string }>,
  fr: Object.fromEntries(
    Object.entries(fr).map(([key, defaultMessage]) => [key, { defaultMessage }]),
  ) as Record<MessageKey, { defaultMessage: string }>,
  ja: Object.fromEntries(
    Object.entries(ja).map(([key, defaultMessage]) => [key, { defaultMessage }]),
  ) as Record<MessageKey, { defaultMessage: string }>,
};
