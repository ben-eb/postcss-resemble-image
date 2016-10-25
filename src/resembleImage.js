import resolver from 'asset-resolver';
import paper from 'paper';
import imageSize from 'image-size';

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

export default function resembleImage (image, {generator, fidelity}) {
    return resolver.getResource(image).then(data => data.contents)
    .then(imageSize).then(({width, height}) => {
        return new Promise((resolve, reject) => {
            paper.setup(new paper.Size(width, height));
            const raster = new paper.Raster(image);
            const colourStop = colourStopFactory(width);

            raster.onLoad = function () {
                const stops = [];
                raster.position = paper.view.center;
                let chunk;
                try {
                    chunk = resolveFidelity(width, fidelity);
                } catch (e) {
                    return reject(e);
                }

                for (let i = 0; i < width; i += chunk) {
                    const rect = new paper.Path.Rectangle(
                        i,
                        0,
                        chunk,
                        height
                    );
                    stops.push(colourStop(raster.getAverageColor(rect).toCSS(true), i));
                }

                return resolve(generator(stops));
            };
        });
    });
}
