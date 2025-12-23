# 🎮 Malware Mayhem

A cybersecurity-themed Pac-Man style game where you navigate through a maze while avoiding different types of malware threats. Collect points, avoid the cyber threats, and compete for the highest score!

![Malware Mayhem](images/Gemini_Generated_Image_pmiy2lpmiy2lpmiy.png)

## 🎯 Game Overview

**Malware Mayhem** is an arcade-style browser game that combines classic Pac-Man gameplay with a cybersecurity theme. Navigate through the maze, collect points, and avoid the various malware enemies that will deduct points from your score!

## 🚀 Features

- **Classic Arcade Gameplay**: Navigate through mazes using arrow keys
- **Four Types of Malware Enemies**:
  - 🦠 **Virus** (Green): -50 points
  - 🔒 **Ransomware** (Red): -100 points
  - 🐛 **Worm** (Yellow/Orange): -200 points
  - 🐴 **Trojan** (Blue/Purple): -300 points
- **Score System**: Collect points and compete for high scores
- **Leaderboard**: Save and view your best scores
- **Sound Effects**: Immersive audio experience with mute toggle
- **Retro Styling**: Pixel-perfect graphics with retro game aesthetics

## 🎮 How to Play

1. **Start the Game**: Click the "PLAY" button on the start screen
2. **Movement**: Use arrow keys (↑ ↓ ← →) to navigate through the maze
3. **Objective**: Collect all the dots while avoiding the malware enemies
4. **Scoring**: 
   - Collect dots to increase your score
   - Avoid malware enemies to prevent point deductions
   - Each malware type deducts different amounts of points
5. **Sound Control**: Press `S` or click the mute button to toggle sound
6. **Game Over**: When you lose all lives, enter your name to submit your score to the leaderboard

## 🛠️ Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional dependencies required!

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pacmaze.git
cd pacmaze
```

2. Open `index.html` in your web browser:
   - Simply double-click the `index.html` file, or
   - Use a local web server (recommended):
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
pacmaze/
├── css/
│   └── style.css          # Game styling and UI
├── images/
│   ├── viruss.png         # Virus enemy sprite
│   ├── ransomwaree.png    # Ransomware enemy sprite
│   ├── worm.png           # Worm enemy sprite
│   ├── trojan.png         # Trojan enemy sprite
│   ├── my-player.png      # Player sprite (closed)
│   └── my-player-open.png # Player sprite (open)
├── js/
│   ├── audio.js           # Audio management
│   ├── constants.js       # Game constants and key mappings
│   ├── game.js            # Main game logic
│   ├── ghost.js           # Enemy (malware) AI and behavior
│   ├── main.js            # Game initialization and UI handlers
│   ├── map.js             # Map rendering and collision detection
│   ├── map-data.js        # Maze layout data
│   └── user.js            # Player character logic
└── index.html             # Main HTML file
```

## 🎨 Technologies Used

- **HTML5 Canvas**: For game rendering
- **JavaScript**: Game logic and mechanics
- **CSS3**: Styling and animations
- **jQuery**: DOM manipulation
- **Modernizr**: Feature detection
- **LocalStorage**: Score persistence

## 🎯 Game Mechanics

- **Lives**: Start with 3 lives
- **Scoring**: Points are awarded for collecting dots
- **Malware Penalties**: Different malware types deduct different point values
- **Power-ups**: Special items may appear throughout the game
- **Levels**: Progress through increasingly difficult levels
