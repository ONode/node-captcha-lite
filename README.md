# node-captcha-lite
Lite captcha generator by Pure Javascript.

# Usage
node-captcha-lite just extends [node-pnglib](https://github.com/Lellansin/node-pnglib), you can check its document for constructor options since we only add some public methods on it.

**Let's try to draw number:**

```javascript
'use strict';

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
```

Output:

![line](/example/char.png)

**Let's try to draw bezier curve:**

```javascript
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
```

Output:

![bezier](/example/bezier.png)
