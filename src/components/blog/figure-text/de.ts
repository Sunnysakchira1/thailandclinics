import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const de = (f: Fmt): FigureDict => ({
  inShort: "Kurz gesagt",
  figures: {
    "ivf-prices": {
      title: "Veröffentlichte IVF/ICSI-Paketpreise in Bangkok, Oktober 2026",
      caption: "Quelle: die eigenen veröffentlichten Preise der Anbieter, geprüft am 14. Oktober 2026. Jetanin und Bumrungrad veröffentlichen keinen Paketpreis. Die Pakete enthalten Unterschiedliches, vergleichen Sie also aufgeschlüsselte Angebote, nicht die Werbepreise.",
      notes: [
        "4 ICSI-Pakete",
        "IVF/ICSI, nur für Einwohner",
        "ICSI-Paket",
        "Paket A für anreisende Patienten",
        "Paket B, mit PGT-A + Einfrieren",
      ],
    },
    "surgery-prices": {
      title: "Veröffentlichte Preise für Schönheitsoperationen in Bangkok, Oktober 2026",
      caption: "Quelle: veröffentlichte Preise von Bangkok Hospital und Yanhee, geprüft am 14. Oktober 2026. Der Preis des Bangkok Hospital für eine Brustvergrößerung gilt ohne Implantate; bei Yanhee ist das genannte Implantat enthalten. Bumrungrad und Kamol veröffentlichen keine Preise.",
      notes: [
        "Nasenkorrektur, von Implantat bis Rippenknorpel",
        "Nasenkorrektur, von lokaler Betäubung bis Septumkorrektur",
        "Brustvergrößerung, inkl. Implantat",
        "Brustvergrößerung, ohne Implantat",
        "Lidstraffung, Ober- oder Unterlid",
        "Lidstraffung, Ober- oder Unterlid",
      ],
    },
    "physio-prices": {
      title: "Veröffentlichte Preise pro Physiotherapie-Sitzung in Bangkok, Oktober 2026",
      caption: "Quelle: die eigene Preisliste jeder Praxis, geprüft am 14. Oktober 2026. Die Krankenhäuser (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) veröffentlichen keinen Preis pro Sitzung.",
      notes: ["pro Sitzung", "60 bis 120 Min.", "60 bis 120 Min."],
    },
    "hospital-vs-centre": {
      title: "Spezialisiertes Kinderwunschzentrum oder Zentrum im Krankenhaus?",
      caption: "Redaktionelle Zusammenfassung von ThailandClinics, Oktober 2026. Fragen Sie Ihren eigenen Arzt, ob Ihre Krankengeschichte die Absicherung durch ein Krankenhaus erfordert.",
      cols: [
        { tag: "Spezialisiertes Zentrum", points: [
          "Macht ausschließlich Reproduktionsmedizin",
          "Laborkapazität ganz auf IVF ausgerichtet",
          "Meist der niedrigere Paketpreis",
          "Ein kleineres Team, das Ihren Fall kennt",
        ], foot: "Passt für die meisten gesunden Patientinnen" },
        { tag: "Zentrum im Krankenhaus", points: [
          "Alle anderen Fachrichtungen im selben Gebäude",
          "Intensivstation vor Ort",
          "Krankenhauspreise",
          "Geeignet bei komplexer Krankengeschichte",
        ], foot: "Passt bei weiteren Erkrankungen oder erhöhtem OHSS-Risiko" },
      ],
    },
    "like-for-like-quote": {
      title: "Lassen Sie jeden Anbieter denselben Zyklus anbieten",
      caption: "Eine identische Anfrage macht die Werbepreise vergleichbar. Schicken Sie sie an jeden Anbieter auf Ihrer engeren Auswahl.",
      steps: [
        { title: "Stimulation", body: "Inklusive Medikamente, mit genannter Dosisobergrenze" },
        { title: "Eizellentnahme + ICSI", body: "Narkose und Embryokultur bis Tag 5" },
        { title: "PGT-A", body: "Preis für bis zu 4 Embryonen, inklusive Biopsie" },
        { title: "Einfrieren + Lagerung", body: "Alle Embryonen, erstes Jahr der Lagerung" },
        { title: "Kryotransfer", body: "Vorbereitung der Gebärmutterschleimhaut und ein Transfer" },
        { title: "Ausschlüsse", body: "Alles, was nicht enthalten ist, schriftlich" },
      ],
    },
    "pgt-types": {
      title: "Die drei Arten der PGT",
      caption: "PGT steht für Präimplantationsdiagnostik: ein Labortest an IVF-Embryonen vor dem Transfer. Ob Sie sie brauchen, entscheiden Sie gemeinsam mit Ihrer Kinderwunschärztin oder Ihrem Kinderwunscharzt.",
      cols: [
        { tag: "PGT-A", title: "Aneuploidie", points: [
          "Prüft Embryonen auf eine falsche Anzahl von Chromosomen",
          "Der häufigste Test",
          "Oft empfohlen ab 37 Jahren oder nach wiederholten Fehlgeburten oder erfolglosen Transfers",
        ] },
        { tag: "PGT-M", title: "Monogen", points: [
          "Testet auf eine bekannte Erbkrankheit, z. B. Thalassämie",
          "Das Labor entwickelt meist zuerst einen Test für Ihre Familie",
          "Verlängert den Ablauf um Wochen",
        ] },
        { tag: "PGT-SR", title: "Strukturelle Umlagerung", points: [
          "Wenn ein Partner eine Translokation oder Inversion trägt",
          "Von weniger Kliniken angeboten",
          "In Bangkok: MedPark und VFC führen sie auf",
        ] },
      ],
    },
    "pgt-timeline": {
      title: "So läuft ein PGT-Zyklus ab",
      caption: "Typischer Ablauf. Die Zeiten hängen von Klinik und Test ab: PGT-M kann länger dauern.",
      steps: [
        { title: "IVF + Eizellentnahme", body: "Stimulation, dann werden Eizellen entnommen und befruchtet" },
        { title: "Kultur bis Tag 5–6", body: "Die Embryonen wachsen bis zum Blastozystenstadium" },
        { title: "Biopsie", body: "Jedem Embryo werden einige äußere Zellen entnommen" },
        { title: "Einfrieren", body: "Jeder biopsierte Embryo wird eingefroren" },
        { title: "Testergebnisse", body: "Meist nach 1–3 Wochen" },
        { title: "Kryotransfer", body: "In einem späteren Zyklus, mit einem getesteten Embryo" },
      ],
    },
    "pgt-checklist": {
      title: "Die 7-Punkte-PGT-Checkliste von ThailandClinics",
      caption: "Stellen Sie jeder Klinik dieselben sieben Fragen und lassen Sie sich die Antworten schriftlich geben.",
      steps: [
        { title: "PGT-Arten", body: "Bietet sie den Test an, den Sie brauchen?" },
        { title: "Wo getestet wird", body: "Eigenes Labor oder externer Versand?" },
        { title: "Das Labor", body: "Time-Lapse, Witnessing, ISO 15189, ESHRE" },
        { title: "Die Biopsie", body: "Wer führt sie durch, und wie oft?" },
        { title: "Preis pro Embryo", body: "Biopsie, Test, Einfrieren, Lagerung" },
        { title: "Erfolgsdaten", body: "Lebendgeburten pro Transfer eines PGT-getesteten Embryos, nach Alter" },
        { title: "Thailändisches Recht", body: "Keine Geschlechtswahl; nur aus medizinischen Gründen" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "Schönheitsklinik oder allgemeines Krankenhaus?",
      caption: "Redaktionelle Zusammenfassung von ThailandClinics, Oktober 2026. Prüfen Sie bei jeder Operation unter Vollnarkose, ob die Einrichtung für Operationen zugelassen ist.",
      cols: [
        { tag: "Krankenhaus für Schönheitschirurgie", points: [
          "Schönheitsoperationen jeden Tag", "Meist niedrigere Preise", "Namentlich genannte Chirurgen zur Auswahl", "Weniger andere Fachrichtungen vor Ort",
        ], foot: "Passt für gesunde Patienten, die nach Preis oder Chirurg wählen" },
        { tag: "Allgemeines Privatkrankenhaus", points: [
          "Alle Fachrichtungen und Intensivstation vor Ort", "Veröffentlichte Pakete (Bangkok Hospital)", "Höhere Preise", "Geeignet bei komplexer Krankengeschichte",
        ], foot: "Passt für Patienten mit anderen Erkrankungen" },
      ],
    },
    "surgery-quote": {
      title: "Lassen Sie jedes Krankenhaus dieselbe Operation anbieten",
      caption: "Eine identische Anfrage macht Angebote für Schönheitsoperationen vergleichbar.",
      steps: [
        { title: "Chirurg", body: "Vollständiger Name und Zulassungsnummer beim Medical Council" },
        { title: "Technik", body: "Welcher Eingriff genau, offen oder geschlossen" },
        { title: "Implantat", body: "Marke, Größe und Typ, im Preis enthalten" },
        { title: "Klinikaufenthalt", body: "Enthaltene Nächte und die Zimmerkategorie" },
        { title: "Nachsorge", body: "Kontrollen, Fädenziehen, Kompressionswäsche" },
        { title: "Komplikationen", body: "Wer zahlt für eine Korrektur oder Wiederaufnahme" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "Der 6-Punkte-Sicherheitscheck für Ästhetik von ThailandClinics",
      caption: "Prüfen Sie alle sechs Punkte vor jedem Botox- oder Filler-Termin in Bangkok.",
      steps: [
        { title: "Lizenz der Klinik", body: "11-stellige Nummer am Schild, Urkunde in der Klinik" },
        { title: "Lizenz des Arztes", body: "Vollständiger Name, beim Medical Council geprüft" },
        { title: "Registrierung bei der Thai FDA", body: "Toxin-Nummern beginnen mit \"1C\"" },
        { title: "Versiegelte Ampulle", body: "Vor Ihren Augen geöffnet; fotografieren Sie das Etikett" },
        { title: "Realistischer Preis", body: "Nicht weit unter dem aller lizenzierten Kliniken" },
        { title: "Nachsorgeplan", body: "Wen Sie anrufen, wenn etwas schiefgeht" },
      ],
    },
    "vial-check": {
      title: "Was Sie auf Packung und Ampulle prüfen sollten",
      caption: "Lassen Sie sich das Produkt vor Behandlungsbeginn zeigen. Eine lizenzierte Klinik hat damit kein Problem.",
      steps: [
        { title: "Versiegelt", body: "Ungeöffnete Packung und Ampulle, vor Ihren Augen geöffnet" },
        { title: "Marke", body: "Entspricht der Marke aus dem Angebot" },
        { title: "Thailändische Registrierung", body: "Registriernummer auf der Packung, z. B. 1C …" },
        { title: "Charge + Verfallsdatum", body: "Chargennummer und ein Verfallsdatum in der Zukunft" },
        { title: "Nachschlagen", body: "Suchen Sie die Marke in der Produktsuche der Thai FDA" },
      ],
    },
    "aesthetic-red-flags": {
      title: "Warnsignale in einer Ästhetikklinik",
      caption: "Jedes davon kam in thailändischen Verfahren der Behörden vor. Eines reicht, um zu gehen.",
      cols: [
        { tag: "Der Ort", title: "Falscher Rahmen", points: [
          "Behandlung in einer Wohnung, einem Privathaus, Hotelzimmer oder Salon", "Keine Lizenznummer am Schild", "Buchung nur über Nachrichten in sozialen Medien",
        ] },
        { tag: "Die Person", title: "Falscher Behandler", points: [
          "Nennt keinen vollständigen Namen und keine Lizenznummer", "In der Werbung nur ein Spitzname", "Eine Kosmetikerin oder Pflegekraft spritzt allein",
        ] },
        { tag: "Das Produkt", title: "Falsches Produkt", points: [
          "Zeigt Ihnen die versiegelte Ampulle nicht", "Marke nicht in der Datenbank der Thai FDA", "Ein Preis weit unter dem aller lizenzierten Kliniken",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "Physiotherapiepraxis oder Reha-Zentrum im Krankenhaus?",
      caption: "Redaktionelle Zusammenfassung von ThailandClinics, Oktober 2026. Folgen Sie nach einer Operation dem Rat Ihres Chirurgen, wo Sie Ihre Reha machen.",
      cols: [
        { tag: "Spezialisierte Physiotherapiepraxis", points: [
          "Veröffentlichte Preise pro Sitzung", "Sitzungen ab 60 Minuten", "Meist bei jedem Termin dieselbe Therapeutin oder derselbe Therapeut", "Keine Überweisung nötig",
        ], foot: "Passt bei Rücken, Nacken, Sportverletzungen und den meisten Reha-Fällen nach OPs" },
        { tag: "Reha-Zentrum im Krankenhaus", points: [
          "Rehabilitationsärzte vor Ort", "Robotergestütztes Gangtraining, Hydrotherapie", "Krankenhauspreise, oft plus Arzthonorar", "Unter Umständen zuerst ein Arzttermin nötig",
        ], foot: "Passt bei Schlaganfall, Rückenmarksverletzung und komplexen Operationen" },
      ],
    },
    "physio-first-visit": {
      title: "Was Sie zur ersten Physiotherapie-Sitzung mitbringen sollten",
      caption: "Das spart eine Sitzung und hilft Ihrer Physiotherapeutin oder Ihrem Physiotherapeuten bei der Planung.",
      steps: [
        { title: "Ihre Vorgeschichte", body: "Wann es anfing, was es besser oder schlimmer macht" },
        { title: "Bilder + Befunde", body: "MRT-, Röntgen- oder Ultraschallbefunde, falls vorhanden" },
        { title: "OP-Unterlagen", body: "OP-Bericht und das Protokoll Ihres Chirurgen" },
        { title: "Ihr Ziel", body: "Wieder laufen, schlafen, Ihr Kind hochheben" },
        { title: "Kleidung", body: "Shorts oder lockere Kleidung, in der Sie sich bewegen können" },
      ],
    },
    "postop-checklist": {
      title: "Der 6-Punkte-Reha-Check von ThailandClinics nach einer Operation",
      caption: "Stellen Sie jedem Reha-Anbieter vor der ersten Sitzung dieselben sechs Fragen.",
      steps: [
        { title: "Zugelassene Physiotherapie", body: "Zulassung des Physical Therapy Council" },
        { title: "Protokoll des Chirurgen", body: "Wird befolgt, bei Bedarf mit Rücksprache" },
        { title: "Plan in Phasen", body: "Meilensteine für den Wechsel in jede Phase" },
        { title: "Ausstattung", body: "Trainingsraum, Becken oder Krafttests nach Bedarf" },
        { title: "Terminplan", body: "Besuche pro Phase, dazu Übungen für zu Hause" },
        { title: "Klarer Preis", body: "Pro Sitzung, Pakete, Erstattungen" },
      ],
    },
    "surgeon-handover": {
      title: "Was Ihre Reha-Praxis von Ihrem Chirurgen braucht",
      caption: "Bitten Sie das Team Ihres Chirurgen um diese Unterlagen, bevor Sie das Krankenhaus verlassen.",
      steps: [
        { title: "OP-Bericht", body: "Was gemacht wurde, und das verwendete Transplantat oder Implantat" },
        { title: "Belastung", body: "Wie stark das Bein belastet werden darf, und ab wann" },
        { title: "Bewegungsgrenzen", body: "Grenzen des Bewegungsumfangs und Vorsichtsmaßnahmen" },
        { title: "Orthese oder Hilfsmittel", body: "Einstellungen der Orthese, Gehstützen, wie lange" },
        { title: "Kontrolltermine", body: "Wann Sie den Chirurgen wiedersehen" },
      ],
    },
    "rehab-milestones": {
      title: "Typische Meilensteine der Genesung nach einer Operation",
      caption: "Quellen: AAOS OrthoInfo und Patienteninformationen des NHS. Nur typische Spannen; Ihren eigenen Zeitplan legen Ihr Chirurg und Ihre Physiotherapeutin oder Ihr Physiotherapeut fest.",
      cols: [
        { tag: "Kreuzbandplastik", title: "6–12 Monate bis zum Sport", points: [
          "Physiotherapie beginnt direkt nach der Operation", "Die Rückkehr zum Sport hängt von bestandenen Kraft- und Funktionstests ab", "Nicht allein von der Zeit",
        ] },
        { tag: "Knieprothese", title: "Mehrere Monate", points: [
          "Alltagsaktivitäten nach etwa 3–6 Wochen (AAOS)", "Gehen ohne Hilfsmittel nach etwa 6 Wochen (NHS)", "Die vollständige Genesung kann mehrere Monate oder länger dauern",
        ] },
        { tag: "Hüftprothese", title: "Mehrere Monate", points: [
          "Leichte Aktivitäten nach etwa 3–6 Wochen (AAOS)", "Bewegungseinschränkungen etwa in den ersten 6 Wochen", "Die vollständige Genesung dauert mehrere Monate (NHS)",
        ] },
      ],
    },
    "meditation-costs": {
      title: "Veröffentlichte Kosten für Meditations- und Heilkurse in Bangkok, Oktober 2026",
      caption: "Quelle: die eigenen veröffentlichten Preise der Zentren, geprüft am 20. Oktober 2026. Wat Mahathat Section 5 finanziert sich über Spenden; die Buddhadasa Indapanno Archives veröffentlichen keine Kosten. Die Gebühr bei Saksit umfasst Buch, Zertifikat und Mittagessen.",
      notes: [
        "offene Gruppe, empfohlene Spende",
        "1-tägiger Vipassana-Schnupperkurs",
        "2-tägiger Einführungskurs",
        "2-tägiges Pranic Healing Level 1, alles inklusive",
      ],
    },
    "meditation-vs-healing": {
      title: "Tempelmeditation, offene Gruppe oder Heilkurs?",
      caption: "Redaktionelle Zusammenfassung von ThailandClinics, Oktober 2026. Alle drei sind ergänzende Praktiken, keine medizinische Behandlung.",
      cols: [
        { tag: "Tempelmeditation", points: [
          "Vipassana und Achtsamkeit", "Auf Spendenbasis", "Kleiderordnung gilt", "Englisch nur an bestimmten Tagen",
        ], foot: "Passt für Einsteiger und Reisende" },
        { tag: "Offene Gruppe", points: [
          "Wöchentliche Sitzungen oder Einzelunterricht", "Unterricht auf Englisch", `Spende bis ${f.baht(P.houseOfDhammaTwoDayTo)}`, "Bei House of Dhamma vorab buchen",
        ], foot: "Passt für Expats, die eine Routine aufbauen" },
        { tag: "Heilkurs", points: [
          "Pranic Healing in Stufen", "Zertifikat für jeden Kurs", `Veröffentlichte Einstiegsgebühr von ${f.num(P.saksitLevel1)} Baht`, "Voraussetzungen für spätere Stufen",
        ], foot: "Passt für alle, die eine Praxis erlernen möchten" },
      ],
    },
    "meditation-before-you-go": {
      title: "Prüfen Sie diese fünf Dinge, bevor Sie hingehen",
      caption: "Die Zeiten der Tempel ändern sich rund um buddhistische Feiertage. Bestätigen Sie sie vor der Anreise per Telefon oder E-Mail.",
      steps: [
        { title: "Sprache", body: "Wird diese Sitzung auf Englisch gehalten?" },
        { title: "Zeiten", body: "Die heutigen Zeiten, nicht die vom letzten Jahr" },
        { title: "Anmeldung", body: "Einfach kommen, anmelden oder Anzahlung leisten" },
        { title: "Kosten", body: "Spende, Gebühr und was sie abdeckt" },
        { title: "Kleiderordnung", body: "Schultern und Knie bedeckt" },
      ],
    },
  },
});

export default de;
