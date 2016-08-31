# gulp-polymer-iconset
Gulp plugin that generates an `<iron-iconset-svg>` given a group of .svg icon files.

## Usage

Install it with npm

    npm install gulp-polymer-iconset

In your <code>gulpfile.js</code>:

```javascript
var polymerIconset = require('gulp-polymer-iconset');

gulp.task('styles', function() {
  return gulp.src('app/icons/**/*')
    .pipe(polymerIconset({
        iconsetName: 'my-namespace',
        iconSize: 18,
        fileName: 'my-namespace-icons.html'
    }))
    .pipe(gulp.dest('app/iconsets'));
});
```

It results in:
```html
<link rel="import" href="../iron-iconset-svg/iron-iconset-svg.html">

<iron-iconset-svg name="my-namespace" size="18">
  <svg>
    <defs>

<g id="icon-01">
  <polygon points="..."/>
  <path d="..."/>
</g>

<g id="icon-02">
  <path d="..."/>
</g>

    </defs>
  </svg>
</iron-iconset-svg>
```

## Options
* `iconsetName` (String)
* `iconSize` (String)
* `iconId` (String|Function): if function, takes the file corresponding to the icon, and should return a String
* `fileName` (String) File name of the iconset. If not specified it will be the same as `iconsetName`.
