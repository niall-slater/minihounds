//Import voronoi
var voronoi = d3.voronoi();

var colors_primary = [
  '#f00', '#00f'
];

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
    map.regions.forEach(function (region){
      graphics.drawPolygon(region, region.stroke, region.fill);
    });
    
    map.regions.forEach(function (region){
      graphics.drawText(region.name, 
                        region.center[0] - 50 + 2,
                        region.center[1] + 2, '#000');
      graphics.drawText(region.name, 
                        region.center[0] - 50,
                        region.center[1]);
    });
    
    //Render hounds
    hounds.forEach(function(h){h.render()});
    
    //Render projectiles
    projectiles.forEach(function(p){p.render()});
    
    this.renderSightRange();
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
  
  drawText: function(text, x, y, color, size) {
    if (color)
      this.ctx.fillStyle = color;
    else
      this.ctx.fillStyle = '#fff'
    this.ctx.font = '30px fantasy';
    if (size)
      this.ctx.font = size + 'px fantasy';
    this.ctx.fillText(text, x, y);
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
  
  renderSightRange: function() {
    var playerHounds = hounds.filter(function(hound){return hound.team === playerTeam});
    playerHounds.forEach(function (hound) {
      graphics.ctx.beginPath();
      graphics.ctx.arc(hound.pos.x, hound.pos.y, hound.stats.sightRange,
              0, 2 * Math.PI);
      graphics.ctx.stroke();
    });
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