import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const es = (f: Fmt): FigureDict => ({
  inShort: "En resumen",
  figures: {
    "ivf-prices": {
      title: "Precios publicados de los paquetes de FIV/ICSI en Bangkok, octubre de 2026",
      caption: "Fuente: el precio que publica cada centro, comprobado el 14 de octubre de 2026. Jetanin y Bumrungrad no publican precio de paquete. Cada paquete incluye cosas distintas, así que compara presupuestos desglosados, no precios de reclamo.",
      notes: [
        "4 paquetes de ICSI",
        "FIV/ICSI, solo residentes",
        "paquete de ICSI",
        "paquete A para pacientes que viajan",
        "paquete B, con PGT-A + congelación",
      ],
    },
    "surgery-prices": {
      title: "Precios publicados de cirugía estética en Bangkok, octubre de 2026",
      caption: "Fuente: precios publicados por Bangkok Hospital y Yanhee, comprobados el 14 de octubre de 2026. El precio del aumento de pecho de Bangkok Hospital no incluye los implantes; el de Yanhee incluye el implante indicado. Bumrungrad y Kamol no publican precios.",
      notes: [
        "rinoplastia, de implante a injerto de cartílago costal",
        "rinoplastia, de anestesia local a septoplastia",
        "aumento de pecho, implante incluido",
        "aumento de pecho, sin implante",
        "cirugía de párpados, superiores o inferiores",
        "cirugía de párpados, superiores o inferiores",
      ],
    },
    "physio-prices": {
      title: "Precios publicados por sesión de fisioterapia en Bangkok, octubre de 2026",
      caption: "Fuente: la lista de precios de cada clínica, comprobada el 14 de octubre de 2026. Los hospitales (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) no publican precio por sesión.",
      notes: ["por sesión", "de 60 a 120 min", "de 60 a 120 min"],
    },
    "hospital-vs-centre": {
      title: "¿Centro de fertilidad especializado o centro dentro de un hospital?",
      caption: "Resumen editorial de ThailandClinics, octubre de 2026. Pregunta a tu médico si tu historial médico requiere el respaldo de un hospital.",
      cols: [
        { tag: "Centro especializado", points: [
          "Solo se dedica a la medicina reproductiva",
          "Volumen del laboratorio centrado en la FIV",
          "Suele tener el paquete más barato",
          "Un equipo más pequeño que conoce tu caso",
        ], foot: "Adecuado para la mayoría de las pacientes sanas" },
        { tag: "Centro dentro de un hospital", points: [
          "Todas las demás especialidades en el mismo edificio",
          "Cuidados intensivos en el propio centro",
          "Precios de hospital",
          "Adecuado para historiales médicos complejos",
        ], foot: "Adecuado si tienes otras enfermedades o más riesgo de SHO" },
      ],
    },
    "like-for-like-quote": {
      title: "Pide a cada centro un presupuesto para el mismo ciclo",
      caption: "Una petición idéntica hace comparables los precios de reclamo. Envíala a todos los centros de tu lista.",
      steps: [
        { title: "Estimulación", body: "Medicación incluida, con el límite de dosis indicado" },
        { title: "Punción ovárica + ICSI", body: "Anestesia y cultivo de embriones hasta el día 5" },
        { title: "PGT-A", body: "Precio para hasta 4 embriones, biopsia incluida" },
        { title: "Congelación + almacenamiento", body: "Todos los embriones, primer año de almacenamiento" },
        { title: "Transferencia de embriones congelados", body: "Preparación del endometrio y una transferencia" },
        { title: "Exclusiones", body: "Todo lo que no cubre, por escrito" },
      ],
    },
    "pgt-types": {
      title: "Los tres tipos de PGT",
      caption: "PGT significa test genético preimplantacional: un análisis de laboratorio de los embriones de FIV antes de la transferencia. Si lo necesitas o no es una decisión tuya y de tu especialista en fertilidad.",
      cols: [
        { tag: "PGT-A", title: "Aneuploidías", points: [
          "Comprueba si los embriones tienen un número incorrecto de cromosomas",
          "El test más habitual",
          "Se suele recomendar a partir de los 37 años, o tras abortos de repetición o transferencias fallidas",
        ] },
        { tag: "PGT-M", title: "Enfermedades monogénicas", points: [
          "Busca una enfermedad hereditaria conocida, p. ej. la talasemia",
          "El laboratorio suele diseñar primero un test para tu familia",
          "Añade semanas al proceso",
        ] },
        { tag: "PGT-SR", title: "Reordenamientos estructurales", points: [
          "Para cuando uno de los miembros de la pareja porta una translocación o inversión",
          "Lo ofrecen menos clínicas",
          "En Bangkok: MedPark y VFC lo incluyen",
        ] },
      ],
    },
    "pgt-timeline": {
      title: "Cómo es un ciclo con PGT",
      caption: "Secuencia habitual. Los plazos varían según la clínica y el test: el PGT-M puede tardar más.",
      steps: [
        { title: "FIV + punción ovárica", body: "Estimulación, después se extraen y fecundan los óvulos" },
        { title: "Cultivo hasta el día 5–6", body: "Los embriones crecen hasta la fase de blastocisto" },
        { title: "Biopsia", body: "Se extraen unas pocas células externas de cada embrión" },
        { title: "Congelación", body: "Se congela cada embrión biopsiado" },
        { title: "Resultados", body: "Normalmente en 1–3 semanas" },
        { title: "Transferencia de embriones congelados", body: "En un ciclo posterior, con un embrión analizado" },
      ],
    },
    "pgt-checklist": {
      title: "La lista de comprobación de PGT de ThailandClinics en 7 puntos",
      caption: "Usa las mismas siete comprobaciones con cada clínica y pide las respuestas por escrito.",
      steps: [
        { title: "Tipos de PGT", body: "¿Ofrece el test que necesitas?" },
        { title: "Dónde se analiza", body: "¿Laboratorio propio o externo?" },
        { title: "El laboratorio", body: "Time-lapse, sistema de testigos, ISO 15189, ESHRE" },
        { title: "La biopsia", body: "¿Quién la hace y con qué frecuencia?" },
        { title: "Precio por embrión", body: "Biopsia, test, congelación, almacenamiento" },
        { title: "Datos de resultados", body: "Nacidos vivos por transferencia de embrión analizado con PGT, por edad" },
        { title: "Ley tailandesa", body: "Sin selección de sexo; solo uso médico" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "¿Hospital de cirugía estética u hospital general?",
      caption: "Resumen editorial de ThailandClinics, octubre de 2026. Para cualquier operación con anestesia general, comprueba que el centro tiene licencia para cirugía.",
      cols: [
        { tag: "Hospital de cirugía estética", points: [
          "Operaciones estéticas todos los días", "Precios normalmente más bajos", "Cirujanos con nombre entre los que elegir", "Menos especialidades distintas en el centro",
        ], foot: "Adecuado para pacientes sanos que eligen por precio o por cirujano" },
        { tag: "Hospital privado general", points: [
          "Todas las especialidades y cuidados intensivos en el centro", "Paquetes publicados (Bangkok Hospital)", "Precios más altos", "Adecuado para historiales médicos complejos",
        ], foot: "Adecuado para pacientes con otras enfermedades" },
      ],
    },
    "surgery-quote": {
      title: "Pide a cada hospital un presupuesto para la misma operación",
      caption: "Una petición idéntica hace comparables los presupuestos de cirugía estética.",
      steps: [
        { title: "Cirujano", body: "Nombre completo y número de licencia del Consejo Médico" },
        { title: "Técnica", body: "Qué procedimiento exactamente, abierto o cerrado" },
        { title: "Implante", body: "Marca, tamaño y tipo, incluidos en el precio" },
        { title: "Ingreso", body: "Noches incluidas y tipo de habitación" },
        { title: "Seguimiento", body: "Revisiones, retirada de puntos, prendas de compresión" },
        { title: "Complicaciones", body: "Quién paga una reintervención o un reingreso" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "La comprobación de seguridad estética de ThailandClinics en 6 puntos",
      caption: "Haz las seis antes de cualquier cita de bótox o rellenos en Bangkok.",
      steps: [
        { title: "Licencia de la clínica", body: "Número de 11 dígitos en el rótulo, certificado en el interior" },
        { title: "Licencia del médico", body: "Nombre completo, comprobado con el Consejo Médico" },
        { title: "Registro en la FDA tailandesa", body: "Los números de las toxinas empiezan por \"1C\"" },
        { title: "Vial precintado", body: "Abierto delante de ti; fotografía la etiqueta" },
        { title: "Precio realista", body: "No muy por debajo de todas las clínicas con licencia" },
        { title: "Plan de seguimiento", body: "A quién llamas si algo sale mal" },
      ],
    },
    "vial-check": {
      title: "Qué comprobar en la caja y el vial",
      caption: "Pide ver el producto antes de empezar el tratamiento. A una clínica con licencia no le importará.",
      steps: [
        { title: "Precintado", body: "Caja y vial sin abrir, abiertos delante de ti" },
        { title: "Marca", body: "Coincide con la marca del presupuesto" },
        { title: "Registro tailandés", body: "Número de registro en la caja, p. ej. 1C …" },
        { title: "Lote + caducidad", body: "Número de lote y una fecha de caducidad futura" },
        { title: "Búscalo", body: "Busca la marca en el buscador de productos de la FDA tailandesa" },
      ],
    },
    "aesthetic-red-flags": {
      title: "Señales de alarma en una clínica estética",
      caption: "Cada una ha aparecido en casos sancionados por las autoridades tailandesas. Con una basta para irte.",
      cols: [
        { tag: "El lugar", title: "Sitio inadecuado", points: [
          "Tratamiento en un piso, una casa, una habitación de hotel o un salón", "Sin número de licencia en el rótulo", "Reservas solo por mensajes en redes sociales",
        ] },
        { tag: "La persona", title: "Persona inadecuada", points: [
          "No da su nombre completo ni su número de licencia", "Solo un apodo en los anuncios", "Una esteticista o enfermera que inyecta sola",
        ] },
        { tag: "El producto", title: "Producto inadecuado", points: [
          "No te enseña el vial precintado", "La marca no está en la base de datos de la FDA tailandesa", "Un precio muy por debajo de todas las clínicas con licencia",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "¿Clínica de fisioterapia o centro de rehabilitación hospitalario?",
      caption: "Resumen editorial de ThailandClinics, octubre de 2026. Después de una operación, sigue el consejo de tu cirujano sobre dónde hacer la rehabilitación.",
      cols: [
        { tag: "Clínica de fisioterapia especializada", points: [
          "Precios por sesión publicados", "Sesiones de 60 minutos o más", "Normalmente el mismo fisioterapeuta en cada visita", "Sin necesidad de derivación",
        ], foot: "Adecuada para espalda, cuello, lesiones deportivas y la mayoría de la rehabilitación posoperatoria" },
        { tag: "Centro de rehabilitación hospitalario", points: [
          "Médicos rehabilitadores en el centro", "Entrenamiento robótico de la marcha, hidroterapia", "Precios de hospital, a menudo más los honorarios médicos", "Puede requerir antes una consulta médica",
        ], foot: "Adecuado para ictus, lesión medular y cirugía compleja" },
      ],
    },
    "physio-first-visit": {
      title: "Qué llevar a tu primera sesión de fisioterapia",
      caption: "Llevar esto te ahorra una sesión y ayuda a tu fisioterapeuta a planificar.",
      steps: [
        { title: "Tu historia", body: "Cuándo empezó, qué lo mejora o lo empeora" },
        { title: "Pruebas + informes", body: "Informes de resonancia, radiografía o ecografía, si los tienes" },
        { title: "Informes de la cirugía", body: "Informe quirúrgico y protocolo de tu cirujano" },
        { title: "Tu objetivo", body: "Volver a correr, a dormir, a coger en brazos a tu hijo" },
        { title: "Ropa", body: "Pantalón corto o ropa holgada con la que puedas moverte" },
      ],
    },
    "postop-checklist": {
      title: "La comprobación de rehabilitación posoperatoria de ThailandClinics en 6 puntos",
      caption: "Haz las mismas seis preguntas a cada centro de rehabilitación antes de tu primera sesión.",
      steps: [
        { title: "Fisioterapeuta con licencia", body: "Licencia del Consejo de Fisioterapia" },
        { title: "Protocolo del cirujano", body: "Se sigue, con contacto si hace falta" },
        { title: "Plan por fases", body: "Hitos para pasar a cada fase" },
        { title: "Equipamiento", body: "Gimnasio, piscina o pruebas de fuerza según haga falta" },
        { title: "Calendario", body: "Visitas por fase, más ejercicios en casa" },
        { title: "Precio claro", body: "Por sesión, bonos, reembolsos" },
      ],
    },
    "surgeon-handover": {
      title: "Qué necesita tu clínica de rehabilitación de tu cirujano",
      caption: "Pide esto al equipo de tu cirujano antes de salir del hospital.",
      steps: [
        { title: "Informe quirúrgico", body: "Qué se hizo, y el injerto o implante utilizado" },
        { title: "Carga", body: "Cuánto peso puede soportar la pierna, y desde cuándo" },
        { title: "Límites de movimiento", body: "Límites del rango de movimiento y precauciones" },
        { title: "Férula o ayudas", body: "Ajustes de la férula, muletas, durante cuánto tiempo" },
        { title: "Fechas de revisión", body: "Cuándo vuelves a ver al cirujano" },
      ],
    },
    "rehab-milestones": {
      title: "Hitos habituales de recuperación después de una operación",
      caption: "Fuentes: AAOS OrthoInfo e información para pacientes del NHS. Solo rangos habituales; tu cirujano y tu fisioterapeuta fijan tus propios plazos.",
      cols: [
        { tag: "Reconstrucción del LCA", title: "6–12 meses hasta el deporte", points: [
          "La fisioterapia empieza justo después de la operación", "La vuelta al deporte depende de superar pruebas de fuerza y función", "No solo del tiempo transcurrido",
        ] },
        { tag: "Prótesis de rodilla", title: "Varios meses", points: [
          "Actividades diarias en unas 3–6 semanas (AAOS)", "Caminar sin ayudas después de unas 6 semanas (NHS)", "La recuperación completa puede llevar varios meses o más",
        ] },
        { tag: "Prótesis de cadera", title: "Varios meses", points: [
          "Actividades ligeras en unas 3–6 semanas (AAOS)", "Precauciones de movimiento durante aproximadamente las primeras 6 semanas", "La recuperación completa lleva varios meses (NHS)",
        ] },
      ],
    },
    "meditation-costs": {
      title: "Precios publicados de cursos de meditación y sanación en Bangkok, octubre de 2026",
      caption: "Fuente: el precio que publica cada centro, comprobado el 20 de octubre de 2026. Wat Mahathat Section 5 funciona con donativos; los Buddhadasa Indapanno Archives no publican precio. La tarifa de Saksit incluye el libro, el certificado y la comida.",
      notes: [
        "sesión abierta, donativo sugerido",
        "iniciación a vipassana de 1 día",
        "curso introductorio de 2 días",
        "Pranic Healing nivel 1 de 2 días, todo incluido",
      ],
    },
    "meditation-vs-healing": {
      title: "¿Meditación en un templo, grupo abierto o curso de sanación?",
      caption: "Resumen editorial de ThailandClinics, octubre de 2026. Las tres son prácticas complementarias, no tratamiento médico.",
      cols: [
        { tag: "Meditación en un templo", points: [
          "Vipassana y mindfulness", "Con donativo", "Hay código de vestimenta", "Inglés solo ciertos días",
        ], foot: "Adecuado para principiantes y viajeros" },
        { tag: "Grupo abierto", points: [
          "Sesiones semanales o clases particulares", "Se imparte en inglés", `De donativo a ${f.baht(P.houseOfDhammaTwoDayTo)}`, "Reserva con antelación en House of Dhamma",
        ], foot: "Adecuado para expatriados que quieren crear un hábito" },
        { tag: "Curso de sanación", points: [
          "Pranic Healing por niveles", "Certificado por cada curso", `Tarifa de entrada publicada de ${f.num(P.saksitLevel1)} bahts`, "Requisitos previos para los niveles siguientes",
        ], foot: "Adecuado para quien quiere aprender una práctica" },
      ],
    },
    "meditation-before-you-go": {
      title: "Comprueba estas cinco cosas antes de ir",
      caption: "Los horarios de los templos cambian en torno a las festividades budistas. Confírmalos por teléfono o correo electrónico antes de ir.",
      steps: [
        { title: "Idioma", body: "¿Esta sesión se imparte en inglés?" },
        { title: "Horario", body: "El de hoy, no el del año pasado" },
        { title: "Reserva", body: "Sin cita, con inscripción o con depósito" },
        { title: "Precio", body: "Donativo, tarifa y qué cubre" },
        { title: "Código de vestimenta", body: "Hombros y rodillas cubiertos" },
      ],
    },
  },
});

export default es;
