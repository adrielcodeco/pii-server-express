const gulp = require('gulp')
const runSequence = require('run-sequence')

gulp.task('increaseVersion', function (callback) {
  runSequence('pkgIncreaseVersion', 'gitTag', callback)
})
