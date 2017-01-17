import {plugin} from 'postcss';
import valueParser, {stringify, unit} from 'postcss-value-parser';
import resembleImage from './resembleImage';
import simpleGradient from './simpleGradient';

const resembleFunction = 'resemble-image';

export complexGradient from './complexGradient';
export simpleGradient from './simpleGradient';

function matchesSelector (node, selectors) {
    return selectors.some(selector => ~node.selectors.indexOf(selector));
}

function resemblePromise (decl, opts, wrapped = true) {
    const promises = [];

    let url;
    let toString;

    decl.value = valueParser(decl.value).walk((node, index, nodes) => {
        const {type, value} = node;
        if (type !== 'function') {
            return false;
        }
        if (wrapped && value === resembleFunction) {
            url = node.nodes[0].nodes[0].value;
            toString = node.nodes[0];
        }
        if (!wrapped && value === 'url') {
            url = node.nodes[0].value;
            toString = node;
        }
        if (!url) {
            return false;
        }
        const second = node.nodes[2];
        const fidelity = unit(second && second.value || opts.fidelity.toString());
        promises.push(
            resembleImage(
                url,
                {
                    ...opts,
                    fidelity,
                }
            ).then(gradient => {
                // Remove the resemble-image function wrapper if there is any
                node.value = stringify(toString);
                node.type = 'word';

                // Add the gradient at the end of the value
                nodes.push({
                    type: 'word',
                    value: `, ${gradient}`,
                    after: true,
                });
            })
        );
        return false;
    });

    return Promise.all(promises).then(() => (decl.value = decl.value.toString()));
}

export default plugin('postcss-resemble-image', (opts = {}) => {
    const {selectors} = opts = {
        fidelity: '25%',
        generator: simpleGradient,
        selectors: [],
        ...opts,
    };
    return css => {
        return new Promise((resolve, reject) => {
            const promises = [];
            css.walkDecls(/^background(?:-image)?/, node => {
                const {value} = node;
                if (~value.indexOf(resembleFunction)) {
                    return promises.push(resemblePromise(node, opts));
                }
                if (~value.indexOf('url') && matchesSelector(node.parent, selectors)) {
                    return promises.push(resemblePromise(node, opts, false));
                }
            });
            return Promise.all(promises).then(resolve, reject);
        });
    };
});
