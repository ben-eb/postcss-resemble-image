# [postcss][postcss]-resemble-image [![Build Status](https://travis-ci.org/ben-eb/postcss-resemble-image.svg?branch=master)][ci] [![Build status](https://ci.appveyor.com/api/projects/status/396xfduj47prxklq?svg=true)](https://ci.appveyor.com/project/ben-eb/postcss-resemble-image) [![NPM version](https://badge.fury.io/js/postcss-resemble-image.svg)][npm] [![Dependency Status](https://gemnasium.com/ben-eb/postcss-resemble-image.svg)][deps]

> Provide a gradient fallback for an image that loosely resembles the original.


## Install

With [npm](https://npmjs.org/package/postcss-resemble-image) do:

```
npm install postcss-resemble-image --save
```

postcss-resemble-image uses [Jimp] to perform the image analysis. The following
image formats are supported:

* `BMP`
* `JPEG`
* `PNG`

[Jimp]: https://github.com/oliver-moran/jimp


## Example

This module will add a background gradient fallback for images, should the
resource fail to load; the image fallback loosely resembles the original. The
idea for this module was inspired by [Harry Roberts' article][2].

[2]: http://csswizardry.com/2016/10/improving-perceived-performance-with-multiple-background-images/

Each image will be loaded relative to the CSS file; in these examples, `"waves.jpg"`
is in the same directory as the CSS. Note that this module can also load images
from a URL.

There are two ways to use postcss-resemble-image; the first allows you to
automatically render these gradients by providing a list of selectors
to analyse for images. The second allows you to use a non-standard function,
`resemble-image`, which takes a CSS URL as the first parameter and the
*fidelity* as the second. You may use these interchangeably if you so wish.

### Using the automatic render

#### Options

```js
{
    selectors: ['header']
}
```

#### Input

```css
header {
    background: url("waves.jpg");
}
```

#### Output

```css
header {
    background: url("waves.jpg"), linear-gradient(90deg, #353230 0%, #3c3835 25%, #3b3734 50%, #322f2c 75%);
}
```

### Using the `resemble-image` function

#### Defaults

##### Input

```css
header {
    background: resemble-image(url("waves.jpg"));
}
```

##### Output

```css
header {
    background: url("waves.jpg"), linear-gradient(90deg, #353230 0%, #3c3835 25%, #3b3734 50%, #322f2c 75%);
}
```

#### Passing percentages

`fidelity` is set globally, but can also be passed as the second parameter to the
`resemble-image` function. This code will generate a colour stop for each tenth
of the image.

```css
header {
    background: resemble-image(url("waves.jpg"), 10%);
}
```

#### Passing absolute lengths

`fidelity` can also be set via a *pixel* value. Anything other than `%` will be
parsed as a `px` value, including no unit; these are equivalent:

```css
header {
    background: resemble-image(url("waves.jpg"), 10px);
    background: resemble-image(url("waves.jpg"), 10em);
    background: resemble-image(url("waves.jpg"), 10);
}
```


## Screenshots

Original image:

<img width="1000" src="https://rawgit.com/ben-eb/postcss-resemble-image/master/docs/waves.jpg">

After processing (using `simpleGradient`, with 25% stops):

<img width="1000" src="https://rawgit.com/ben-eb/postcss-resemble-image/master/docs/simple.png">

After processing (using `complexGradient`, with 5% stops):

<img width="1000" src="https://rawgit.com/ben-eb/postcss-resemble-image/master/docs/complex.png">

Image credit: https://unsplash.com/?photo=9EM7s13H2I0

## API

### `resembleImage([options])`

Note that postcss-resemble-image is an *asynchronous* processor. It cannot be
used like this:

```js
import postcss from 'postcss';
import resembleImage from 'postcss-resemble-image';

const result = postcss([ resembleImage() ]).process(css).css;
console.log(result);
```

Instead make sure your PostCSS runner uses the asynchronous API:

```js
import postcss from 'postcss';
import resembleImage from 'postcss-resemble-image';

postcss([ resembleImage() ]).process(css).then((result) => {
    console.log(result.css);
});
```

postcss-resemble-image is designed to be used with `import` & `export`. When
using `require`, make sure that you load the main module by doing:

```js
const resembleImage = require('postcss-resemble-image').default;
```

#### options

##### fidelity

Type: `number|string`  
Default: `25%`  

The `fidelity` option controls how many colour stops will be generated for the
linear gradient fallback. By default, it will be split into quarters. Setting
this to anything other than `%` will be parsed as a `px` value, including
no unit. Zero values are not allowed.

##### generator

Type: `function`  
Default: `simpleGradient`  

The `generator` option controls the rendering of the gradient function; by
default it is set to `simpleGradient` which will smoothly transition between
the gradient stops. The `complexGradient` function hard transitions between each
colour, for a striped effect. To use this instead you may import the function
from the module, like so:

```js
import postcss from 'postcss';
import resembleImage, {complexGradient} from 'postcss-resemble-image';

postcss([ resembleImage({generator: complexGradient}) ]).process(css).then((result) => {
    console.log(result.css);
});
```

##### selectors

Type: `array`  
Default: `[]`  

The `selectors` array controls which selectors postcss-resemble-image should
analyse for URLs to provide gradients for. The module tests using strict
equality; if you are checking a selector which contains more than one simple
selector only one of these needs to be specified. For example:

```js
import postcss from 'postcss';
import resembleImage from 'postcss-resemble-image';

const css = `
header, footer {
    background: url("waves.jpg");
}
`;

postcss([ resembleImage({selectors: ['footer']}) ]).process(css).then((result) => {
    console.log(result.css);
    // => header, footer {
    //        background: url("waves.jpg"), linear-gradient(90deg, #353230 0%, #3c3835 25%, #3b3734 50%, #322f2c 75%);
    //    }
});
```

Note that this option isn't required when using the `resemble-image` function.

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for
examples for your environment.


## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/1282980?v=3" width="100px;"/><br /><sub>Ben Briggs</sub>](http://beneb.info)<br />[💻](https://github.com/ben-eb/postcss-resemble-image/commits?author=ben-eb) [📖](https://github.com/ben-eb/postcss-resemble-image/commits?author=ben-eb) 👀 [⚠️](https://github.com/ben-eb/postcss-resemble-image/commits?author=ben-eb) | [<img src="https://avatars.githubusercontent.com/u/2143782?v=3" width="100px;"/><br /><sub>Manuel Wieser</sub>](https://manu.ninja)<br />[💻](https://github.com/ben-eb/postcss-resemble-image/commits?author=Lorti) [⚠️](https://github.com/ben-eb/postcss-resemble-image/commits?author=Lorti) |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors] specification. Contributions of
any kind welcome!


## License

MIT © [Ben Briggs](http://beneb.info)


[all-contributors]: https://github.com/kentcdodds/all-contributors
[ci]:      https://travis-ci.org/ben-eb/postcss-resemble-image
[deps]:    https://gemnasium.com/ben-eb/postcss-resemble-image
[npm]:     http://badge.fury.io/js/postcss-resemble-image
[postcss]: https://github.com/postcss/postcss
