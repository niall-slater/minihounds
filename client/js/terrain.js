class TerrainFeature {
  constructor(position, region, effectRadius) {
    this.pos = { x: position.x, y: position.y };
    this.region = region;
    this.effectRadius = effectRadius;
  }

  render() {
    graphics.drawPolygon(this.poly, this.stroke, this.fill);
  }
}

class Forest extends TerrainFeature {
    constructor(position, region) {
      super(position, region);
      /*
      //Not ready for terrain features yet
      this.poly = [
        [position.x, position.y],
        [position.x, position.y],
        [position.x, position.y]
      ];
      */
    }
}