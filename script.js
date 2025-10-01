// =========================================================
// INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const inputFields = document.querySelectorAll('.details-input');
    function validateForm() {
        let allFilled = true;
        inputFields.forEach(input => {
            if (input.value.trim() === '') allFilled = false;
        });
        startBtn.disabled = !allFilled;
    }
    inputFields.forEach(input => input.addEventListener('input', validateForm));
});

// =========================================================
// QUIZ DATA & GLOBAL STATE
// =========================================================
const quizData = [
    { level: 'Easy', points: 10, questions: [
            { question: "Here is question 1 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 2 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }, { question: "Here is question 3 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 4 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 5 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 6 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }, { question: "Here is question 7 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 8 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 9 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 10 of the easy quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }
    ]},
    { level: 'Medium', points: 20, questions: [
            { question: "Here is question 1 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 2 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 3 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 4 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }, { question: "Here is question 5 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 6 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 7 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 8 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }, { question: "Here is question 9 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 10 of the medium quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }
    ]},
    { level: 'Hard', points: 30, questions: [
            { question: "Here is question 1 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 2 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 3 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 4 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }, { question: "Here is question 5 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 6 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }, { question: "Here is question 7 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }, { question: "Here is question 8 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 2 }, { question: "Here is question 9 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 3 }, { question: "Here is question 10 of the hard quiz", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 1 }
    ]}
];

const roundDurations = [ 5 * 60, 5 * 60, 10 * 60 ];
let currentRoundIndex = 0, currentQuestionIndex = 0, totalScore = 0;
let timerInterval, userDetails = {}, selectedAnswerIndex = -1, roundStartTime = 0;
let quizEndedByTimeout = false;
const roundResults = [
    { points: 0, timeTaken: 0, attempted: 0 },
    { points: 0, timeTaken: 0, attempted: 0 },
    { points: 0, timeTaken: 0, attempted: 0 }
];

// =========================================================
// CORE QUIZ & ROUND MANAGEMENT
// =========================================================
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    const activeView = document.getElementById(viewId);
    activeView.classList.remove('hidden'); activeView.classList.add('active');
}

function startQuiz() {
    userDetails = {
        name: document.getElementById('name').value, phone: document.getElementById('phone').value,
        division: document.getElementById('division').value, branch: document.getElementById('branch').value,
        year: document.getElementById('year').value
    };
    showView('quiz-view');
    document.getElementById('quiz-timer').classList.remove('hidden');
    startNewRound();
}

function startNewRound() {
    currentQuestionIndex = 0;
    roundStartTime = Date.now();
    startTimer(roundDurations[currentRoundIndex]);
    loadQuestion();
}

function loadQuestion() {
    selectedAnswerIndex = -1;
    const currentRound = quizData[currentRoundIndex];
    const questionData = currentRound.questions[currentQuestionIndex];
    const optionsContainer = document.getElementById('options-container');

    document.getElementById('round-title').textContent = `Round ${currentRoundIndex + 1}: ${currentRound.level}`;
    document.getElementById('question-progress').textContent = `Question ${currentQuestionIndex + 1} of ${currentRound.questions.length}`;
    document.getElementById('question-text').textContent = questionData.question;
    optionsContainer.innerHTML = '';
    document.getElementById('next-btn').classList.add('hidden');

    questionData.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => selectAnswer(button, index);
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedButton, index) {
    if (selectedAnswerIndex !== -1) return;
    selectedAnswerIndex = index;
    document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
    selectedButton.classList.add('selected');
    document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
    const currentRound = quizData[currentRoundIndex];
    const isCorrect = selectedAnswerIndex === currentRound.questions[currentQuestionIndex].correctIndex;

    roundResults[currentRoundIndex].attempted++;
    if (isCorrect) {
        totalScore += currentRound.points;
        roundResults[currentRoundIndex].points += currentRound.points;
        moveToNext();
    } else {
        showWrongAnswerModal();
    }
}

function moveToNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData[currentRoundIndex].questions.length) {
        loadQuestion();
    } else {
        finishRound(false); // Finished round by answering all questions
    }
}

function finishRound(wasTimeout) {
    clearInterval(timerInterval);
    recordRoundTime();
    quizEndedByTimeout = wasTimeout;

    currentRoundIndex++;
    if (currentRoundIndex < quizData.length) {
        alert(`Round Complete! Get ready for the ${quizData[currentRoundIndex].level} round.`);
        startNewRound();
    } else {
        // All rounds are finished, show the end screen
        showView('end-view');
    }
}

// =========================================================
// MODALS, TIMER, & SCORECARD
// =========================================================
function showWrongAnswerModal() {
    document.getElementById('wrong-answer-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('wrong-answer-modal').classList.add('hidden');
    moveToNext();
}

function startTimer(duration) {
    let timeLeft = duration;
    const timeDisplay = document.getElementById('time-display');
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`Time's up for Round ${currentRoundIndex + 1}!`);
            finishRound(true); // Finished round due to timeout
        }
        timeLeft--;
    }, 1000);
}

function recordRoundTime() {
    const timeTakenInSeconds = Math.round((Date.now() - roundStartTime) / 1000);
    roundResults[currentRoundIndex].timeTaken = timeTakenInSeconds;
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes)}m ${String(seconds).padStart(2, '0')}s`;
}

function showResults() {
    showView('loading-view');
    // Simulate a delay for calculating results
    setTimeout(() => {
        displayScorecard(quizEndedByTimeout);
    }, 2500); // 2.5 second delay
}

function displayScorecard(wasTimeout) {
    showView('score-view');
    document.getElementById('final-score').textContent = totalScore;
    document.getElementById('user-info-display').innerHTML = `
        <p><strong>Name:</strong> ${userDetails.name}</p>
        <p><strong>Phone:</strong> ${userDetails.phone}</p>
        <p><strong>Branch:</strong> ${userDetails.branch} | <strong>Division:</strong> ${userDetails.division} | <strong>Year:</strong> ${userDetails.year}</p>
        ${wasTimeout ? '<p style="color:#ffeb3b; font-weight:bold;">Quiz ended as the final round timer ran out!</p>' : ''}
    `;

    const tableBody = document.querySelector('#scorecard-table tbody');
    tableBody.innerHTML = '';
    quizData.forEach((round, index) => {
        const result = roundResults[index];
        const maxPoints = round.points * round.questions.length;
        tableBody.innerHTML += `
            <tr>
                <td>Round ${index + 1}</td>
                <td>${round.level}</td>
                <td>${result.points} / ${maxPoints}</td>
                <td>${formatTime(result.timeTaken)}</td>
                <td>${result.attempted} / ${round.questions.length}</td>
            </tr>
        `;
    });
}