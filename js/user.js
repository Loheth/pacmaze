Pacman.User = function (game, map, rootPath) {
    
    var position  = null,
        direction = null,
        eaten     = null,
        due       = null, 
        lives     = null,
        score     = 5,
        keyMap    = {},
        spriteImage = null,
        spriteLoaded = false,
        spriteImageOpen = null,
        spriteOpenLoaded = false,
        useSpriteSheet = true; // Set to false if using two separate images
        
    // Default root path to empty string (relative to HTML file)
    rootPath = rootPath || "";
    
    keyMap[KEY.ARROW_LEFT]  = LEFT;
    keyMap[KEY.ARROW_UP]    = UP;
    keyMap[KEY.ARROW_RIGHT] = RIGHT;
    keyMap[KEY.ARROW_DOWN]  = DOWN;

    function addScore(nScore) { 
        score += nScore;
        if (score >= 10000 && score - nScore < 10000) { 
            lives += 1;
        }
    };

    function setScore(newScore) {
        score = newScore;
    };

    function theScore() { 
        return score;
    };

    function loseLife() { 
        lives -= 1;
    };

    function getLives() {
        return lives;
    };

    function initUser() {
        score = 0;
        lives = 3;
        newLevel();
    }
    
    function newLevel() {
        resetPosition();
        eaten = 0;
    };
    
    function resetPosition() {
        position = {"x": 90, "y": 120};
        direction = LEFT;
        due = LEFT;
    };
    
    function reset() {
        initUser();
        resetPosition();
    };        
    
    function keyDown(e) {
        if (typeof keyMap[e.keyCode] !== "undefined") { 
            due = keyMap[e.keyCode];
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
	};

    function getNewCoord(dir, current) {   
        return {
            "x": current.x + (dir === LEFT && -2 || dir === RIGHT && 2 || 0),
            "y": current.y + (dir === DOWN && 2 || dir === UP    && -2 || 0)
        };
    };

    function onWholeSquare(x) {
        return x % 10 === 0;
    };

    function pointToCoord(x) {
        return Math.round(x/10);
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

    function next(pos, dir) {
        return {
            "y" : pointToCoord(nextSquare(pos.y, dir)),
            "x" : pointToCoord(nextSquare(pos.x, dir)),
        };                               
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function isOnSamePlane(due, dir) { 
        return ((due === LEFT || due === RIGHT) && 
                (dir === LEFT || dir === RIGHT)) || 
            ((due === UP || due === DOWN) && 
             (dir === UP || dir === DOWN));
    };

    function move(ctx) {
        
        var npos        = null, 
            nextWhole   = null, 
            oldPosition = position,
            block       = null;
        
        if (due !== direction) {
            npos = getNewCoord(due, position);
            
            if (isOnSamePlane(due, direction) || 
                (onGridSquare(position) && 
                 map.isFloorSpace(next(npos, due)))) {
                direction = due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = getNewCoord(direction, position);
        }
        
        if (onGridSquare(position) && map.isWallSpace(next(npos, direction))) {
            direction = NONE;
        }

        if (direction === NONE) {
            return {"new" : position, "old" : position};
        }
        
        if (npos.y === 100 && npos.x >= 190 && direction === RIGHT) {
            npos = {"y": 100, "x": -10};
        }
        
        if (npos.y === 100 && npos.x <= -12 && direction === LEFT) {
            npos = {"y": 100, "x": 190};
        }
        
        position = npos;        
        nextWhole = next(position, direction);
        
        block = map.block(nextWhole);        
        
        if ((isMidSquare(position.y) || isMidSquare(position.x)) &&
            block === Pacman.BISCUIT || block === Pacman.PILL) {
            
            map.setBlock(nextWhole, Pacman.EMPTY);           
            addScore((block === Pacman.BISCUIT) ? 10 : 50);
            eaten += 1;
            
            if (eaten === 182) {
                game.completedLevel();
            }
            
            if (block === Pacman.PILL) { 
                game.eatenPill();
            }
        }   
                
        return {
            "new" : position,
            "old" : oldPosition
        };
    };

    function isMidSquare(x) { 
        var rem = x % 10;
        return rem > 3 || rem < 7;
    };

    function calcAngle(dir, pos) { 
        // Calculate animation frame based on position for walking animation
        // Frame 0 = closed mouth, Frame 1 = open mouth (Pac-Man style)
        // Only animate when actually moving (direction !== NONE)
        var frame = 0;
        
        if (dir === NONE) {
            // Not moving - always show closed mouth
            frame = 0;
        } else {
            // Moving - animate mouth opening/closing based on position
            // Faster animation cycle: switches every 4 pixels (modulo 8)
            if (dir === RIGHT || dir === LEFT) {
                frame = Math.floor((pos.x % 8) / 4);
            } else {
                frame = Math.floor((pos.y % 8) / 4);
            }
        }
        
        return {"frame": frame, "direction": dir};
    };
    
    function loadSprite() {
        // CRITICAL: This MUST load images/my-player.png - DO NOT CHANGE THIS PATH
        // This is the ONLY image that should be used for the player character
        spriteImage = new Image();
        spriteImage.onload = function() {
            spriteLoaded = true;
            // Check if this is a sprite sheet (width >= 1.5 * height)
            var imgWidth = spriteImage.naturalWidth || spriteImage.width;
            var imgHeight = spriteImage.naturalHeight || spriteImage.height;
            useSpriteSheet = (imgWidth >= imgHeight * 1.5);
            console.log("Player sprite loaded: " + imgWidth + "x" + imgHeight + ", SpriteSheet: " + useSpriteSheet);
            
            // If not a sprite sheet, try to load the open mouth version
            if (!useSpriteSheet) {
                loadOpenMouthSprite();
            }
        };
        spriteImage.onerror = function() {
            spriteLoaded = false;
            console.error("CRITICAL: Failed to load my-player.png from: " + spriteImage.src);
            // Retry with alternative path formats
            var retryImage = new Image();
            retryImage.onload = function() {
                spriteImage = retryImage;
                spriteLoaded = true;
                var imgWidth = spriteImage.naturalWidth || spriteImage.width;
                var imgHeight = spriteImage.naturalHeight || spriteImage.height;
                useSpriteSheet = (imgWidth >= imgHeight * 1.5);
                if (!useSpriteSheet) {
                    loadOpenMouthSprite();
                }
            };
            retryImage.onerror = function() {
                console.error("CRITICAL: Failed to load my-player.png from all paths!");
            };
            // Try with ./ prefix
            retryImage.src = "./images/my-player.png";
        };
        // Always use relative path for local images - NEVER use rootPath for images
        // Add cache-busting timestamp to ensure fresh image (prevents browser caching old images)
        var imagePath = "images/my-player.png?v=" + Date.now();
        spriteImage.src = imagePath;
    }
    
    function loadOpenMouthSprite() {
        // Try to load a separate open mouth image (optional)
        // If this file doesn't exist, we'll just use the sprite sheet approach
        spriteImageOpen = new Image();
        spriteImageOpen.onload = function() {
            spriteOpenLoaded = true;
            console.log("Open mouth sprite loaded");
        };
        spriteImageOpen.onerror = function() {
            spriteOpenLoaded = false;
            // This is okay - we'll use sprite sheet or single image
        };
        spriteImageOpen.src = "images/my-player-open.png?v=" + Date.now();
    }

    function drawDead(ctx, amount) { 

        var size = map.blockSize, 
            half = size / 2,
            x = ((position.x/10) * size) + half,
            y = ((position.y/10) * size) + half,
            scale = 1 - amount;

        if (amount >= 1) { 
            return;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        drawCyberAgent(ctx, size, LEFT, 0);
        ctx.restore();
    };
    
    function drawCyberAgent(ctx, size, dir, frame) {
        // CRITICAL: Only draw if my-player.png is loaded - NO FALLBACK
        if (!spriteImage) {
            return; // Don't draw anything if image not initialized
        }
        
        // Wait for image to load - check multiple ways
        var isLoaded = spriteLoaded && spriteImage.complete && 
                       (spriteImage.naturalWidth > 0 || spriteImage.width > 0);
        
        if (!isLoaded) {
            // Image still loading - don't draw fallback, just return
            // This ensures we ONLY show my-player.png when it's ready
            return;
        }
        
        // Get image dimensions
        var imgWidth = spriteImage.naturalWidth || spriteImage.width;
        var imgHeight = spriteImage.naturalHeight || spriteImage.height;
        
        if (imgWidth === 0 || imgHeight === 0) {
            return; // Invalid image - don't draw anything
        }
        
        ctx.save();
        
        // Determine sprite sheet layout
        // If width is approximately 2x height, treat as sprite sheet with 2 frames side by side
        var frameWidth = imgWidth;
        var frameIndex = 0;
        var imageToUse = spriteImage;
        
        if (useSpriteSheet && imgWidth >= imgHeight * 1.5) {
            // Sprite sheet: two frames side by side
            frameWidth = imgWidth / 2;
            frameIndex = Math.min(Math.max(frame, 0), 1); // Clamp to 0 or 1
        } else if (!useSpriteSheet && frame === 1 && spriteOpenLoaded && spriteImageOpen) {
            // Two separate images: use open mouth image when frame is 1
            // Check if open mouth image is fully loaded
            var openLoaded = spriteImageOpen.complete && 
                           (spriteImageOpen.naturalWidth > 0 || spriteImageOpen.width > 0);
            if (openLoaded) {
                imageToUse = spriteImageOpen;
                frameWidth = spriteImageOpen.naturalWidth || spriteImageOpen.width;
                frameIndex = 0; // Use full open mouth image
            } else {
                // Open mouth not loaded yet, use closed mouth
                frameIndex = 0;
                frameWidth = imgWidth;
            }
        } else {
            // Single image or closed mouth - always use the full image
            frameIndex = 0;
            frameWidth = imgWidth;
        }
        
        // Get dimensions from the image we're actually using
        var useWidth = imageToUse.naturalWidth || imageToUse.width;
        var useHeight = imageToUse.naturalHeight || imageToUse.height;
        
        // Safety check - if dimensions are invalid, fall back to closed mouth
        if (useWidth === 0 || useHeight === 0) {
            imageToUse = spriteImage;
            useWidth = imgWidth;
            useHeight = imgHeight;
            frameWidth = imgWidth;
            frameIndex = 0;
        }
        
        // Calculate source rectangle
        var sx = frameIndex * frameWidth;
        var sy = 0;
        var sWidth = frameWidth;
        var sHeight = useHeight;
        
        // Rotate/flip based on direction
        if (dir === LEFT) {
            ctx.scale(-1, 1);  // Flip horizontally
        } else if (dir === UP) {
            ctx.rotate(-Math.PI / 2);
        } else if (dir === DOWN) {
            ctx.rotate(Math.PI / 2);
        }
        
        // Draw my-player.png at the same size as ghosts
        // Scale sprite larger to account for transparent padding - makes visible content fill blockSize
        // Scale factor: increase size to make sprite fill block like ghosts do
        var scaleFactor = 1.5; // Increase this if sprite still looks small (try 1.5, 1.8, or 2.0)
        var scaledSize = size * scaleFactor;
        var half = scaledSize / 2;
        
        // Draw sprite scaled up to fill blockSize - matches ghost visual size
        ctx.drawImage(
            imageToUse,
            sx, sy, sWidth, sHeight,  // Source rectangle from sprite image
            -half, -half, scaledSize, scaledSize   // Destination rectangle - scaled up to fill block
        );
        
        ctx.restore();
    }


    function draw(ctx) { 

        var s     = map.blockSize, 
            anim  = calcAngle(direction, position),
            x     = ((position.x/10) * s) + s / 2,
            y     = ((position.y/10) * s) + s / 2;

        ctx.save();
        ctx.translate(x, y);
        drawCyberAgent(ctx, s, anim.direction, anim.frame);
        ctx.restore();
    };
    
    // Load the sprite image
    loadSprite();
    
    initUser();

    function drawCyberAgentAt(ctx, x, y, size, dir) {
        ctx.save();
        ctx.translate(x, y);
        drawCyberAgent(ctx, size, dir || RIGHT, 0);
        ctx.restore();
    }

    return {
        "draw"              : draw,
        "drawDead"          : drawDead,
        "drawCyberAgentAt"  : drawCyberAgentAt,
        "loseLife"          : loseLife,
        "getLives"          : getLives,
        "score"             : score,
        "addScore"          : addScore,
        "setScore"          : setScore,
        "theScore"          : theScore,
        "keyDown"           : keyDown,
        "move"              : move,
        "newLevel"          : newLevel,
        "reset"             : reset,
        "resetPosition"     : resetPosition
    };
};

