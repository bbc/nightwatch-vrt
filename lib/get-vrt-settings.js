'use strict';

const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');

/**
 * Get the visual regression tests settings from the nightwatch configuration file.
 *
 * @param {Object} clientSettings Instance of the client Settings
 * @param {Object} overrideSettings Optional override settings.
 * @return {NightwatchVRTSettings} An object containing the visual regression test settings.
 */
module.exports = function getVrtSettings(clientSettings, overrideSettings) {
  const visualRegressionSettingsPaths = [
    'globals.visual_regression_settings',
    'globals.test_settings.visual_regression_settings',
    '@nightwatch/vrt'
  ];

  const settings = visualRegressionSettingsPaths.map((settingPath) =>
    get(clientSettings, settingPath, null)
  ).find(vrtSettings => vrtSettings && !isEmpty(vrtSettings));

  

  return Object.assign(
    {
      latest_screenshots_path: 'vrt/latest',
      latest_suffix: '',
      baseline_screenshots_path: 'vrt/baseline',
      baseline_suffix: '',
      diff_screenshots_path: 'vrt/diff',
      diff_suffix: '',
      threshold: 0.0,
      prompt: false,
      updateScreenshots: false
    },
    settings,
    overrideSettings
  );
};
