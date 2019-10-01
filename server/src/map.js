var d3 = require('../node_modules/d3-voronoi/dist/d3-voronoi.min.js');

var City = require('./city.js');

//Import voronoi
var voronoi = d3.voronoi();

var terrainTypes = [
  {
    name: 'Plains',
    movecost: .1,
    defence: .1,
    color: '#8ad117'
  },
  {
    name: 'Farm',
    movecost: .2,
    defence: .2,
    color: '#c3a044'
  },
  {
    name: 'Woods',
    movecost: .3,
    defence: .3,
    color: '#037603'
  },
  {
    name: 'Lake',
    movecost: .4,
    defence: .4,
    color: '#1a8add'
  },
  {
    name: 'Mountains',
    movecost: .5,
    defence: .5,
    color: '#a0a0a0'
  }
];

var city_names = ["Aberdeen", "Abilene", "Akron", "Albany", "Albuquerque", "Alexandria", "Allentown", "Amarillo", "Anaheim", "Anchorage", "Ann Arbor", "Antioch", "Apple Valley", "Appleton", "Arlington", "Arvada", "Asheville", "Athens", "Atlanta", "Atlantic City", "Augusta", "Aurora", "Austin", "Bakersfield", "Baltimore", "Barnstable", "Baton Rouge", "Beaumont", "Bel Air", "Bellevue", "Berkeley", "Bethlehem", "Billings", "Birmingham", "Bloomington", "Boise", "Boise City", "Bonita Springs", "Boston", "Boulder", "Bradenton", "Bremerton", "Bridgeport", "Brighton", "Brownsville", "Bryan", "Buffalo", "Burbank", "Burlington", "Cambridge", "Canton", "Cape Coral", "Carrollton", "Cary", "Cathedral City", "Cedar Rapids", "Champaign", "Chandler", "Charleston", "Charlotte", "Chattanooga", "Chesapeake", "Chicago", "Chula Vista", "Cincinnati", "Clarke County", "Clarksville", "Clearwater", "Cleveland", "College Station", "Colorado Springs", "Columbia", "Columbus", "Concord", "Coral Springs", "Corona", "Corpus Christi", "Costa Mesa", "Dallas", "Daly City", "Danbury", "Davenport", "Davidson County", "Dayton", "Daytona Beach", "Deltona", "Denton", "Denver", "Des Moines", "Detroit", "Downey", "Duluth", "Durham", "El Monte", "El Paso", "Elizabeth", "Elk Grove", "Elkhart", "Erie", "Escondido", "Eugene", "Evansville", "Fairfield", "Fargo", "Fayetteville", "Fitchburg", "Flint", "Fontana", "Fort Collins", "Fort Lauderdale", "Fort Smith", "Fort Walton Beach", "Fort Wayne", "Saint Louis", "Saint Paul", "Saint Petersburg", "Salem", "Salinas", "Salt Lake City", "San Antonio", "San Bernardino", "San Buenaventura", "San Diego", "San Francisco", "San Jose", "Santa Ana", "Santa Barbara", "Santa Clara", "Santa Clarita", "Santa Cruz", "Santa Maria", "Santa Rosa", "Sarasota", "Savannah", "Scottsdale", "Scranton", "Seaside", "Seattle", "Sebastian", "Shreveport", "Simi Valley", "Sioux City", "Sioux Falls", "South Bend", "South Lyon", "Spartanburg", "Spokane", "Springdale", "Springfield", "St. Louis", "St. Paul", "St. Petersburg", "Stamford", "Sterling Heights", "Stockton", "Sunnyvale", "Syracuse", "Tacoma", "Tallahassee", "Tampa", "Temecula", "Tempe", "Thornton", "Thousand Oaks", "Toledo", "Topeka", "Torrance", "Trenton", "Tucson", "Tulsa", "Tuscaloosa", "Tyler", "Utica", "Vallejo", "Vancouver", "Vero Beach", "Victorville", "Virginia Beach", "Visalia", "Waco", "Warren", "Washington", "Waterbury", "Waterloo", "West Covina", "West Valley City", "Westminster", "Wichita", "Wilmington", "Winston", "Winter Haven", "Worcester", "Yakima", "Yonkers", "York", "Youngstown"];

var colors_ocean =
  ['#68e6ba', '#17d1d1', '#3c94d4', '#3bc6ab', '#a9ffff'];

var colors_computer =
  ['#006500', '#005c00', '#008100', '#00ac00'];

function getRandom(array) {
  var result = array[Math.floor(Math.random() * array.length)];
  return result;
}

class Map {
  constructor(seed, settings) {
    this.seed = seed;

    this.height = settings.mapWidth;
    this.width = settings.mapHeight;

    var voronoiPoints = [];
    var voronoiDensity = seed.length/2;

    for (var i = 0; i < voronoiDensity; i++) {
      var x = randomWithSeed(seed[i]) * this.width;
      var y = randomWithSeed(seed[i + 1]) * this.height;
      voronoiPoints.push([x, y]);
    }

    voronoi.size([settings.mapWidth, settings.mapHeight]);

    //generate map using voronoi diagrams
    this.mapData = voronoi(voronoiPoints);
    var regions = this.mapData.polygons();
    regions = regions.map(function (polygon) {
      return polygon.filter(function (point) {
        if (point)
          return point;
      });
    });
    regions = regions.filter(function (el) {
      return el != null;
    });
    this.mapData.polygons = regions;

    this.cities = [];
    
    //assign region properties
    for (var i = 0; i < this.mapData.polygons.length; i++) {
      var poly = this.mapData.polygons[i];
      var type = getFromArrayWithSeed(terrainTypes, seed[i]);

      poly.stroke = '#000';
      poly.type = type.name;
      poly.fill = type.color;
      poly.movecost = type.movecost;
      poly.defence = type.defence;
      poly.name = getFromArrayWithSeed(city_names, seed[i]);
      poly.center = {
        x: getCenterOfPolygon(poly)[0],
        y: getCenterOfPolygon(poly)[1]
      };
    }

    var numCities = 6;

    for (var i = 0; i < numCities ; i++) {
      var size = 30 + seed[i];
      var team = 0;
      if (i > numCities/2)
        team = 1;
      var pos = {
        x: seed[i] * 100,
        y: seed[i + 1] * 100
      };
      pos.x = Math.min()
      var city = new City(getFromArrayWithSeed(city_names, seed[i]), seed[i] * 100, seed[i + 1] * 100, size, '#eee', team);
      this.cities.push(city);
    }
    //console.log('Mapdata:', this.mapData);
  }

  update() {

  }

  getRegionAt(x, y) {
    for (var i = 0; i < this.mapData.polygons.length; i++) {
      var region = this.mapData.polygons[i];
      if (isInside([x, y], region))
        return region;
    }
    return null;
  }
}

function getFromArrayWithSeed(array, seed) {
  var x = Math.sin(seed++) * 10000;
  var selector = x - Math.floor(x);
  var result = array[Math.floor(selector * array.length)];
  return result;
}

function randomWithSeed(seed) {
  var x = Math.sin(seed++) * 10000;
  var result = x - Math.floor(x);
  return result;
}

function getCenterOfPolygon(points) {

  function Point(x, y) {
    this[0] = x;
    this[1] = y;
  }

  function Region(points) {
    this.points = points || [];
    this.length = points.length;
  }

  Region.prototype.area = function () {
    var area = 0,
      i,
      j,
      point1,
      point2;

    for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
      point1 = this.points[i];
      point2 = this.points[j];
      area += point1[0] * point2[1];
      area -= point1[1] * point2[0];
    }
    area /= 2;

    return area;
  };

  Region.prototype.centroid = function () {
    var x = 0,
      y = 0,
      i,
      j,
      f,
      point1,
      point2;

    for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
      point1 = this.points[i];
      point2 = this.points[j];
      f = point1[0] * point2[1] - point2[0] * point1[1];
      x += (point1[0] + point2[0]) * f;
      y += (point1[1] + point2[1]) * f;
    }

    f = this.area() * 6;

    return new Point(x / f, y / f);
  };

  var polygon = points,
    region = new Region(polygon);

  return region.centroid();
}

function isInside(point, polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i][0], yi = polygon[i][1];
    var xj = polygon[j][0], yj = polygon[j][1];

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

function rotateVector(vec, ang)
{
    ang = ang * (Math.PI/180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
};

module.exports = Map;