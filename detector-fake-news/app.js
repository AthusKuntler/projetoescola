let characteristic = null;

const connectBtn = document.getElementById("connectBtn");
const analyzeBtn = document.getElementById("analyzeBtn");

connectBtn.addEventListener("click", conectarBluetooth);
analyzeBtn.addEventListener("click", analisar);

async function conectarBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [
                "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
            ]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
        );

        // 6e400002 = TX (micro:bit → web)
        // 6e400003 = RX (web → micro:bit) ✅ canal correto para enviar
        characteristic = await service.getCharacteristic(
            "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
        );

        document.getElementById("statusDot").classList.add("connected");
        document.getElementById("statusText").textContent = "micro:bit conectado";

    } catch (erro) {
        alert("Erro ao conectar");
    }
}

function analisarIA(texto) {
    let score = 0;
    texto = texto.toUpperCase();

    // --- Alarme máximo (+25 cada) ---
    const criticas = [
        "NÃO VÃO TE CONTAR",
        "A MÍDIA ESCONDE",
        "O QUE O GOVERNO OCULTA",
        "ELES NÃO QUEREM QUE VOCÊ SAIBA",
        "ACORDA BRASIL",
        "ISSO É REAL E ESTÁ SENDO CENSURADO",
        "PROIBIDO DE VEICULAR",
        "ANTES QUE APAGUEM",
        "SALVE ANTES QUE DELETEM",
    ];

    // --- Alta suspeita (+20 cada) ---
    const altas = [
        "URGENTE",
        "CHOCANTE",
        "COMPARTILHE",
        "SEGREDO",
        "REVELADO",
        "BOMBA",
        "EXCLUSIVO",
        "INACREDITÁVEL",
        "SURPREENDENTE",
        "VERDADE OCULTA",
        "VERDADE ESCONDIDA",
        "MÍDIA MENTE",
        "FAKE NEWS DA MÍDIA",
        "GLOBALISMO",
        "NOVA ORDEM MUNDIAL",
        "CHIP NA VACINA",
        "VACINA MATA",
        "COMPROVADO CIENTIFICAMENTE",
        "MÉDICOS NÃO QUEREM",
        "CURA MILAGROSA",
        "REMÉDIO PROIBIDO",
        "ELES ESTÃO TE ENGANANDO",
        "DESPERTA",
        "PASSEM ADIANTE",
        "REPASSEM",
        "ISSO PRECISA VIRALIZAR",
    ];

    // --- Suspeita moderada (+10 cada) ---
    const moderadas = [
        "FAKE",
        "VIRALIZAR",
        "VIRAL",
        "MENTIRA",
        "ENGANAÇÃO",
        "DENÚNCIA",
        "ESCÂNDALO",
        "ABSURDO",
        "INADMISSÍVEL",
        "TODO MUNDO PRECISA VER",
        "IMPRESSIONANTE",
        "NUNCA ANTES VISTO",
        "HISTORICO",
        "HISTÓRICO",
        "MISTERIOSO",
        "CONSPIRAÇÃO",
        "ILLUMINATI",
        "SATANISMO",
        "ELITE GLOBAL",
        "DEEP STATE",
        "ESTADO PROFUNDO",
        "COMUNISMO",
        "MARXISMO CULTURAL",
        "IDEOLOGIA DE GÊNERO",
        "ENDOUTRINAÇÃO",
        "MANIPULAÇÃO",
        "LAVAGEM CEREBRAL",
        "PLANO SECRETO",
        "AGENDA OCULTA",
        "COMPARTILHA",
        "MANDA PRA TODOS",
    ];

    criticas.forEach(p  => { if (texto.includes(p)) score += 25; });
    altas.forEach(p     => { if (texto.includes(p)) score += 20; });
    moderadas.forEach(p => { if (texto.includes(p)) score += 10; });

    // Exclamações excessivas
    const exclamacoes = (texto.match(/!/g) || []).length;
    score += exclamacoes * 3;

    // Texto curto demais (sem contexto)
    if (texto.length < 60)  score += 15;

    // Sem nenhum número (dados concretos)
    if (!/\d/.test(texto))  score += 10;

    // Sem indicação de fonte
    if (!texto.includes("FONTE")  &&
        !texto.includes("SEGUNDO") &&
        !texto.includes("CONFORME") &&
        !texto.includes("DE ACORDO")) score += 10;

    // Texto todo em maiúsculas (estilo alarmista)
    const palavras = texto.trim().split(/\s+/);
    const original = document.getElementById("texto").value.trim().split(/\s+/);
    const maiusculas = original.filter(p => p === p.toUpperCase() && p.length > 3).length;
    if (maiusculas / palavras.length > 0.5) score += 10;

    return score;
}

async function enviar(msg) {
    const encoder = new TextEncoder();
    await characteristic.writeValue(encoder.encode(msg + "\n"));
}

async function analisar() {
    if (!characteristic) {
        alert("Conecte o micro:bit primeiro");
        return;
    }

    const texto = document.getElementById("texto").value;
    const score = analisarIA(texto);

    let resultado = "";
    if (score >= 60)      resultado = "RED";
    else if (score >= 30) resultado = "YELLOW";
    else                  resultado = "GREEN";

    const el = document.getElementById("resultado");
    el.className = resultado;
    el.innerText = resultado === "GREEN"  ? "✓ CONFIÁVEL"
                 : resultado === "YELLOW" ? "⚠ SUSPEITO"
                 :                         "✗ DESINFORMAÇÃO";

    document.getElementById("score").innerText = "Pontuação: " + score;

    await enviar(resultado);
}
