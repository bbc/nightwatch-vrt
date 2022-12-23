const reporter = require('../lib/reporter');
module.exports = {

  afterEach() {
    reporter.appendDataToTestResult();
  },

  reporter(results, done) {
    reporter.publishReport(results, done);
  }

};