# 2.1.1

* Resolves an issue where the gradient fallback would be placed in the wrong
  position for the `background` shorthand; now, it is appended to the value
  (thanks to @diagramatics).

# 2.1.0

* Adds a `selectors` option which enables you to automatically add the gradients
  to URLs of your choosing, without a non-standard function.

# 2.0.0

## Breaking changes

* Now uses the Jimp module instead of paper.js for the image analysis, which
  means that this module now has no external dependencies outside of Node.js
  (thanks to @Lorti).

# 1.0.0

* Initial release.
