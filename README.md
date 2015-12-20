# Minitium
A simple mini-map system built for the browser game [Initium](http://playinitium.com/), powered by LeafletJS.

# Dependencies
- LeafletJS

# Usage
Using this tool is easy. Simply include dependencies and minitium.js to your HTML, and you're good to go!

Creating a mini-map is as simple as:
```var minimap = new minitium('image-map', 64, 1, 4);```. This creates a minitium object focusing on div ```image-map``` with a tile size of ```64 x 64``` pixels. This map will have zoom levels ranging from ```1``` to ```4```.

Set the border tile for the map (think fog of war hiding the edges of discovered lands):
```minimap.setBorderTile('images/border_tile.png', 128);```
Note that border tiles are suggested to be larger than the normal tiles, as these will be stretched to cover areas slightly larger than a normal tile would cover.

Then, add the map tiles in whatever order you like:

```
minimap.addTile('images/tile_01.jpg', 0, 0);
minimap.addTile('images/tile_02.jpg', 1, 0);
minimap.addTile('images/tile_03.jpg', 1, 2);
```

Finally, initialize and display the map on screen with:
```minimap.initialize();```

# Examples
To see minitium in action, check out the examples folder included.
