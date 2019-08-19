//Import voronoi
var voronoi = d3.voronoi();

var colors = {
  star: "rgba(68,255,68,1)",
  planet: "rgba(0,255,0,1)",
  text: "rgba(255,255,255,1)"
}

var graphics = {
  init: function() {
    this.canvas = document.getElementById("output-canvas");
    this.ctx = this.canvas.getContext("2d");
    
    this.canvas.width = settings.gameWidth;
    this.canvas.height = settings.gameHeight;
    this.center = {x: this.canvas.width/2, y:this.canvas.height/2};
    this.flickerFrequency = 0;
  },
  
  render: function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();
    this.ctx.fillStyle = "#00FF00";
    mapTest.forEach(function (poly){
      graphics.drawPolygon(poly, poly.stroke, poly.fill);
    });
  },
  
  drawDot: function(x, y, size, label, color, labelColor) {
    this.ctx.beginPath();
    this.ctx.setLineDash([0]);
    this.ctx.arc(x, y, size/2, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    if (label) {
      this.ctx.fillStyle = labelColor;
      this.ctx.fillText(label, x + size/2 + 12, y - size/2 - 12);

      this.ctx.beginPath();
      this.ctx.setLineDash([2]);
      this.ctx.strokeStyle = color;
      this.ctx.moveTo(x + size/2, y - size/2);
      this.ctx.lineTo(x + size/2 + 10, y - size/2 - 10);
      this.ctx.stroke();
    }
  },
  
  drawPolygon: function(points, stroke, fill) {
    this.ctx.lineWidth = "2";
    if (stroke)
      this.ctx.strokeStyle = stroke;
    else
      this.ctx.strokeStyle = getRandomColor();
    if (fill)
      this.ctx.fillStyle = fill;
    else
      this.ctx.fillStyle = getRandomColor();
    this.ctx.beginPath();
    
    this.ctx.moveTo(points[0][0], points[0][1]);

    for (var i = 0; i < points.length; i++) {
      if (points[i]) {
        this.ctx.lineTo(points[i][0], points[i][1]);
      }
    }
    this.ctx.closePath();
    if (fill)
      this.ctx.fill();
    if (stroke)
      this.ctx.stroke();
  },
  
  drawLine: function(x1, y1, x2, y2, weight, color) {
    this.ctx.beginPath();
    this.ctx.setLineDash([2]);
    if (weight)
      this.ctx.lineWidth = weight;
    if (color)
      this.ctx.strokeStyle = color;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  },
  
  drawOrbit: function(planet) {
    if (Math.random() < this.flickerFrequency)
      return;
    this.ctx.beginPath();
    this.ctx.setLineDash([6, 3]);
    this.ctx.arc(this.center.x, this.center.y, planet.distance * this.scale, 0, 2 * Math.PI);
    this.ctx.stroke();
  },
  
  drawStar: function(star) {
    if (Math.random() < this.flickerFrequency)
      return;
    this.drawDot(this.center.x, this.center.y, star.mass * this.starScale, star.name, colors.star, colors.text);
    star.x = this.center.x; star.y = this.center.y;
  },
  
  drawPlanet: function(planet) {
    if (Math.random() < this.flickerFrequency)
      return;
    var pos = {x: this.center.x, y: this.center.y};
    pos.y -= planet.distance * this.scale;
    var rotated = rotatePoint(
      this.center.x,
      this.center.y,
      pos.x,
      pos.y,
      planet.angle
    );
    
    pos.x = rotated[0]; pos.y = rotated[1];
    planet.pos = {
      x: pos.x, y: pos.y
    };
    this.ctx.strokeStyle = "#008800";
    this.drawOrbit(planet);
    this.ctx.strokeStyle = "#00FF00";
    this.ctx.globalAlpha = planet.opacity;
    this.ctx.strokeStyle = colors.planet;
    this.ctx.fillStyle = "#FFFFFF";
    this.drawDot(pos.x, pos.y, planet.mass * this.planetScale, planet.name);
    this.ctx.globalAlpha = 1;
  }
}

function rotatePoint(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function clampAngle(angle) {
  var result = angle;
  if (result > 360)
    result -= 360;
  else if (result < 0)
    result += 360;
  return result;
}