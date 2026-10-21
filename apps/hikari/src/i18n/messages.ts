export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const en = {
  "app.description": "Cosplay photoshoot commissions, planned end to end",
  "nav.product": "Product",
  "nav.workflow": "Workflow",
  "nav.roles": "For both sides",
  "nav.commissions": "Commissions",
  "nav.newCommission": "New commission",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.signingIn": "Signing in…",
  "nav.notifications": "Notifications",
  "nav.selectLanguage": "Select language",

  "landing.eyebrow": "Cosplay photoshoot commissions",
  "landing.titleTop": "Cosplay shoots,",
  "landing.titleAccent": "planned properly.",
  "landing.body":
    "One workspace for the whole shoot: the request, the place, the time, the photos. Both sides always know what happens next.",
  "landing.ctaPrimary": "Sign in with Google",
  "landing.ctaSecondary": "See how it works",
  "landing.note": "Google sign-in · English, Français, 日本語",
  "landing.previewLabel": "A commission, end to end",
  "landing.previewCommission": "Commission #128",
  "landing.previewTitle": "C108 · Saturday outdoor shoot",
  "landing.previewCharacter": "Kaguya · Kaguya-sama",
  "landing.previewDate": "Sat 12 Dec",
  "landing.previewHall": "East Hall 8",
  "landing.previewStep": "Step 3 of 5 · Scheduled",
  "landing.previewPhotos": "12 photos delivered",
  "landing.previewNotifTitle": "New commission request",
  "landing.previewNotifBody": "Aoi · golden hour at the pier",
  "landing.previewMap": "Tokyo Big Sight",
  "landing.previewDelivered": "Photos delivered",

  "landing.pipelineEyebrow": "The lifecycle",
  "landing.pipelineTitle": "Five stages. No mystery.",
  "landing.pipelineBody":
    "A commission only ever moves forward, and both people see the same state at the same time.",
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

  "landing.rolesEyebrow": "Two sides",
  "landing.rolesTitle": "Built for the cosplayer and the photographer.",
  "landing.rolesBody":
    "Same commission, two points of view. Nobody has to translate a chat thread into a schedule.",
  "landing.roleClientTitle": "For cosplayers",
  "landing.roleClientBody":
    "Ask for the shoot you actually want, then watch it happen.",
  "landing.roleClient1": "Send a brief in under a minute",
  "landing.roleClient2": "Agree on a real place, with a map on the page",
  "landing.roleClient3": "Add the shoot to Google Calendar in one tap",
  "landing.roleClient4": "Download the gallery the moment it is delivered",
  "landing.roleShooterTitle": "For photographers",
  "landing.roleShooterBody":
    "Keep every request, location and delivery in one calm board.",
  "landing.roleShooter1": "See new requests with the full brief attached",
  "landing.roleShooter2": "Move a shoot through its stages, one click each",
  "landing.roleShooter3": "Upload photos straight into delivery",
  "landing.roleShooter4": "Clients are notified automatically at every step",

  "landing.featuresEyebrow": "What is inside",
  "landing.featuresTitle": "Small app, complete workflow.",
  "landing.featuresBody":
    "No plugins, no spreadsheet, no calendar Tetris. Just the parts a shoot actually needs.",
  "landing.feature1Title": "A board, not a chat thread",
  "landing.feature1Body":
    "Every commission is grouped by the stage it is in, so the next action is always obvious.",
  "landing.feature2Title": "Maps without API keys",
  "landing.feature2Body":
    "The agreed place renders as a Google Maps embed and opens in Maps when you need directions.",
  "landing.feature3Title": "One tap to the calendar",
  "landing.feature3Body":
    "A Google Calendar render link carries the title, time and venue. No OAuth, no SDK.",
  "landing.feature4Title": "Delivery built in",
  "landing.feature4Body":
    "JPEG, PNG, WebP or AVIF up to 25 MiB per photo, stored against the commission.",
  "landing.feature5Title": "Notifications that follow the shoot",
  "landing.feature5Body":
    "Request, acceptance, schedule, shoot day and delivery each reach the right person in-app.",
  "landing.feature6Title": "Three languages, one app",
  "landing.feature6Body":
    "English, French and Japanese, switchable from the header and remembered on the device.",

  "landing.stepsEyebrow": "How it works",
  "landing.stepsTitle": "From first message to final gallery.",
  "landing.stepsBody":
    "Four steps, no setup, nothing to install. Sign in and the board is ready.",
  "landing.step1Title": "Sign in with Google",
  "landing.step1Body":
    "One account for both roles. Your name and avatar come from your Google profile.",
  "landing.step2Title": "Send the brief",
  "landing.step2Body":
    "Title, photographer email, character, date, venue and any notes for the shoot.",
  "landing.step3Title": "Agree on place and time",
  "landing.step3Body":
    "The photographer accepts, then the commission moves to scheduled with a map and calendar link.",
  "landing.step4Title": "Receive the photos",
  "landing.step4Body":
    "The first upload marks delivery, notifies you, and the gallery stays attached to the commission.",

  "landing.ctaTitle": "Your next shoot deserves better than a group chat.",
  "landing.ctaBody":
    "Start with a sign-in. Your first commission takes about a minute.",
  "landing.ctaButton": "Start a commission",
  "landing.ctaNote": "No card. No setup. Just the shoot.",

  "landing.footerTagline":
    "A cosplay photoshoot commission planner by Shikanime Studio.",
  "landing.footerProduct": "Product",
  "landing.footerBuilt": "Built with",
  "landing.footerDocs": "Documentation",
  "landing.footerRights": "© {year} Shikanime Studio",
  "landing.footerStatus": "Runs on Cloudflare Workers",

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
} as const;

export type MessageKey = keyof typeof en;

const fr: Record<MessageKey, string> = {
  "app.description":
    "Commissions de séances photo cosplay, planifiées de bout en bout",
  "nav.product": "Produit",
  "nav.workflow": "Déroulé",
  "nav.roles": "Pour les deux",
  "nav.commissions": "Commissions",
  "nav.newCommission": "Nouvelle commission",
  "nav.signIn": "Connexion",
  "nav.signOut": "Déconnexion",
  "nav.signingIn": "Connexion…",
  "nav.notifications": "Notifications",
  "nav.selectLanguage": "Choisir la langue",

  "landing.eyebrow": "Commissions photo cosplay",
  "landing.titleTop": "Des shootings cosplay,",
  "landing.titleAccent": "vraiment planifiés.",
  "landing.body":
    "Un seul espace pour toute la séance : la demande, le lieu, l'horaire, les photos. Les deux côtés savent toujours ce qui vient ensuite.",
  "landing.ctaPrimary": "Se connecter avec Google",
  "landing.ctaSecondary": "Voir le déroulé",
  "landing.note": "Connexion Google · English, Français, 日本語",
  "landing.previewLabel": "Une commission, de bout en bout",
  "landing.previewCommission": "Commission n° 128",
  "landing.previewTitle": "C108 · shooting extérieur du samedi",
  "landing.previewCharacter": "Kaguya · Kaguya-sama",
  "landing.previewDate": "Sam. 12 déc.",
  "landing.previewHall": "Hall Est 8",
  "landing.previewStep": "Étape 3 sur 5 · Planifiée",
  "landing.previewPhotos": "12 photos livrées",
  "landing.previewNotifTitle": "Nouvelle demande de commission",
  "landing.previewNotifBody": "Aoi · heure dorée sur la jetée",
  "landing.previewMap": "Tokyo Big Sight",
  "landing.previewDelivered": "Photos livrées",

  "landing.pipelineEyebrow": "Le cycle de vie",
  "landing.pipelineTitle": "Cinq étapes. Aucun flou.",
  "landing.pipelineBody":
    "Une commission ne fait qu'avancer, et les deux personnes voient le même état au même moment.",
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

  "landing.rolesEyebrow": "Deux côtés",
  "landing.rolesTitle": "Pensé pour le cosplayeur et le photographe.",
  "landing.rolesBody":
    "La même commission, deux points de vue. Personne n'a à traduire un fil de discussion en planning.",
  "landing.roleClientTitle": "Pour les cosplayeurs",
  "landing.roleClientBody":
    "Demandez la séance que vous voulez vraiment, puis regardez-la se réaliser.",
  "landing.roleClient1": "Envoyez un brief en moins d'une minute",
  "landing.roleClient2": "Fixez un lieu réel, avec la carte sur la page",
  "landing.roleClient3": "Ajoutez la séance à Google Calendar en un geste",
  "landing.roleClient4": "Téléchargez la galerie dès sa livraison",
  "landing.roleShooterTitle": "Pour les photographes",
  "landing.roleShooterBody":
    "Toutes les demandes, les lieux et les livraisons sur un seul tableau calme.",
  "landing.roleShooter1": "Recevez les demandes avec le brief complet",
  "landing.roleShooter2": "Faites avancer une séance étape par étape",
  "landing.roleShooter3": "Envoyez les photos directement en livraison",
  "landing.roleShooter4": "Les clients sont prévenus automatiquement à chaque étape",

  "landing.featuresEyebrow": "Ce qu'il y a dedans",
  "landing.featuresTitle": "Une petite app, un flux complet.",
  "landing.featuresBody":
    "Pas d'extension, pas de tableur, pas de Tetris de calendriers. Juste ce qu'une séance demande.",
  "landing.feature1Title": "Un tableau, pas un fil de messages",
  "landing.feature1Body":
    "Chaque commission est rangée par étape, donc la prochaine action est toujours évidente.",
  "landing.feature2Title": "Des cartes sans clé API",
  "landing.feature2Body":
    "Le lieu convenu s'affiche en carte Google et s'ouvre dans Maps pour l'itinéraire.",
  "landing.feature3Title": "Le calendrier en un geste",
  "landing.feature3Body":
    "Un lien Google Calendar porte le titre, l'heure et le lieu. Sans OAuth ni SDK.",
  "landing.feature4Title": "La livraison intégrée",
  "landing.feature4Body":
    "JPEG, PNG, WebP ou AVIF jusqu'à 25 Mio par photo, stockées avec la commission.",
  "landing.feature5Title": "Des notifications qui suivent la séance",
  "landing.feature5Body":
    "Demande, acceptation, planning, jour J et livraison : chacun est prévenu dans l'app.",
  "landing.feature6Title": "Trois langues, une app",
  "landing.feature6Body":
    "Anglais, français et japonais, changeables dans l'en-tête et retenus sur l'appareil.",

  "landing.stepsEyebrow": "Comment ça marche",
  "landing.stepsTitle": "Du premier message à la galerie finale.",
  "landing.stepsBody":
    "Quatre étapes, aucune installation. Connectez-vous et le tableau est prêt.",
  "landing.step1Title": "Connectez-vous avec Google",
  "landing.step1Body":
    "Un compte pour les deux rôles. Nom et avatar viennent de votre profil Google.",
  "landing.step2Title": "Envoyez le brief",
  "landing.step2Body":
    "Titre, e-mail du photographe, personnage, date, lieu et notes pour la séance.",
  "landing.step3Title": "Convenez du lieu et de l'heure",
  "landing.step3Body":
    "Le photographe accepte, puis la commission passe en planifiée avec carte et calendrier.",
  "landing.step4Title": "Recevez les photos",
  "landing.step4Body":
    "Le premier envoi marque la livraison, vous prévient, et la galerie reste attachée à la commission.",

  "landing.ctaTitle":
    "Votre prochaine séance mérite mieux qu'un groupe de discussion.",
  "landing.ctaBody":
    "Commencez par une connexion. Votre première commission prend une minute.",
  "landing.ctaButton": "Créer une commission",
  "landing.ctaNote": "Sans carte. Sans installation. Juste la séance.",

  "landing.footerTagline":
    "Un planificateur de commissions photo cosplay par Shikanime Studio.",
  "landing.footerProduct": "Produit",
  "landing.footerBuilt": "Construit avec",
  "landing.footerDocs": "Documentation",
  "landing.footerRights": "© {year} Shikanime Studio",
  "landing.footerStatus": "Sur Cloudflare Workers",

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
};

const ja: Record<MessageKey, string> = {
  "app.description": "コスプレ撮影の依頼を、最初から最後まで計画",
  "nav.product": "プロダクト",
  "nav.workflow": "流れ",
  "nav.roles": "両側のために",
  "nav.commissions": "撮影依頼",
  "nav.newCommission": "新規依頼",
  "nav.signIn": "ログイン",
  "nav.signOut": "ログアウト",
  "nav.signingIn": "ログイン中…",
  "nav.notifications": "通知",
  "nav.selectLanguage": "言語を選ぶ",

  "landing.eyebrow": "コスプレ撮影の依頼",
  "landing.titleTop": "コスプレ撮影を、",
  "landing.titleAccent": "きちんと計画。",
  "landing.body":
    "依頼、場所、時間、写真。撮影のすべてをひとつの場所に。どちらも次の一手がいつでも分かります。",
  "landing.ctaPrimary": "Google でログイン",
  "landing.ctaSecondary": "流れを見る",
  "landing.note": "Google ログイン · English, Français, 日本語",
  "landing.previewLabel": "依頼の流れ",
  "landing.previewCommission": "依頼 #128",
  "landing.previewTitle": "C108 · 土曜 屋外撮影",
  "landing.previewCharacter": "かぐや · かぐや様は告らせたい",
  "landing.previewDate": "12月12日（土）",
  "landing.previewHall": "東 8 ホール",
  "landing.previewStep": "ステップ 3 / 5 · 撮影決定",
  "landing.previewPhotos": "12 枚を納品",
  "landing.previewNotifTitle": "新しい撮影依頼",
  "landing.previewNotifBody": "あおい · 桟橋で夕暮れ撮影",
  "landing.previewMap": "東京ビッグサイト",
  "landing.previewDelivered": "写真納品済み",

  "landing.pipelineEyebrow": "依頼のライフサイクル",
  "landing.pipelineTitle": "5 つの段階。迷いなし。",
  "landing.pipelineBody":
    "依頼は前にしか進まず、二人はいつでも同じ状態を見ています。",
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

  "landing.rolesEyebrow": "二人のために",
  "landing.rolesTitle": "コスプレイヤーと撮影者の両方に。",
  "landing.rolesBody":
    "同じ依頼を、二つの視点で。チャットのやり取りを予定表に訳す必要はありません。",
  "landing.roleClientTitle": "コスプレイヤーへ",
  "landing.roleClientBody":
    "本当に撮りたい撮影を依頼して、そのまま見届けられます。",
  "landing.roleClient1": "1 分以内に依頼を送れる",
  "landing.roleClient2": "ページ上の地図で実際の場所を決められる",
  "landing.roleClient3": "ワンタップで Google カレンダーに追加",
  "landing.roleClient4": "納品されたその瞬間にギャラリーを保存",
  "landing.roleShooterTitle": "撮影者へ",
  "landing.roleShooterBody":
    "依頼・場所・納品を、ひとつの静かなボードに。",
  "landing.roleShooter1": "依頼を概要つきで確認できる",
  "landing.roleShooter2": "ワンクリックで次の段階へ進められる",
  "landing.roleShooter3": "写真をそのまま納品にアップロード",
  "landing.roleShooter4": "各段階で依頼者に自動で通知",

  "landing.featuresEyebrow": "中身",
  "landing.featuresTitle": "小さなアプリ、ひと通りの流れ。",
  "landing.featuresBody":
    "プラグインも表計算もカレンダー崩しも不要。撮影に必要なものだけ。",
  "landing.feature1Title": "チャットではなくボード",
  "landing.feature1Body":
    "依頼は今の段階ごとに並ぶので、次にやることがいつも見えます。",
  "landing.feature2Title": "API キー不要の地図",
  "landing.feature2Body":
    "合意した場所は Google マップで表示され、経路は Maps で開けます。",
  "landing.feature3Title": "カレンダーへワンタップ",
  "landing.feature3Body":
    "Google カレンダーのリンクに題名・時刻・場所を載せます。OAuth も SDK も不要。",
  "landing.feature4Title": "納品まで組み込み",
  "landing.feature4Body":
    "JPEG・PNG・WebP・AVIF を 1 枚 25MiB まで、依頼に紐づけて保存。",
  "landing.feature5Title": "撮影に寄り添う通知",
  "landing.feature5Body":
    "依頼・受諾・日程・当日・納品が、それぞれ適切な相手にアプリ内で届きます。",
  "landing.feature6Title": "3 言語、ひとつのアプリ",
  "landing.feature6Body":
    "英語・フランス語・日本語。ヘッダーで切り替え、端末に記憶されます。",

  "landing.stepsEyebrow": "使い方",
  "landing.stepsTitle": "最初のひとことから、最後のギャラリーまで。",
  "landing.stepsBody":
    "4 ステップ、初期設定なし、インストールなし。ログインすればすぐ使えます。",
  "landing.step1Title": "Google でログイン",
  "landing.step1Body":
    "どちらの役割も同じアカウント。名前とアイコンは Google プロフィールから。",
  "landing.step2Title": "概要を送る",
  "landing.step2Body":
    "題名、撮影者のメール、キャラクター、日時、場所、そしてメモ。",
  "landing.step3Title": "場所と時間を決める",
  "landing.step3Body":
    "撮影者が受諾すると、地図とカレンダーつきで「撮影決定」に進みます。",
  "landing.step4Title": "写真を受け取る",
  "landing.step4Body":
    "最初のアップロードで納品となり通知が届きます。ギャラリーは依頼に残ります。",

  "landing.ctaTitle": "次の撮影は、グループチャットより良い場所で。",
  "landing.ctaBody":
    "まずはログインから。最初の依頼は 1 分ほどで作れます。",
  "landing.ctaButton": "依頼を作る",
  "landing.ctaNote": "カード不要。設定不要。撮影だけ。",

  "landing.footerTagline":
    "Shikanime Studio によるコスプレ撮影依頼プランナー。",
  "landing.footerProduct": "プロダクト",
  "landing.footerBuilt": "使用技術",
  "landing.footerDocs": "ドキュメント",
  "landing.footerRights": "© {year} Shikanime Studio",
  "landing.footerStatus": "Cloudflare Workers で稼働",

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
};

export const MESSAGES: Record<LanguageCode, Record<MessageKey, string>> = {
  en,
  fr,
  ja,
};
