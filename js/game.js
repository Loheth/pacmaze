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
        stored       = null;

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
        setState(WAITING);
        level = 1;
        user.reset();
        map.reset();
        map.draw(ctx);
        startLevel();
    }

    function keyDown(e) {
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
        
        // Redraw a 3x3 grid of blocks around the player's position
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var y = blockY + dy;
                var x = blockX + dx;
                // Make sure we're within map bounds
                if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
                    map.drawBlock(y, x, ctx);
                }
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
                    audio.play("die");
                    setState(DYING);
                    timerStart = tick;
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
            map.draw(ctx);
            dialog("Press N to start a New game");            
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
    }

    function eatenPill() {
        audio.play("eatpill");
        timerStart = tick;
        eatenCount = 0;
        for (i = 0; i < ghosts.length; i += 1) {
            ghosts[i].makeEatable(ctx);
        }        
    };
    
    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.reset();
        user.newLevel();
        startLevel();
    };

    function keyPress(e) { 
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

