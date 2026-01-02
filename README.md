 # 🎮 Malware Mayhem

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

