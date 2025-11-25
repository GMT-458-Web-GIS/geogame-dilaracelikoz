
const pinkIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', 
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'huechange' 
});


function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

function getDirectionText(userLat, userLng, targetLat, targetLng, distance) {
    let direction = "";
    if (targetLng > userLng) direction += "East";
    else direction += "West";
    
    if (targetLat > userLat) direction = "North " + direction;
    else direction = "South " + direction;

    if (distance < 50) return "You are extremely close! Go Closer!";
    return `Go ${direction}, approx. ${distance} meters 🧭`;
}


let score = 0;
let time = 120;
let gameActive = false;
let timerInterval;
let currentArtifactIndex = 0;
let currentCity = 'ankara'; 
let currentArtifacts = [];
let myChart = null; 
let responseTimes = []; 
let lastTimeRemaining = 120; 


const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const clueText = document.getElementById('clue-text');
const controlButton = document.getElementById('control-button'); 
const citySelect = document.getElementById('city-select'); 
const restartButton = document.getElementById('restart-button');
const splashScreen = document.getElementById('splash-screen'); 
const gameControls = document.getElementById('game-controls'); 
const homeButton = document.getElementById('home-button');
const resultModal = document.getElementById('result-modal'); 


const cityData = {
    ankara: {
        center: [39.9334, 32.8597],
        zoom: 14, 
        distanceThreshold: 300, 
        artifacts: [
            { name: "Ankara Kalesi", clue: "Ankara'nın tam ortasındaki tarihi zirve noktası.", lat: 39.9405, lng: 32.8631 },
            { name: "Anıtkabir", clue: "Türk ulusunun en önemli anıt mezarı.", lat: 39.9250, lng: 32.8369 },
            { name: "Atakule", clue: "Çankaya'nın sembolü olan kule.", lat: 39.8973, lng: 32.8681 },
            { name: "Kuğulu Park", clue: "Çankaya'daki meşhur göletli park.", lat: 39.9022, lng: 32.8601 },
            { name: "Hacettepe Beytepe", clue: "Şehrin batısındaki en büyük üniversite kampüsü.", lat: 39.8660, lng: 32.7480 },
        ]
    },
    istanbul: {
        center: [41.0082, 28.9784],
        zoom: 14, 
        distanceThreshold: 300, 
        artifacts: [
            { name: "Galata Kulesi", clue: "Altın Boynuz'un girişindeki, denizcileri selamlayan kule.", lat: 41.0255, lng: 28.9748 },
            { name: "Yerebatan Sarnıcı", clue: "Ayasofya'nın yakınında, su altındaki gizemli yapı.", lat: 41.0083, lng: 28.9840 },
            { name: "Dolmabahçe Sarayı", clue: "Boğaz kıyısında, Beşiktaş'taki görkemli saray.", lat: 41.0397, lng: 29.0044 },
            { name: "Kız Kulesi", clue: "Üsküdar açıklarında, karadan uzaktaki küçük fener.", lat: 41.0210, lng: 29.0040 },
            { name: "Beşiktaş Stadyumu", clue: "Dolmabahçe Sarayı'nın hemen yanı başındaki spor mabedi.", lat: 41.0366, lng: 29.0069 },
            { name: "Taksim Meydanı", clue: "İstiklal Caddesi'nin bittiği, Cumhuriyet anıtının bulunduğu merkez.", lat: 41.0361, lng: 28.9850 },
            { name: "Karaköy İskelesi", clue: "Galata Köprüsü'nün hemen altında, vapur durağı.", lat: 41.0220, lng: 28.9772 },
            { name: "Pera", clue: "Tarihi Büyük Otellerin bulunduğu, tramvayın geçtiği Avrupai semt.", lat: 41.0310, lng: 28.9750 },
        ]
    }
};



const map = L.map('map-area'); 

function initializeMap() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    

    homeButton.style.display = 'none';
    gameControls.style.display = 'none';
    resetGame();
}

function restartGame() {
    resetGame();
    startGame();
}

function resetGame() {
    currentCity = citySelect.value;
    const cityDataRef = cityData[currentCity];

    currentArtifacts = cityDataRef.artifacts;
    const difficultyText = cityDataRef.distanceThreshold === 300 ? "Easy" : "Hard";

    map.setView(cityDataRef.center, cityDataRef.zoom - 2); 
    map.invalidateSize(); 

    time = 120;
    lastTimeRemaining = 120;
    responseTimes = [];
    
    timerDisplay.textContent = time;
    score = 0;
    scoreDisplay.textContent = score;
    clueText.textContent = `Location: ${currentCity.toUpperCase()} (${difficultyText}). Ready to find ${currentArtifacts.length} relics!`;
    
    gameActive = false;
    controlButton.textContent = "START";
    controlButton.disabled = false;
    currentArtifactIndex = 0;
    clearInterval(timerInterval);
    map.off('click', handleMapClick);

    clearMapLayers(); 
    restartButton.style.display = 'none'; 
}


function clearMapLayers() {
    map.eachLayer(function(layer) {

        if (layer.options.attribution !== '© OpenStreetMap contributors') {
            map.removeLayer(layer);
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
        endGame();
    }
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    clueText.textContent = `GAME OVER!`;
    controlButton.textContent = "NEW GAME";
    controlButton.disabled = false;
    map.off('click', handleMapClick);
    restartButton.style.display = 'none';
    
    showResultModal(); 
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        controlButton.textContent = "PAUSE";
        controlButton.disabled = false;
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

function goHome() {
    if (gameActive) {
        clearInterval(timerInterval);
        map.off('click', handleMapClick);
    }
    

    gameControls.style.display = 'none';
    splashScreen.style.display = 'block';
    homeButton.style.display = 'none';
    

    map.setView([39.9334, 32.8597], 6); 
    clearMapLayers(); 
    
    gameActive = false;
    currentArtifactIndex = 0;
    controlButton.textContent = "START";
}

function selectCity(city) {
    citySelect.value = city;
    splashScreen.style.display = 'none';
    gameControls.style.display = 'block';
    homeButton.style.display = 'block'; 
    resetGame();
}

function closeModal() {
    resultModal.style.display = 'none'; 
    if (myChart) {
        myChart.destroy(); 
    }
    goHome(); 
}

function showResultModal() {
    resultModal.style.display = 'block';
    document.getElementById('final-score-text').textContent = `Final Score: ${score}`;

    const ctx = document.getElementById('gameChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    const labels = responseTimes.map((_, index) => `Relic ${index + 1}`);

    myChart = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Spent (Seconds)', 
                data: responseTimes,
                borderColor: '#FF90BB', 
                backgroundColor: 'rgba(255, 144, 187, 0.2)', 
                borderWidth: 3,
                tension: 0.4, 
                pointBackgroundColor: '#FF90BB',
                pointRadius: 5,
                fill: true 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Seconds' }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Speed Analysis: How fast did you find them?',
                    font: { size: 16 }
                }
            }
        }
    });
}

function handleMapClick(e) {
    if (!gameActive) return;

    const userLat = e.latlng.lat;
    const userLng = e.latlng.lng;
    const target = currentArtifacts[currentArtifactIndex];
    const cityDataRef = cityData[currentCity];

    const distance = getDistance(userLat, userLng, target.lat, target.lng);
    const successThreshold = cityDataRef.distanceThreshold;

    if (distance <= successThreshold) { 

        let timeSpent = lastTimeRemaining - time;
        if (timeSpent < 0) timeSpent = 0; 
        responseTimes.push(timeSpent); 
        lastTimeRemaining = time; 

        updateScore(10); 
        
        L.marker([target.lat, target.lng], {icon: pinkIcon})
            .addTo(map)
            .bindPopup(`SUCCESS! Found ${target.name}!`)
            .openPopup();
            
        currentArtifactIndex++;
        displayClue();
    } else {
        const directionHint = getDirectionText(userLat, userLng, target.lat, target.lng, distance);
        const failedMarker = L.circle([userLat, userLng], { 
            color: 'red', fillColor: 'red', fillOpacity: 0.5, radius: 100 
        }).addTo(map);
        
        clueText.textContent = `Miss! Try again: ${directionHint}`; 
        
        setTimeout(() => {
            map.removeLayer(failedMarker);
            displayClue();
        }, 3000); 
    }
}

initializeMap();