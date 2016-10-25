import fs from 'fs';
import http from 'http';
import test from 'ava';
import postcss from 'postcss';
import getPort from 'get-port';
import plugin, {complexGradient, simpleGradient} from '..';

function processCss (t, fixture, expected, options) {
    return postcss(plugin(options)).process(fixture).then(({css}) => {
        t.deepEqual(css, expected);
    });
}

function shouldThrow (t, fixture, options) {
    t.throws(processCss(t, fixture, fixture, options));
}

test('should process images from urls', t => {
    return getPort().then(port => {
        const server = http.createServer((req, res) => {
            res.writeHead(200, {'Content-Type': 'image/jpg'});
            fs.createReadStream('./alchemy.jpg').pipe(res);
        }).listen(port);

        return processCss(
            t,
            `header{background:resemble-image(url("http://localhost:${port}"), 50%)}`,
            `header{background:url("http://localhost:${port}"), linear-gradient(90deg, #383532 0%, #373330 50%)}`
        ).then(() => server.close());
    });
});

test(
    'should pass through when it cannot find a resemble-image function',
    processCss,
    `header{background:url("alchemy.jpg")}`,
    `header{background:url("alchemy.jpg")}`
);

test(
    'should output a gradient with stops 25% apart (defaults)',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"))}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #353230 0%, #3c3835 25%, #3b3734 50%, #322f2c 75%)}`
);

test(
    'should output a gradient with stops 50% apart',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"), 50%)}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #383532 0%, #373330 50%)}`
);

test(
    'should output a gradient with stops 50% apart, with an unquoted url',
    processCss,
    `header{background:resemble-image(url(alchemy.jpg), 50%)}`,
    `header{background:url(alchemy.jpg), linear-gradient(90deg, #383532 0%, #373330 50%)}`
);

test(
    'should output a gradient with stops 50% apart, using the complex generator',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"), 50%)}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #383532 0%, #383532 50%, #373330 50%)}`,
    {generator: complexGradient}
);

test(
    'should output a gradient with stops 50% apart, using the simple generator',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"), 50%)}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #383532 0%, #373330 50%)}`,
    {generator: simpleGradient}
);

test(
    'should output a gradient with stops 100px apart',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"), 100px)}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #312f2d 0%, #353230 10%, #3b3734 20%, #3a3633 30%, #3e3a36 40%, #3e3a36 50%, #393532 60%, #383431 70%, #33302d 80%, #2f2c2a 90%)}`
);

test(
    'should output a gradient with stops 100px apart (non-px unit)',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"), 100em)}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #312f2d 0%, #353230 10%, #3b3734 20%, #3a3633 30%, #3e3a36 40%, #3e3a36 50%, #393532 60%, #383431 70%, #33302d 80%, #2f2c2a 90%)}`
);

test(
    'should output a gradient with stops 100px apart (no unit)',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"), 100)}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #312f2d 0%, #353230 10%, #3b3734 20%, #3a3633 30%, #3e3a36 40%, #3e3a36 50%, #393532 60%, #383431 70%, #33302d 80%, #2f2c2a 90%)}`
);

test(
    'should output a gradient with stops 100px apart (from options)',
    processCss,
    `header{background:resemble-image(url("alchemy.jpg"))}`,
    `header{background:url("alchemy.jpg"), linear-gradient(90deg, #312f2d 0%, #353230 10%, #3b3734 20%, #3a3633 30%, #3e3a36 40%, #3e3a36 50%, #393532 60%, #383431 70%, #33302d 80%, #2f2c2a 90%)}`,
    {fidelity: 100}
);

test(
    'should handle multiple backgrounds',
    processCss,
    `header{background:url("foo.jpg"), resemble-image(url("alchemy.jpg"))}`,
    `header{background:url("foo.jpg"), url("alchemy.jpg"), linear-gradient(90deg, #353230 0%, #3c3835 25%, #3b3734 50%, #322f2c 75%)}`
);

test(
    'should error on 0',
    shouldThrow,
    `header{background:resemble-image(url("alchemy.jpg"), 0)}`
);

test(
    'should error on 0, when set from options',
    shouldThrow,
    `header{background:resemble-image(url("alchemy.jpg"))}`,
    {fidelity: 0}
);

test(
    'should error on 0, when set from options (string)',
    shouldThrow,
    `header{background:resemble-image(url("alchemy.jpg"))}`,
    {fidelity: '0'}
);

test(
    'should error on invalid fidelity',
    shouldThrow,
    `header{background:resemble-image(url("alchemy.jpg"), twenty-five)}`
);
