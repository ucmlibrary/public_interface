# CSS Development Guide

## Custom Styles

All custom CSS is contained within Sass files within `/app/styles/`

The Sass compiler imports all sass component files listed in `main.scss` and outputs the finished CSS into a single CSS file, `main.css`. Since `main.css` is the compiled result of all sass files, it should not be edited directly. Only edit styles in the `.scss` files. 

### Labeling Styles

Each Sass file typically represents a UI component. 

Sass files are generally named according to their UI component. Example: carousel.scss represents the styles for the main carousel. 

Generally, selectors for elements within a component are named `<component-name>__<element-name>--<optional-modifier>` in which component names, selector names, and modifier names all use a single hyphen delimiter for multi-word names. Example: `carousel__thumbnail-caption`, `carousel__image`, and `carousel__image--selected`. 

### Writing Styles

When creating new styles, write them in an existing component sass file (if it relates to a component) or create a new sass file for the styles and import it within `main.scss`. This practice helps keep styles manageable and helps prevent CSS specificity issues. Avoid writing styles inline within the HTML, which will cause these issues. 

Selectors are generally labeled using the BEM naming methodology. See https://css-tricks.com/bem-101 or http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax for information and examples of BEM. 

When writing Sass and ordering properties, I followed these style guidelines: https://css-tricks.com/sass-style-guide

### Debugging Styles

It's helpful to use your browser's element inspector to track down the class you want to fix. Unfortuately, sourcemaps aren't configured within the Calisphere front-end stack, so the inspector is your best bet. Once you find the class you're looking for (like "class='thumbnail__image'"), then you can open thumbnail.scss and find the selector that matches that class. Searching for the class via your code editor's find-and-replace is another good way to find classes within the sass component files. 