import { alert } from "./core.js";

const namePromptDiv = document.getElementById("namePrompt");
const quizContent = document.getElementById("quizContent");
const receiverNameInput = document.getElementById("receiverNameInput");
const confirmNameBtn = document.getElementById("confirmNameBtn");
const senderNameDisplay = document.getElementById("senderNameDisplay");
const questionText = document.getElementById("questionText");
const radioOptions = document.querySelectorAll(".radio-option");
const radioInputs = document.querySelectorAll('.radio-option input[type="radio"]');
const nextButton = document.getElementById("nextbtn");
const progressDiv = document.getElementById("progress");

let currentQuestionIndex = 0;
let maximumQuestions = 0;
let receiverAnswers = [];
let questionsData = [];
let senderName = "";
let receiverName = "";

function getUrlParams() {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    senderName = urlParams.get("name") || "Anonymous";
    const questions = urlParams.get("questions");
    
    if (questions) {
        try {
            const decoded = decodeURIComponent(questions);
            questionsData = JSON.parse(decoded);
            maximumQuestions = questionsData.length;
        } catch (e) {
            console.error("Error parsing questions:", e);
            questionsData = [];
            maximumQuestions = 0;
        }
    }
    
    senderNameDisplay.textContent = senderName;
}

function updateProgress() {
    if (progressDiv) {
        progressDiv.textContent = `Question ${currentQuestionIndex + 1}/${maximumQuestions}`;
    }
}

function displayQuestion(questionIndex) {
    if (questionIndex < maximumQuestions) {
        const { question } = questionsData[questionIndex];
        questionText.textContent = question;
        radioInputs.forEach(input => input.checked = false);
        updateProgress();
    }
}

function handleRedirect() {
    const urlParams = new URLSearchParams();
    const json = JSON.stringify({
        answers: receiverAnswers,
        senderName: senderName,
        receiverName: receiverName,
        totalQuestions: maximumQuestions
    });
    const encoded = encodeURIComponent(json);
    urlParams.set("data", encoded);
    window.location.href = "./result.html?" + urlParams.toString();
}

function saveAnswer() {
    if (currentQuestionIndex >= maximumQuestions) return;
    
    const { answer } = questionsData[currentQuestionIndex];
    const checkedRadio = [...radioInputs].find((c) => c.checked);
    
    if (!checkedRadio) {
        alert("Veuillez sélectionner une réponse");
        return false;
    }
    
    const receiverAnswer = checkedRadio.value;
    const isValid = receiverAnswer === answer;
    receiverAnswers.push({ valid: isValid, userAnswer: receiverAnswer });
    return true;
}

const handleClickOnNext = () => {
    const saved = saveAnswer();
    if (!saved) return;
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < maximumQuestions) {
        displayQuestion(currentQuestionIndex);
    } else {
        questionText.textContent = `Merci ${receiverName} ! Vous avez répondu à toutes les questions de ${senderName}`;
        nextButton.textContent = 'Voir mon score';
        const radioGroup = document.getElementById("radioGroup");
        if (radioGroup) radioGroup.style.display = 'none';
        nextButton.removeEventListener("click", handleClickOnNext);
        nextButton.addEventListener("click", handleRedirect);
    }
};

function startQuiz() {
    if (maximumQuestions === 0) {
        alert("Aucune question trouvée");
        window.location.href = "./index.html";
        return;
    }
    
    namePromptDiv.style.display = "none";
    quizContent.style.display = "block";
    displayQuestion(currentQuestionIndex);
    nextButton.addEventListener("click", handleClickOnNext);
}

confirmNameBtn.addEventListener("click", () => {
    receiverName = receiverNameInput.value.trim();
    if (!receiverName) {
        alert("Veuillez entrer votre nom");
        return;
    }
    startQuiz();
});

receiverNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        receiverName = receiverNameInput.value.trim();
        if (receiverName) {
            startQuiz();
        }
    }
});

window.addEventListener("DOMContentLoaded", () => {
    getUrlParams();
});