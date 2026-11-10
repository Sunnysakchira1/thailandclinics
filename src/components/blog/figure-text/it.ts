import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const it = (f: Fmt): FigureDict => ({
  inShort: "In breve",
  figures: {
    "ivf-prices": {
      title: "Prezzi pubblicati dei pacchetti FIVET/ICSI a Bangkok, ottobre 2026",
      caption: "Fonte: il prezzo pubblicato da ciascuna struttura, verificato il 14 ottobre 2026. Jetanin e Bumrungrad non pubblicano un prezzo a pacchetto. I pacchetti includono cose diverse, quindi confronta preventivi dettagliati, non i prezzi di richiamo.",
      notes: [
        "4 pacchetti ICSI",
        "FIVET/ICSI, solo residenti",
        "pacchetto ICSI",
        "pacchetto A per chi arriva dall'estero",
        "pacchetto B, con PGT-A + congelamento",
      ],
    },
    "surgery-prices": {
      title: "Prezzi pubblicati della chirurgia estetica a Bangkok, ottobre 2026",
      caption: "Fonte: prezzi pubblicati da Bangkok Hospital e Yanhee, verificati il 14 ottobre 2026. Il prezzo della mastoplastica additiva di Bangkok Hospital esclude le protesi; quello di Yanhee include la protesi indicata. Bumrungrad e Kamol non pubblicano prezzi.",
      notes: [
        "rinoplastica, da protesi a innesto di cartilagine costale",
        "rinoplastica, da anestesia locale a correzione del setto",
        "mastoplastica additiva, protesi inclusa",
        "mastoplastica additiva, protesi esclusa",
        "blefaroplastica, superiore o inferiore",
        "blefaroplastica, superiore o inferiore",
      ],
    },
    "physio-prices": {
      title: "Prezzi pubblicati per seduta di fisioterapia a Bangkok, ottobre 2026",
      caption: "Fonte: il listino di ciascuna clinica, verificato il 14 ottobre 2026. Gli ospedali (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) non pubblicano un prezzo per seduta.",
      notes: ["a seduta", "da 60 a 120 min", "da 60 a 120 min"],
    },
    "hospital-vs-centre": {
      title: "Centro per la fertilità dedicato o centro ospedaliero?",
      caption: "Sintesi editoriale di ThailandClinics, ottobre 2026. Chiedi al tuo medico se la tua storia clinica richiede il supporto di un ospedale.",
      cols: [
        { tag: "Centro dedicato", points: [
          "Si occupa solo di medicina della riproduzione",
          "Attività del laboratorio concentrata sulla FIVET",
          "Di solito il prezzo del pacchetto è più basso",
          "Un'équipe più piccola che conosce il tuo caso",
        ], foot: "Adatto alla maggior parte delle pazienti in buona salute" },
        { tag: "Centro ospedaliero", points: [
          "Tutte le altre specialità nello stesso edificio",
          "Terapia intensiva in sede",
          "Prezzi da ospedale",
          "Adatto a storie cliniche complesse",
        ], foot: "Adatto a chi ha altre patologie o un rischio di OHSS più alto" },
      ],
    },
    "like-for-like-quote": {
      title: "Chiedi a ogni struttura il preventivo per lo stesso ciclo",
      caption: "Una richiesta identica rende confrontabili i prezzi di richiamo. Inviala a ogni struttura della tua rosa.",
      steps: [
        { title: "Stimolazione", body: "Farmaci inclusi, con il tetto di dose indicato" },
        { title: "Prelievo ovocitario + ICSI", body: "Anestesia e coltura degli embrioni fino al giorno 5" },
        { title: "PGT-A", body: "Prezzo per un massimo di 4 embrioni, biopsia inclusa" },
        { title: "Congelamento + conservazione", body: "Tutti gli embrioni, primo anno di conservazione" },
        { title: "Transfer da congelato", body: "Preparazione dell'endometrio e un transfer" },
        { title: "Esclusioni", body: "Tutto ciò che non è coperto, per iscritto" },
      ],
    },
    "pgt-types": {
      title: "I tre tipi di PGT",
      caption: "PGT significa test genetico preimpianto: un esame di laboratorio sugli embrioni della FIVET prima del transfer. Se ti serve è una decisione da prendere con il tuo medico della fertilità.",
      cols: [
        { tag: "PGT-A", title: "Aneuploidie", points: [
          "Controlla se gli embrioni hanno un numero errato di cromosomi",
          "Il test più comune",
          "Spesso consigliato dai 37 anni, o dopo aborti ripetuti o transfer falliti",
        ] },
        { tag: "PGT-M", title: "Malattie monogeniche", points: [
          "Cerca una specifica malattia ereditaria nota, ad es. la talassemia",
          "Di solito il laboratorio prepara prima un test per la tua famiglia",
          "Allunga i tempi di qualche settimana",
        ] },
        { tag: "PGT-SR", title: "Riarrangiamenti strutturali", points: [
          "Per un partner portatore di una traslocazione o di un'inversione",
          "Offerto da meno cliniche",
          "A Bangkok: MedPark e VFC lo indicano",
        ] },
      ],
    },
    "pgt-timeline": {
      title: "Come si svolge un ciclo con PGT",
      caption: "Sequenza tipica. I tempi variano in base alla clinica e al test: la PGT-M può richiedere di più.",
      steps: [
        { title: "FIVET + prelievo ovocitario", body: "Stimolazione, poi prelievo e fecondazione degli ovociti" },
        { title: "Coltura fino al giorno 5–6", body: "Gli embrioni crescono fino allo stadio di blastocisti" },
        { title: "Biopsia", body: "Si prelevano alcune cellule esterne da ogni embrione" },
        { title: "Congelamento", body: "Ogni embrione biopsiato viene congelato" },
        { title: "Risultati del test", body: "Di solito in 1–3 settimane" },
        { title: "Transfer da congelato", body: "In un ciclo successivo, con un embrione testato" },
      ],
    },
    "pgt-checklist": {
      title: "La checklist PGT in 7 punti di ThailandClinics",
      caption: "Usa gli stessi sette controlli per ogni clinica e chiedi le risposte per iscritto.",
      steps: [
        { title: "Tipi di PGT", body: "Offre il test che ti serve?" },
        { title: "Dove si fa il test", body: "Laboratorio interno o esterno?" },
        { title: "Il laboratorio", body: "Time-lapse, sistema di tracciabilità (witnessing), ISO 15189, ESHRE" },
        { title: "La biopsia", body: "Chi la esegue, e quanto spesso?" },
        { title: "Prezzo per embrione", body: "Biopsia, test, congelamento, conservazione" },
        { title: "Dati di successo", body: "Nati vivi per transfer di embrioni testati con PGT, per età" },
        { title: "Legge thailandese", body: "Niente scelta del sesso; solo uso medico" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "Ospedale di chirurgia estetica od ospedale generale?",
      caption: "Sintesi editoriale di ThailandClinics, ottobre 2026. Per qualsiasi intervento in anestesia generale, verifica che la struttura sia autorizzata alla chirurgia.",
      cols: [
        { tag: "Ospedale di chirurgia estetica", points: [
          "Interventi estetici ogni giorno", "Di solito prezzi più bassi", "Chirurghi indicati per nome tra cui scegliere", "Meno altre specialità in sede",
        ], foot: "Adatto a pazienti in buona salute che scelgono per prezzo o chirurgo" },
        { tag: "Ospedale privato generale", points: [
          "Tutte le specialità e terapia intensiva in sede", "Pacchetti pubblicati (Bangkok Hospital)", "Prezzi più alti", "Adatto a storie cliniche complesse",
        ], foot: "Adatto a pazienti con altre patologie" },
      ],
    },
    "surgery-quote": {
      title: "Chiedi a ogni ospedale il preventivo per lo stesso intervento",
      caption: "Una richiesta identica rende confrontabili i preventivi di chirurgia estetica.",
      steps: [
        { title: "Chirurgo", body: "Nome completo e numero di abilitazione del Medical Council" },
        { title: "Tecnica", body: "Esattamente quale procedura, aperta o chiusa" },
        { title: "Protesi", body: "Marca, misura e tipo, inclusi nel prezzo" },
        { title: "Ricovero", body: "Notti incluse e tipo di camera" },
        { title: "Controlli", body: "Visite di controllo, rimozione dei punti, indumenti compressivi" },
        { title: "Complicanze", body: "Chi paga un intervento di revisione o un nuovo ricovero" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "Il controllo di sicurezza estetica in 6 punti di ThailandClinics",
      caption: "Fai tutti e sei i controlli prima di qualsiasi appuntamento per Botox o filler a Bangkok.",
      steps: [
        { title: "Licenza della clinica", body: "Numero di 11 cifre sull'insegna, certificato all'interno" },
        { title: "Abilitazione del medico", body: "Nome completo, verificato presso il Medical Council" },
        { title: "Registrazione presso la FDA thailandese", body: "I numeri delle tossine iniziano con \"1C\"" },
        { title: "Fiala sigillata", body: "Aperta davanti a te; fotografa l'etichetta" },
        { title: "Prezzo realistico", body: "Non molto più basso di tutte le cliniche autorizzate" },
        { title: "Piano per il dopo", body: "Chi chiami se qualcosa va storto" },
      ],
    },
    "vial-check": {
      title: "Cosa controllare su confezione e fiala",
      caption: "Chiedi di vedere il prodotto prima che inizi il trattamento. A una clinica autorizzata non darà fastidio.",
      steps: [
        { title: "Sigillata", body: "Confezione e fiala integre, aperte davanti a te" },
        { title: "Marca", body: "Corrisponde alla marca del preventivo" },
        { title: "Registrazione thailandese", body: "Numero di registrazione sulla confezione, ad es. 1C …" },
        { title: "Lotto + scadenza", body: "Numero di lotto e una data di scadenza futura" },
        { title: "Verifica", body: "Cerca la marca nella banca dati prodotti della FDA thailandese" },
      ],
    },
    "aesthetic-red-flags": {
      title: "Campanelli d'allarme in una clinica estetica",
      caption: "Ognuno di questi è emerso in casi di controlli delle autorità thailandesi. Ne basta uno per andartene.",
      cols: [
        { tag: "Il luogo", title: "Ambiente sbagliato", points: [
          "Trattamento in un condominio, in casa, in una camera d'albergo o in un salone", "Nessun numero di licenza sull'insegna", "Prenotazione solo tramite messaggi sui social",
        ] },
        { tag: "La persona", title: "Iniettore sbagliato", points: [
          "Non fornisce nome completo né numero di abilitazione", "Solo un soprannome nelle pubblicità", "Un'estetista o un'infermiera che inietta da sola",
        ] },
        { tag: "Il prodotto", title: "Prodotto sbagliato", points: [
          "Non ti mostra la fiala sigillata", "Marca assente dalla banca dati della FDA thailandese", "Un prezzo molto più basso di tutte le cliniche autorizzate",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "Clinica di fisioterapia o centro di riabilitazione ospedaliero?",
      caption: "Sintesi editoriale di ThailandClinics, ottobre 2026. Dopo un intervento, segui il consiglio del tuo chirurgo su dove fare la riabilitazione.",
      cols: [
        { tag: "Clinica di fisioterapia dedicata", points: [
          "Prezzi per seduta pubblicati", "Sedute da 60 minuti in su", "Di solito lo stesso fisioterapista a ogni visita", "Nessuna prescrizione necessaria",
        ], foot: "Adatta per schiena, collo, infortuni sportivi e la maggior parte della riabilitazione post-operatoria" },
        { tag: "Centro di riabilitazione ospedaliero", points: [
          "Medici fisiatri in sede", "Training robotico del cammino, idroterapia", "Prezzi da ospedale, spesso più l'onorario del medico", "Può servire prima una visita medica",
        ], foot: "Adatto per ictus, lesioni spinali e interventi complessi" },
      ],
    },
    "physio-first-visit": {
      title: "Cosa portare alla prima seduta di fisioterapia",
      caption: "Portare queste cose ti fa risparmiare una seduta e aiuta il fisioterapista a pianificare.",
      steps: [
        { title: "La tua storia", body: "Quando è iniziato, cosa lo migliora o lo peggiora" },
        { title: "Esami + referti", body: "Referti di risonanza, radiografia o ecografia, se li hai" },
        { title: "Documenti dell'intervento", body: "Verbale operatorio e protocollo del tuo chirurgo" },
        { title: "Il tuo obiettivo", body: "Tornare a correre, a dormire, a prendere in braccio tuo figlio" },
        { title: "Abbigliamento", body: "Pantaloncini o abiti comodi in cui muoverti" },
      ],
    },
    "postop-checklist": {
      title: "Il controllo in 6 punti di ThailandClinics per la riabilitazione post-operatoria",
      caption: "Fai a ogni struttura di riabilitazione le stesse sei domande prima della prima seduta.",
      steps: [
        { title: "Fisioterapista abilitato", body: "Abilitazione del Physical Therapy Council" },
        { title: "Protocollo del chirurgo", body: "Rispettato, con contatti se serve" },
        { title: "Piano per fasi", body: "Traguardi per passare a ogni fase" },
        { title: "Attrezzature", body: "Palestra, piscina o test di forza se servono" },
        { title: "Calendario", body: "Visite per fase, più esercizi a casa" },
        { title: "Prezzo chiaro", body: "A seduta, pacchetti, rimborsi" },
      ],
    },
    "surgeon-handover": {
      title: "Cosa serve alla tua clinica di riabilitazione dal tuo chirurgo",
      caption: "Chiedi questi documenti all'équipe del tuo chirurgo prima di lasciare l'ospedale.",
      steps: [
        { title: "Verbale operatorio", body: "Cosa è stato fatto, e l'innesto o la protesi usati" },
        { title: "Carico", body: "Quanto peso può reggere la gamba, e da quando" },
        { title: "Limiti di movimento", body: "Limiti di escursione articolare e precauzioni" },
        { title: "Tutore o ausili", body: "Regolazioni del tutore, stampelle, per quanto tempo" },
        { title: "Date dei controlli", body: "Quando rivedi il chirurgo" },
      ],
    },
    "rehab-milestones": {
      title: "Tappe tipiche del recupero dopo un intervento",
      caption: "Fonti: AAOS OrthoInfo e indicazioni per i pazienti dell'NHS. Solo intervalli tipici; i tuoi tempi li stabiliscono il tuo chirurgo e il tuo fisioterapista.",
      cols: [
        { tag: "Ricostruzione del LCA", title: "6–12 mesi per tornare allo sport", points: [
          "La fisioterapia inizia subito dopo l'intervento", "Il ritorno allo sport dipende dal superamento dei test di forza e funzionali", "Non solo dal tempo trascorso",
        ] },
        { tag: "Protesi di ginocchio", title: "Diversi mesi", points: [
          "Attività quotidiane in circa 3–6 settimane (AAOS)", "Cammino senza ausili dopo circa 6 settimane (NHS)", "Il recupero completo può richiedere diversi mesi o più",
        ] },
        { tag: "Protesi d'anca", title: "Diversi mesi", points: [
          "Attività leggere in circa 3–6 settimane (AAOS)", "Precauzioni nei movimenti per circa le prime 6 settimane", "Il recupero completo richiede diversi mesi (NHS)",
        ] },
      ],
    },
    "meditation-costs": {
      title: "Costi pubblicati di corsi di meditazione e guarigione a Bangkok, ottobre 2026",
      caption: "Fonte: il prezzo pubblicato da ciascun centro, verificato il 20 ottobre 2026. Wat Mahathat Section 5 funziona a offerta libera; il Buddhadasa Indapanno Archives non pubblica costi. La quota di Saksit include libro, certificato e pranzo.",
      notes: [
        "accesso libero, offerta consigliata",
        "assaggio di vipassana di 1 giorno",
        "corso introduttivo di 2 giorni",
        "Pranic Healing Livello 1 di 2 giorni, tutto incluso",
      ],
    },
    "meditation-vs-healing": {
      title: "Meditazione al tempio, gruppo ad accesso libero o corso di guarigione?",
      caption: "Sintesi editoriale di ThailandClinics, ottobre 2026. Sono tutte e tre pratiche complementari, non trattamenti medici.",
      cols: [
        { tag: "Meditazione al tempio", points: [
          "Vipassana e mindfulness", "A offerta libera", "C'è un codice di abbigliamento", "Inglese solo in giorni stabiliti",
        ], foot: "Adatta a chi inizia e a chi è in viaggio" },
        { tag: "Gruppo ad accesso libero", points: [
          "Sessioni settimanali o lezioni private", "Insegnamento in inglese", `Da offerta libera a ${f.baht(P.houseOfDhammaTwoDayTo)}`, "Prenota in anticipo da House of Dhamma",
        ], foot: "Adatto agli expat che vogliono creare un'abitudine" },
        { tag: "Corso di guarigione", points: [
          "Pranic Healing a livelli", "Certificato per ogni corso", `Quota d'ingresso pubblicata di ${f.num(P.saksitLevel1)} baht`, "Requisiti per i livelli successivi",
        ], foot: "Adatto a chi vuole imparare una pratica" },
      ],
    },
    "meditation-before-you-go": {
      title: "Controlla queste cinque cose prima di andare",
      caption: "Gli orari dei templi cambiano in prossimità delle festività buddhiste. Conferma per telefono o email prima di partire.",
      steps: [
        { title: "Lingua", body: "Questa sessione è in inglese?" },
        { title: "Orari", body: "Gli orari di oggi, non quelli dell'anno scorso" },
        { title: "Prenotazione", body: "Accesso libero, iscrizione o caparra" },
        { title: "Costo", body: "Offerta, quota e cosa copre" },
        { title: "Abbigliamento", body: "Spalle e ginocchia coperte" },
      ],
    },
  },
});

export default it;
