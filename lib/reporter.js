const path = require('path');
const {merge: lodashMerge, pick: lodashPick, isEmpty}= require('lodash');
const {writeNightwatchHTMLReport} = require('@nightwatch/html-reporter-template');
const open = require('open');

class Reporter {


  constructor() {
    this.reports = {};
  }


  /**
   * store the data from vrt command
   * @param {NightwatchReporter} clientReporter 
   * @param {Object} param1 
   */
  insertData(clientReporter, {assertionName, completeBaselinePath, completeDiffPath, completeLatestPath, diff}) {
    this.reports = lodashMerge(this.reports, {
      [assertionName]: {
        vrt: {
          completeBaselinePath,
          completeDiffPath,
          completeLatestPath,
          diff
        }
      }
    });

    this.clientReporter = clientReporter;
  }

  /**
   * append data to Nightwatch test result object
   */
  appendDataToTestResult() {
    if (!this.clientReporter) {
      return;
    }
    const {testResults} = this.clientReporter;
    testResults.appendTestResult(this.reports);
  }

  /**
   * filter out the unnecessary keys  
   * @param {Object} module 
   * @returns {Object} 
   */
  adaptModule(module) {
    const completedSections = {};
    for (const sectionName of Object.keys(module.completedSections)) {
      const section = lodashPick(module.completedSections[sectionName], ['vrt', 'time', 'status']);

      if (Object.keys(section).includes('vrt')) {
        completedSections[sectionName] = section;
      }
    }

    return {
      modulePath: module.modulePath,
      completedSections,
      sessionCapabilities: module.sessionCapabilities,
      status: module.status
    };
  }

  /**
   * flatten the envs global result object
   * @param {Object} modulesWithEnv
   */
  flattenEnvironments(modulesWithEnv) {
    const filteredModules = {};
  
    for (const testEnv of Object.keys(modulesWithEnv)) {
      const modules = modulesWithEnv[testEnv];
  
      for (const moduleKey of Object.keys(modules)) {
        const module = modules[moduleKey];
        const newModuleKey = `${moduleKey}(${testEnv})`;
        const adaptedModule = this.adaptModule(module);
        if (Object.keys(adaptedModule.completedSections).length) {
          filteredModules[newModuleKey] = adaptedModule;
        }
      }
    }

    return filteredModules;
  }

  /**
   * adaps data as per reporter needs
   * @param {*} results 
   * @returns {Object}
   */
  adaptResults(results) {
    const {modulesWithEnv}  = results;
    const modules = this.flattenEnvironments(modulesWithEnv);

    if (isEmpty(modules)) {
      return false;
    }
    
    return {
      environments: {
        defaults: {
          modules
        }
      },
      metadata: {
        date: new Date()
      }
    };
  }

  /**
   * invoke method to create vrt report with the filtered ressults object
   * 
   * @param {Object} data 
   */
  publishReport(data, done) {
  
    const result = this.adaptResults(data);
    if (!result) {
      return done();
    }
    writeNightwatchHTMLReport(path.join(process.cwd(), 'vrt-report'), 'index.html', JSON.stringify(result), 'vrt');

    if (process.argv.includes('--open')) {
      return open(path.join(process.cwd(), 'vrt-report', 'index.html'))
        .then(_ => done())
        .catch(err => done(err));
    } 
    done();
    
  }
   
}

module.exports = new Reporter();

