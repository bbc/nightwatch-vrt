const path = require('path');
const {merge: lodashMerge, filter: lodashFilter, pick: lodashPick}= require('lodash');
const {writeNightwatchHTMLReport} = require('html-reporter');

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
    const defaults = {
      modules: {}
    };
  
    for (const testEnv of Object.keys(modulesWithEnv)) {
      const modules = modulesWithEnv[testEnv];
  
      for (const moduleKey of Object.keys(modules)) {
        const module = modules[moduleKey];
        for (const testEnv of Object.keys(modulesWithEnv)) {
          const newModuleKey = `${moduleKey}(${testEnv})`;
          const adaptedModule = this.adaptModule(module);
          if (Object.keys(adaptedModule.completedSections).length) {
            defaults.modules[newModuleKey] = adaptedModule;
          }
        }
      
      }
    }
    const environments = {
      defaults: defaults
    };

    return environments;
  }

  /**
   * invoke method to create vrt report with the filtered ressults object
   * 
   * @param {Object} data 
   */
  publishReport(data) {
    if (data && data.modulesWithEnv) {
      data = this.flattenEnvironments(data.modulesWithEnv);
      writeNightwatchHTMLReport(path.join(process.cwd(), 'vrt-report'), JSON.stringify(data));
    }
   
  }
   
}

module.exports = new Reporter();

