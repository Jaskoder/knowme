import { shareViaWhatsApp, copyToClipboard } from "./core.js";

const search = window.location.search;
const params = new URLSearchParams(search);
const encodedData = params.get("data");

let decodedData = null;
let score = 0;
let maxScore = 0;
let percent = 0;
let senderName = "";
let receiverName = "";


try {
    if (encodedData) {
        const decoded = decodeURIComponent(encodedData);
        decodedData = JSON.parse(decoded);
        const answers = decodedData.answers || [];
        maxScore = decodedData.totalQuestions || answers.length;
        score = answers.filter((a) => a.valid).length;
        percent = maxScore > 0 ? Math.round(score * 100 / maxScore) : 0;
        senderName = decodedData.senderName || "Anonymous";
        receiverName = decodedData.receiverName || "Vous";
    }
} catch (e) {
    console.error("Error parsing data:", e);
}

const message = percent >= 70 ? "Félicitations! 🎉" : percent >= 50 ? "Pas mal! 👍" : "À améliorer! 💪";

const scoreBox = document.querySelector(".score-box");
const messageDisplayer = document.querySelector(".message");
const percentDisplayer = document.querySelector(".percent");
const scoreCount = document.querySelector(".score-count");
const tipText = document.getElementById("tipText");
const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");
const copyResultBtn = document.getElementById("copyResultBtn");



function generateShareableResultLink() {
    const resultData = {
        receiverName: receiverName,
        senderName: senderName,
        score: score,
        total: maxScore
    };
    
    const jsonString = JSON.stringify(resultData);
    const encoded = encodeURIComponent(jsonString);
    const baseUrl = window.location.origin + window.location.pathname.replace("result.html", "shared_result.html");
    
    return `${baseUrl}?data=${encoded}`;
}


function shareResultLink() {
    const shareLink = generateShareableResultLink();
    const message = `🎯 Découvre mon résultat au questionnaire de ${senderName} ! 🎯\n\nJ'ai obtenu ${percent}% (${score}/${maxScore})\n\n👉 ${shareLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
}


shareWhatsappBtn.addEventListener("click", shareResultLink);

function resolveClassName(scorePercent) {
    if (scorePercent >= 70) return "green";
    if (scorePercent >= 50) return "yellow";
    return "red";
}

function generateResultMessage() {
    return `🎯 Résultat KnowMe 🎯\n\n` +
           `👤 ${receiverName} a répondu au questionnaire de ${senderName}\n` +
           `📊 Score: ${score}/${maxScore}\n` +
           `📈 Pourcentage: ${percent}%\n` +
           `💬 ${message}`;
}

function shareResult() {
    const resultMessage = generateResultMessage();
    shareViaWhatsApp(resultMessage, "Mon résultat KnowMe");
}

function copyResult() {
    const resultMessage = generateResultMessage();
    copyToClipboard(resultMessage, "Résultat copié dans le presse-papier!");
}

window.addEventListener("DOMContentLoaded", () => {
    if (!decodedData) {
        tipText.textContent = "Aucun résultat trouvé";
        return;
    }
    
    const resultClass = resolveClassName(percent);
    scoreBox.classList.add(resultClass);
    
    messageDisplayer.textContent = message;
    percentDisplayer.textContent = percent + "%";
    scoreCount.textContent = `${score}/${maxScore}`;
    tipText.innerHTML = `${receiverName} a obtenu <span>${percent}%</span> au questionnaire de <span>${senderName}</span>`;
    
    shareWhatsappBtn.addEventListener("click", shareResult);
    copyResultBtn.addEventListener("click", copyResult);
});