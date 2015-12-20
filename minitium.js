function minitium (divName, size) {
    this.maxZoom = 2;
    this.minZoom = 1;
    this.borderTile = "fog.png";
    this.borderSize = size;
    this.borderTiles = [];
    this.tileURLs = [];
    this.tileBounds = [];
    this.fogOverlap = size*1.0/2;
    this.tileSize = size; // 64 for example
    this.map = L.map(divName, {
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        crs: L.CRS.Simple,
        attributionControl: false
    }).setView([0, 0], this.minZoom);
    // Function definitions
    this.addTile = addTile;
    this.setBorderTile = setBorderTile;
    this.initialize = initialize;
    this.setMaxZoom = setMaxZoom;
    this.setMinZoom = setMinZoom;
    this.updateFogOverlap = updateFogOverlap;
}

// Array comparator for fog search
function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

// setBorderTile(string URL, int fogSize);
function setBorderTile(URL, borderSize) {
    this.borderTile = URL;
    this.borderSize = borderSize;
    this.updateFogOverlap();
}

// addTile(string URL, int X, int Y);
function addTile(URL, x, y) {
    this.tileURLs.push(URL);
    this.tileBounds.push(
        [
            [x*this.tileSize, (y+1)*this.tileSize],
            [(x+1)*this.tileSize, y*this.tileSize]
        ]);
}

function setMaxZoom(zoom) {
    this.maxZoom = zoom;
    this.map.setMaxZoom(this.maxZoom);
}
function setMinZoom(zoom) {
    this.minZoom = zoom;
    this.map.setMinZoom(this.minZoom);
}
function updateFogOverlap() {
    this.fogOverlap = (this.borderSize - this.tileSize)*1.0 / 3.0;
}

// draw map and display
function initialize() {
    // Add image overlays for each tile
    for (var i = 0; i < this.tileURLs.length; i++) {
        var imageURL = this.tileURLs[i].toString();
        var imageBounds = new L.LatLngBounds(
            this.map.unproject(this.tileBounds[i][0], this.map.getMinZoom()),
            this.map.unproject(this.tileBounds[i][1], this.map.getMinZoom())
        );
        var imageOverlay = new L.imageOverlay(imageURL, imageBounds);
        imageOverlay.addTo(this.map);
    }

    // Find center of map
    var minX, minY, maxX, maxY;
    minX = this.tileBounds[0][0][0];
    minY = this.tileBounds[0][0][1];
    maxX = this.tileBounds[0][0][0];
    maxY = this.tileBounds[0][0][1];
    for (var i = 0; i < this.tileBounds.length; i++) {
        for (var j = 0; j < this.tileBounds[i].length; j++) {
            if (this.tileBounds[i][j][0] < minX) {
                minX = this.tileBounds[i][j][0];
            }
            if (this.tileBounds[i][j][1] < minY) {
                minY = this.tileBounds[i][j][1];
            }
            if (this.tileBounds[i][j][0] > maxX) {
                maxX = this.tileBounds[i][j][0];
            }
            if (this.tileBounds[i][j][1] > maxY) {
                maxY = this.tileBounds[i][j][1];
            }
        }
    }
    var center = [(minX + maxX * 1.0/2.0), (minY + maxY * 1.0/2.0)];

    // Reset camera to center
    this.map.setView(this.map.unproject(center, this.map.getMinZoom()), this.map.getMinZoom());
    this.map.setMaxBounds(
        new L.LatLngBounds(
            this.map.unproject([0, maxY], this.map.getMinZoom()),
            this.map.unproject([maxX, 0], this.map.getMinZoom())
        )
    );

    // Add fog tiles
    for (var i = 0; i < this.tileBounds.length; i++) {
        // Start with top fog first
        // Check if top neighbor not in list
        var found = false;
        var goalArray = [
            [this.tileBounds[i][0][0], this.tileBounds[i][0][1] - this.tileSize],
            [this.tileBounds[i][1][0], this.tileBounds[i][1][1] - this.tileSize]
        ];
        for (var j = 0; j < this.tileBounds.length; j++) {
            // if goal is found, fog not needed
            if (arraysEqual(goalArray, this.tileBounds[j])) {
                found = true;
                break;
            }
        }
        if (found == false) {
            for (var j = 0; j < this.borderTiles.length; j++) {
                // if goal is found, fog not needed
                if (arraysEqual(goalArray, this.borderTiles[j])) {
                    found = true;
                    break;
                }
            }
        }
        if (found == false) {
                // Top neighbor does not exist; add fog
                // Push to borderTileBounds so we know fog exists there already
                this.borderTiles.push(goalArray);
                var fogBounds = new L.LatLngBounds(
                    this.map.unproject(
                        [this.tileBounds[i][0][0] - this.fogOverlap, this.tileBounds[i][0][1] - this.tileSize + this.fogOverlap], this.map.getMinZoom()),
                    this.map.unproject(
                        [this.tileBounds[i][1][0] + this.fogOverlap, this.tileBounds[i][1][1] - this.tileSize - this.fogOverlap], this.map.getMinZoom())
                );
                var fogOverlay = new L.imageOverlay(this.borderTile, fogBounds);
                fogOverlay.addTo(this.map);
        }

        // Next, look for bottom neighbor
        found = false;
        goalArray = [
            [this.tileBounds[i][0][0], this.tileBounds[i][0][1] + this.tileSize],
            [this.tileBounds[i][1][0], this.tileBounds[i][1][1] + this.tileSize]
        ];
        for (var j = 0; j < this.tileBounds.length; j++) {
            // if goal is found, fog not needed
            if (arraysEqual(goalArray, this.tileBounds[j])) {
                found = true;
                break;
            }
        }
        if (found == false) {
            for (var j = 0; j < this.borderTiles.length; j++) {
                // if goal is found, fog not needed
                if (arraysEqual(goalArray, this.borderTiles[j])) {
                    found = true;
                    break;
                }
            }
        }
        if (found == false) {
                // Bottom neighbor does not exist; add fog
                // Push to borderTileBounds so we know fog exists there already
                this.borderTiles.push(goalArray);
                var fogBounds = new L.LatLngBounds(
                    this.map.unproject(
                        [this.tileBounds[i][0][0] - this.fogOverlap, this.tileBounds[i][0][1] + this.tileSize + this.fogOverlap], this.map.getMinZoom()),
                    this.map.unproject(
                        [this.tileBounds[i][1][0] + this.fogOverlap, this.tileBounds[i][1][1] + this.tileSize - this.fogOverlap], this.map.getMinZoom())
                );
                var fogOverlay = new L.imageOverlay(this.borderTile, fogBounds);
                fogOverlay.addTo(this.map);
        }

        // Next, look for left neighbor
        found = false;
        goalArray = [
            [this.tileBounds[i][0][0] - this.tileSize, this.tileBounds[i][0][1]],
            [this.tileBounds[i][1][0] - this.tileSize, this.tileBounds[i][1][1]]
        ];
        for (var j = 0; j < this.tileBounds.length; j++) {
            // if goal is found, fog not needed
            if (arraysEqual(goalArray, this.tileBounds[j])) {
                found = true;
                break;
            }
        }
        if (found == false) {
            for (var j = 0; j < this.borderTiles.length; j++) {
                // if goal is found, fog not needed
                if (arraysEqual(goalArray, this.borderTiles[j])) {
                    found = true;
                    break;
                }
            }
        }
        if (found == false) {
                // Left neighbor does not exist; add fog
                // Push to borderTileBounds so we know fog exists there already
                this.borderTiles.push(goalArray);
                var fogBounds = new L.LatLngBounds(
                    this.map.unproject(
                        [this.tileBounds[i][0][0] - this.tileSize - this.fogOverlap, this.tileBounds[i][0][1] + this.fogOverlap], this.map.getMinZoom()),
                    this.map.unproject(
                        [this.tileBounds[i][1][0] - this.tileSize + this.fogOverlap, this.tileBounds[i][1][1] - this.fogOverlap], this.map.getMinZoom())
                );
                var fogOverlay = new L.imageOverlay(this.borderTile, fogBounds);
                fogOverlay.addTo(this.map);
        }

        // Next, look for right neighbor
        found = false;
        goalArray = [
            [this.tileBounds[i][0][0] + this.tileSize, this.tileBounds[i][0][1]],
            [this.tileBounds[i][1][0] + this.tileSize, this.tileBounds[i][1][1]]
        ];
        for (var j = 0; j < this.tileBounds.length; j++) {
            // if goal is found, fog not needed
            if (arraysEqual(goalArray, this.tileBounds[j])) {
                found = true;
                break;
            }
        }
        if (found == false) {
            for (var j = 0; j < this.borderTiles.length; j++) {
                // if goal is found, fog not needed
                if (arraysEqual(goalArray, this.borderTiles[j])) {
                    found = true;
                    break;
                }
            }
        }
        if (found == false) {
                // Left neighbor does not exist; add fog
                // Push to borderTileBounds so we know fog exists there already
                this.borderTiles.push(goalArray);
                var fogBounds = new L.LatLngBounds(
                    this.map.unproject(
                        [this.tileBounds[i][0][0] + this.tileSize - this.fogOverlap, this.tileBounds[i][0][1] + this.fogOverlap], this.map.getMinZoom()),
                    this.map.unproject(
                        [this.tileBounds[i][1][0] + this.tileSize + this.fogOverlap, this.tileBounds[i][1][1] - this.fogOverlap], this.map.getMinZoom())
                );
                var fogOverlay = new L.imageOverlay(this.borderTile, fogBounds);
                fogOverlay.addTo(this.map);
        }
    }
}
