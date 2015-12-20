var minimap = new minitium('image-map', 100);

minimap.addTile('1.png', 0, 0);
minimap.addTile('2.png', 1, 1);
minimap.addTile('3.png', 1, 2);
minimap.addTile('4.png', 0, 1);
minimap.setBorderTile('map-fog.png', 181);
minimap.initialize();
