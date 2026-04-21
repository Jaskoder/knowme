import createElement, { alert, prompt, shareViaWhatsApp, copyToClipboard } from "./core.js";

const senderNameInput = document.querySelector("#senderName");
const inputQuestion = document.querySelector("#question");
const radioButtons = document.querySelectorAll(".radio-group input");
const questionsList = document.querySelector("#questionsList");
const sendButton = document.querySelector("#sendBtn");
const saveButton = document.querySelector("#savebtn");
const resetButton = document.querySelector("#resetBtn");
const questionCountSpan = document.querySelector("#questionCount");

let QUESTIONS = [];
let senderName = "";

function loadSenderName() {
    const savedName = localStorage.getItem("senderName");
    if (savedName) {
        senderNameInput.value = savedName;
        senderName = savedName;
    }
    
    senderNameInput.addEventListener("input", (e) => {
        senderName = e.target.value.trim();
        if (senderName) {
            localStorage.setItem("senderName", senderName);
        }
        updateSendButtonState();
    });
}

function updateSendButtonState() {
    sendButton.disabled = QUESTIONS.length === 0 || !senderName;
}

function updateQuestionCount() {
    const count = QUESTIONS.length;
    questionCountSpan.textContent = `${count} ${count === 1 ? "question" : "questions"}`;
}

function handleClickOnSave() {
    const question = inputQuestion.value.trim();
    const answerRadio = [...radioButtons].find((rb) => rb.checked);
    const answer = answerRadio?.value;

    if (!question || !answerRadio) {
        alert("Assurez-vous d'entrer une question et sa réponse");
        return;
    }

    const newQuestion = { question, answer };
    QUESTIONS.push(newQuestion);
    renderQuestions(QUESTIONS);
    
    inputQuestion.value = "";
    radioButtons.forEach(rb => rb.checked = false);
    
    updateSendButtonState();
}

function deleteQuestion(index) {
    QUESTIONS.splice(index, 1);
    renderQuestions(QUESTIONS);
    updateSendButtonState();
}

function renderQuestions(questions) {
    if (questions.length === 0) {
        questionsList.innerHTML = `
            <div class="empty-state">
                <p>📝 Aucune question pour le moment</p>
                <p class="empty-hint">Ajoutez votre première question à gauche</p>
            </div>
        `;
        updateQuestionCount();
        return;
    }

    questionsList.innerHTML = "";

    for (let i = 0; i < questions.length; i++) {
        const currentQuestion = questions[i];
        const { question, answer } = currentQuestion;

        const questionItem = createElement("div").classNames("question-item");
        const questionText = createElement("div").classNames("question-text").textNode(question);
        const questionAnswer = createElement("div").classNames("question-answer");
        const questionAnswerBadge = createElement("div")
            .classNames("answer-badge", answer === "true" ? "answer-true" : "answer-false")
            .textNode(answer === "true" ? "Vrai" : "Faux");
        
        const deleteBtn = createElement("button")
            .classNames("delete-btn")
            .textNode("🗑️")
            .click(() => deleteQuestion(i));

        questionAnswer.children(questionAnswerBadge, deleteBtn);
        questionItem.children(questionText, questionAnswer);
        questionsList.appendChild(questionItem.toElement);
    }
    
    updateQuestionCount();
}

function generateShareableLink() {
    const questionsJson = JSON.stringify(QUESTIONS);
    const encoded = encodeURIComponent(questionsJson);
    const baseUrl = window.location.origin + window.location.pathname.replace("sender.html", "receiver.html");
    return `${baseUrl}?questions=${encoded}&name=${encodeURIComponent(senderName)}`;
}

function handleClickOnSend() {
    if (QUESTIONS.length === 0) {
        alert("Ajoutez au moins une question avant de partager");
        return;
    }
    
    if (!senderName) {
        alert("Entrez votre nom");
        return;
    }
    
    const shareLink = generateShareableLink();
    
    const shareBox = createElement("div").classNames("prompt-box");
    const title = createElement("h3").textNode("Partager le questionnaire").classNames("panel-title");
    const linkText = createElement("p").textNode(shareLink).classNames("form-input");
    linkText.toElement.style.wordBreak = "break-all";
    linkText.toElement.style.fontSize = "0.8rem";
    
    const buttonGroup = createElement("div").classNames("share-buttons");
    const whatsappBtn = createElement("button")
        .classNames("btn", "btn-whatsapp")
        .textNode("📱 Partager sur WhatsApp")
        .click(() => {
            shareViaWhatsApp(shareLink, `Questionnaire de ${senderName}`);
            document.body.removeChild(shareBox.toElement);
        });
    
    const copyBtn = createElement("button")
        .classNames("btn", "btn-copy")
        .textNode("📋 Copier le lien")
        .click(() => {
            copyToClipboard(shareLink);
            document.body.removeChild(shareBox.toElement);
        });
    
    const closeBtn = createElement("button")
        .classNames("btn", "btn-secondary")
        .textNode("Fermer")
        .click(() => {
            document.body.removeChild(shareBox.toElement);
        });
    
    buttonGroup.children(whatsappBtn, copyBtn);
    shareBox.children(title, linkText, buttonGroup, closeBtn);
    
    document.body.appendChild(shareBox.toElement);
}

function resetAll() {
    if (QUESTIONS.length > 0 && confirm("Êtes-vous sûr de vouloir supprimer toutes les questions ?")) {
        QUESTIONS = [];
        renderQuestions(QUESTIONS);
        updateSendButtonState();
        alert("Toutes les questions ont été supprimées");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadSenderName();
    saveButton.addEventListener("click", handleClickOnSave);
    sendButton.addEventListener("click", handleClickOnSend);
    resetButton.addEventListener("click", resetAll);
    updateSendButtonState();
});