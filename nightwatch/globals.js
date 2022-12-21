const reporter = require('../lib/reporter');
module.exports = {

  afterEach(browser) {
    reporter.insertDataIntoReporter();
  },

  reporter(results, done) {
    reporter.publishReport(results);
    done();
  }

};