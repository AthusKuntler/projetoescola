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

        const service =
            await server.getPrimaryService(
                "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
            );

        characteristic =
            await service.getCharacteristic(
                "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
            );

        alert("Micro:bit conectado!");
    } catch (erro) {
        alert("Erro ao conectar");
    }
}

function analisarIA(texto) {

    let score = 0;

    texto = texto.toUpperCase();

    const suspeitas = [
        "URGENTE",
        "CHOCANTE",
        "COMPARTILHE",
        "NÃO VÃO TE CONTAR",
        "SEGREDO",
        "A MÍDIA ESCONDE",
        "REVELADO"
    ];

    suspeitas.forEach(p => {
        if (texto.includes(p)) score += 20;
    });

    const exclamacoes = (texto.match(/!/g) || []).length;
    score += exclamacoes * 3;

    if (texto.length < 60)
        score += 15;

    if (!/\d/.test(texto))
        score += 10;

    if (!texto.includes("FONTE"))
        score += 10;

    return score;
}

async function enviar(msg) {
    const encoder = new TextEncoder();

    await characteristic.writeValue(
        encoder.encode(msg + "\n")
    );
}

async function analisar() {

    if (!characteristic) {
        alert("Conecte o micro:bit primeiro");
        return;
    }

    const texto =
        document.getElementById("texto").value;

    const score = analisarIA(texto);

    let resultado = "";

    if (score >= 60)
        resultado = "RED";
    else if (score >= 30)
        resultado = "YELLOW";
    else
        resultado = "GREEN";

    document.getElementById("resultado")
        .innerText = resultado;

    document.getElementById("score")
        .innerText = "Pontuação: " + score;

    await enviar(resultado);
}