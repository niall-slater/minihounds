var terrainTypes = [
  'plains',
  'desert',
  'forest',
  'mountains',
  'river',
  'tundra'
];

var city_names = ["Aberdeen", "Abilene", "Akron", "Albany", "Albuquerque", "Alexandria", "Allentown", "Amarillo", "Anaheim", "Anchorage", "Ann Arbor", "Antioch", "Apple Valley", "Appleton", "Arlington", "Arvada", "Asheville", "Athens", "Atlanta", "Atlantic City", "Augusta", "Aurora", "Austin", "Bakersfield", "Baltimore", "Barnstable", "Baton Rouge", "Beaumont", "Bel Air", "Bellevue", "Berkeley", "Bethlehem", "Billings", "Birmingham", "Bloomington", "Boise", "Boise City", "Bonita Springs", "Boston", "Boulder", "Bradenton", "Bremerton", "Bridgeport", "Brighton", "Brownsville", "Bryan", "Buffalo", "Burbank", "Burlington", "Cambridge", "Canton", "Cape Coral", "Carrollton", "Cary", "Cathedral City", "Cedar Rapids", "Champaign", "Chandler", "Charleston", "Charlotte", "Chattanooga", "Chesapeake", "Chicago", "Chula Vista", "Cincinnati", "Clarke County", "Clarksville", "Clearwater", "Cleveland", "College Station", "Colorado Springs", "Columbia", "Columbus", "Concord", "Coral Springs", "Corona", "Corpus Christi", "Costa Mesa", "Dallas", "Daly City", "Danbury", "Davenport", "Davidson County", "Dayton", "Daytona Beach", "Deltona", "Denton", "Denver", "Des Moines", "Detroit", "Downey", "Duluth", "Durham", "El Monte", "El Paso", "Elizabeth", "Elk Grove", "Elkhart", "Erie", "Escondido", "Eugene", "Evansville", "Fairfield", "Fargo", "Fayetteville", "Fitchburg", "Flint", "Fontana", "Fort Collins", "Fort Lauderdale", "Fort Smith", "Fort Walton Beach", "Fort Wayne", "Saint Louis", "Saint Paul", "Saint Petersburg", "Salem", "Salinas", "Salt Lake City", "San Antonio", "San Bernardino", "San Buenaventura", "San Diego", "San Francisco", "San Jose", "Santa Ana", "Santa Barbara", "Santa Clara", "Santa Clarita", "Santa Cruz", "Santa Maria", "Santa Rosa", "Sarasota", "Savannah", "Scottsdale", "Scranton", "Seaside", "Seattle", "Sebastian", "Shreveport", "Simi Valley", "Sioux City", "Sioux Falls", "South Bend", "South Lyon", "Spartanburg", "Spokane", "Springdale", "Springfield", "St. Louis", "St. Paul", "St. Petersburg", "Stamford", "Sterling Heights", "Stockton", "Sunnyvale", "Syracuse", "Tacoma", "Tallahassee", "Tampa", "Temecula", "Tempe", "Thornton", "Thousand Oaks", "Toledo", "Topeka", "Torrance", "Trenton", "Tucson", "Tulsa", "Tuscaloosa", "Tyler", "Utica", "Vallejo", "Vancouver", "Vero Beach", "Victorville", "Virginia Beach", "Visalia", "Waco", "Warren", "Washington", "Waterbury", "Waterloo", "West Covina", "West Valley City", "Westminster", "Wichita", "Wilmington", "Winston", "Winter Haven", "Worcester", "Yakima", "Yonkers", "York", "Youngstown"];


var colors_countryside =
     ['#99e668', '#8ad117', '#1a8add', '#a0a0a0', '#037603'];

var colors_ocean =
     ['#68e6ba', '#17d1d1', '#3c94d4', '#3bc6ab', '#a9ffff'];

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
    var numPoints = 5;
    for (var i = 0; i < numPoints; i++) {
      voronoiPoints.push([Math.random() * this.width, Math.random() * this.height]);
    }
    
    
    voronoi.size([this.height, this.width]);
    //generate map using voronoi diagrams
    var v = voronoi(voronoiPoints);
    this.regions = v.polygons();
    this.regions = this.regions.map(function (polygon) {
      return polygon.filter(function (point) {
        if (point)
          return point;
      });
    });
    
    //assign colors
    this.regions.forEach(function (poly){
      var color = getRandom(colors_countryside);
      poly.stroke = '#eeeeff';
      poly.fill = color;
      poly.name = getRandom(city_names);
      poly.center = getCenterOfPolygon(poly);
    });
    
    //define areas as polygons
    console.log(this);
  }
  
  update() {
    
  }
  
  getRegionAt(x, y) {
    return ;
  }
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

        for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
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

        for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
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