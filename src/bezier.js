// 获得两点间的距离
const getLength = (point) => {
  return Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2));
}

// 加减乘除数组每一项
const arrayOperator = (a, b, operator = '-') => {
  if (!a.length) a = [a, a];
  if (!b.length) b = [b, b];
  switch (operator) {
    case '-':
      return [a[0] - b[0], a[1] - b[1]];
    case '*':
      return [a[0] * b[0], a[1] * b[1]];
    case '/':
      return [a[0] / b[0], a[1] / b[1]];
    case '+':
      return [a[0] + b[0], a[1] + b[1]];
  }
}

// 根据前后两点计算当前点的进出控制点
// 算法采用连续贝塞尔模型，见: https://tieba.baidu.com/p/3363020493?pid=59173025030&cid=0#59173025030
const computeTangent = (curr, prev, next, ratio) => {
  const result = [];
  let diffPoint = arrayOperator(prev, next, '-');
  let diffLength = getLength(diffPoint);
  let inAnchor = [0, 0];
  if (diffLength > 0) {
    inAnchor = arrayOperator(diffPoint, diffLength, '/');
  }
  let outAnchor = [-inAnchor[0], -inAnchor[1]];
  result[0] = arrayOperator(
    inAnchor,
    arrayOperator(
      getLength(next, curr),
      ratio,
      '*'
    ),
    '*'
  );
  result[1] = arrayOperator(
    outAnchor,
    arrayOperator(
      getLength(prev, curr),
      ratio,
      '*'
    ),
    '*'
  );
  return result;
}

// 计算所有点的进出控制点
const computeBezierTangent = (points, options = {}) => {
  const { handlerRatio = 0.5, fixEndPointCurve = false } = options;
  const inTangents = [];
  const outTangents = [];

  for (let i = 0, len = points.length; i < len; i++) {
    if (!fixEndPointCurve && (i === 0 || i === len - 1)) {
      inTangents[i] = [0, 0];
      outTangents[i] = [0, 0];
      continue;
    }

    let prevPoint = points[1];
    let nextPoint = points[len - 1];
    let prev = i - 1;
    let next = i + 1;
    if (i === 0) {
      prev = len - 1;
      next = 1;
    } else if (i === len - 1) {
      prev = len - 2;
      next = 0;
    }
    const [first, second] = computeTangent(points[i], points[prev], points[next], handlerRatio);
    inTangents[i] = first;
    outTangents[i] = second;
  }
  return {
    inTangents,
    outTangents
  }
}

function extendedPoint(center, radians, radius) {
    let x = center[0] + Math.cos(radians) * radius;
    let y = center[1] + Math.sin(radians) * radius;
    return [x, y];
}


function CubicN(pct, a, b, c, d) {
    let t2 = pct * pct;
    let t3 = t2 * pct;
    return a + (-a * 3 + pct * (3 * a - a * pct)) * pct + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct + (c * 3 - c * 3 * pct) * t2 + d * t3;
}

// 获取曲线上的所有点, 见: https://stackoverflow.com/a/17096947
function getCubicBezierXYatPercent(startPt, controlPt1, controlPt2, endPt, percent) {
    let x = CubicN(percent, startPt[0], controlPt1[0], controlPt2[0], endPt[0]);
    let y = CubicN(percent, startPt[1], controlPt1[1], controlPt2[1], endPt[1]);
    return [x | 0, y | 0];
}

module.exports = function (points, options = {}) {
  const { tolerance = 0, step = 1/1000, fixEndPointCurve = true, handlerRatio = 0.5  } = options
  const tangents = computeBezierTangent(points, { fixEndPointCurve, handlerRatio });

  const resultPoints = [];
  for (let i = 0; i< points.length - 1; i += 1) {
    const startPoint = points[i];
    const inPoint = arrayOperator(startPoint, tangents.inTangents[i], '+');
    const outPoint = arrayOperator(points[i + 1], tangents.outTangents[i], '+');
    const endPoint = points[i + 1];
    let tests = 10000;
    const maxLen = tests - 1;
    let back = [];
    let p0 = startPoint;

    let p = getCubicBezierXYatPercent(startPoint, inPoint, outPoint, endPoint, step);
    let dx = p[0] - startPoint[0];
    let dy = p[1] - startPoint[1];
    let radians = Math.atan2(dy, dx) + Math.PI / 2;
    resultPoints.push(extendedPoint(startPoint, radians, -tolerance));
    for (let j = 0; j < 1; j += step) {

        let p1 = getCubicBezierXYatPercent(startPoint, inPoint, outPoint, endPoint, j);

        let dx = p1[0] - p0[0];
        let dy = p1[1] - p0[1];
        let radians = Math.atan2(dy, dx) + Math.PI / 2;

        resultPoints.push(extendedPoint(p1, radians, -tolerance));

        back.push(extendedPoint(p1, radians, tolerance));
        p0 = p1;
    }
    back = back.reverse();

    resultPoints.push.apply(resultPoints, back);
  }
  return resultPoints;
}

