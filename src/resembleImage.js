import Jimp from 'jimp';

function scaleValue (value, min, max) {
    const newMin = 0;
    const newMax = 100;
    const percent = (value - min) / (max - min);
    return percent * (newMax - newMin) + newMin;
}

function colourStopFactory (width) {
    return function colourStop (colour, index) {
        return {
            colour,
            position: scaleValue(index, 0, width),
        };
    };
}

function resolveFidelity (width, pair) {
    if (!pair) {
        throw new Error('Expected a <number> or <percentage> value for fidelity.');
    }
    const number = parseFloat(pair.number);
    if (number === 0) {
        throw new Error('Expected a fidelity greater than 0.');
    }
    if (pair.unit === '%') {
        return width * (number / 100);
    }
    return number;
}

function rgbToHex ({r, g, b}) {
    function convert (c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    return convert(r) + convert(g) + convert(b);
}

export default function resembleImage (path, {generator, fidelity}) {
    return new Promise((resolve, reject) => {
        Jimp.read(path, (err, image) => {
            if (err) {
                reject(err);
            }
            let width;
            let height;
            let chunk;
            try {
                width = image.bitmap.width;
                height = image.bitmap.height;
                chunk = resolveFidelity(width, fidelity);
            } catch (e) {
                return reject(e);
            }
            const stops = [];
            const colourStop = colourStopFactory(width);
            for (let i = 0; i < width; i += chunk) {
                let color = image.clone()
                    .crop(i, 0, chunk, height)
                    .resize(1, 1, Jimp.RESIZE_BICUBIC)
                    .getPixelColor(0, 0);
                color = rgbToHex(Jimp.intToRGBA(color));
                stops.push(colourStop(color, i));
            }
            return resolve(generator(stops));
        });
    });
}
