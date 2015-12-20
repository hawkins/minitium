# Minitium
A simple mini-map system built for the browser game [Initium](http://playinitium.com/), powered by LeafletJS.

# Dependencies
- LeafletJS

# Usage
Using this tool is easy. Simply include dependencies and minitium.js to your HTML, and you're good to go!

Creating a minimap is as simple as:
    var minimap = new minitium('image-map', 64); // Creates a minimap minitium object focusing on div 'image-map' with a tile size of 64 pixels by 64 pixels.

Set the border tile for the map (think fog of war hiding the edges of discovered lands):
    minimap.setBorderTile('images/border_tile.png', 128);
Note that border tiles are suggested to be larger than the normal tiles, as these will be stretched to cover areas slightly larger than a normal tile would cover.

Then, add the map tiles in whatever order you like:
    minimap.addTile('images/map-sample_01.jpg', 0, 0);
    minimap.addTile('images/map-sample_02.jpg', 1, 0);
    minimap.addTile('images/map-sample_03.jpg', 2, 0);

Finally, initialize and display the map on screen with:
    minimap.initialize();

# Examples
To see minimap in action, check out the examples folder included. 
