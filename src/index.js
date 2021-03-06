'use strict';

const PNGlib = require('node-pnglib');
const FONTS = require('./font');
const Bezier = require('./bezier');

class Captcha extends PNGlib {
  constructor(...args) {
    super(...args);
  }

  drawChar(ch, x = 0, y = 0, font = FONTS.f8x16Raw, color = '#ff0000') {
    let idx = font.chars.indexOf(ch);

    if (idx >= 0) {
      let fontData = font.data[idx];
      let w = font.w;
      let y0 = y;
      let l = Math.ceil(w / 8);

      for (let i = 0, len = font.h; i < len; ++i) {
        for (let j = 0; j < l; ++j) {
          // 每一排的第几个字节
          let d = fontData[l * i + j];
          let width = 8;
          let x0 = j * 8;          
          // 假如到了这一排的最后一个字节
          if (j === (l - 1)) {
            width = w - x0;
          }

          let mask = 1;
          for (let bitPos = width - 1; bitPos >= 0; --bitPos) {
            mask = 1 << bitPos;
            if ((d & mask) === mask) {
              this.setPixel(x + x0 + (8 - bitPos), y0, color);
            }
          }
        }
        ++y0;
      }
    }
  }

  drawBezier(bezierPoints, options = {}, color = '#cc0044') {
    const { tolerance = 0, step = 1/1000, fixEndPointCurve = true, color: baseColor, handlerRatio = 0.5 } = options
    const points = Bezier(bezierPoints, {
      tolerance, 
      step, 
      fixEndPointCurve,
      handlerRatio
    });
    for (let i = 0, len = points.length; i < len; i++) {
      const point = points[i];
      this.setPixel(point[0], point[1], baseColor || color);
    }
  }

}

module.exports = Captcha;
module.exports.FONTS = FONTS;
