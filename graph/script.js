var V3 = /** @class */ (function () {
    function V3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    V3.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    };
    V3.prototype.rotateX = function (angle) {
        return new V3(this.x, this.y * Math.cos(angle) - this.z * Math.sin(angle), this.z * Math.cos(angle) + this.y * Math.sin(angle));
    };
    V3.prototype.rotateY = function (angle) {
        return new V3(this.x * Math.cos(angle) + this.z * Math.sin(angle), this.y, this.z * Math.cos(angle) - this.x * Math.sin(angle));
    };
    V3.prototype.rotateZ = function (angle) {
        return new V3(this.x * Math.cos(angle) + this.y * Math.sin(angle), this.y * Math.cos(angle) - this.x * Math.sin(angle), this.z);
    };
    return V3;
}());
var COLOR = {
    white: [255, 255, 255, 255],
    black: [0, 0, 0, 255],
};
var Mesh = /** @class */ (function () {
    function Mesh() {
        this.pointList = new Array();
        this.lineList = new Array();
    }
    Mesh.prototype.addPoint = function (point) {
        this.pointList.push(point);
    };
    return Mesh;
}());
var Line = /** @class */ (function () {
    function Line(begin, end) {
    }
    return Line;
}());
var Canvas = /** @class */ (function () {
    function Canvas() {
        var _this = this;
        this.observer = -400;
        this.addr = function (x, y) { return (y * _this.width + x) * 4; };
        this.fill = function (rgba) {
            for (var addr = 0; addr < _this.data.length; addr += 4) {
                _this.data[addr] = rgba[0];
                _this.data[addr + 1] = rgba[1];
                _this.data[addr + 2] = rgba[2];
                _this.data[addr + 3] = rgba[3];
            }
        };
        this.setPixel = function (x, y, rgba) {
            x = Math.round(x);
            y = Math.round(y);
            var addr = _this.addr(x, y);
            _this.data[addr] = rgba[0];
            _this.data[addr + 1] = rgba[1];
            _this.data[addr + 2] = rgba[2];
            _this.data[addr + 3] = rgba[3];
        };
        this.linex = function (x, y, len, rgba) {
            if (x + len > _this.width) {
                len = _this.width - x;
            }
            var addr = _this.addr(x, y);
            while (len--) {
                _this.data[addr] = rgba[0];
                _this.data[addr + 1] = rgba[1];
                _this.data[addr + 2] = rgba[2];
                _this.data[addr + 3] = rgba[3];
                addr += 4;
            }
        };
        this.liney = function (x, y, len, rgba) {
            if (y + len > _this.height) {
                len = _this.height - x;
            }
            var addr = _this.addr(x, y);
            while (len--) {
                _this.data[addr] = rgba[0];
                _this.data[addr + 1] = rgba[1];
                _this.data[addr + 2] = rgba[2];
                _this.data[addr + 3] = rgba[3];
                addr += _this.width * 4;
            }
        };
        this.line = function (x1, y1, x2, y2, rgba) {
            var _a, _b, _c, _d, _e, _f;
            if (x1 === x2) {
                if (y1 > y2) {
                    _a = [y2, y1], y1 = _a[0], y2 = _a[1];
                }
                _this.liney(x1, y1, y2 - y1, rgba);
            }
            else if (y1 === y2) {
                if (x1 > x2) {
                    _b = [x2, x1], x1 = _b[0], x2 = _b[1];
                }
                _this.linex(x1, y1, x2 - x1, rgba);
            }
            else {
                if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                    if (x1 > x2) {
                        _c = [x2, x1], x1 = _c[0], x2 = _c[1];
                        _d = [y2, y1], y1 = _d[0], y2 = _d[1];
                    }
                    for (var x = x1; x <= x2; x++) {
                        var y = Math.round(y1 + (y2 - y1) / (x2 - x1) * (x - x1));
                        _this.setPixel(x, y, rgba);
                    }
                }
                else {
                    if (y1 > y2) {
                        _e = [x2, x1], x1 = _e[0], x2 = _e[1];
                        _f = [y2, y1], y1 = _f[0], y2 = _f[1];
                    }
                    for (var y = y1; y <= y2; y++) {
                        var x = Math.round(x1 + (x2 - x1) / (y2 - y1) * (y - y1));
                        _this.setPixel(x, y, rgba);
                    }
                }
            }
        };
        this.to2d = function (point) {
            var halfWidth = _this.width / 2;
            var halfHeight = _this.height / 2;
            var zFactor = (point.z - _this.observer) / (-_this.observer);
            var x = Math.round(halfWidth + (point.x / zFactor));
            var y = Math.round(halfHeight - (point.y / zFactor));
            return { x: x, y: y };
        };
        this.plot3d = function (point) {
            var _a = _this.to2d(point), x = _a.x, y = _a.y;
            _this.setPixel(x, y, [0, 0, 0, 255]);
        };
        this.draw3d = function (begin, end) {
            var p1 = _this.to2d(begin);
            var p2 = _this.to2d(end);
            _this.line(p1.x, p1.y, p2.x, p2.y, [0, 0, 0, 255]);
        };
        this.solid3d = function (solid) {
            solid.pointList.forEach(function (point) { return _this.plot3d(point); });
            solid.lineList.forEach(function (pointPair) { return _this.draw3d(solid.pointList[pointPair[0]], solid.pointList[pointPair[1]]); });
        };
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.data = this.imageData.data;
    }
    Object.defineProperty(Canvas.prototype, "width", {
        get: function () { return this.canvas.width; },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(Canvas.prototype, "height", {
        get: function () { return this.canvas.height; },
        enumerable: false,
        configurable: true
    });
    ;
    Canvas.prototype.refresh = function () {
        this.context.putImageData(this.imageData, 0, 0);
    };
    return Canvas;
}());
var AppGraph = /** @class */ (function () {
    function AppGraph() {
        this.angle = 0;
    }
    AppGraph.prototype.run = function () {
        // this.mesh = this.prepare();
        this.canvas = new Canvas();
        this.frame();
    };
    AppGraph.prototype.prepare = function (param) {
        if (param === void 0) { param = 0; }
        var mesh = new Mesh();
        var stretch = 8;
        var scale = 4;
        var scaleZ = 10;
        var range = 30;
        for (var x = -range; x < range; x++) {
            for (var y = -range; y < range; y++) {
                var z = Math.sin(Math.sqrt(x / scale * x / scale + y / scale * y / scale) + param * 10) * scaleZ;
                mesh.addPoint(new V3(x * stretch, y * stretch, z * stretch));
            }
        }
        return mesh;
    };
    AppGraph.prototype.frame = function () {
        var _this = this;
        this.mesh = this.prepare(this.angle);
        var tmpMesh = new Mesh();
        for (var n = 0; n < this.mesh.pointList.length; n++) {
            var point = this.mesh.pointList[n];
            point = point
                .rotateX(Math.sin(this.angle * 2) * 2 + Math.cos(this.angle * 3) * 3)
                .rotateY(this.angle / 2)
                .rotateZ(this.angle / 3);
            point.add(new V3(Math.sin(this.angle * 5) * 200, Math.sin(this.angle * 7) * 200, Math.sin(this.angle * 11) * 400 + 400));
            tmpMesh.pointList[n] = point;
        }
        // for(let n=0; n<box.lineList.length; n++) {
        //     tmpMesh.lineList[n] = box.lineList[n];
        // }
        this.canvas.fill(COLOR.white);
        this.canvas.solid3d(tmpMesh);
        this.canvas.refresh();
        setTimeout(function () {
            _this.angle += Math.PI / 1000;
            _this.frame();
        }, 1);
    };
    return AppGraph;
}());
