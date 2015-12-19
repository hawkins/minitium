var map = L.map('image-map', {
    maxZoom: 2,
    minZoom: 1,
    crs: L.CRS.Simple,
    attributionControl: false
}).setView([150, 100], 1);

// Describe limits for entire map's bounds:
var southWest = map.unproject([0, 200], map.getMinZoom());
var northEast = map.unproject([300, 0], map.getMinZoom());
// Describe difference between fog.png size and tile size
var fogDifference = (178-100)/2;

// Now add all known images to map appropriately
// Simulate URL and bounds found from Initium server
var images = [1, 2, 3, 4, 5];
var bounds = [[[0, 100], [100, 0]], [[100, 100], [200, 0]], [[200, 100], [300, 0]],
[[0, 200], [100, 100]], [[100, 200], [200, 100]], [[200, 200], [300, 100]]];
// Create overlay and add to map for each instance
for (var i = 0; i < images.length; i++) {
    var imageURL = images[i].toString()+".png";
    var imageBounds = new L.LatLngBounds(
        map.unproject(bounds[i][0], map.getMinZoom()),
        map.unproject(bounds[i][1], map.getMinZoom())
    );
    var imageOverlay = new L.imageOverlay(imageURL, imageBounds);
    imageOverlay.addTo(map);

    // Add fog
    var fogURL = "fog.png";
    var fogBounds = new L.LatLngBounds(
        map.unproject(
            new Array(bounds[i][0][0] - fogDifference, bounds[i][0][1] + fogDifference), map.getMinZoom()),
        map.unproject(
            new Array(bounds[i][1][0] + fogDifference, bounds[i][1][1] - fogDifference), map.getMinZoom())
    );
    var fogOverlay = new L.imageOverlay(fogURL, fogBounds);
    fogOverlay.addTo(map);
    fogOverlay.bringToBack();
}
// Reset camera to center and lock bounds
map.setView(map.unproject([150,100], map.getMinZoom()), map.getMinZoom());
map.setMaxBounds(new L.LatLngBounds(
    map.unproject([0, 200], map.getMinZoom()),
    map.unproject([300, 0], map.getMinZoom())
));
