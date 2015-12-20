function minitium (divName, size, minZoom, maxZoom) {
    // Leaflet map object
    this.map = L.map(divName, {
        maxZoom: maxZoom,
        minZoom: minZoom,
        crs: L.CRS.Simple,
        attributionControl: false
    }).setView([0, 0], minZoom);
    // Instance variables
    this.borderOverlap = size*1.0/2;
    this.borderSize = size;
    this.borderTile = "border.png";
    this.borderTileCovers = [];
    this.tileBounds = [];
    this.tileSize = size;
    this.tileURLs = [];
    // Method definitions
    this.addTile = addTile;
    this.drawTile = drawTile;
    this.initialize = initialize;
    this.setBorderTile = setBorderTile;
    this.updateBorderOverlap = updateBorderOverlap;
}

// Array comparator for fog search
function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}
// Array searcher for fog search
function arrayContains(a1,a2) {
    for (var n = 0; n < a1.length; n++) {
        if (arraysEqual(a1[n],a2)) {
            return true;
        }
    }
    return false;
}

function addTile(URL, x, y) {
    this.tileURLs.push(URL);
    this.tileBounds.push(
        [
            [x*this.tileSize, (y+1)*this.tileSize],
            [(x+1)*this.tileSize, y*this.tileSize]
        ]);
}

function drawTile(URL, arrayBounds) {
    var imageBounds = new L.LatLngBounds(
        this.map.unproject(arrayBounds[0], this.map.getMinZoom()),
        this.map.unproject(arrayBounds[1], this.map.getMinZoom())
    );
    var imageOverlay = new L.imageOverlay(URL, imageBounds);
    imageOverlay.addTo(this.map);
}

function setBorderTile(URL, borderSize) {
    this.borderTile = URL;
    this.borderSize = borderSize;
    this.updateBorderOverlap();
}

function updateBorderOverlap() {
    this.borderOverlap = (this.borderSize - this.tileSize)*1.0 / 3.0;
}

// draw map and display
function initialize() {
    // Add image overlays for each tile
    for (var i = 0; i < this.tileURLs.length; i++) {
        this.drawTile(this.tileURLs[i].toString(), this.tileBounds[i]);
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
        // Check if top neighbor not in list
        var goalArray = [
            [this.tileBounds[i][0][0], this.tileBounds[i][0][1] - this.tileSize],
            [this.tileBounds[i][1][0], this.tileBounds[i][1][1] - this.tileSize]
        ];
        if (!arrayContains(this.tileBounds, goalArray) && !arrayContains(this.borderTileCovers, goalArray)) {
                // Top neighbor does not exist; add fog
                this.borderTileCovers.push(goalArray); // Push to array so we know fog exists there already
                this.drawTile(this.borderTile, [
                    [this.tileBounds[i][0][0] - this.borderOverlap, this.tileBounds[i][0][1] - this.tileSize + this.borderOverlap],
                    [this.tileBounds[i][1][0] + this.borderOverlap, this.tileBounds[i][1][1] - this.tileSize - this.borderOverlap]
                ]);
        }

        // Next, look for bottom neighbor
        goalArray = [
            [this.tileBounds[i][0][0], this.tileBounds[i][0][1] + this.tileSize],
            [this.tileBounds[i][1][0], this.tileBounds[i][1][1] + this.tileSize]
        ];
        if (!arrayContains(this.tileBounds, goalArray) && !arrayContains(this.borderTileCovers, goalArray)) {
                // Bottom neighbor does not exist; add fog
                this.borderTileCovers.push(goalArray); // Push to array so we know fog exists there already
                this.drawTile(this.borderTile, [
                    [this.tileBounds[i][0][0] - this.borderOverlap, this.tileBounds[i][0][1] + this.tileSize + this.borderOverlap],
                    [this.tileBounds[i][1][0] + this.borderOverlap, this.tileBounds[i][1][1] + this.tileSize - this.borderOverlap]
                ]);
        }

        // Next, look for left neighbor
        goalArray = [
            [this.tileBounds[i][0][0] - this.tileSize, this.tileBounds[i][0][1]],
            [this.tileBounds[i][1][0] - this.tileSize, this.tileBounds[i][1][1]]
        ];
        if (!arrayContains(this.tileBounds, goalArray) && !arrayContains(this.borderTileCovers, goalArray)) {
                // Left neighbor does not exist; add fog
                this.borderTileCovers.push(goalArray); // Push to array so we know fog exists there already
                this.drawTile(this.borderTile, [
                    [this.tileBounds[i][0][0] - this.tileSize - this.borderOverlap, this.tileBounds[i][0][1] + this.borderOverlap],
                    [this.tileBounds[i][1][0] - this.tileSize + this.borderOverlap, this.tileBounds[i][1][1] - this.borderOverlap]
                ]);
        }

        // Next, look for right neighbor
        goalArray = [
            [this.tileBounds[i][0][0] + this.tileSize, this.tileBounds[i][0][1]],
            [this.tileBounds[i][1][0] + this.tileSize, this.tileBounds[i][1][1]]
        ];
        if (!arrayContains(this.tileBounds, goalArray) && !arrayContains(this.borderTileCovers, goalArray)) {
                // Right neighbor does not exist; add fog
                this.borderTileCovers.push(goalArray); // Push to array so we know fog exists there already
                this.drawTile(this.borderTile, [
                    [this.tileBounds[i][0][0] + this.tileSize - this.borderOverlap, this.tileBounds[i][0][1] + this.borderOverlap],
                    [this.tileBounds[i][1][0] + this.tileSize + this.borderOverlap, this.tileBounds[i][1][1] - this.borderOverlap],
                ]);
        }
    }
}
