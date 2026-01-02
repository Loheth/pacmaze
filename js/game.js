var PACMAN = (function () {

    var state        = WAITING,
        audio        = null,
        ghosts       = [],
        ghostSpecs   = ["#00FF00", "#FF0000", "#FFAA00", "#6A5ACD"], // Virus (Green), Ransomware (Red), Worm (Yellow/Orange), Trojan (Blue/Purple)
        eatenCount   = 0,
        level        = 0,
        tick         = 0,
        ghostPos, userPos, 
        stateChanged = true,
        timerStart   = null,
        lastTime     = 0,
        ctx          = null,
        timer        = null,
        map          = null,
        user         = null,
        stored       = null,
        virusMessageTimer = null,
        ransomwareMessageTimer = null,
        wormMessageTimer = null,
        trojanMessageTimer = null,
        powerupMessageTimer = null;

    function getTick() { 
        return tick;
    };

    function drawScore(text, position) {
        ctx.fillStyle = "#FFD700";
        ctx.font      = "bold 14px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        var x = (position["new"]["x"] / 10) * map.blockSize;
        var y = ((position["new"]["y"] + 5) / 10) * map.blockSize;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }
    
    function dialog(text) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font      = "bold 16px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2;        
        ctx.strokeText(text, x, (map.height * 10) + 8);
        ctx.fillText(text, x, (map.height * 10) + 8);
    }
    
    function drawVirusMessage() {
        var text = "SYSTEM INFECTED";
        ctx.fillStyle = "#FF0000";
        ctx.font      = "bold 24px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2,
            y     = (map.height * map.blockSize) / 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    function drawRansomwareMessage() {
        var text = "FILES ENCRYPTED";
        ctx.fillStyle = "#FF0000";
        ctx.font      = "bold 24px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2,
            y     = (map.height * map.blockSize) / 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    function drawWormMessage() {
        var text = "NETWORK COMPROMISED";
        ctx.fillStyle = "#FF0000";
        ctx.font      = "bold 24px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2,
            y     = (map.height * map.blockSize) / 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    function drawTrojanMessage() {
        var text = "BACKDOOR INSTALLED";
        ctx.fillStyle = "#FF0000";
        ctx.font      = "bold 24px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2,
            y     = (map.height * map.blockSize) / 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    function drawPowerupMessage() {
        var text = "INSTALLED FIREWALL";
        
        // Use smaller font size to ensure text fits in maze
        var fontSize = 18;
        ctx.font = "bold " + fontSize + "px 'Press Start 2P', monospace";
        
        // Measure text width and adjust if too wide
        var maxWidth = (map.width * map.blockSize) * 0.9; // 90% of canvas width
        var textWidth = ctx.measureText(text).width;
        
        // If text is too wide, reduce font size
        if (textWidth > maxWidth) {
            fontSize = Math.floor(fontSize * (maxWidth / textWidth));
            ctx.font = "bold " + fontSize + "px 'Press Start 2P', monospace";
            textWidth = ctx.measureText(text).width;
        }
        
        ctx.fillStyle = "#00FF00"; // Green color for positive powerup
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        var x = ((map.width * map.blockSize) - textWidth) / 2,
            y = (map.height * map.blockSize) / 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    function soundDisabled() {
        return localStorage["soundDisabled"] === "true";
    };
    
    function startLevel() {        
        user.resetPosition();
        for (var i = 0; i < ghosts.length; i += 1) { 
            ghosts[i].reset();
        }
        audio.play("start");
        timerStart = tick;
        setState(COUNTDOWN);
    }    

    function startNewGame() {
        // Make sure game over screen is hidden
        var gameOverScreen = document.getElementById("game-over-screen");
        var gameContainer = document.getElementById("game-container");
        if (gameOverScreen) gameOverScreen.style.display = "none";
        if (gameContainer) gameContainer.style.display = "flex";
        
        setState(WAITING);
        level = 1;
        user.reset();
        map.reset();
        map.draw(ctx);
        startLevel();
    }

    function keyDown(e) {
        // Don't process game keys if we're in game over state or if an input field is focused
        var activeElement = document.activeElement;
        var isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
        
        if (state === GAME_OVER || isInputFocused) {
            // Allow input fields to work normally
            return true;
        }
        
        if (e.keyCode === KEY.N) {
            startNewGame();
        } else if (e.keyCode === KEY.S) {
            audio.disableSound();
            localStorage["soundDisabled"] = !soundDisabled();
        } else if (e.keyCode === KEY.P && state === PAUSE) {
            audio.resume();
            map.draw(ctx);
            setState(stored);
        } else if (e.keyCode === KEY.P) {
            stored = state;
            setState(PAUSE);
            audio.pause();
            map.draw(ctx);
            dialog("Paused");
        } else if (state !== PAUSE) {   
            return user.keyDown(e);
        }
        return true;
    }    

    function loseLife() {        
        setState(WAITING);
        user.loseLife();
        if (user.getLives() > 0) {
            startLevel();
        } else {
            // Game over - no lives left
            setState(GAME_OVER);
            showGameOverScreen();
        }
    }

    function getLeaderboard() {
        var leaderboard = localStorage.getItem("malwareMayhemLeaderboard");
        if (leaderboard) {
            try {
                return JSON.parse(leaderboard);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    function saveToLeaderboard(name, score) {
        var leaderboard = getLeaderboard();
        leaderboard.push({
            name: name || "Anonymous",
            score: score,
            date: new Date().toISOString()
        });
        // Sort by score descending
        leaderboard.sort(function(a, b) {
            return b.score - a.score;
        });
        // Keep only top 5
        leaderboard = leaderboard.slice(0, 5);
        localStorage.setItem("malwareMayhemLeaderboard", JSON.stringify(leaderboard));
        return leaderboard;
    }

    function displayLeaderboard() {
        var leaderboard = getLeaderboard();
        var listElement = document.getElementById("leaderboard-list");
        if (!listElement) return;
        
        listElement.innerHTML = "";
        
        if (leaderboard.length === 0) {
            listElement.innerHTML = '<div style="text-align: center; color: #FFFFFF; padding: 20px; font-size: 10px;">No scores yet. Be the first!</div>';
            return;
        }
        
        // Display only top 5
        var top5 = leaderboard.slice(0, 5);
        
        for (var i = 0; i < top5.length; i++) {
            var item = top5[i];
            var rankClass = "";
            if (i === 0) rankClass = "rank-1";
            else if (i === 1) rankClass = "rank-2";
            else if (i === 2) rankClass = "rank-3";
            
            var rankText = (i + 1) + ".";
            var nameText = item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name;
            var scoreText = item.score.toString().padStart(6, "0");
            
            var itemDiv = document.createElement("div");
            itemDiv.className = "leaderboard-item " + rankClass;
            itemDiv.innerHTML = '<span class="leaderboard-rank">' + rankText + '</span>' +
                               '<span class="leaderboard-name">' + nameText + '</span>' +
                               '<span class="leaderboard-score">' + scoreText + '</span>';
            listElement.appendChild(itemDiv);
        }
    }

    function showGameOverScreen() {
        var gameContainer = document.getElementById("game-container");
        var gameOverScreen = document.getElementById("game-over-screen");
        var finalScoreDisplay = document.getElementById("final-score-display");
        var nameInputSection = document.getElementById("name-input-section");
        var leaderboardSection = document.getElementById("leaderboard-section");
        var playerNameInput = document.getElementById("player-name-input");
        var submitButton = document.getElementById("submit-score-button");
        var playAgainButton = document.getElementById("play-again-button");
        
        if (!gameOverScreen || !gameContainer) return;
        
        // Hide game container, show game over screen
        gameContainer.style.display = "none";
        gameOverScreen.style.display = "flex";
        
        // Display final score
        var finalScore = user.theScore();
        if (finalScoreDisplay) {
            finalScoreDisplay.textContent = "Final Score: " + finalScore.toString().padStart(6, "0");
        }
        
        // Show name input section, hide leaderboard initially
        if (nameInputSection) nameInputSection.style.display = "flex";
        if (leaderboardSection) leaderboardSection.style.display = "none";
        
        // Focus on name input
        if (playerNameInput) {
            playerNameInput.value = "";
            setTimeout(function() {
                playerNameInput.focus();
            }, 100);
        }
        
        // Submit button handler
        function handleSubmit() {
            // Get fresh reference to input field
            var nameInput = document.getElementById("player-name-input");
            var name = nameInput ? nameInput.value.trim() : "";
            if (!name) name = "Anonymous";
            
            saveToLeaderboard(name, finalScore);
            displayLeaderboard();
            
            // Hide name input, show leaderboard
            if (nameInputSection) nameInputSection.style.display = "none";
            if (leaderboardSection) leaderboardSection.style.display = "block";
        }
        
        // Remove old event listeners by cloning and replacing
        if (submitButton) {
            var newSubmitButton = submitButton.cloneNode(true);
            submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
            newSubmitButton.addEventListener("click", handleSubmit);
            submitButton = newSubmitButton;
        }
        
        // Enter key on input - need to get fresh reference after cloning
        var nameInput = document.getElementById("player-name-input");
        if (nameInput) {
            nameInput.onkeydown = function(e) {
                // Don't prevent default for normal typing
                if (e.keyCode === KEY.ENTER) {
                    e.preventDefault();
                    handleSubmit();
                }
            };
            // Ensure input is enabled and can receive focus
            nameInput.disabled = false;
            nameInput.readOnly = false;
        }
        
        // Play again button handler
        function handlePlayAgain() {
            gameOverScreen.style.display = "none";
            gameContainer.style.display = "flex";
            startNewGame();
        }
        
        if (playAgainButton) {
            var newPlayAgainButton = playAgainButton.cloneNode(true);
            playAgainButton.parentNode.replaceChild(newPlayAgainButton, playAgainButton);
            newPlayAgainButton.addEventListener("click", handlePlayAgain);
            playAgainButton = newPlayAgainButton;
        }
    }

    function setState(nState) { 
        state = nState;
        stateChanged = true;
    };
    
    function collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) + 
                          Math.pow(ghost.y - user.y, 2))) < 10;
    };

    function drawFooter() {
        
        var topLeft  = (map.height * map.blockSize),
            textBase = topLeft + 17,
            canvasWidth = map.width * map.blockSize;
        
        // Minecraft-style footer background (dirt/stone texture)
        ctx.fillStyle = "#8B7355";
        ctx.fillRect(0, topLeft, canvasWidth, 30);
        
        // Add texture lines
        ctx.strokeStyle = "#6B5B3D";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, topLeft + 15);
        ctx.lineTo(canvasWidth, topLeft + 15);
        ctx.stroke();
        
        // Border
        ctx.strokeStyle = "#2A2A2A";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, topLeft, canvasWidth, 30);

        // Set up text styling
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px 'Press Start 2P', monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        // Helper function to pad numbers with zeros
        function padNumber(num, digits) {
            var str = num.toString();
            while (str.length < digits) {
                str = "0" + str;
            }
            return str;
        }

        // Left side: Score (zero-padded)
        var scoreValue = padNumber(user.theScore(), 2);
        var scoreText = "Score: " + scoreValue;
        ctx.strokeText(scoreText, 15, textBase);
        ctx.fillText(scoreText, 15, textBase);

        // Center: Lives icons only (no label) - Cyber Agent sprites
        var livesCount = user.getLives();
        var livesSpacing = 30; // Increased spacing between icons
        var livesTotalWidth = livesCount * livesSpacing; // Width for all icons with spacing
        var livesStartX = (canvasWidth / 2) - (livesTotalWidth / 2);
        
        for (var i = 0, len = livesCount; i < len; i++) {
            var iconX = livesStartX + (livesSpacing * i) + map.blockSize / 2;
            var iconY = (topLeft+1) + map.blockSize / 2;
            user.drawCyberAgentAt(ctx, iconX, iconY, map.blockSize, RIGHT);
        }

        // Right side: Level (zero-padded)
        var levelValue = padNumber(level, 2);
        var levelText = "Level: " + levelValue;
        var levelTextWidth = ctx.measureText(levelText).width;
        var levelX = canvasWidth - levelTextWidth - 15;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeText(levelText, levelX, textBase);
        ctx.fillText(levelText, levelX, textBase);
    }

    function redrawBlock(pos) {
        map.drawBlock(Math.floor(pos.y/10), Math.floor(pos.x/10), ctx);
        map.drawBlock(Math.ceil(pos.y/10), Math.ceil(pos.x/10), ctx);
    }
    
    function redrawPlayerBlock(pos) {
        // Redraw a larger area (3x3 blocks) around the player position
        // to account for the scaled sprite that extends beyond the block boundaries
        var blockY = Math.floor(pos.y/10);
        var blockX = Math.floor(pos.x/10);
        var hasWall = false;
        
        // Redraw a 3x3 grid of blocks around the player's position
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var y = blockY + dy;
                var x = blockX + dx;
                // Make sure we're within map bounds
                if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
                    // Check if this is a wall block before redrawing
                    if (map.block({y: y, x: x}) === Pacman.WALL) {
                        hasWall = true;
                    }
                    map.drawBlock(y, x, ctx);
                }
            }
        }
        
        // If any wall blocks were redrawn, we need to redraw the wall lines
        // since filling wall blocks erases the wall lines
        if (hasWall) {
            // Redraw walls by drawing them again on top
            var i, j, p, line;
            ctx.strokeStyle = "#808080";
            ctx.lineWidth   = 5;
            ctx.lineCap     = "round";
            
            for (i = 0; i < Pacman.WALLS.length; i += 1) {
                line = Pacman.WALLS[i];
                ctx.beginPath();
                
                for (j = 0; j < line.length; j += 1) {
                    p = line[j];
                    
                    if (p.move) {
                        ctx.moveTo(p.move[0] * map.blockSize, p.move[1] * map.blockSize);
                    } else if (p.line) {
                        ctx.lineTo(p.line[0] * map.blockSize, p.line[1] * map.blockSize);
                    } else if (p.curve) {
                        ctx.quadraticCurveTo(p.curve[0] * map.blockSize, 
                                             p.curve[1] * map.blockSize,
                                             p.curve[2] * map.blockSize, 
                                             p.curve[3] * map.blockSize);   
                    }
                }
                ctx.stroke();
            }
        }
    }

    function mainDraw() { 

        var diff, u, i, len, nScore;
        
        ghostPos = [];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghostPos.push(ghosts[i].move(ctx));
        }
        u = user.move(ctx);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            redrawBlock(ghostPos[i].old);
        }
        redrawPlayerBlock(u.old);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx);
        }                     
        user.draw(ctx);
        
        userPos = u["new"];
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            if (collided(userPos, ghostPos[i]["new"])) {
                if (ghosts[i].isVunerable()) { 
                    audio.play("eatghost");
                    ghosts[i].eat();
                    eatenCount += 1;
                    nScore = eatenCount * 50;
                    drawScore(nScore, ghostPos[i]);
                    user.addScore(nScore);                    
                    setState(EATEN_PAUSE);
                    timerStart = tick;
                } else if (ghosts[i].isDangerous()) {
                    // Check malware type for special handling
                    if (ghosts[i].isVirus()) {
                        // Virus collision: reduce score by 50, lose a life, show message
                        var currentScore = user.theScore();
                        user.addScore(-50);
                        // Ensure score doesn't go below 0
                        if (user.theScore() < 0) {
                            user.setScore(0);
                        }
                        user.loseLife();
                        virusMessageTimer = tick;
                        // If player has lives left, restart level after message
                        if (user.getLives() > 0) {
                            setState(WAITING);
                        } else {
                            // No lives left, game over
                            setState(GAME_OVER);
                            virusMessageTimer = null;
                            showGameOverScreen();
                        }
                    } else if (ghosts[i].isRansomware()) {
                        // Ransomware collision: reduce score by 100, lose a life, show message
                        var currentScore = user.theScore();
                        user.addScore(-100);
                        // Ensure score doesn't go below 0
                        if (user.theScore() < 0) {
                            user.setScore(0);
                        }
                        user.loseLife();
                        ransomwareMessageTimer = tick;
                        // If player has lives left, restart level after message
                        if (user.getLives() > 0) {
                            setState(WAITING);
                        } else {
                            // No lives left, game over
                            setState(GAME_OVER);
                            ransomwareMessageTimer = null;
                            showGameOverScreen();
                        }
                    } else if (ghosts[i].isWorm()) {
                        // Worm collision: reduce score by 200, lose a life, show message
                        var currentScore = user.theScore();
                        user.addScore(-200);
                        // Ensure score doesn't go below 0
                        if (user.theScore() < 0) {
                            user.setScore(0);
                        }
                        user.loseLife();
                        wormMessageTimer = tick;
                        // If player has lives left, restart level after message
                        if (user.getLives() > 0) {
                            setState(WAITING);
                        } else {
                            // No lives left, game over
                            setState(GAME_OVER);
                            wormMessageTimer = null;
                            showGameOverScreen();
                        }
                    } else if (ghosts[i].isTrojan()) {
                        // Trojan collision: reduce score by 300, lose a life, show message
                        var currentScore = user.theScore();
                        user.addScore(-300);
                        // Ensure score doesn't go below 0
                        if (user.theScore() < 0) {
                            user.setScore(0);
                        }
                        user.loseLife();
                        trojanMessageTimer = tick;
                        // If player has lives left, restart level after message
                        if (user.getLives() > 0) {
                            setState(WAITING);
                        } else {
                            // No lives left, game over
                            setState(GAME_OVER);
                            trojanMessageTimer = null;
                            showGameOverScreen();
                        }
                    } else {
                        // Other dangerous ghosts kill the player
                        audio.play("die");
                        setState(DYING);
                        timerStart = tick;
                    }
                }
            }
        }                             
    };

    function mainLoop() {

        var diff;

        if (state !== PAUSE) { 
            ++tick;
        }

        map.drawPills(ctx);

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING && stateChanged) {
            stateChanged = false;
            // Don't show "Press N" message if malware message is being displayed
            if (virusMessageTimer === null && ransomwareMessageTimer === null && 
                wormMessageTimer === null && trojanMessageTimer === null) {
                map.draw(ctx);
                dialog("Press N to start a New game");
            } else {
                // Malware message will be shown, just draw the map
                map.draw(ctx);
            }
        } else if (state === GAME_OVER) {
            // Game over state - screen is handled by showGameOverScreen()
            // Don't draw anything on canvas
        } else if (state === EATEN_PAUSE && 
                   (tick - timerStart) > (Pacman.FPS / 3)) {
            map.draw(ctx);
            setState(PLAYING);
        } else if (state === DYING) {
            if (tick - timerStart > (Pacman.FPS * 2)) { 
                loseLife();
            } else { 
                redrawPlayerBlock(userPos);
                for (i = 0, len = ghosts.length; i < len; i += 1) {
                    redrawBlock(ghostPos[i].old);
                    ghostPos.push(ghosts[i].draw(ctx));
                }                                   
                user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
            }
        } else if (state === COUNTDOWN) {
            
            diff = 5 + Math.floor((timerStart - tick) / Pacman.FPS);
            
            if (diff === 0) {
                map.draw(ctx);
                setState(PLAYING);
            } else {
                if (diff !== lastTime) { 
                    lastTime = diff;
                    map.draw(ctx);
                    dialog("Starting in: " + diff);
                }
            }
        } 

        drawFooter();
        
        // Show virus message for 2 seconds (drawn on top of everything)
        if (virusMessageTimer !== null) {
            if ((tick - virusMessageTimer) < (Pacman.FPS * 2)) {
                drawVirusMessage();
            } else {
                // Message has been shown for 2 seconds, now restart level if lives remain
                virusMessageTimer = null;
                if (state === WAITING && user.getLives() > 0) {
                    startLevel();
                } else if (state === WAITING && user.getLives() <= 0) {
                    setState(GAME_OVER);
                    showGameOverScreen();
                }
            }
        }

        // Show ransomware message for 2 seconds
        if (ransomwareMessageTimer !== null) {
            if ((tick - ransomwareMessageTimer) < (Pacman.FPS * 2)) {
                drawRansomwareMessage();
            } else {
                ransomwareMessageTimer = null;
                if (state === WAITING && user.getLives() > 0) {
                    startLevel();
                } else if (state === WAITING && user.getLives() <= 0) {
                    setState(GAME_OVER);
                    showGameOverScreen();
                }
            }
        }

        // Show worm message for 2 seconds
        if (wormMessageTimer !== null) {
            if ((tick - wormMessageTimer) < (Pacman.FPS * 2)) {
                drawWormMessage();
            } else {
                wormMessageTimer = null;
                if (state === WAITING && user.getLives() > 0) {
                    startLevel();
                } else if (state === WAITING && user.getLives() <= 0) {
                    setState(GAME_OVER);
                    showGameOverScreen();
                }
            }
        }

        // Show trojan message for 2 seconds
        if (trojanMessageTimer !== null) {
            if ((tick - trojanMessageTimer) < (Pacman.FPS * 2)) {
                drawTrojanMessage();
            } else {
                trojanMessageTimer = null;
                if (state === WAITING && user.getLives() > 0) {
                    startLevel();
                } else if (state === WAITING && user.getLives() <= 0) {
                    setState(GAME_OVER);
                    showGameOverScreen();
                }
            }
        }

        // Show powerup message for 2 seconds (flashing effect)
        // Always check timer and clear it after 2 seconds, regardless of state
        if (powerupMessageTimer !== null) {
            var elapsed = tick - powerupMessageTimer;
            // Check if 2 seconds have passed (60 frames at 30 FPS = 2 seconds)
            var twoSecondsInFrames = Pacman.FPS * 2;
            if (elapsed >= twoSecondsInFrames) {
                // Time's up - always clear the timer after exactly 2 seconds
                var wasShowing = (state === PLAYING);
                powerupMessageTimer = null;
                // If we were showing the message, force a complete redraw of the message area
                // to ensure no text marks remain
                if (wasShowing && state === PLAYING) {
                    // Calculate the exact pixel area where text was displayed
                    var text = "INSTALLED FIREWALL";
                    ctx.font = "bold 18px 'Press Start 2P', monospace";
                    var textWidth = ctx.measureText(text).width;
                    var textX = ((map.width * map.blockSize) - textWidth) / 2;
                    var textY = (map.height * map.blockSize) / 2;
                    var textHeight = 25; // Approximate text height including stroke
                    
                    // First, explicitly clear the text area by filling with background color
                    // Add padding to account for stroke width and anti-aliasing
                    var clearPadding = 10;
                    ctx.fillStyle = "#4A3A2A"; // Main background color
                    ctx.fillRect(
                        textX - clearPadding, 
                        textY - textHeight - clearPadding, 
                        textWidth + (clearPadding * 2), 
                        textHeight + (clearPadding * 2)
                    );
                    
                    // Now redraw the center area where message was displayed
                    var centerY = Math.floor((map.height * map.blockSize) / 2 / map.blockSize);
                    var centerX = Math.floor((map.width * map.blockSize) / 2 / map.blockSize);
                    var hasWall = false;
                    
                    // Redraw blocks in message area (wider area to cover text)
                    for (var dy = -4; dy <= 4; dy++) {
                        for (var dx = -10; dx <= 10; dx++) {
                            var y = centerY + dy;
                            var x = centerX + dx;
                            if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
                                if (map.block({y: y, x: x}) === Pacman.WALL) {
                                    hasWall = true;
                                }
                                map.drawBlock(y, x, ctx);
                            }
                        }
                    }
                    
                    // If any wall blocks were redrawn, redraw wall lines
                    if (hasWall) {
                        var i, j, p, line;
                        ctx.strokeStyle = "#808080";
                        ctx.lineWidth   = 5;
                        ctx.lineCap     = "round";
                        
                        for (i = 0; i < Pacman.WALLS.length; i += 1) {
                            line = Pacman.WALLS[i];
                            ctx.beginPath();
                            
                            for (j = 0; j < line.length; j += 1) {
                                p = line[j];
                                
                                if (p.move) {
                                    ctx.moveTo(p.move[0] * map.blockSize, p.move[1] * map.blockSize);
                                } else if (p.line) {
                                    ctx.lineTo(p.line[0] * map.blockSize, p.line[1] * map.blockSize);
                                } else if (p.curve) {
                                    ctx.quadraticCurveTo(p.curve[0] * map.blockSize, 
                                                         p.curve[1] * map.blockSize,
                                                         p.curve[2] * map.blockSize, 
                                                         p.curve[3] * map.blockSize);   
                                }
                            }
                            ctx.stroke();
                        }
                    }
                    
                    // Redraw pills in the message area
                    map.drawPills(ctx);
                    
                    // Redraw any sprites that might be in this area
                    if (userPos) {
                        var userBlockY = Math.floor(userPos.y / 10);
                        var userBlockX = Math.floor(userPos.x / 10);
                        if (Math.abs(userBlockY - centerY) <= 4 && Math.abs(userBlockX - centerX) <= 10) {
                            user.draw(ctx);
                        }
                    }
                    // Redraw ghosts in this area
                    for (var i = 0, len = ghosts.length; i < len; i += 1) {
                        if (ghostPos && ghostPos[i] && ghostPos[i]["new"]) {
                            var ghostBlockY = Math.floor(ghostPos[i]["new"].y / 10);
                            var ghostBlockX = Math.floor(ghostPos[i]["new"].x / 10);
                            if (Math.abs(ghostBlockY - centerY) <= 4 && Math.abs(ghostBlockX - centerX) <= 10) {
                                ghosts[i].draw(ctx);
                            }
                        }
                    }
                }
            } else if (state === PLAYING) {
                // Only draw message during PLAYING state and when timer is active
                // Flash effect: show message every other frame for first second
                if (elapsed < Pacman.FPS) {
                    // Flash every 3 frames for first second (on for 3 frames, off for 3 frames)
                    if ((elapsed % 6) < 3) {
                        drawPowerupMessage();
                    } else {
                        // Clear text area when not flashing to prevent green spots
                        var text = "INSTALLED FIREWALL";
                        ctx.font = "bold 18px 'Press Start 2P', monospace";
                        var textWidth = ctx.measureText(text).width;
                        var textX = ((map.width * map.blockSize) - textWidth) / 2;
                        var textY = (map.height * map.blockSize) / 2;
                        var textHeight = 25;
                        var clearPadding = 10;
                        
                        // Clear the text area
                        ctx.fillStyle = "#4A3A2A";
                        ctx.fillRect(
                            textX - clearPadding, 
                            textY - textHeight - clearPadding, 
                            textWidth + (clearPadding * 2), 
                            textHeight + (clearPadding * 2)
                        );
                        
                        // Redraw blocks in the cleared area
                        var centerY = Math.floor((map.height * map.blockSize) / 2 / map.blockSize);
                        var centerX = Math.floor((map.width * map.blockSize) / 2 / map.blockSize);
                        var hasWall = false;
                        for (var dy = -2; dy <= 2; dy++) {
                            for (var dx = -6; dx <= 6; dx++) {
                                var y = centerY + dy;
                                var x = centerX + dx;
                                if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
                                    if (map.block({y: y, x: x}) === Pacman.WALL) {
                                        hasWall = true;
                                    }
                                    map.drawBlock(y, x, ctx);
                                }
                            }
                        }
                        
                        // If any wall blocks were redrawn, redraw wall lines to prevent blinking
                        if (hasWall) {
                            var i, j, p, line;
                            ctx.strokeStyle = "#808080";
                            ctx.lineWidth   = 5;
                            ctx.lineCap     = "round";
                            
                            for (i = 0; i < Pacman.WALLS.length; i += 1) {
                                line = Pacman.WALLS[i];
                                ctx.beginPath();
                                
                                for (j = 0; j < line.length; j += 1) {
                                    p = line[j];
                                    
                                    if (p.move) {
                                        ctx.moveTo(p.move[0] * map.blockSize, p.move[1] * map.blockSize);
                                    } else if (p.line) {
                                        ctx.lineTo(p.line[0] * map.blockSize, p.line[1] * map.blockSize);
                                    } else if (p.curve) {
                                        ctx.quadraticCurveTo(p.curve[0] * map.blockSize, 
                                                             p.curve[1] * map.blockSize,
                                                             p.curve[2] * map.blockSize, 
                                                             p.curve[3] * map.blockSize);   
                                    }
                                }
                                ctx.stroke();
                            }
                        }
                        
                        map.drawPills(ctx);
                    }
                } else {
                    // Show continuously for second second
                    drawPowerupMessage();
                }
            }
        }
    }

    function eatenPill() {
        audio.play("eatpill");
        timerStart = tick;
        eatenCount = 0;
        for (i = 0; i < ghosts.length; i += 1) {
            ghosts[i].makeEatable(ctx);
        }
        // Show powerup message
        powerupMessageTimer = tick;
    };
    
    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.reset();
        user.newLevel();
        startLevel();
    };

    function keyPress(e) { 
        // Don't prevent default if we're in game over state or if an input field is focused
        var activeElement = document.activeElement;
        var isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
        
        if (state === GAME_OVER || isInputFocused) {
            // Allow input fields to work normally
            return;
        }
        
        if (state !== WAITING && state !== PAUSE) { 
            e.preventDefault();
            e.stopPropagation();
        }
    };
    
    function init(wrapper, root) {
        
        var i, len, ghost,
            // Calculate blockSize based on viewport dimensions to fit screen
            // Use viewport dimensions directly since wrapper might not be visible yet
            viewportWidth = window.innerWidth * 0.9,
            viewportHeight = window.innerHeight * 0.9,
            // Game dimensions: 19 blocks wide, 22 blocks tall + 30px footer
            gameWidth = 19,
            gameHeight = 22,
            footerHeight = 30,
            // Calculate blockSize based on both width and height constraints
            blockSizeByWidth = viewportWidth / gameWidth,
            blockSizeByHeight = (viewportHeight - footerHeight) / gameHeight,
            // Use the smaller to ensure it fits both dimensions
            blockSize = Math.min(blockSizeByWidth, blockSizeByHeight),
            canvas    = document.createElement("canvas");
        
        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 30 + "px");

        wrapper.appendChild(canvas);

        ctx  = canvas.getContext('2d');

        audio = new Pacman.Audio({"soundDisabled":soundDisabled});
        map   = new Pacman.Map(blockSize);
        user  = new Pacman.User({ 
            "completedLevel" : completedLevel, 
            "eatenPill"      : eatenPill 
        }, map, root);

        for (i = 0, len = ghostSpecs.length; i < len; i += 1) {
            ghost = new Pacman.Ghost({"getTick":getTick}, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }
        
        map.draw(ctx);
        dialog("Loading ...");

        var extension = Modernizr.audio.ogg ? 'ogg' : 'mp3';

        var audio_files = [
            ["start", root + "audio/opening_song." + extension],
            ["die", root + "audio/die." + extension],
            ["eatghost", root + "audio/eatghost." + extension],
            ["eatpill", root + "audio/eatpill." + extension],
            ["eating", root + "audio/eating.short." + extension],
            ["eating2", root + "audio/eating.short." + extension]
        ];

        load(audio_files, function() { loaded(); });
    };

    function load(arr, callback) { 
        
        if (arr.length === 0) { 
            callback();
        } else { 
            var x = arr.pop();
            audio.load(x[0], x[1], function() { load(arr, callback); });
        }
    };
        
    function loaded() {

        dialog("Press N to Start");
        
        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keypress", keyPress, true); 
        
        timer = window.setInterval(mainLoop, 1000 / Pacman.FPS);
    };
    
    function toggleSound() {
        var wasDisabled = soundDisabled();
        localStorage["soundDisabled"] = !wasDisabled;
        if (!wasDisabled) {
            // Sound was enabled, now disable it
            if (audio) {
                audio.disableSound();
            }
        }
    }
    
    return {
        "init" : init,
        "toggleSound" : toggleSound,
        "soundDisabled" : soundDisabled
    };
    
}());

