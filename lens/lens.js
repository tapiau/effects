const Lens = {
    radius: 100,
    margin: 120,
    strength: 4,
    width: 1280,
    height: 800,

    x: 0,
    y: 0,
    dataSize: 0,
    y_min: 0,
    y_max: 0,
    x_min: 0,
    x_max: 0,
    map: [],
    dst: {
        canvas: null,
        context: null,
        imageData: null,
        data: null,
    },
    src: {
        image: new Image(),
        canvas: document.createElement('canvas'),
        context: null,
        imageData: null,
        data: null,
    },
    run: () => {
        Lens.setDst();
        Lens.dataSize = Lens.dst.data.length;
        Lens.setSrc();
        Lens.dst.context.putImageData(Lens.dst.imageData, 0, 0);
        Lens.makeMap();
        Lens.dst.canvas.addEventListener('mousemove', Lens.mouse);
    },
    setDst: () => {
        Lens.dst.canvas = document.getElementById('canvas');
        Lens.dst.context = Lens.dst.canvas.getContext('2d');
        Lens.dst.imageData = Lens.dst.context.getImageData(0, 0, Lens.width, Lens.height);
        Lens.dst.data = Lens.dst.imageData.data;
    },
    setSrc: () => {
        Lens.src.image.crossOrigin = 'anonymous';
        Lens.src.image.addEventListener('load', () => {
            Lens.src.canvas.width = Lens.width;
            Lens.src.canvas.height = Lens.height;
            Lens.src.context = Lens.src.canvas.getContext('2d');
            Lens.src.context.drawImage(Lens.src.image, 0, 0);
            Lens.src.imageData = Lens.src.context.getImageData(0, 0, Lens.width, Lens.height);
            Lens.src.data = Lens.src.imageData.data;

            Lens.copy();
        });
        Lens.src.image.src = `https://placekitten.com/${Lens.width}/${Lens.height}`;
    },
    mouse: (e) => {
        Lens.patch();
        Lens.x = e.offsetX;
        Lens.y = e.offsetY;
        Lens.calculateWindow();
        Lens.drawLensMapped();
        // Lens.drawLens();
        // Lens.drawCross();
        Lens.dst.context.putImageData(Lens.dst.imageData, 0, 0);
    },
    calculateWindow: () => {
        Lens.y_min = Math.max(0, Lens.y - Lens.margin);
        Lens.y_max = Math.min(Lens.height, Lens.y + Lens.margin);
        Lens.x_min = Math.max(0, Lens.x - Lens.margin);
        Lens.x_max = Math.min(Lens.width, Lens.x + Lens.margin);
    },
    addr: (x, y) => (y * Lens.width + x) * 4,
    setPixel: (x, y, rgba) => {
        const addr = Lens.addr(x, y);
        Lens.dst.data[addr+0] = rgba[0];
        Lens.dst.data[addr+1] = rgba[1];
        Lens.dst.data[addr+2] = rgba[2];
        Lens.dst.data[addr+3] = rgba[3];
    },
    getPixel: (x, y) => {
        const addr = Lens.addr(x, y);
        return [
            Lens.src.data[addr+0],
            Lens.src.data[addr+1],
            Lens.src.data[addr+2],
            Lens.src.data[addr+3],
        ];
    },
    distance: (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)),
    zoom:  (distance) => (- distance  / Lens.radius  + 1) * Lens.strength / 4,
    makeMap: () => {
        for (let y = -Lens.margin; y < Lens.margin; y++) {
            Lens.map[y] = [];
            for (let x = -Lens.margin; x < Lens.margin; x++) {
                const distance = Lens.distance(x, y, 0, 0);

                if (Lens.radius < distance) {
                    Lens.map[y][x] = [0, 0];
                } else {
                    const zoom = -Lens.zoom(distance);
                    Lens.map[y][x] = [
                        Math.round(zoom * x),
                        Math.round(zoom * y)
                    ];
                }
            }
        }
    },
    drawLensMapped: () => {
        for (let y = Lens.y_min; y < Lens.y_max; y++) {
            for (let x = Lens.x_min; x < Lens.x_max; x++) {
                [x0, y0] = Lens.map[y - Lens.y][x - Lens.x]
                Lens.setPixel(x, y, Lens.getPixel(x0 + x, y0 + y));
            }
        }
    },
    drawLens: () => {
        for (let y = Lens.y_min; y < Lens.y_max; y++) {
            for (let x = Lens.x_min; x < Lens.x_max; x++) {

                let rgba = [];

                const distance = Lens.distance(x, y, Lens.x, Lens.y);
                if (Lens.radius < distance) {
                    rgba = Lens.getPixel(x, y);
                } else {
                    const zoom = Lens.zoom(distance);
                    rgba = Lens.getPixel(
                        Math.round(x + zoom * (Lens.x - x)),
                        Math.round(y + zoom * (Lens.y - y))
                    );
                }

                Lens.setPixel(x, y, rgba);
            }
        }
    },
    drawCross: () => {
        for (let y = Lens.y_min; y < Lens.y_max; y++) {
            for (let x = Lens.x_min; x < Lens.x_max; x++) {
                Lens.setPixel(
                    x, y,
                    (x !== Lens.x && y !== Lens.y) ?
                    Lens.getPixel(x, y) :
                    [ 255, 0, 0, 0 ]
                );
            }
        }
    },
    patch: () => {
        for (let y = Lens.y_min; y < Lens.y_max; y++) {
            for (let x = Lens.x_min; x < Lens.x_max; x++) {
                Lens.setPixel(x, y, Lens.getPixel(x, y));
            }
        }
    },
    copy: () => {
        for (let y = 0; y < Lens.height; y++) {
            for (let x = 0; x < Lens.width; x++) {
                Lens.setPixel(x, y, Lens.getPixel(x, y));
            }
        }
    },
}

