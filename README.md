# GMT 458 - GeoGame Project: "Lost Relic Hunt"

This document outlines the design for the Assignment 2: GeoGame project.

## 1. Requirements

The game's core requirements are as follows:
* An interactive map will be displayed to the user (using Leaflet.js).
* The user will have a "Score" tracker.
* A "Time Remaining" counter will be present, starting from 120 seconds.
* A "Clue" text area will display hints describing the location of a hidden relic.
* The objective is to find as many relics as possible by clicking on the map before the time runs out.

## 2. Interface Layout

**![WhatsApp Image 2025-11-16 at 23 45 15](https://github.com/user-attachments/assets/34c28272-486c-4e25-a2c0-c77b3268f1ed)** 

### Layout Description:
* **Main Area (Left 80%):** This area will contain the full interactive Leaflet map.
* **Side Panel (Right 20%):** This panel will display all game-related information:
    * Game Title: "Lost Relic Hunt"
    * Score: 0
    * Time Remaining: 120
    * Clue: [Current clue text will appear here...]
    * "Start Game" Button

**Design Note:** This is a preliminary design document. Minor differences in interface and functionality may exist between this design and the final implemented application.

## 3. Game Mechanics and Design

### Progression and Scoring 
The game is time-based. The user will have a total of 120 seconds. The primary goal is to "complete as many tasks as possible" within this time limit. For every correctly identified relic, the user earns points, and a new clue is immediately provided. The game ends when the timer reaches zero.

### Objectives & Lives 
Instead of "questions," the game provides a continuous stream of "clues" or "targets." There is no limit to the number of clues; the goal is to maximize the score within the time limit. The game does not feature a "lives" system. Clicking an incorrect location will only result in lost time, not a point penalty.

### Proposed Technology Stack 
* **Base Map:** Leaflet.js
* **Interface (Timer, Score, Clues):** Vanilla JavaScript
* **(Bonus Goal):** An advanced visualization library like D3.js could be explored to add custom icons for found locations.
