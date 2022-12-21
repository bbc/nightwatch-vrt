# @nightwatch/vrt

[![Build Status][build-badge]][build]
[![version][version-badge]][package]
[![Discord][discord-badge]][discord]

Official Nightwatch Plugin which adds visual regression testing support.



```
npm install @nightwatch/vrt
```

## Description

Nightwatch VRT extends [nightwatch.js](http://nightwatchjs.org/) with an assertion that captures a screenshot of a DOM element identified by a selector and compares the screenshot against a baseline screenshot. If the baseline screenshot does not exist, it will be created the first time you run the test and the assertion will pass.

## Usage
Update your [Nightwatch configuration](https://nightwatchjs.org/guide/configuration/overview.html) and add the plugin to the list:

```js
module.exports = {
    plugins: ['@nightwatch/vrt']
    
    // other nightwath settings...
}
```



#### Nightwatch VRT custom settings

The `@nightwatch/vrt` plugin comes by default with sensible configuration, but in some scenarios you may need to change some of the config options.

You can change the settings using Nightwatch globals, add the `@nightwatch/vrt` entry to Nightwatch config

```js
//nightwatch.conf.js

module.exports: {
   '@nightwatch/vrt': {
    'generate_screenshot_path': this.generateScreenshotFilePath,
    'latest_screenshots_path': 'vrt/latest',
    'latest_suffix': '',
    'baseline_screenshots_path': 'vrt/baseline',
    'baseline_suffix': '',
    'diff_screenshots_path': 'vrt/diff',
    'diff_suffix': '',
    'threshold': 0.01,
    'prompt': true,
    'always_save_diff_screenshot': true
  },
}

```

| Property                    | Description                                                                                                      | Defaults       |
|-----------------------------|------------------------------------------------------------------------------------------------------------------| -------------- |
| generate_screenshot_path    | Passed function that will generate a screenshot path                                                             | none           |
| latest_screenshots_path     | Path to the most recently captured screenshots                                                                   | "vrt/latest"   |
| latest_suffix               | A string appended to the end of the latest captured screenshot*                                                  | ""             |
| baseline_screenshots_path   | Path to the baseline expected screenshots                                                                        | "vrt/baseline" |
| baseline_suffix             | A string appended to the end of the baseline screenshot*                                                         | ""             |
| diff_screenshots_path       | Path to the diff image of the two screenshots                                                                    | "vrt/diff"     |
| diff_suffix                 | A string appended to the end of the diff image*                                                                  | ""             |
| threshold                   | Matching threshold, ranges from `0` to `1`. Smaller values make the comparison more sensitive.                   | 0.0            |
| prompt                      | If true, the user will be prompted to override baseline screenshot when the recently captured screenshot differs | false          |
| updateScreenshots | If true, recently captured screenshots will always override the baseline                                         | false          |
\* *Only necessary if screenshots are set to reside in the same directory*

#### Nightwatch VRT screenshot path generator

The screenshot path generator option accepts a function that generates a dynamic path based on the test properties, and returns that string.

| Parameter        | Description                                                                                    |
|------------------|------------------------------------------------------------------------------------------------|
| nightwatchClient | The nightwatch client test instance                                                            |
| basePath         | The base path for the screenshot set in `visual_regression_settings` (e.g. *_screenshots_path) |
| fileName         | The file name; either the selector used or the custom name given for the test                  |
|  ***returns***   | A string which contains the full path - minus the file extension                               |

For example:

```JavaScript
function generateScreenshotFilePath(nightwatchClient, basePath, fileName) {
    const moduleName = nightwatchClient.currentTest.module,
        testName = nightwatchClient.currentTest.name

    return path.join(process.cwd(), basePath, moduleName, testName, fileName)
}
```

## API Commands

In order to use `nightwatch-vrt`, you only need to invoke the `screenshotIdenticalToBaseline` assertion and pass a css selector for the DOM element to compare. You may also pass a custom filename, `visual_regression_settings` overrides, and a custom log message.

### - assert.screenshotIdenticalToBaseline

| Parameter        | Description                                                                                    |
|------------------|------------------------------------------------------------------------------------------------|
| selector         | Identifies the element that will be captured in the screenshot.                                |
| fileName         | Optional file name for this screenshot; defaults to the selector                               |
| settings         | Optional settings to override the defaults and `visual_regression_settings`                    |
| message          | Optional message for `nightwatch` to log upon completion                                       |


```JavaScript
describe('VRT demo test', function() {
    it('Test Google UI loads correctly', function(browser) {
        browser
            .url('https://www.google.co.uk')
            .assert.screenshotIdenticalToBaseline('body',  /* Optional */ 'custom-name', {threshold: 0.5}, 'VRT custom-name complete.')
            .end()
    })
})
```

The first time a test is run, a baseline screenshot will be created and stored on disk. You should always register the baseline screenshot in the code repository. Further executions of this test will compare against this baseline.

### Updating baseline screenshots

The first time a test is run, a baseline screenshot will be created and stored on disk. You should always register the baseline screenshot in the code repository. Further executions of this test will compare against this baseline. 

Baseline screenshots can be updated by running test with a CLI flag `--update-screenshots` or using global setting 'updateScreenshots' 

