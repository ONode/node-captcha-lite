'use strict';
// draw number

const fs = require('fs');
const path = require('path');
const Captcha = require('..');
const FONTS = Captcha.FONTS;

function rand(min, max) {
  let comp = max - min;
  return (Math.random() * comp + min) | 0;
}

function getRandFont(fonts) {
  const fontNames = Object.keys(fonts);
  return fonts[fontNames[rand(0, fontNames.length)]];
}

let png = new Captcha(200, 100, 8, [255, 255, 255, 255]);
let chars = getRandFont(FONTS).chars;

for (let i = 0; i < chars.length; ++i) {
  let font = getRandFont(FONTS);
  let ch = chars[i];
  png.drawChar(ch, 0 + 2 * i * font.w, 50, font, '#00FF00');
}

fs.writeFileSync(path.resolve(__dirname, './char.png'), png.getBuffer());
