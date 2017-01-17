import fs from 'fs';
import http from 'http';
import test from 'ava';
import postcss from 'postcss';
import getPort from 'get-port';
import valueParser from 'postcss-value-parser';
import plugin, {complexGradient, simpleGradient} from '..';

const image = './../../docs/waves.jpg';
const unprocessable = './../../docs/index.html';

function getArguments (node) {
    return node.nodes.reduce((list, child) => {
        if (child.type !== 'div') {
            list[list.length - 1].push(child);
        } else {
            list.push([]);
        }
        return list;
    }, [[]]);
}

function assertColourStops (t, fixture, expected, options) {
    return postcss(plugin(options)).process(fixture).then((result) => {
        let hasGradient = false;
        valueParser(result.root.first.nodes[0].value).walk(node => {
            if (node.value !== 'linear-gradient') {
                return false;
            }
            hasGradient = true;
            const stops = getArguments(node).slice(1);
            t.deepEqual(stops.length, expected);
            stops.forEach(stop => {
                const colour = stop[0].value;
                t.truthy(/^#[0-9a-f]{6}$/i.test(colour));
            });
        });
        t.truthy(hasGradient);
    });
}

function shouldNotHaveFunctionInOutput (t, fixture, expected, options) {
    return postcss(plugin(options)).process(fixture).then((result) => {
        t.is(result.root.first.nodes[0].value.indexOf('resemble-image'), -1);
    });
}

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
            fs.createReadStream(image).pipe(res);
        }).listen(port);

        return assertColourStops(
            t,
            `header{background:resemble-image(url("http://localhost:${port}"), 50%)}`,
            2
        ).then(() => server.close());
    });
});

test(
    'should pass through when it cannot find a resemble-image function',
    processCss,
    `header{background:url("${image}")}`,
    `header{background:url("${image}")}`
);

test(
    'should output a gradient for specified selectors',
    assertColourStops,
    `header, footer{background:url("${image}")}`,
    4,
    {selectors: ['header']}
);

test(
    'should output a value without the resemble-image() function wrapped around',
    shouldNotHaveFunctionInOutput,
    `header{background:resemble-image(url("${image}"))}`,
    4
);

test(
    'should output a gradient with stops 25% apart (defaults)',
    assertColourStops,
    `header{background:resemble-image(url("${image}"))}`,
    4
);

test(
    'should output a gradient with stops 50% apart',
    assertColourStops,
    `header{background:resemble-image(url("${image}"), 50%)}`,
    2
);

test(
    'should output a gradient with stops 50% apart, with an unquoted url',
    assertColourStops,
    `header{background:resemble-image(url(${image}), 50%)}`,
    2
);

test(
    'should output a gradient with stops 50% apart, using the complex generator',
    assertColourStops,
    `header{background:resemble-image(url("${image}"), 50%)}`,
    3,
    {generator: complexGradient}
);

test(
    'should output a gradient with stops 50% apart, using the simple generator',
    assertColourStops,
    `header{background:resemble-image(url("${image}"), 50%)}`,
    2,
    {generator: simpleGradient}
);

test(
    'should output a gradient with stops 100px apart',
    assertColourStops,
    `header{background:resemble-image(url("${image}"), 100px)}`,
    10
);

test(
    'should output a gradient with stops 100px apart (non-px unit)',
    assertColourStops,
    `header{background:resemble-image(url("${image}"), 100em)}`,
    10
);

test(
    'should output a gradient with stops 100px apart (no unit)',
    assertColourStops,
    `header{background:resemble-image(url("${image}"), 100)}`,
    10
);

test(
    'should output a gradient with stops 100px apart (from options)',
    assertColourStops,
    `header{background:resemble-image(url("${image}"))}`,
    10,
    {fidelity: 100}
);

test(
    'should handle multiple backgrounds',
    assertColourStops,
    `header{background:url("foo.jpg"), resemble-image(url("${image}"))}`,
    4
);

test('should handle background value shorthand',
    assertColourStops,
    `header{background:resemble-image(url("${image}")) no-repeat center / cover}`,
    4
);

test(
    'should error on 0',
    shouldThrow,
    `header{background:resemble-image(url("${image}"), 0)}`
);

test(
    'should error on 0, when set from options',
    shouldThrow,
    `header{background:resemble-image(url("${image}"))}`,
    {fidelity: 0}
);

test(
    'should error on 0, when set from options (string)',
    shouldThrow,
    `header{background:resemble-image(url("${image}"))}`,
    {fidelity: '0'}
);

test(
    'should error on invalid fidelity',
    shouldThrow,
    `header{background:resemble-image(url("${image}"), twenty-five)}`
);

test(
    'should error on non-existing image',
    shouldThrow,
    `header{background:resemble-image(url(), twenty-five)}`
);

test(
    'should error on unprocessable image',
    shouldThrow,
    `header{background:resemble-image(url("${unprocessable}"))}`
);
