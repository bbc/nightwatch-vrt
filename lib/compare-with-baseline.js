'use strict';

const Jimp = require('jimp');
const getBaselineScreenshotOrCreate = require('./get-baseline-screenshot-or-create');
const saveScreenshot = require('./save-screenshot');
const generateScreenshotFilePath = require('./generate-screenshot-file-path');
const getVrtSettings = require('./get-vrt-settings');
const promptScreenshotOverride = require('./prompt-screenshot-override');
const overrideBaseline = require('./override-baseline');
const cleanupScreenshots = require('./cleanup-screenshots');
const reporter = require('./reporter');

/**
 * Compares a screenshot against the baseline screenshot. If the baseline screenshot
 * does not exist in the baseline directory, this function creates it and compares the screenshot
 * passed as parameter against itself.
 *
 * @param {Object} nightwatchClient Instance of the current nightwatch API interface
 * @param {Object} screenshot Jimp image representation
 * @param {Object} fileName Optional file name
 * @param {Object} overrideSettings Optional override settings
 */
module.exports = async function compareWithBaseline(
  nightwatchClient,
  screenshot,
  fileName,
  overrideSettings
) {
  fileName = fileName.selector || fileName;
  const {
    latest_screenshots_path,
    latest_suffix,
    baseline_screenshots_path,
    baseline_suffix,
    diff_screenshots_path,
    diff_suffix,
    threshold,
    prompt,
    updateScreenshots
  } = getVrtSettings(this.client.settings, overrideSettings);
  const completeLatestPath = generateScreenshotFilePath(
    nightwatchClient,
    latest_screenshots_path,
    `${fileName}${latest_suffix}`
  );
  const completeBaselinePath = generateScreenshotFilePath(
    nightwatchClient,
    baseline_screenshots_path,
    `${fileName}${baseline_suffix}`
  );
  const completeDiffPath = generateScreenshotFilePath(
    nightwatchClient,
    diff_screenshots_path,
    `${fileName}${diff_suffix}`
  );

  const browserName = nightwatchClient.capabilities && nightwatchClient.capabilities.browserName;
  const testModule = nightwatchClient.currentTest && nightwatchClient.currentTest.module;
  const assertionName = nightwatchClient.currentTest && nightwatchClient.currentTest.name;
  const clientReporter = this.client.reporter;

  const baseline = await getBaselineScreenshotOrCreate(nightwatchClient, screenshot, completeBaselinePath);
  const diff = Jimp.diff(screenshot, baseline);
  const identical = diff.percent <= (Number.isFinite(threshold) ? threshold : 0.0);
  let result;

  try {
    if (!identical && prompt === true) {
      await saveScreenshot(completeLatestPath, screenshot);
      await saveScreenshot(completeDiffPath, diff.image);
      await promptScreenshotOverride(completeLatestPath, completeBaselinePath, completeDiffPath);
      await overrideBaseline(completeLatestPath, completeBaselinePath);
      await cleanupScreenshots(completeLatestPath, completeDiffPath);
    } else if (!identical && (updateScreenshots === true || process.argv.includes('--update-screenshots'))) {
      nightwatchClient.assert.ok(true, 'Settings enforced overriding baseline screenshot');
      await saveScreenshot(completeBaselinePath, screenshot);
      result = true;
    } else if (!identical && !prompt && !updateScreenshots) {
      await saveScreenshot(completeLatestPath, screenshot);
      await saveScreenshot(completeDiffPath, diff.image);
      result = false;
    } else if (identical) {
      await cleanupScreenshots(completeLatestPath, completeDiffPath);
      result = true;
    }
  } catch (err) {
    result = err;
  }

  if (result !== true) {
    reporter.insertData(clientReporter, {browserName, testModule, assertionName, completeBaselinePath, completeDiffPath, completeLatestPath, diff: diff.percent});
  }
  
  return result;
};
