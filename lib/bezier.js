'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// 获得两点间的距离
var getLength = function getLength(point) {
  return Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2));
};

// 加减乘除数组每一项
var arrayOperator = function arrayOperator(a, b) {
  var operator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '-';

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
};

// 根据前后两点计算当前点的进出控制点
// 算法采用连续贝塞尔模型，见: https://tieba.baidu.com/p/3363020493?pid=59173025030&cid=0#59173025030
var computeTangent = function computeTangent(curr, prev, next, ratio) {
  var result = [];
  var diffPoint = arrayOperator(prev, next, '-');
  var diffLength = getLength(diffPoint);
  var inAnchor = [0, 0];
  if (diffLength > 0) {
    inAnchor = arrayOperator(diffPoint, diffLength, '/');
  }
  var outAnchor = [-inAnchor[0], -inAnchor[1]];
  result[0] = arrayOperator(inAnchor, arrayOperator(getLength(next, curr), ratio, '*'), '*');
  result[1] = arrayOperator(outAnchor, arrayOperator(getLength(prev, curr), ratio, '*'), '*');
  return result;
};

// 计算所有点的进出控制点
var computeBezierTangent = function computeBezierTangent(points) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$handlerRatio = options.handlerRatio,
      handlerRatio = _options$handlerRatio === undefined ? 0.5 : _options$handlerRatio,
      _options$fixEndPointC = options.fixEndPointCurve,
      fixEndPointCurve = _options$fixEndPointC === undefined ? false : _options$fixEndPointC;

  var inTangents = [];
  var outTangents = [];

  for (var i = 0, len = points.length; i < len; i++) {
    if (!fixEndPointCurve && (i === 0 || i === len - 1)) {
      inTangents[i] = [0, 0];
      outTangents[i] = [0, 0];
      continue;
    }

    var prevPoint = points[1];
    var nextPoint = points[len - 1];
    var prev = i - 1;
    var next = i + 1;
    if (i === 0) {
      prev = len - 1;
      next = 1;
    } else if (i === len - 1) {
      prev = len - 2;
      next = 0;
    }

    var _computeTangent = computeTangent(points[i], points[prev], points[next], handlerRatio),
        _computeTangent2 = _slicedToArray(_computeTangent, 2),
        first = _computeTangent2[0],
        second = _computeTangent2[1];

    inTangents[i] = first;
    outTangents[i] = second;
  }
  return {
    inTangents: inTangents,
    outTangents: outTangents
  };
};

function extendedPoint(center, radians, radius) {
  var x = center[0] + Math.cos(radians) * radius;
  var y = center[1] + Math.sin(radians) * radius;
  return [x, y];
}

function CubicN(pct, a, b, c, d) {
  var t2 = pct * pct;
  var t3 = t2 * pct;
  return a + (-a * 3 + pct * (3 * a - a * pct)) * pct + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct + (c * 3 - c * 3 * pct) * t2 + d * t3;
}

// 获取曲线上的所有点, 见: https://stackoverflow.com/a/17096947
function getCubicBezierXYatPercent(startPt, controlPt1, controlPt2, endPt, percent) {
  var x = CubicN(percent, startPt[0], controlPt1[0], controlPt2[0], endPt[0]);
  var y = CubicN(percent, startPt[1], controlPt1[1], controlPt2[1], endPt[1]);
  return [x | 0, y | 0];
}

module.exports = function (points) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$tolerance = options.tolerance,
      tolerance = _options$tolerance === undefined ? 0 : _options$tolerance,
      _options$step = options.step,
      step = _options$step === undefined ? 1 / 1000 : _options$step,
      _options$fixEndPointC2 = options.fixEndPointCurve,
      fixEndPointCurve = _options$fixEndPointC2 === undefined ? true : _options$fixEndPointC2,
      _options$handlerRatio2 = options.handlerRatio,
      handlerRatio = _options$handlerRatio2 === undefined ? 0.5 : _options$handlerRatio2;

  var tangents = computeBezierTangent(points, { fixEndPointCurve: fixEndPointCurve, handlerRatio: handlerRatio });

  var resultPoints = [];
  for (var i = 0; i < points.length - 1; i += 1) {
    var startPoint = points[i];
    var inPoint = arrayOperator(startPoint, tangents.inTangents[i], '+');
    var outPoint = arrayOperator(points[i + 1], tangents.outTangents[i], '+');
    var endPoint = points[i + 1];
    var tests = 10000;
    var maxLen = tests - 1;
    var back = [];
    var p0 = startPoint;

    var p = getCubicBezierXYatPercent(startPoint, inPoint, outPoint, endPoint, step);
    var dx = p[0] - startPoint[0];
    var dy = p[1] - startPoint[1];
    var radians = Math.atan2(dy, dx) + Math.PI / 2;
    resultPoints.push(extendedPoint(startPoint, radians, -tolerance));
    for (var j = 0; j < 1; j += step) {

      var p1 = getCubicBezierXYatPercent(startPoint, inPoint, outPoint, endPoint, j);

      var _dx = p1[0] - p0[0];
      var _dy = p1[1] - p0[1];
      var _radians = Math.atan2(_dy, _dx) + Math.PI / 2;

      resultPoints.push(extendedPoint(p1, _radians, -tolerance));

      back.push(extendedPoint(p1, _radians, tolerance));
      p0 = p1;
    }
    back = back.reverse();

    resultPoints.push.apply(resultPoints, back);
  }
  return resultPoints;
};