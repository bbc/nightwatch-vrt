const reporter = require('../lib/reporter');
module.exports = {

  afterEach(browser) {
    reporter.appendDataToTestResult();
  },

  reporter(results, done) {
    reporter.publishReport(results);
    done();
  }

};