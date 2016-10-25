import {plugin} from 'postcss';
import valueParser, {stringify, unit} from 'postcss-value-parser';
import resembleImage from './resembleImage';
import simpleGradient from './simpleGradient';

const resembleFunction = 'resemble-image';

export complexGradient from './complexGradient';
export simpleGradient from './simpleGradient';

function resemblePromise (decl, opts) {
    const promises = [];

    decl.value = valueParser(decl.value).walk(node => {
        const {type, value} = node;
        if (type !== 'function' || value !== resembleFunction) {
            return false;
        }
        const fidelity = unit(node.nodes[2] && node.nodes[2].value || opts.fidelity.toString());
        promises.push(
            resembleImage(
                node.nodes[0].nodes[0].value,
                {
                    ...opts,
                    fidelity,
                }
            ).then(gradient => {
                node.value = stringify(node.nodes[0]) + ', ' + gradient;
                node.type = 'word';
            })
        );
        return false;
    });

    return Promise.all(promises).then(() => (decl.value = decl.value.toString()));
}

export default plugin('postcss-resemble-image', (opts = {}) => {
    opts = {
        fidelity: '25%',
        generator: simpleGradient,
        ...opts,
    };
    return css => {
        return new Promise((resolve, reject) => {
            const promises = [];
            css.walkDecls(/^background(?:-image)?/, node => {
                if (!~node.value.indexOf(resembleFunction)) {
                    return;
                }
                promises.push(resemblePromise(node, opts));
            });
            return Promise.all(promises).then(resolve, reject);
        });
    };
});
