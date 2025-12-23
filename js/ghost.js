Pacman.Ghost = function (game, map, colour) {

    var position  = null,
        direction = null,
        eatable   = null,
        eaten     = null,
        due       = null,
        malwareImage = null,
        malwareImageLoaded = false;
    
    function getNewCoord(dir, current) { 
        
        var speed  = isVunerable() ? 1 : isHidden() ? 4 : 2,
            xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
            ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);
    
        return {
            "x": addBounded(current.x, xSpeed),
            "y": addBounded(current.y, ySpeed)
        };
    };

    /* Collision detection(walls) is done when a ghost lands on an
     * exact block, make sure they dont skip over it 
     */
    function addBounded(x1, x2) { 
        var rem    = x1 % 10, 
            result = rem + x2;
        if (rem !== 0 && result > 10) {
            return x1 + (10 - rem);
        } else if(rem > 0 && result < 0) { 
            return x1 - rem;
        }
        return x1 + x2;
    };
    
    function isVunerable() { 
        return eatable !== null;
    };
    
    function isDangerous() {
        return eaten === null;
    };

    function isHidden() { 
        return eatable === null && eaten !== null;
    };
    
    function getRandomDirection() {
        var moves = (direction === LEFT || direction === RIGHT) 
            ? [UP, DOWN] : [LEFT, RIGHT];
        return moves[Math.floor(Math.random() * 2)];
    };
    
    function reset() {
        eaten = null;
        eatable = null;
        position = {"x": 90, "y": 80};
        direction = getRandomDirection();
        due = getRandomDirection();
    };
    
    function onWholeSquare(x) {
        return x % 10 === 0;
    };
    
    function oppositeDirection(dir) { 
        return dir === LEFT && RIGHT ||
            dir === RIGHT && LEFT ||
            dir === UP && DOWN || UP;
    };

    function makeEatable() {
        direction = oppositeDirection(direction);
        eatable = game.getTick();
    };

    function eat() { 
        eatable = null;
        eaten = game.getTick();
    };

    function pointToCoord(x) {
        return Math.round(x / 10);
    };

    function nextSquare(x, dir) {
        var rem = x % 10;
        if (rem === 0) { 
            return x; 
        } else if (dir === RIGHT || dir === DOWN) { 
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function secondsAgo(tick) { 
        return (game.getTick() - tick) / Pacman.FPS;
    };

    function getColour() { 
        if (eatable) { 
            // Return original color for dimming effect (no blue tint)
            return colour;
        } else if(eaten) { 
            return "#222";
        } 
        return colour;
    };

    function getMalwareType() {
        // Map colors to malware types
        if (colour === "#00FF00") return "virus";      // Green -> Virus
        if (colour === "#FF0000") return "ransomware"; // Red -> Ransomware
        if (colour === "#FFAA00") return "worm";       // Yellow/Orange -> Worm
        if (colour === "#6A5ACD") return "trojan";     // Blue/Purple -> Trojan
        return "virus"; // Default
    };

    function getImagePath() {
        var malwareType = getMalwareType();
        var imagePaths = {
            "virus": "images/viruss.png",
            "ransomware": "images/ransomwaree.png",
            "worm": "images/worm.png",
            "trojan": "images/trojan.png"
        };
        return imagePaths[malwareType] || imagePaths["virus"];
    }

    function loadMalwareImage() {
        malwareImage = new Image();
        malwareImage.onload = function() {
            malwareImageLoaded = true;
            console.log("Malware image loaded: " + getImagePath());
        };
        malwareImage.onerror = function() {
            malwareImageLoaded = false;
            console.error("Failed to load malware image: " + getImagePath());
        };
        var imagePath = getImagePath() + "?v=" + Date.now();
        malwareImage.src = imagePath;
    }

    function drawMalwareImage(ctx, left, top, s, baseColor) {
        // Only draw if image is loaded
        if (!malwareImageLoaded || !malwareImage) {
            // Fallback: draw a simple colored rectangle while loading
            ctx.fillStyle = baseColor;
            ctx.fillRect(left, top, s, s);
            return;
        }

        // Check if image is fully loaded
        var isLoaded = malwareImage.complete && 
                       (malwareImage.naturalWidth > 0 || malwareImage.width > 0);
        
        if (!isLoaded) {
            // Still loading - draw fallback
            ctx.fillStyle = baseColor;
            ctx.fillRect(left, top, s, s);
            return;
        }

        // Save context state
        ctx.save();

        // Apply dimming effect for vulnerable state
        if (eatable) {
            // When vulnerable, just dim the ghost (reduced opacity)
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 0.4; // Dim the ghost
            ctx.drawImage(malwareImage, left, top, s, s);
            ctx.globalAlpha = 1.0; // Reset alpha
            ctx.globalCompositeOperation = "source-over";
        } else if (eaten) {
            // When eaten, draw dark/disabled version
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(malwareImage, left, top, s, s);
            
            // Apply dark overlay
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#222";
            ctx.globalAlpha = 0.8;
            ctx.fillRect(left, top, s, s);
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = "source-over";
        } else {
            // Normal state - draw image as-is
            ctx.drawImage(malwareImage, left, top, s, s);
        }

        // Restore context state
        ctx.restore();
    }

    function draw(ctx) {
  
        var s    = map.blockSize, 
            top  = (position.y/10) * s,
            left = (position.x/10) * s;
    
        if (eatable && secondsAgo(eatable) > 8) {
            eatable = null;
        }
        
        if (eaten && secondsAgo(eaten) > 3) { 
            eaten = null;
        }
        
        var baseColor = getColour();
        
        // Draw malware image
        drawMalwareImage(ctx, left, top, s, baseColor);
    };

    function pane(pos) {

        if (pos.y === 100 && pos.x >= 190 && direction === RIGHT) {
            return {"y": 100, "x": -10};
        }
        
        if (pos.y === 100 && pos.x <= -10 && direction === LEFT) {
            return position = {"y": 100, "x": 190};
        }

        return false;
    };
    
    function move(ctx) {
        
        var oldPos = position,
            onGrid = onGridSquare(position),
            npos   = null;
        
        if (due !== direction) {
            
            npos = getNewCoord(due, position);
            
            if (onGrid &&
                map.isFloorSpace({
                    "y":pointToCoord(nextSquare(npos.y, due)),
                    "x":pointToCoord(nextSquare(npos.x, due))})) {
                direction = due;
            } else {
                npos = null;
            }
        }
        
        if (npos === null) {
            npos = getNewCoord(direction, position);
        }
        
        if (onGrid &&
            map.isWallSpace({
                "y" : pointToCoord(nextSquare(npos.y, direction)),
                "x" : pointToCoord(nextSquare(npos.x, direction))
            })) {
            
            due = getRandomDirection();            
            return move(ctx);
        }

        position = npos;        
        
        var tmp = pane(position);
        if (tmp) { 
            position = tmp;
        }
        
        due = getRandomDirection();
        
        return {
            "new" : position,
            "old" : oldPos
        };
    };
    
    // Load the malware image when ghost is created
    loadMalwareImage();
    
    return {
        "eat"         : eat,
        "isVunerable" : isVunerable,
        "isDangerous" : isDangerous,
        "makeEatable" : makeEatable,
        "reset"       : reset,
        "move"        : move,
        "draw"        : draw
    };
};

