var terrainTypes = [
  'plains',
  'desert',
  'forest',
  'mountains',
  'river',
  'tundra'
];

var colors_countryside =
     ['#99e668', '#8ad117', '#1a8add', '#a0a0a0', '#037603'];

var colors_ocean =
     ['#68e6ba', '#17d1d1', '#3c94d4', '#3bc6ab', '#a9ffff'];

var mapTest;

function getRandom(array) {
  var result = array[Math.floor(Math.random() * array.length)];
  return result;
}

class Map {
  constructor(seed) {
    this.seed = seed;
    
    this.height = settings.gameHeight;
    this.width = settings.gameWidth;
    
    var voronoiPoints = [];
    var numPoints = 280;
    for (var i = 0; i < numPoints; i++) {
      voronoiPoints.push([Math.random() * this.width, Math.random() * this.height]);
    }
    
    
    voronoi.size([this.height, this.width]);
    //generate map using voronoi diagrams
    var v = voronoi(voronoiPoints);
    //define areas as polygons
    /*
    v.edges.forEach(function (edge) {
      graphics.drawLine(edge.left[0], edge.left[1], edge.right[0], edge.right[1], .5, getRandomColor());
    });
    */
    mapTest = v.polygons();
    mapTest = mapTest.map(function (polygon) {
      return polygon.filter(function (point) {
        if (point)
          return point;
      });
    });
    
    //resolve border edges
    
    
    //assign colors
    mapTest.forEach(function (poly){
      var color = getRandom(colors_countryside);
      poly.stroke = '#eeeeff';
      poly.fill = color;
    });
  }
  
  update() {
    
  }
}