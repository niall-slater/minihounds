var colors_primary = [
  '#f00', '#00f'
];

var graphics = {
  init: function () {
    this.canvas = document.getElementById("output-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = settings.gameWidth;
    this.canvas.height = settings.gameHeight;
    this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.flickerFrequency = 0;

    this.setUpCamera();
  },

  setUpCamera: function () {
    //Camera pan and zoom code taken from https://codepen.io/techslides/pen/zowLd

    this.trackTransforms(this.ctx);

    var lastX = this.canvas.width / 2, lastY = this.canvas.height / 2;

    var dragStart, dragged;

    this.canvas.addEventListener('mousedown', function (evt) {
      document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
      lastX = evt.offsetX || (evt.pageX - graphics.canvas.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - graphics.canvas.offsetTop);
      dragStart = graphics.ctx.transformedPoint(lastX, lastY);
      dragged = false;
    }, false);

    this.canvas.addEventListener('mousemove', function (evt) {
      lastX = evt.offsetX || (evt.pageX - graphics.canvas.offsetLeft);
      lastY = evt.offsetY || (evt.pageY - graphics.canvas.offsetTop);
      dragged = true;
      if (dragStart) {
        var pt = graphics.ctx.transformedPoint(lastX, lastY);
        graphics.ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
      }
    }, false);

    this.canvas.addEventListener('mouseup', function (evt) {
      dragStart = null;
      if (!dragged)
        zoom(evt.shiftKey ? -1 : 1);
    }, false);


    var zoom = function (clicks) {
      var pt = graphics.ctx.transformedPoint(lastX, lastY);
      graphics.ctx.translate(pt.x, pt.y);
      var scaleFactor = 1.07;
      var factor = Math.pow(scaleFactor, clicks);
      graphics.ctx.scale(factor, factor);
      graphics.ctx.translate(-pt.x, -pt.y);
    }

    var handleScroll = function (evt) {
      var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
      if (delta)
        zoom(delta);
      return evt.preventDefault() && false;
    };

    this.canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    this.canvas.addEventListener('mousewheel', handleScroll, false);

  },

  render: function () {

    this.ctx.save();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);

    var p1 = this.ctx.transformedPoint(0, 0);
    var p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);

    this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    this.ctx.restore();

    this.ctx.fillStyle = '#000';
    this.ctx.fill();
    this.ctx.fillStyle = "#00FF00";

    map.mapData.polygons.forEach(function (region) {
      graphics.drawPolygon(region, region.stroke, region.fill);
    });

    map.mapData.polygons.forEach(function (region) {
      if (!region.city)
        graphics.drawText(region.name + " " + region.type,
          region.center.x - 100,
          region.center.y, '#fff', 24);
    });
    
    //Render grid
    var division = 10;
    /*
      this is a slightly hacky solution to prevent numbers drawing over
      each other - if graphical glitches occur near the edge of the map,
      this code may be the cause
    */
    graphics.ctx.clearRect(-100, -100, 100, settings.gameHeight + 100);
    graphics.ctx.clearRect(-100, -100, settings.gameWidth + 100, 100);
    for (var y = 0; y < division + 1; y++) {
      for (var x = 0; x < division + 1; x++) {
        var lineX = x * (settings.mapWidth / division);
        var lineY = y * (settings.mapHeight / division);
        graphics.drawText("" + x * 10, lineX - 20, -20);
        graphics.drawLine(0, lineY, settings.mapWidth, lineY,
                          1, 'rgba(255,255,255,0.1)', []);
        graphics.drawText("" + y * 10, -40, lineY + 10);
        graphics.drawLine(lineX, 0, lineX, settings.mapHeight,
                          1, 'rgba(255,255,255,0.1)', []);
      }
    }

    //Render cities
    cities.forEach(function (c) { c.render() });

    //Render hounds
    hounds.forEach(function (h) { h.render() });

    //Render traildots
    trailDots.forEach(function (t) { t.render() });

    //Render projectiles
    projectiles.forEach(function (p) { p.render() });

    //Render impacts
    impacts.forEach(function (i) { i.render() });

    //Render vision 
    hounds.forEach(function (h) {
      if (this.team === playerTeam)
        h.renderSightRange();
    });
    cities.forEach(function (c) { c.renderSightRange() });
  },

  drawDot: function (x, y, size, color, label, labelColor) {
    this.ctx.beginPath();
    this.ctx.setLineDash([0]);
    this.ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    if (color)
      this.ctx.fillStyle = color;
    this.ctx.fill();

    if (label) {
      this.ctx.fillStyle = labelColor;
      this.ctx.fillText(label, x + size / 2 + 12, y - size / 2 - 12);

      this.ctx.beginPath();
      this.ctx.setLineDash([2]);
      this.ctx.strokeStyle = color;
      this.ctx.moveTo(x + size / 2, y - size / 2);
      this.ctx.lineTo(x + size / 2 + 10, y - size / 2 - 10);
      this.ctx.stroke();
      this.ctx.setLineDash([0]);
    }
  },

  drawRect: function (x, y, width, height, fill, stroke, label, labelColor) {
    this.ctx.rect(x - width / 2, y - height / 2, width, height);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.strokeStyle = stroke;
    this.ctx.stroke();

    if (label) {
      this.drawText(label, x + width, y + 4, labelColor, 18);

      this.ctx.beginPath();
      this.ctx.setLineDash([2]);
      this.ctx.strokeStyle = fill;
      this.ctx.moveTo(x + width / 2, y);
      this.ctx.lineTo(x + width / 2 + 10, y);
      this.ctx.stroke();
      this.ctx.setLineDash([0]);
    }
  },

  drawPolygon: function (points, stroke, fill) {
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

  drawText: function (text, x, y, color, size, alpha) {
    text = text.toUpperCase();
    if (!alpha)
      this.ctx.globalAlpha = .5;
    if (color)
      this.ctx.fillStyle = color;
    else
      this.ctx.fillStyle = '#fff'
    this.ctx.font = '30px sans-serif';
    if (size)
      this.ctx.font = size + 'px sans-serif';
    this.ctx.fillText(text, x, y);
    this.ctx.globalAlpha = 1;
  },

  drawLine: function (x1, y1, x2, y2, weight, color, dash) {
    this.ctx.beginPath();
    if (!dash)
      this.ctx.setLineDash([2]);
    else
      this.ctx.setLineDash(dash);
    if (weight)
      this.ctx.lineWidth = weight;
    if (color)
      this.ctx.strokeStyle = color;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  },

  drawCircle: function (x, y, radius, stroke, fill) {
    if (radius < 0)
      return;
    this.ctx.beginPath();
    this.ctx.arc(
      x, y, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.fill;
    if (!stroke)
      stroke = '#fff';
    this.ctx.strokeStyle = stroke;
    this.ctx.stroke();

    this.ctx.fillStyle = fill;
    if (fill)
      this.ctx.fill();
  },

  //Camera stuff

  trackTransforms: function (ctx) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function () { return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function () {
      savedTransforms.push(xform.translate(0, 0));
      return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function () {
      xform = savedTransforms.pop();
      return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function (sx, sy) {
      xform = xform.scaleNonUniform(sx, sy);
      return scale.call(ctx, sx, sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function (radians) {
      xform = xform.rotate(radians * 180 / Math.PI);
      return rotate.call(ctx, radians);
    };

    var translate = ctx.translate;
    ctx.translate = function (dx, dy) {
      xform = xform.translate(dx, dy);
      return translate.call(ctx, dx, dy);
    };

    var transform = ctx.transform;
    ctx.transform = function (a, b, c, d, e, f) {
      var m2 = svg.createSVGMatrix();
      m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
      xform = xform.multiply(m2);
      return transform.call(ctx, a, b, c, d, e, f);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function (a, b, c, d, e, f) {
      xform.a = a;
      xform.b = b;
      xform.c = c;
      xform.d = d;
      xform.e = e;
      xform.f = f;
      return setTransform.call(ctx, a, b, c, d, e, f);
    };

    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
      pt.x = x; pt.y = y;
      return pt.matrixTransform(xform.inverse());
    }
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