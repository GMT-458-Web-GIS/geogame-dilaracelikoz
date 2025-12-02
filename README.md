# 🌸 HERITAGE HUNT

**Heritage Hunt** is an interactive web-based GeoGame developed for the **GMT 458 - Web GIS** course. The game challenges players to find historical landmarks and cultural heritage sites in major Turkish cities (Ankara and Istanbul) based on textual clues within a limited time.

**[PLAY THE GAME HERE](https://gmt-458-web-gis.github.io/geogame-dilaracelikoz/)** 

---

##  Features

* **Multi-City Gameplay:** Choose between **Ankara** (Easy Mode) and **Istanbul** (Hard Mode).
* **Dynamic Difficulty:**
    * **Easy:** Simpler clues, longer time (105s).
    * **Hard:** Complex clues, shorter time (85s).
* **Smart Feedback System:**
    * The game calculates the real-world distance between the user's click and the target.
    * Provides directional hints which user can follow by the coordinates placed below the map (e.g., "Go North West, approx 300m").
* **Penalty System:** Wrong guesses deduct time (-2 seconds) to increase the challenge.

---

##  Technical Stack & Bonus Libraries

This project was built using **HTML, CSS, and Vanilla JavaScript, and Leaflet.js**. In addition to the core requirements, the following advanced packages were integrated for **Bonus Points**:

### Chart.js 
* **Usage:** At the end of the game, a dynamic line chart is generated inside a modal window.
* **Purpose:** To visualize the player's performance (Time Spent vs. Question Number), allowing users to analyze their speed for each specific landmark.

---

##  Design & UI

The project features custom **"Pink"** theme:
* **Custom Markers:** Standard blue Leaflet markers were filtered to match the pink color palette.
* **3D Effects:** Buttons and info boxes feature CSS-based 3D hover effects and shadows.
* **Responsive Layout:** A clean sidebar for game controls and a full-screen map area.

---

##  How to Play

1.  **Select a City:** Choose Ankara or Istanbul from the splash screen.
2.  **Read the Clue:** Look at the "Target Clue" box to identify the landmark.
3.  **Find & Click:** Navigate the map and click where you think the landmark is located.
    * ✅ **Correct:** You earn points and move to the next clue.
    * ❌ **Incorrect:** You lose 2 seconds and receive a directional hint.
4.  **Review:** When the game ends, check your performance graph in the result window that shows the time that you spend to find the locations.
   <img width="1830" height="867" alt="image" src="https://github.com/user-attachments/assets/93ada0da-8733-4984-b9d1-693ab2b2c14f" />


---

##  Author
**Dilara Çeliköz** 
