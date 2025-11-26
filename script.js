
const pinkIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'huechange' 
});

function getDirectionText(userLat, userLng, targetLat, targetLng, distance) {
    let direction = "";
    if (targetLng > userLng) direction += "East"; else direction += "West";
    if (targetLat > userLat) direction = "North " + direction; else direction = "South " + direction;
    if (distance < 50) return "Extremely close!";
    return `Go ${direction}, approx. ${distance}m 🧭`;
}

let score = 0;
let maxPossibleScore = 0;
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
const mouseCoords = document.getElementById('mouse-coords');

const cityData = {
    ankara: {
        center: [39.9334, 32.8597],
        zoom: 14, 
        distanceThreshold: 300, 
        timeLimit: 120, 
        artifacts: [
            { name: "Ankara Castle", clue: "The historical hilltop fortress in the center of old Ankara.", lat: 39.9405, lng: 32.8631 },
            { name: "Anitkabir", clue: "The monumental mausoleum of Mustafa Kemal Ataturk. (BONUS POINTS!)", lat: 39.9250, lng: 32.8369 },
            { name: "Atakule", clue: "The primary landmark tower located in Cankaya.", lat: 39.8859, lng: 32.8558 },
            { name: "Kugulu Park", clue: "A famous park with swans in the Kavaklidere district.", lat: 39.9022, lng: 32.8601 },
            { name: "Hacettepe Beytepe", clue: "The large university campus located in the western hills.", lat: 39.8704, lng: 32.7358 },
            { name: "Republic Museum", clue: "The 2nd Parliament Building, witnessing the early Republic years.", lat: 39.9411, lng: 32.8515 },
            { name: "Eymir Lake", clue: "A natural lake south of the city, popular for biking.", lat: 39.8249, lng: 32.8328 },
            { name: "Ataturk Forest Farm (AOÇ)", clue: "A large recreational farming area and zoo established by Ataturk.", lat: 39.9463, lng: 32.8047 }
        ]
    },
    istanbul: {
        center: [41.0082, 28.9784],
        zoom: 14, 
        distanceThreshold: 300, 
        timeLimit: 90, 
        artifacts: [
            { name: "Galata Tower", clue: "A medieval stone tower in the Galata/Karakoy quarter.", lat: 41.0255, lng: 28.9741 },
            { name: "Basilica Cistern", clue: "The largest of several hundred ancient cisterns beneath the city.", lat: 41.0084, lng: 28.9779 },
            { name: "Dolmabahce Palace", clue: "The main administrative center of the Ottoman Empire on the Bosphorus.", lat: 41.0391, lng: 29.0003 },
            { name: "Maiden's Tower", clue: "A tower on a small islet at the southern entrance of the Bosphorus.", lat: 41.0211, lng: 29.0041 },
            { name: "Tupras Stadium", clue: "A modern football stadium right next to Dolmabahce Palace.", lat: 41.0393, lng: 28.9944 },
            { name: "Taksim Square", clue: "The heart of modern Istanbul, known for the Republic Monument.", lat: 41.0369, lng: 28.9853 },
            { name: "Karakoy Pier", clue: "A busy ferry terminal near the Galata Bridge.", lat: 41.0225, lng: 28.9769 },
            { name: "Pera Museum", clue: "A private museum in the Tepebasi quarter, formerly the Bristol Hotel.", lat: 41.0317, lng: 28.9754 }
        ]
    }
};

const map = L.map('map-area'); 

function initializeMap() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    map.on('mousemove', function(e) {
        mouseCoords.textContent = `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
    });

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

    maxPossibleScore = 0;
    currentArtifacts.forEach(art => {
        if (art.name === "Anitkabir") maxPossibleScore += 50;
        else maxPossibleScore += 10;
    });

    map.setView(cityDataRef.center, cityDataRef.zoom - 2); 
    map.invalidateSize(); 

    time = cityDataRef.timeLimit; 
    lastTimeRemaining = time;
    responseTimes = [];
    
    timerDisplay.textContent = time;
    score = 0;
    scoreDisplay.textContent = score;
    clueText.textContent = `Ready to explore ${currentCity.toUpperCase()}? Press START.`;
    
    gameActive = false;
    controlButton.textContent = "START";
    controlButton.disabled = false;
    currentArtifactIndex = 0;
    clearInterval(timerInterval);
    map.off('click', handleMapClick);

    map.eachLayer(function(layer) {
        if (layer.options.attribution !== '© OpenStreetMap contributors') {
            map.removeLayer(layer);
        }
    });
    restartButton.style.display = 'none'; 
}

function startTimer() {
    timerInterval = setInterval(() => {
        time--;
        timerDisplay.textContent = time;
        if (time <= 0) endGame();
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

function clearMapLayers() {
    map.eachLayer(function(layer) {
        if (layer.options.attribution !== '© OpenStreetMap contributors') {
            map.removeLayer(layer);
        }
    });
}

function closeModal() {
    resultModal.style.display = 'none'; 
    if (myChart) myChart.destroy(); 
    goHome(); 
}

function showResultModal() {
    resultModal.style.display = 'block';
    document.getElementById('final-score-text').textContent = `Final Score: ${score} / ${maxPossibleScore}`;
    
    const msg = document.getElementById('game-over-msg');
    if (score >= maxPossibleScore) {
        msg.textContent = "PERFECT! You found everything!";
        msg.style.color = "#EC7FA9";
        triggerConfetti();
    } else {
        msg.textContent = "Time's up! Try again to find all relics.";
        msg.style.color = "#EC7FA9";
    }

    const ctx = document.getElementById('gameChart').getContext('2d');
    if (myChart) myChart.destroy();

    const labels = responseTimes.map((_, index) => `Q${index + 1}`);

    myChart = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Spent (sec)', 
                data: responseTimes,
                borderColor: '#FF90BB', 
                backgroundColor: 'rgba(255, 144, 187, 0.2)', 
                borderWidth: 3,
                tension: 0.4, 
                pointBackgroundColor: '#FF90BB',
                fill: true 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Seconds' } } },
            plugins: { legend: { display: false } }
        }
    });
}

function handleMapClick(e) {
    if (!gameActive) return;

    const userLat = e.latlng.lat;
    const userLng = e.latlng.lng;
    const target = currentArtifacts[currentArtifactIndex];
    const cityDataRef = cityData[currentCity];
    const from = turf.point([userLng, userLat]); 
    const to = turf.point([target.lng, target.lat]);
    const options = {units: 'meters'}; 
    const distance = Math.round(turf.distance(from, to, options));

    const successThreshold = cityDataRef.distanceThreshold;

    if (distance <= successThreshold) { 
        let timeSpent = lastTimeRemaining - time;
        if (timeSpent < 0) timeSpent = 0; 
        responseTimes.push(timeSpent); 
        lastTimeRemaining = time; 

        let pointsEarned = 10;
        if (target.name === "Anitkabir") pointsEarned = 50;

        updateScore(pointsEarned); 
        
        L.marker([target.lat, target.lng], {icon: pinkIcon})
            .addTo(map)
            .bindPopup(`FOUND! ${target.name} (+${pointsEarned})`)
            .openPopup();
            
        currentArtifactIndex++;
        displayClue();
    } else {
        time -= 2; 
        if (time < 0) time = 0;
        timerDisplay.textContent = time;

        const directionHint = getDirectionText(userLat, userLng, target.lat, target.lng, distance);
        const failedMarker = L.circleMarker([userLat, userLng], { 
            color: '#ff0062ff', fillColor: '#ff0062ff', fillOpacity: 0.5, radius: 13 
        }).addTo(map);
        
        clueText.textContent = `Miss! (-2s) Try again: ${directionHint}`; 
        
        setTimeout(() => {
            map.removeLayer(failedMarker);
            displayClue();
        }, 2500); 
    }
}

function triggerConfetti() {
    var duration = 3 * 1000; 
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

    function randomInOut(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        var colors = ['#FF90BB', '#EC7FA9', '#FFEDFA', '#FFEDFA'];

        confetti(Object.assign({}, defaults, { 
            particleCount, 
            colors: colors,
            origin: { x: randomInOut(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            colors: colors,
            origin: { x: randomInOut(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
    }, 250);
}

initializeMap();