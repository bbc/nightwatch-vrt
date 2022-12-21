'use strict';

const kebabCase = require('lodash/kebabCase');
const path = require('path');
const get = require('lodash/get');
const getVrtSettings = require('./get-vrt-settings');


function appendExtensionToFilename(fileName) {
  return fileName ? `${fileName}.png` : undefined;
}

/**
 * The default screenshot file path generator based on the following information
 * extracted from the nightwatch public interface:
 *
 * 1. Name of the current test running in the node process.
 * 2. The current test's module.
 * 3. A base path.
 *
 * @param {Object} nightwatchClient Instance of the current nightwatch API interface
 * @param {String} basePath A custom string that can be specified to further distinguish
 * the location where the screenshot will be stored or read from.
 * @param {String} [fileName] A custom filename for the screenshot
 */
function defaultScreenshotFilePath(nightwatchClient, basePath, fileName) {
  const moduleName = nightwatchClient.currentTest.module;
  const testName = nightwatchClient.currentTest.name;
  const kebabName = `${kebabCase(testName)}`;
  const browserName = nightwatchClient.capabilities && nightwatchClient.capabilities.browserName;
  const platformName = nightwatchClient.capabilities && nightwatchClient.capabilities.platformName;
  const target = ((browserName || '') + (platformName ? `_${platformName}`: '')).trim();

  var screenShotName = appendExtensionToFilename(fileName || kebabName);

  return path.join(process.cwd(), basePath, target, moduleName, screenShotName);
}

/**
 * Generates a screenshot file path from either the default function or one supplied
 * in the settings.
 *
 * @param {Object} nightwatchClient Instance of the current nightwatch API interface
 * @param {String} basePath A custom string that can be specified to further distinguish
 * the location where the screenshot will be stored or read from.
 * @param {String} [fileName] A custom filename for the screenshot
 */
module.exports = function generateScreenshotFilePath(nightwatchClient, basePath, fileName) {
  const globalSettings = getVrtSettings(nightwatchClient);

  if (globalSettings && globalSettings.generate_screenshot_path) {
    return globalSettings.generate_screenshot_path(
      nightwatchClient, basePath, appendExtensionToFilename(fileName));
  }

  return defaultScreenshotFilePath(nightwatchClient, basePath, fileName);
};
