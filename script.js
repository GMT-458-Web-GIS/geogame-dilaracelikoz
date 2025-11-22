

const map = L.map('map-area').setView([40.7128, -74.0060], 13); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    
}).addTo(map);

console.log("1st commit after read.me.");