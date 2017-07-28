'use strict';

const fs = require('fs');
const path = require('path');
const Captcha = require('..');

const png = new Captcha(300, 300, 8, [255,255,255,255]);

const bezierPoints = [
  [250, 50],
  [250, 250],
  [260, 70],
  [60, 70]
];

png.drawBezier(bezierPoints, {
  tolerance: 0,
  step: 1/1000, 
  fixEndPointCurve: true,
  handlerRatio: 0.5,
  color: '#cc0044'
});

fs.writeFileSync(path.resolve(__dirname, './bezier.png'), png.getBuffer());