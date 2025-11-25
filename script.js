
let score = 0;
let time = 120;
let gameActive = false;
let timerInterval;
let currentArtifactIndex = 0;
let currentCity = 'ankara'; 
let currentArtifacts = [];
let currentTolerance = 0.01; 


const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const clueText = document.getElementById('clue-text');
const controlButton = document.getElementById('control-button'); 
const citySelect = document.getElementById('city-select'); 
const restartButton = document.getElementById('restart-button'); 
const splashScreen = document.getElementById('splash-screen'); 
const gameControls = document.getElementById('game-controls'); 




const cityData = {
    ankara: {
        center: [39.9334, 32.8597],
        zoom: 14, 
        tolerance: 0.008, 
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
        zoom: 16, 
        tolerance: 0.003, 
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
    currentTolerance = cityDataRef.tolerance;
    const difficultyText = currentTolerance === 0.01 ? "Easy" : "Hard";


    map.setView(cityDataRef.center, cityDataRef.zoom - 2); 
    map.invalidateSize();

  
    time = 120;
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


    restartButton.style.display = 'none'; 


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
        const target = currentArtifacts[currentArtifactIndex];
        const cityDataRef = cityData[currentCity];

        map.setView([target.lat, target.lng], cityDataRef.zoom); 
        
        clueText.textContent = currentArtifacts[currentArtifactIndex].clue;
    } else {
        clueText.textContent = "Congratulations! You found all current artifacts.";
        endGame();
    }
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    clueText.textContent = `GAME OVER! Final Score: ${score}.`;
    controlButton.textContent = "NEW GAME";
    controlButton.disabled = false;
    map.off('click', handleMapClick);
    restartButton.style.display = 'none'; 
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


function getDirectionText(userLat, userLng, targetLat, targetLng) {
    let direction = "";
    

    if (targetLng > userLng) {
        direction += "East"; 
    } else {
        direction += "West"; 
    }
    
   
    if (targetLat > userLat) {
        direction = "North " + direction; 
    } else {
        direction = "South " + direction; 
    }

 
    const latDiff = Math.abs(userLat - targetLat);
    const lngDiff = Math.abs(userLng - targetLng);

    if (latDiff < 0.005 && lngDiff < 0.005) {
        return "Go Closer!";
    }

    return "Go " + direction + " 🗺️";
}

function handleMapClick(e) {
    if (!gameActive) return;

    const userLat = e.latlng.lat;
    const userLng = e.latlng.lng;
    const target = currentArtifacts[currentArtifactIndex];
    const tolerance = currentTolerance; 

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
        
       
        const directionHint = getDirectionText(userLat, userLng, target.lat, target.lng);
        
        clueText.textContent = `Miss! Try again: ${directionHint}`; 
        
        
        setTimeout(() => {
            map.removeLayer(failedMarker);
            displayClue();
        }, 2000); 
    }
}

const homeButton = document.getElementById('home-button'); 



function goHome() {
 
    if (gameActive) {
        clearInterval(timerInterval);
        map.off('click', handleMapClick);
    }
    

    gameControls.style.display = 'none';
    splashScreen.style.display = 'block';
    homeButton.style.display = 'none'; 

    map.eachLayer(function(layer) {
        if (layer.options.attribution !== '© OpenStreetMap contributors') { 
            map.removeLayer(layer);
        }
    });
    map.setView([39.9334, 32.8597], 6); 


    gameActive = false;
    currentArtifactIndex = 0;
    controlButton.textContent = "START";
}


initializeMap();

function selectCity(city) {
 
    citySelect.value = city;
    
   
    splashScreen.style.display = 'none';
    gameControls.style.display = 'block';
    homeButton.style.display = 'block'; 

 
    resetGame();
}