(function() {
    var element = document.getElementById("canvas"),
        c = element.getContext("2d"),
        width = element.width,
        height = element.height,
        imageData = c.createImageData(width, height),
        data = imageData.data,

        centerX = 0,
        centerY = 0,
        halfWidth = Math.floor(width / 2),
        halfHeight = Math.floor(height / 2),
        pixelSize = 2 / Math.max(halfWidth, halfHeight),
        drawFrame = function() {
            var idx = 0, 
                coordY = centerY + pixelSize * halfHeight,
                coordXref = centerX - pixelSize * halfWidth;
            for (var i = 0; i < width; i ++) {
                var coordX = coordXref;
                for (var j = 0; j < height; j++) {
                    data[idx] = data[idx + 1] = data[idx + 2] = isInside(coordX, coordY) ? 0 : 255;
                    coordX += pixelSize;
                    idx += 4;
                }
                coordY -= pixelSize;
            }
            c.putImageData(imageData, 0, 0);
        },
        isInside = function(_re, _im) {
            var re = 0, im = 0, re2 = 0, im2 = 0;
            for (i = 0; i < 100; i++) {
                re2 = re * re;
                im2 = im * im;
                if (re2 + im2 > 4) return false;
                im = 2 * re * im + _im; 
                re = re2 - im2 + _re;
            }
            return true;
        },

        moves = {
            shiftLeft:  { active: false, codes: [37, 65] },
            shiftUp:    { active: false, codes: [38, 87] },
            shiftRight: { active: false, codes: [39, 68] },
            shiftDown:  { active: false, codes: [40, 83] },
            zoomIn:     { active: false, codes: [34, 69] },
            zoomOut:    { active: false, codes: [33, 81] }
        },
        handleKey = function(e) {
            for (var m in moves) {
                var move = moves[m];
                if (move.codes.indexOf(e.keyCode) !== -1) {
                    move.active = e.type === 'keydown';
                    return;
                }
            }
        },

        SHIFT_SPEED = 0.5,
        ZOOM_SPEED = 0.002, 
        lastTimestamp = 0,
        moveStuff = function(delta) {
            for (var m in moves) {
                var move = moves[m];
                if (move.active) {
                    switch (m) {
                        case 'shiftLeft':
                            centerX -= delta * SHIFT_SPEED * pixelSize;
                        break;
                        case 'shiftUp':    
                            centerY += delta * SHIFT_SPEED * pixelSize;
                        break;
                        case 'shiftRight': 
                            centerX += delta * SHIFT_SPEED * pixelSize;
                        break;
                        case 'shiftDown':  
                            centerY -= delta * SHIFT_SPEED * pixelSize;
                        break;
                        case 'zoomIn':
                            pixelSize /= 1 + delta * ZOOM_SPEED; 
                        break;
                        case 'zoomOut':
                            pixelSize *= 1 + delta * ZOOM_SPEED; 
                        break;
                    }
                }
            }
        },
        animationLoop = function(timestamp) {
            var delta = timestamp - lastTimestamp;
            
            moveStuff(delta);
            drawFrame();

            lastTimestamp = timestamp;
            requestAnimationFrame(animationLoop);
        };

    window.onkeydown = window.onkeyup = handleKey;
    for (var i = 0; i < data.length; i += 4) {
        data[i + 3] = 255;
    }

    requestAnimationFrame(function(timestamp) {
        lastTimestamp = timestamp;
        requestAnimationFrame(animationLoop);
    });
})();