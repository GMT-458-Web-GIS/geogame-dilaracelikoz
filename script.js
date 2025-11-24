
let score = 0;
let time = 120;
let gameActive = false;
let timerInterval;
let currentArtifactIndex = 0;
let currentCity = 'ankara'; 
let currentArtifacts = [];

const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const clueText = document.getElementById('clue-text');
const controlButton = document.getElementById('control-button'); 
const citySelect = document.getElementById('city-select'); 
const restartButton = document.getElementById('restart-button');


const cityData = {
    ankara: {
        center: [39.9334, 32.8597], 
        zoom: 13,
        artifacts: [
            { name: "Ankara Kalesi", clue: "Ankara'nın tam ortasındaki tarihi zirve noktası.", lat: 39.9405, lng: 32.8631, tolerance: 0.005 },
            { name: "Anıtkabir", clue: "Türk ulusunun en önemli anıt mezarı.", lat: 39.9250, lng: 32.8369, tolerance: 0.005 },
            { name: "Atakule", clue: "Çankaya'nın sembolü olan kule.", lat: 39.8973, lng: 32.8681, tolerance: 0.005 },
            { name: "Kuğulu Park", clue: "Çankaya'daki meşhur göletli park.", lat: 39.9022, lng: 32.8601, tolerance: 0.005 },
            { name: "Hacettepe Beytepe", clue: "Şehrin batısındaki en büyük üniversite kampüsü.", lat: 39.8660, lng: 32.7480, tolerance: 0.005 },
        ]
    },
    istanbul: {
        center: [41.0082, 28.9784],
        zoom: 13,
        artifacts: [
            { name: "Placeholder 1", clue: "Istanbul eseri 1", lat: 41.0, lng: 28.9, tolerance: 0.005 },
            { name: "Placeholder 2", clue: "Istanbul eseri 2", lat: 41.01, lng: 28.91, tolerance: 0.005 },
        ]
    }
};


const map = L.map('map-area'); 

function initializeMap() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    resetGame();
}

function restartGame() {
    resetGame();
    startGame();
}

function resetGame() {
    currentCity = citySelect.value;
    currentArtifacts = cityData[currentCity].artifacts;

    map.setView(cityData[currentCity].center, cityData[currentCity].zoom);

    setTimeout(() => {
        map.invalidateSize();
    }, 100); 

    time = 120;
    timerDisplay.textContent = time;
    score = 0;
    scoreDisplay.textContent = score;
    clueText.textContent = `Ready to find ${currentArtifacts.length} relics in ${currentCity}! Press START.`;
    gameActive = false;
    controlButton.textContent = "START";
    controlButton.disabled = false;
    currentArtifactIndex = 0;
    clearInterval(timerInterval);
    map.off('click', handleMapClick);

    map.eachLayer(function(layer) {
        if (layer !== L.tileLayer) {
            if (layer.options.attribution !== '© OpenStreetMap contributors') {
                map.removeLayer(layer);
            }
        }
    });
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

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

function displayClue() {
    if (currentArtifactIndex < currentArtifacts.length) {
        clueText.textContent = currentArtifacts[currentArtifactIndex].clue;
    } else {
        clueText.textContent = "Congratulations! You found all current artifacts.";
        endGame();
    }
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    clueText.textContent = `GAME OVER! Your final score is ${score}.`;
    controlButton.textContent = "NEW GAME";
    controlButton.disabled = false;
    map.off('click', handleMapClick);
    restartButton.style.display = 'none'; 
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        score = 0;
        time = 120; 
        currentArtifactIndex = 0;
        scoreDisplay.textContent = score;
        controlButton.textContent = "PAUSE"; 

        startTimer();
        displayClue();
        map.on('click', handleMapClick);
        restartButton.style.display = 'block';
    }
}

function toggleGame() {
    if (controlButton.textContent === "START" || controlButton.textContent === "NEW GAME") {
        resetGame(); 
        startGame();
        
    } else if (gameActive) {
        gameActive = false;
        clearInterval(timerInterval);
        controlButton.textContent = "RESUME"; 
        map.off('click', handleMapClick); 
        clueText.textContent = "Game Paused. Press RESUME to continue.";

    } else if (!gameActive && time > 0) {
        gameActive = true;
        startTimer();
        controlButton.textContent = "PAUSE";
        map.on('click', handleMapClick); 
        displayClue();
    }
}

function handleMapClick(e) {
    if (!gameActive) return;

    const userLat = e.latlng.lat;
    const userLng = e.latlng.lng;
    const target = currentArtifacts[currentArtifactIndex];
    const tolerance = target.tolerance || 0.005; 

    const latDiff = Math.abs(userLat - target.lat);
    const lngDiff = Math.abs(userLng - target.lng);
    
    const addMarker = (lat, lng, color, radius, text) => {
        const marker = L.circle([lat, lng], { 
            color: color, 
            fillColor: color, 
            fillOpacity: 0.5, 
            radius: radius
        }).addTo(map);
        marker.bindPopup(text).openPopup();
        return marker;
    };


    if (latDiff < tolerance && lngDiff < tolerance) { 

        updateScore(10); 
        addMarker(target.lat, target.lng, 'green', 100, `SUCCESS! Found ${target.name}!`);
            
        currentArtifactIndex++;
        displayClue();

    } else {
        
        const failedMarker = addMarker(userLat, userLng, 'red', 100, 'Miss!');
        clueText.textContent = "That's not it! Try again quickly!";
        
        setTimeout(() => {
            map.removeLayer(failedMarker); 
            displayClue();
        }, 2000); 
    }
}


initializeMap();
citySelect.onchange = resetGame;