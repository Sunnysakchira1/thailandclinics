import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const pt = (f: Fmt): FigureDict => ({
  inShort: "Em resumo",
  figures: {
    "ivf-prices": {
      title: "Preços publicados de pacotes de FIV/ICSI em Bangkok, outubro de 2026",
      caption: "Fonte: o preço publicado por cada clínica, conferido em 14 de outubro de 2026. Jetanin e Bumrungrad não publicam preço de pacote. Os pacotes incluem coisas diferentes, então compare orçamentos detalhados, não os preços de vitrine.",
      notes: [
        "4 pacotes de ICSI",
        "FIV/ICSI, só para residentes",
        "pacote de ICSI",
        "pacote A para quem vem do exterior",
        "pacote B, com PGT-A + congelamento",
      ],
    },
    "surgery-prices": {
      title: "Preços publicados de cirurgia plástica estética em Bangkok, outubro de 2026",
      caption: "Fonte: preços publicados pelo Bangkok Hospital e pelo Yanhee, conferidos em 14 de outubro de 2026. O preço do aumento de mama do Bangkok Hospital não inclui os implantes; o do Yanhee inclui o implante indicado. Bumrungrad e Kamol não publicam preços.",
      notes: [
        "rinoplastia, de implante a enxerto de cartilagem costal",
        "rinoplastia, de anestesia local a correção do septo",
        "aumento de mama, com implante",
        "aumento de mama, sem implante",
        "cirurgia de pálpebras, superiores ou inferiores",
        "cirurgia de pálpebras, superiores ou inferiores",
      ],
    },
    "physio-prices": {
      title: "Preços publicados por sessão de fisioterapia em Bangkok, outubro de 2026",
      caption: "Fonte: a tabela de preços de cada clínica, conferida em 14 de outubro de 2026. Os hospitais (Vejthani, Bumrungrad, MedPark, Samitivej, BNH, Bangkok Hospital) não publicam preço por sessão.",
      notes: ["por sessão", "de 60 a 120 min", "de 60 a 120 min"],
    },
    "hospital-vs-centre": {
      title: "Clínica de fertilidade dedicada ou centro dentro de hospital?",
      caption: "Resumo editorial do ThailandClinics, outubro de 2026. Pergunte ao seu médico se o seu histórico de saúde pede o respaldo de um hospital.",
      cols: [
        { tag: "Clínica dedicada", points: [
          "Faz apenas medicina reprodutiva",
          "Volume do laboratório concentrado em FIV",
          "Normalmente o pacote mais barato",
          "Uma equipe menor que conhece o seu caso",
        ], foot: "Indicada para a maioria das pacientes saudáveis" },
        { tag: "Centro dentro de hospital", points: [
          "Todas as outras especialidades no mesmo prédio",
          "UTI no local",
          "Preços de hospital",
          "Indicado para históricos de saúde complexos",
        ], foot: "Indicado para quem tem outras condições de saúde ou maior risco de SHO" },
      ],
    },
    "like-for-like-quote": {
      title: "Peça a cada clínica um orçamento para o mesmo ciclo",
      caption: "Um pedido idêntico torna os preços de vitrine comparáveis. Envie-o a todas as clínicas da sua lista.",
      steps: [
        { title: "Estimulação", body: "Com a medicação incluída e o limite de dose informado" },
        { title: "Coleta de óvulos + ICSI", body: "Anestesia e cultivo dos embriões até o dia 5" },
        { title: "PGT-A", body: "Preço para até 4 embriões, com biópsia incluída" },
        { title: "Congelamento + armazenamento", body: "Todos os embriões, primeiro ano de armazenamento" },
        { title: "Transferência de embrião congelado", body: "Preparo do endométrio e uma transferência" },
        { title: "Exclusões", body: "Tudo o que não está coberto, por escrito" },
      ],
    },
    "pgt-types": {
      title: "Os três tipos de PGT",
      caption: "PGT significa teste genético pré-implantacional: um exame de laboratório nos embriões da FIV antes da transferência. Se você precisa dele é uma decisão sua e do seu médico de fertilidade.",
      cols: [
        { tag: "PGT-A", title: "Aneuploidias", points: [
          "Verifica se os embriões têm um número errado de cromossomos",
          "O teste mais comum",
          "Muitas vezes sugerido a partir dos 37 anos, ou após abortos de repetição ou transferências sem sucesso",
        ] },
        { tag: "PGT-M", title: "Doenças monogênicas", points: [
          "Testa uma doença hereditária conhecida, por ex. talassemia",
          "O laboratório costuma criar primeiro um teste para a sua família",
          "Acrescenta semanas ao processo",
        ] },
        { tag: "PGT-SR", title: "Rearranjos estruturais", points: [
          "Para quando um dos parceiros tem uma translocação ou inversão",
          "Oferecido por menos clínicas",
          "Em Bangkok: MedPark e VFC listam esse teste",
        ] },
      ],
    },
    "pgt-timeline": {
      title: "Como funciona um ciclo com PGT",
      caption: "Sequência típica. Os prazos variam conforme a clínica e o teste: o PGT-M pode levar mais tempo.",
      steps: [
        { title: "FIV + coleta de óvulos", body: "Estimulação, depois os óvulos são coletados e fertilizados" },
        { title: "Cultivo até o dia 5–6", body: "Os embriões crescem até o estágio de blastocisto" },
        { title: "Biópsia", body: "Algumas células externas são retiradas de cada embrião" },
        { title: "Congelamento", body: "Todo embrião biopsiado é congelado" },
        { title: "Resultados", body: "Normalmente em 1–3 semanas" },
        { title: "Transferência de embrião congelado", body: "Em um ciclo posterior, com um embrião testado" },
      ],
    },
    "pgt-checklist": {
      title: "O checklist de PGT em 7 pontos do ThailandClinics",
      caption: "Use as mesmas sete verificações em todas as clínicas e peça as respostas por escrito.",
      steps: [
        { title: "Tipos de PGT", body: "Ela oferece o teste de que você precisa?" },
        { title: "Onde é testado", body: "Laboratório próprio ou enviado para fora?" },
        { title: "O laboratório", body: "Time-lapse, sistema de testemunhas, ISO 15189, ESHRE" },
        { title: "A biópsia", body: "Quem faz, e com que frequência?" },
        { title: "Preço por embrião", body: "Biópsia, teste, congelamento, armazenamento" },
        { title: "Dados de sucesso", body: "Nascidos vivos por transferência de embrião testado com PGT, por idade" },
        { title: "Lei tailandesa", body: "Sem escolha do sexo; só uso médico" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "Hospital de cirurgia plástica ou hospital geral?",
      caption: "Resumo editorial do ThailandClinics, outubro de 2026. Para qualquer operação com anestesia geral, confira se o local tem licença para cirurgia.",
      cols: [
        { tag: "Hospital de cirurgia plástica", points: [
          "Cirurgias estéticas todos os dias", "Preços normalmente mais baixos", "Cirurgiões identificados pelo nome para escolher", "Menos outras especialidades no local",
        ], foot: "Indicado para pacientes saudáveis que escolhem pelo preço ou pelo cirurgião" },
        { tag: "Hospital privado geral", points: [
          "Todas as especialidades e UTI no local", "Pacotes publicados (Bangkok Hospital)", "Preços mais altos", "Indicado para históricos de saúde complexos",
        ], foot: "Indicado para pacientes com outras condições de saúde" },
      ],
    },
    "surgery-quote": {
      title: "Peça a cada hospital um orçamento para a mesma operação",
      caption: "Um pedido idêntico torna os orçamentos de cirurgia plástica comparáveis.",
      steps: [
        { title: "Cirurgião", body: "Nome completo e número de registro no Conselho Médico" },
        { title: "Técnica", body: "Exatamente qual procedimento, aberto ou fechado" },
        { title: "Implante", body: "Marca, tamanho e tipo, incluídos no preço" },
        { title: "Internação", body: "Noites incluídas e o tipo de quarto" },
        { title: "Acompanhamento", body: "Consultas de retorno, retirada de pontos, cintas de compressão" },
        { title: "Complicações", body: "Quem paga uma nova cirurgia ou reinternação" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "A checagem de segurança estética em 6 pontos do ThailandClinics",
      caption: "Faça as seis antes de qualquer consulta de Botox ou preenchimento em Bangkok.",
      steps: [
        { title: "Licença da clínica", body: "Número de 11 dígitos na placa, certificado lá dentro" },
        { title: "Registro do médico", body: "Nome completo, conferido no Conselho Médico" },
        { title: "Registro na FDA tailandesa", body: "Os números das toxinas começam com \"1C\"" },
        { title: "Frasco lacrado", body: "Aberto na sua frente; fotografe o rótulo" },
        { title: "Preço realista", body: "Não muito abaixo de todas as clínicas licenciadas" },
        { title: "Plano de acompanhamento", body: "Para quem ligar se algo der errado" },
      ],
    },
    "vial-check": {
      title: "O que conferir na caixa e no frasco",
      caption: "Peça para ver o produto antes do tratamento começar. Uma clínica licenciada não vai se importar.",
      steps: [
        { title: "Lacrado", body: "Caixa e frasco fechados, abertos na sua frente" },
        { title: "Marca", body: "É a mesma marca do orçamento" },
        { title: "Registro tailandês", body: "Número de registro na caixa, por ex. 1C …" },
        { title: "Lote + validade", body: "Número do lote e uma data de validade futura" },
        { title: "Pesquise", body: "Procure a marca na busca de produtos da FDA tailandesa" },
      ],
    },
    "aesthetic-red-flags": {
      title: "Sinais de alerta em uma clínica estética",
      caption: "Cada um destes apareceu em casos de fiscalização na Tailândia. Basta um para ir embora.",
      cols: [
        { tag: "O lugar", title: "Local errado", points: [
          "Tratamento em apartamento, casa, quarto de hotel ou salão", "Sem número de licença na placa", "Agendamento só por mensagens em redes sociais",
        ] },
        { tag: "A pessoa", title: "Aplicador errado", points: [
          "Não informa nome completo nem número de registro", "Só um apelido nos anúncios", "Uma esteticista ou enfermeira aplicando sozinha",
        ] },
        { tag: "O produto", title: "Produto errado", points: [
          "Não mostra o frasco lacrado", "Marca fora da base de dados da FDA tailandesa", "Um preço muito abaixo de todas as clínicas licenciadas",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "Clínica de fisioterapia ou centro de reabilitação hospitalar?",
      caption: "Resumo editorial do ThailandClinics, outubro de 2026. Depois de uma cirurgia, siga a orientação do seu cirurgião sobre onde fazer a reabilitação.",
      cols: [
        { tag: "Clínica de fisioterapia dedicada", points: [
          "Preços por sessão publicados", "Sessões de 60 minutos ou mais", "Normalmente o mesmo fisioterapeuta em cada visita", "Não precisa de encaminhamento",
        ], foot: "Indicada para coluna, pescoço, lesões esportivas e a maior parte da reabilitação pós-operatória" },
        { tag: "Centro de reabilitação hospitalar", points: [
          "Médicos fisiatras no local", "Treino de marcha robótico, hidroterapia", "Preços de hospital, muitas vezes mais os honorários médicos", "Pode exigir uma consulta médica antes",
        ], foot: "Indicado para AVC, lesão medular e cirurgias complexas" },
      ],
    },
    "physio-first-visit": {
      title: "O que levar à sua primeira sessão de fisioterapia",
      caption: "Levar isto economiza uma sessão e ajuda o seu fisioterapeuta a planejar.",
      steps: [
        { title: "A sua história", body: "Quando começou, o que melhora ou piora" },
        { title: "Exames + laudos", body: "Laudos de ressonância, raio-X ou ultrassom, se tiver" },
        { title: "Relatórios da cirurgia", body: "Descrição cirúrgica e o protocolo do seu cirurgião" },
        { title: "O seu objetivo", body: "Voltar a correr, a dormir, a pegar o seu filho no colo" },
        { title: "Roupa", body: "Shorts ou roupas folgadas para se movimentar" },
      ],
    },
    "postop-checklist": {
      title: "A checagem em 6 pontos do ThailandClinics para reabilitação pós-cirurgia",
      caption: "Faça as mesmas seis perguntas a cada serviço de reabilitação antes da primeira sessão.",
      steps: [
        { title: "Fisioterapeuta licenciado", body: "Licença do Physical Therapy Council" },
        { title: "Protocolo do cirurgião", body: "Seguido, com contato quando necessário" },
        { title: "Plano por fases", body: "Marcos para passar de uma fase para outra" },
        { title: "Equipamentos", body: "Academia, piscina ou testes de força conforme a necessidade" },
        { title: "Agenda", body: "Sessões por fase, mais exercícios em casa" },
        { title: "Preço claro", body: "Por sessão, pacotes, reembolsos" },
      ],
    },
    "surgeon-handover": {
      title: "O que a sua clínica de reabilitação precisa do seu cirurgião",
      caption: "Peça isto à equipe do seu cirurgião antes de sair do hospital.",
      steps: [
        { title: "Descrição cirúrgica", body: "O que foi feito, e o enxerto ou implante usado" },
        { title: "Apoio de peso", body: "Quanto peso a perna pode suportar, e a partir de quando" },
        { title: "Limites de movimento", body: "Limites de amplitude de movimento e cuidados" },
        { title: "Órtese ou apoios", body: "Ajustes da órtese, muletas, por quanto tempo" },
        { title: "Datas de retorno", body: "Quando você volta a ver o cirurgião" },
      ],
    },
    "rehab-milestones": {
      title: "Marcos típicos de recuperação após a cirurgia",
      caption: "Fontes: AAOS OrthoInfo e orientações para pacientes do NHS. Apenas faixas típicas; o seu cirurgião e o seu fisioterapeuta definem o seu próprio cronograma.",
      cols: [
        { tag: "Reconstrução do LCA", title: "6–12 meses até o esporte", points: [
          "A fisioterapia começa logo após a cirurgia", "A volta ao esporte depende de passar em testes de força e função", "Não só do tempo",
        ] },
        { tag: "Prótese de joelho", title: "Vários meses", points: [
          "Atividades do dia a dia em cerca de 3–6 semanas (AAOS)", "Andar sem apoio após cerca de 6 semanas (NHS)", "A recuperação completa pode levar vários meses ou mais",
        ] },
        { tag: "Prótese de quadril", title: "Vários meses", points: [
          "Atividades leves em cerca de 3–6 semanas (AAOS)", "Cuidados com os movimentos por cerca das primeiras 6 semanas", "A recuperação completa leva vários meses (NHS)",
        ] },
      ],
    },
    "meditation-costs": {
      title: "Preços publicados de cursos de meditação e cura em Bangkok, outubro de 2026",
      caption: "Fonte: o preço publicado por cada centro, conferido em 20 de outubro de 2026. O Wat Mahathat Section 5 funciona com doações; os Buddhadasa Indapanno Archives não publicam preço. A taxa do Saksit inclui o livro, o certificado e o almoço.",
      notes: [
        "aula avulsa, doação sugerida",
        "introdução a vipassana de 1 dia",
        "curso introdutório de 2 dias",
        "Pranic Healing nível 1 de 2 dias, tudo incluído",
      ],
    },
    "meditation-vs-healing": {
      title: "Meditação no templo, grupo aberto ou curso de cura?",
      caption: "Resumo editorial do ThailandClinics, outubro de 2026. As três são práticas complementares, não tratamento médico.",
      cols: [
        { tag: "Meditação no templo", points: [
          "Vipassana e mindfulness", "Por doação", "Há código de vestimenta", "Inglês só em dias definidos",
        ], foot: "Indicada para iniciantes e viajantes" },
        { tag: "Grupo aberto", points: [
          "Sessões semanais ou aulas particulares", "Ensinado em inglês", `De doação a ${f.baht(P.houseOfDhammaTwoDayTo)}`, "Reserve com antecedência na House of Dhamma",
        ], foot: "Indicado para expatriados criando um hábito" },
        { tag: "Curso de cura", points: [
          "Pranic Healing em níveis", "Certificado para cada curso", `Taxa de entrada publicada de ${f.num(P.saksitLevel1)} bahts`, "Pré-requisitos para os níveis seguintes",
        ], foot: "Indicado para quem quer aprender uma prática" },
      ],
    },
    "meditation-before-you-go": {
      title: "Confira estas cinco coisas antes de ir",
      caption: "Os horários dos templos mudam perto dos feriados budistas. Confirme por telefone ou e-mail antes de ir.",
      steps: [
        { title: "Idioma", body: "Esta sessão é dada em inglês?" },
        { title: "Horários", body: "Os de hoje, não os do ano passado" },
        { title: "Reserva", body: "Chegar direto, se inscrever ou pagar um sinal" },
        { title: "Custo", body: "Doação, taxa e o que ela cobre" },
        { title: "Código de vestimenta", body: "Ombros e joelhos cobertos" },
      ],
    },
  },
});

export default pt;
