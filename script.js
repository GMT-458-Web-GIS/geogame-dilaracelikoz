
const map = L.map('map-area').setView([40.7128, -74.0060], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


let score = 0;
let time = 120;
let gameActive = false;
let timerInterval;
let currentArtifactIndex = 0; 

const artifacts = [
    { name: "City Museum", clue: "The museum is found exactly in the center of the first street intersection.", lat: 40.7150, lng: -74.0150, tolerance: 0.005 },
    { name: "Old Ferry Dock", clue: "Look near the water's edge, south of the largest island.", lat: 40.7000, lng: -74.0100, tolerance: 0.005 },
];


const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const clueText = document.getElementById('clue-text');
const startButton = document.getElementById('start-button');

// Fonksiyonlar
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

function displayClue() {
    if (currentArtifactIndex < artifacts.length) {
        clueText.textContent = artifacts[currentArtifactIndex].clue;
    } else {
        clueText.textContent = "Congratulations! You found all current artifacts.";
        endGame();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        time--;
        timerDisplay.textContent = time;

        if (time <= 0) {
            endGame();
        }
    }, 1000); 
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    clueText.textContent = `GAME OVER! Your final score is ${score}.`;
    startButton.disabled = false;
    map.off('click', handleMapClick); 
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        score = 0;
        time = 120;
        currentArtifactIndex = 0;
        scoreDisplay.textContent = score;
        startButton.disabled = true;

        startTimer();
        displayClue();
        map.on('click', handleMapClick); 
    }
}


function handleMapClick(e) {
    if (gameActive) {
        console.log(`Tıklanan koordinatlar: ${e.latlng.lat}, ${e.latlng.lng}`);
    }
}

timerDisplay.textContent = time;
