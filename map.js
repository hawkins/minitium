var map = L.map('image-map', {
        maxZoom: 24,
        minZoom: 1,
        crs: L.CRS.Simple
    }).setView([0, 0], 1);

    var southWest = map.unproject([0, 768], map.getMinZoom());
    var northEast = map.unproject([1024, 0], map.getMinZoom());

    var imageUrl = 'https://i.imgur.com/ZuUibeV.jpg'
    var imageBounds = new L.LatLngBounds(southWest, northEast);

    L.imageOverlay(imageUrl, imageBounds).addTo(map);

    map.setMaxBounds(imageBounds);
