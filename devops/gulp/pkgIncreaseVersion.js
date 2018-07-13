var gulp = require('gulp')
var bump = require('gulp-bump')
const prompt = require('gulp-prompt')

gulp.task('pkgIncreaseVersion', function () {
  let type
  return gulp
    .src('./package.json')
    .pipe(
      prompt.prompt(
        {
          type: 'list',
          name: 'type',
          message: 'Choose a version type to increase.',
          choices: ['major', 'minor', 'patch']
        },
        function (result) {
          type = result
        }
      )
    )
    .pipe(bump({ type }))
    .pipe(gulp.dest('./'))
})
