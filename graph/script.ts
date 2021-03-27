class V3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v: V3) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    }
    rotateX(angle) {
        return new V3(
            this.x,
            this.y * Math.cos(angle) - this.z * Math.sin(angle),
            this.z * Math.cos(angle) + this.y * Math.sin(angle)
        );
    }
    rotateY(angle) {
        return new V3(
            this.x * Math.cos(angle) + this.z * Math.sin(angle),
            this.y,
            this.z * Math.cos(angle) - this.x * Math.sin(angle),
        );
    }
    rotateZ(angle) {
        return new V3(
            this.x * Math.cos(angle) + this.y * Math.sin(angle),
            this.y * Math.cos(angle) - this.x * Math.sin(angle),
            this.z
        );
    }
}

const COLOR = {
    white: [255,255,255,255],
    black: [0,0,0,255],
}

class Mesh {
    pointList: Array<V3>;
    lineList: Array<Array<number>>;

    constructor() {
        this.pointList = new Array<V3>();
        this.lineList = new Array<Array<number>>();
    }

    addPoint (point: V3) {
        this.pointList.push(point);
    }
}

class Line {
    public begin: V3;
    public end: V3;

    constructor(begin: V3, end: V3) {
    }
}

class Canvas {
    private canvas;
    private context;
    private imageData;
    public data;
    public observer = -400;

    constructor() {
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        this.data = this.imageData.data;
    }

    get width () { return this.canvas.width };
    get height () { return this.canvas.height };
    addr = (x, y) => (y * this.width + x) * 4;

    public refresh() {
        this.context.putImageData(this.imageData, 0, 0);
    }

    fill = (rgba) => {
        for(let addr=0;addr<this.data.length; addr+=4)
        {
            this.data[addr] = rgba[0];
            this.data[addr+1] = rgba[1];
            this.data[addr+2] = rgba[2];
            this.data[addr+3] = rgba[3];
        }
    }

    setPixel = (x: number, y: number, rgba) => {
        x = Math.round(x);
        y = Math.round(y);
        const addr = this.addr(x, y);
        this.data[addr] = rgba[0];
        this.data[addr+1] = rgba[1];
        this.data[addr+2] = rgba[2];
        this.data[addr+3] = rgba[3];
    };
    linex = (x: number, y: number, len: number, rgba) => {
        if (x + len > this.width) {
            len = this.width - x;
        }

        let addr = this.addr(x, y);
        while(len--) {
            this.data[addr] = rgba[0];
            this.data[addr+1] = rgba[1];
            this.data[addr+2] = rgba[2];
            this.data[addr+3] = rgba[3];
            addr += 4;
        }
    }
    liney = (x: number, y: number, len: number, rgba) => {
        if (y + len > this.height) {
            len = this.height - x;
        }

        let addr = this.addr(x, y);
        while(len--) {
            this.data[addr] = rgba[0];
            this.data[addr+1] = rgba[1];
            this.data[addr+2] = rgba[2];
            this.data[addr+3] = rgba[3];
            addr += this.width * 4;
        }
    }
    line = (x1, y1, x2, y2, rgba) => {
        if (x1 === x2) {
            if (y1 > y2) {
                [y1, y2] = [y2, y1];
            }
            this.liney(x1, y1, y2 - y1, rgba);
        } else if (y1 === y2) {
            if (x1 > x2) {
                [x1, x2] = [x2, x1];
            }
            this.linex(x1, y1, x2 - x1, rgba);
        } else {
            if (Math.abs(x2 - x1) > Math.abs(y2 - y1))
            {
                if (x1 > x2) {
                    [x1, x2] = [x2, x1];
                    [y1, y2] = [y2, y1];
                }
                for (let x = x1; x <= x2; x++) {
                    let y = Math.round(y1 + (y2 - y1)/(x2 - x1)*(x - x1));
                    this.setPixel(x, y, rgba);
                }
            }
            else
            {
                if (y1 > y2) {
                    [x1, x2] = [x2, x1];
                    [y1, y2] = [y2, y1];
                }
                for (let y = y1; y <= y2; y++) {
                    let x = Math.round(x1 + (x2 - x1)/(y2 - y1) * (y - y1));
                    this.setPixel(x, y, rgba);
                }
            }
        }
    }
    to2d = (point: V3) => {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        let zFactor = (point.z - this.observer)/(- this.observer);

        let x = Math.round( halfWidth + (point.x / zFactor);
        let y = Math.round( halfHeight - (point.y / zFactor);

        return {x: x, y: y};
    }
    plot3d = (point: V3) => {
        const {x, y} = this.to2d(point);
        this.setPixel(x, y, [0,0,0,255]);
    }
    draw3d = (begin: V3, end: V3) => {
        const p1 = this.to2d(begin);
        const p2 = this.to2d(end);

        this.line(p1.x, p1.y, p2.x, p2.y, [0,0,0,255]);
    }
    solid3d = (solid: Mesh) => {
        solid.pointList.forEach((point) => this.plot3d(point));
        solid.lineList.forEach((pointPair) => this.draw3d(solid.pointList[pointPair[0]], solid.pointList[pointPair[1]]));
    }
}

class AppGraph {
    public canvas: Canvas;
    public angle = 0;
    public mesh: Mesh;

    run () {
        // this.mesh = this.prepare();
        this.canvas = new Canvas();
        this.frame();
    }
    prepare (param = 0) {
        const mesh = new Mesh();
        const stretch = 8;
        const scale = 4;
        const scaleZ = 10;
        const range = 30;

        for(let x=-range; x<range; x++) {
            for(let y=-range; y<range; y++) {
                let z = Math.sin(Math.sqrt(x/scale*x/scale + y/scale*y/scale) + param*10) * scaleZ;
                mesh.addPoint(new V3(
                    x * stretch,
                    y * stretch,
                    z * stretch
                ));
            }
        }

        return mesh;
    }
    frame () {

        this.mesh = this.prepare(this.angle);
        const tmpMesh = new Mesh();

        for(let n=0; n < this.mesh.pointList.length ;n++) {
            let point = this.mesh.pointList[n];
            point = point
                .rotateX(Math.sin(this.angle*2) * 2 + Math.cos(this.angle*3) * 3)
                .rotateY(this.angle/2)
                .rotateZ(this.angle/3)
            ;

            point.add(new V3(
                Math.sin(this.angle * 5) * 200,
                Math.sin(this.angle * 7) * 200,
                Math.sin(this.angle * 11) * 400 + 400
            ));

            tmpMesh.pointList[n] = point;
        }
        // for(let n=0; n<box.lineList.length; n++) {
        //     tmpMesh.lineList[n] = box.lineList[n];
        // }

        this.canvas.fill(COLOR.white);
        this.canvas.solid3d(tmpMesh);
        this.canvas.refresh();

        setTimeout(() => {
            this.angle += Math.PI/1000;
            this.frame();
        }, 1);
    }
}

