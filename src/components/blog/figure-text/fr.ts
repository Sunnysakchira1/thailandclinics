import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const fr = (f: Fmt): FigureDict => ({
  inShort: "En bref",
  figures: {
    "ivf-prices": {
      title: "Tarifs publiés des forfaits FIV/ICSI à Bangkok, octobre 2026",
      caption: "Source : le tarif publié par chaque établissement, vérifié le 14 octobre 2026. Jetanin et Bumrungrad ne publient aucun prix de forfait. Les forfaits n'incluent pas les mêmes prestations : comparez des devis détaillés, pas les prix d'appel.",
      notes: [
        "4 forfaits ICSI",
        "FIV/ICSI, résidents uniquement",
        "forfait ICSI",
        "forfait A pour patients venant de l'étranger",
        "forfait B, avec PGT-A + congélation",
      ],
    },
    "surgery-prices": {
      title: "Tarifs publiés de chirurgie esthétique à Bangkok, octobre 2026",
      caption: "Source : tarifs publiés par Bangkok Hospital et Yanhee, vérifiés le 14 octobre 2026. Le prix de l'augmentation mammaire de Bangkok Hospital n'inclut pas les implants ; celui de Yanhee inclut l'implant indiqué. Bumrungrad et Kamol ne publient aucun prix.",
      notes: [
        "rhinoplastie, de l'implant à la greffe de cartilage costal",
        "rhinoplastie, de l'anesthésie locale à la septoplastie",
        "augmentation mammaire, implant compris",
        "augmentation mammaire, hors implant",
        "chirurgie des paupières, supérieures ou inférieures",
        "chirurgie des paupières, supérieures ou inférieures",
      ],
    },
    "physio-prices": {
      title: "Tarifs publiés des séances de kinésithérapie à Bangkok, octobre 2026",
      caption: "Source : la grille tarifaire de chaque cabinet, vérifiée le 14 octobre 2026. Les hôpitaux (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) ne publient aucun prix par séance.",
      notes: ["par séance", "60 à 120 min", "60 à 120 min"],
    },
    "hospital-vs-centre": {
      title: "Centre de fertilité spécialisé ou centre hospitalier ?",
      caption: "Synthèse de la rédaction de ThailandClinics, octobre 2026. Demandez à votre médecin si vos antécédents médicaux justifient l'appui d'un hôpital.",
      cols: [
        { tag: "Centre spécialisé", points: [
          "Ne fait que de la médecine de la reproduction",
          "Activité du laboratoire concentrée sur la FIV",
          "Forfait généralement moins cher",
          "Une équipe plus petite qui connaît votre dossier",
        ], foot: "Convient à la plupart des patientes en bonne santé" },
        { tag: "Centre hospitalier", points: [
          "Toutes les autres spécialités dans le même bâtiment",
          "Soins intensifs sur place",
          "Tarifs hospitaliers",
          "Adapté aux antécédents médicaux complexes",
        ], foot: "Convient en cas d'autres pathologies ou de risque accru de SHO" },
      ],
    },
    "like-for-like-quote": {
      title: "Demandez à chaque établissement un devis pour le même cycle",
      caption: "Une demande identique rend les prix d'appel comparables. Envoyez-la à chaque établissement de votre liste.",
      steps: [
        { title: "Stimulation", body: "Médicaments compris, avec le plafond de dose indiqué" },
        { title: "Ponction ovocytaire + ICSI", body: "Anesthésie et culture des embryons jusqu'au jour 5" },
        { title: "PGT-A", body: "Prix pour 4 embryons maximum, biopsie comprise" },
        { title: "Congélation + conservation", body: "Tous les embryons, première année de conservation" },
        { title: "Transfert d'embryon congelé", body: "Préparation de l'endomètre et un transfert" },
        { title: "Exclusions", body: "Tout ce qui n'est pas couvert, par écrit" },
      ],
    },
    "pgt-types": {
      title: "Les trois types de PGT",
      caption: "PGT signifie test génétique préimplantatoire : une analyse en laboratoire des embryons de FIV avant le transfert. C'est à vous et à votre médecin de la fertilité de décider si vous en avez besoin.",
      cols: [
        { tag: "PGT-A", title: "Aneuploïdie", points: [
          "Vérifie si les embryons ont un nombre anormal de chromosomes",
          "Le test le plus courant",
          "Souvent proposé dès 37 ans, ou après des fausses couches à répétition ou des transferts sans succès",
        ] },
        { tag: "PGT-M", title: "Monogénique", points: [
          "Recherche une maladie héréditaire connue, par ex. la thalassémie",
          "Le laboratoire met généralement d'abord au point un test pour votre famille",
          "Ajoute quelques semaines au calendrier",
        ] },
        { tag: "PGT-SR", title: "Remaniement structurel", points: [
          "Quand un partenaire est porteur d'une translocation ou d'une inversion",
          "Proposé par moins de cliniques",
          "À Bangkok : MedPark et VFC l'indiquent",
        ] },
      ],
    },
    "pgt-timeline": {
      title: "Comment se déroule un cycle avec PGT",
      caption: "Déroulement type. Les délais varient selon la clinique et le test : le PGT-M peut prendre plus de temps.",
      steps: [
        { title: "FIV + ponction ovocytaire", body: "Stimulation, puis recueil et fécondation des ovocytes" },
        { title: "Culture jusqu'au jour 5–6", body: "Les embryons se développent jusqu'au stade blastocyste" },
        { title: "Biopsie", body: "Quelques cellules externes sont prélevées sur chaque embryon" },
        { title: "Congélation", body: "Chaque embryon biopsié est congelé" },
        { title: "Résultats", body: "En général sous 1–3 semaines" },
        { title: "Transfert d'embryon congelé", body: "Lors d'un cycle ultérieur, avec un embryon testé" },
      ],
    },
    "pgt-checklist": {
      title: "La check-list PGT en 7 points de ThailandClinics",
      caption: "Posez les sept mêmes questions à chaque clinique et demandez les réponses par écrit.",
      steps: [
        { title: "Types de PGT", body: "Propose-t-elle le test dont vous avez besoin ?" },
        { title: "Lieu d'analyse", body: "Laboratoire interne ou envoi à l'extérieur ?" },
        { title: "Le laboratoire", body: "Time-lapse, double vérification, ISO 15189, ESHRE" },
        { title: "La biopsie", body: "Qui la réalise, et à quelle fréquence ?" },
        { title: "Prix par embryon", body: "Biopsie, test, congélation, conservation" },
        { title: "Résultats chiffrés", body: "Naissances vivantes par transfert d'embryon testé par PGT, selon l'âge" },
        { title: "Loi thaïlandaise", body: "Pas de choix du sexe ; usage médical uniquement" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "Hôpital de chirurgie esthétique ou hôpital général ?",
      caption: "Synthèse de la rédaction de ThailandClinics, octobre 2026. Pour toute opération sous anesthésie générale, vérifiez que l'établissement est autorisé à pratiquer la chirurgie.",
      cols: [
        { tag: "Hôpital de chirurgie esthétique", points: [
          "Des opérations esthétiques tous les jours", "Prix généralement plus bas", "Chirurgiens nommés au choix", "Moins d'autres spécialités sur place",
        ], foot: "Convient aux patients en bonne santé qui choisissent selon le prix ou le chirurgien" },
        { tag: "Hôpital privé généraliste", points: [
          "Toutes les spécialités et soins intensifs sur place", "Forfaits publiés (Bangkok Hospital)", "Prix plus élevés", "Adapté aux antécédents médicaux complexes",
        ], foot: "Convient aux patients ayant d'autres problèmes de santé" },
      ],
    },
    "surgery-quote": {
      title: "Demandez à chaque hôpital un devis pour la même opération",
      caption: "Une demande identique rend les devis de chirurgie esthétique comparables.",
      steps: [
        { title: "Chirurgien", body: "Nom complet et numéro de licence du Medical Council" },
        { title: "Technique", body: "Quelle intervention exactement, ouverte ou fermée" },
        { title: "Implant", body: "Marque, taille et type, inclus dans le prix" },
        { title: "Hospitalisation", body: "Nuits incluses et type de chambre" },
        { title: "Suivi", body: "Contrôles, retrait des fils, vêtements de compression" },
        { title: "Complications", body: "Qui paie une reprise ou une réhospitalisation" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "Le contrôle de sécurité esthétique en 6 points de ThailandClinics",
      caption: "Faites les six vérifications avant tout rendez-vous de Botox ou d'injection de filler à Bangkok.",
      steps: [
        { title: "Licence de la clinique", body: "Numéro à 11 chiffres sur l'enseigne, certificat à l'intérieur" },
        { title: "Licence du médecin", body: "Nom complet, vérifié auprès du Medical Council" },
        { title: "Enregistrement auprès de la FDA thaïlandaise", body: "Les numéros des toxines commencent par \"1C\"" },
        { title: "Flacon scellé", body: "Ouvert devant vous ; photographiez l'étiquette" },
        { title: "Prix réaliste", body: "Pas très en dessous de toutes les cliniques agréées" },
        { title: "Suivi après l'injection", body: "Qui appeler en cas de problème" },
      ],
    },
    "vial-check": {
      title: "Ce qu'il faut vérifier sur la boîte et le flacon",
      caption: "Demandez à voir le produit avant le début du soin. Une clinique agréée n'y verra aucun inconvénient.",
      steps: [
        { title: "Scellé", body: "Boîte et flacon intacts, ouverts devant vous" },
        { title: "Marque", body: "Correspond à la marque du devis" },
        { title: "Enregistrement thaïlandais", body: "Numéro d'enregistrement sur la boîte, par ex. 1C …" },
        { title: "Lot + péremption", body: "Numéro de lot et date de péremption à venir" },
        { title: "Vérification", body: "Cherchez la marque dans la base produits de la FDA thaïlandaise" },
      ],
    },
    "aesthetic-red-flags": {
      title: "Signaux d'alerte dans une clinique esthétique",
      caption: "Chacun de ces signaux est apparu dans des affaires traitées par les autorités thaïlandaises. Un seul suffit pour partir.",
      cols: [
        { tag: "Le lieu", title: "Mauvais cadre", points: [
          "Soin dans un appartement, un domicile, une chambre d'hôtel ou un salon", "Aucun numéro de licence sur l'enseigne", "Réservation uniquement par messages sur les réseaux sociaux",
        ] },
        { tag: "La personne", title: "Mauvais injecteur", points: [
          "Refuse de donner son nom complet ou son numéro de licence", "Seulement un surnom dans les publicités", "Une esthéticienne ou une infirmière qui injecte seule",
        ] },
        { tag: "Le produit", title: "Mauvais produit", points: [
          "Refuse de vous montrer le flacon scellé", "Marque absente de la base de la FDA thaïlandaise", "Un prix très en dessous de toutes les cliniques agréées",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "Cabinet de kinésithérapie ou centre de rééducation hospitalier ?",
      caption: "Synthèse de la rédaction de ThailandClinics, octobre 2026. Après une opération, suivez l'avis de votre chirurgien sur le lieu de votre rééducation.",
      cols: [
        { tag: "Cabinet de kinésithérapie spécialisé", points: [
          "Prix par séance publiés", "Séances de 60 minutes ou plus", "En général le même kinésithérapeute à chaque séance", "Pas besoin d'ordonnance",
        ], foot: "Convient au dos, à la nuque, aux blessures sportives et à la plupart des rééducations postopératoires" },
        { tag: "Centre de rééducation hospitalier", points: [
          "Médecins de médecine physique et de réadaptation sur place", "Rééducation de la marche assistée par robot, balnéothérapie", "Tarifs hospitaliers, souvent avec des honoraires médicaux en plus", "Une consultation médicale peut être nécessaire d'abord",
        ], foot: "Convient après un AVC, une lésion de la moelle épinière ou une chirurgie complexe" },
      ],
    },
    "physio-first-visit": {
      title: "Quoi apporter à votre première séance de kiné",
      caption: "Les apporter vous fait gagner une séance et aide votre kinésithérapeute à planifier.",
      steps: [
        { title: "Votre histoire", body: "Quand cela a commencé, ce qui soulage ou aggrave" },
        { title: "Imagerie + comptes rendus", body: "Comptes rendus d'IRM, de radio ou d'échographie, si vous en avez" },
        { title: "Documents opératoires", body: "Compte rendu opératoire et protocole de votre chirurgien" },
        { title: "Votre objectif", body: "Reprendre la course, bien dormir, porter votre enfant" },
        { title: "Tenue", body: "Short ou vêtements amples pour bouger" },
      ],
    },
    "postop-checklist": {
      title: "Le contrôle en 6 points de ThailandClinics pour la rééducation postopératoire",
      caption: "Posez les six mêmes questions à chaque centre de rééducation avant votre première séance.",
      steps: [
        { title: "Kiné diplômé", body: "Licence du Physical Therapy Council" },
        { title: "Protocole du chirurgien", body: "Respecté, avec contact si besoin" },
        { title: "Plan par phases", body: "Critères pour passer à chaque phase" },
        { title: "Équipement", body: "Salle de sport, piscine ou tests de force selon les besoins" },
        { title: "Calendrier", body: "Séances par phase, plus exercices à domicile" },
        { title: "Prix clair", body: "Par séance, forfaits, remboursements" },
      ],
    },
    "surgeon-handover": {
      title: "Ce dont votre centre de rééducation a besoin de votre chirurgien",
      caption: "Demandez ces éléments à l'équipe de votre chirurgien avant de quitter l'hôpital.",
      steps: [
        { title: "Compte rendu opératoire", body: "Ce qui a été fait, et la greffe ou l'implant utilisé" },
        { title: "Appui", body: "Quelle charge la jambe peut supporter, et à partir de quand" },
        { title: "Limites de mouvement", body: "Limites d'amplitude articulaire et précautions" },
        { title: "Attelle ou aides", body: "Réglages de l'attelle, béquilles, pendant combien de temps" },
        { title: "Dates de contrôle", body: "Quand vous revoyez le chirurgien" },
      ],
    },
    "rehab-milestones": {
      title: "Étapes de récupération habituelles après une opération",
      caption: "Sources : AAOS OrthoInfo et informations patients du NHS. Fourchettes habituelles uniquement ; votre chirurgien et votre kinésithérapeute fixent votre propre calendrier.",
      cols: [
        { tag: "Reconstruction du LCA", title: "6–12 mois avant le sport", points: [
          "La kiné commence dès l'opération", "Le retour au sport dépend de la réussite aux tests de force et de fonction", "Pas du seul temps écoulé",
        ] },
        { tag: "Prothèse de genou", title: "Plusieurs mois", points: [
          "Activités quotidiennes après environ 3–6 semaines (AAOS)", "Marche sans aide après environ 6 semaines (NHS)", "La récupération complète peut prendre plusieurs mois ou plus",
        ] },
        { tag: "Prothèse de hanche", title: "Plusieurs mois", points: [
          "Activités légères après environ 3–6 semaines (AAOS)", "Précautions de mouvement pendant environ les 6 premières semaines", "La récupération complète prend plusieurs mois (NHS)",
        ] },
      ],
    },
    "meditation-costs": {
      title: "Tarifs publiés des cours de méditation et de soins énergétiques à Bangkok, octobre 2026",
      caption: "Source : le tarif publié par chaque centre, vérifié le 20 octobre 2026. Wat Mahathat Section 5 fonctionne sur la base de dons ; les Buddhadasa Indapanno Archives ne publient aucun tarif. Le prix de Saksit comprend le livre, le certificat et le déjeuner.",
      notes: [
        "séance libre, don suggéré",
        "initiation au vipassana sur 1 jour",
        "cours d'introduction sur 2 jours",
        "Pranic Healing niveau 1 sur 2 jours, tout compris",
      ],
    },
    "meditation-vs-healing": {
      title: "Méditation au temple, groupe ouvert ou cours de soins énergétiques ?",
      caption: "Synthèse de la rédaction de ThailandClinics, octobre 2026. Ces trois options sont des pratiques complémentaires, pas des traitements médicaux.",
      cols: [
        { tag: "Méditation au temple", points: [
          "Vipassana et pleine conscience", "Sur la base de dons", "Code vestimentaire exigé", "Anglais certains jours seulement",
        ], foot: "Convient aux débutants et aux voyageurs" },
        { tag: "Groupe ouvert", points: [
          "Séances hebdomadaires ou cours particuliers", "Enseigné en anglais", `Du don libre à ${f.baht(P.houseOfDhammaTwoDayTo)}`, "Réservation à l'avance chez House of Dhamma",
        ], foot: "Convient aux expatriés qui veulent prendre une habitude" },
        { tag: "Cours de soins énergétiques", points: [
          "Pranic Healing par niveaux", "Certificat pour chaque cours", `Prix d'entrée publié de ${f.num(P.saksitLevel1)} bahts`, "Prérequis pour les niveaux suivants",
        ], foot: "Convient à ceux qui veulent apprendre une pratique" },
      ],
    },
    "meditation-before-you-go": {
      title: "Vérifiez ces cinq points avant d'y aller",
      caption: "Les horaires des temples changent autour des fêtes bouddhistes. Confirmez par téléphone ou par e-mail avant de vous déplacer.",
      steps: [
        { title: "Langue", body: "Cette séance est-elle donnée en anglais ?" },
        { title: "Horaires", body: "Ceux d'aujourd'hui, pas ceux de l'an dernier" },
        { title: "Réservation", body: "Sans réservation, inscription ou acompte" },
        { title: "Coût", body: "Don, tarif et ce qu'il couvre" },
        { title: "Code vestimentaire", body: "Épaules et genoux couverts" },
      ],
    },
  },
});

export default fr;
