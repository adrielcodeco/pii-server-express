const gulp = require('gulp')
const tagVersion = require('gulp-tag-version')

gulp.task('gitTag', function () {
  return gulp.src(['./package.json']).pipe(tagVersion())
})
