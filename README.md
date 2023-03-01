# @nightwatch/vrt

[![Build Status][build-badge]][build]
[![Discord][discord-badge]][discord]

Official Nightwatch plugin that adds visual regression testing support.

## Installation

### Step 1 – install from NPM

```
npm i @nightwatch/vrt --save-dev
```

### Step 2 – add the plugin to the list

Update your [Nightwatch configuration](https://nightwatchjs.org/guide/configuration/overview.html) and add the plugin to the list:

```js
module.exports = {
  plugins: ['@nightwatch/vrt']
    
  // other nightwath settings...
}
```

## Usage

Nightwatch VRT extends [Nightwatch.js](https://nightwatchjs.org/) with an assertion that captures a screenshot of a DOM element identified by a selector and compares it against a baseline. If the baseline screenshot does not exist, it will be created the first time you run the test and the assertion will pass.


### VRT custom settings

The `@nightwatch/vrt` plugin comes by default with sensible configuration, but in some scenarios you may need to change some of the config options.

You can change the settings by adding `@nightwatch/vrt` entry to Nightwatch config

```js
//nightwatch.conf.js

module.exports = {
    
    //... other config

   '@nightwatch/vrt': {
    latest_screenshots_path: 'vrt/latest',
    latest_suffix: '',
    baseline_screenshots_path: 'vrt/baseline',
    baseline_suffix: '',
    diff_screenshots_path: 'vrt/diff',
    diff_suffix: '',
    threshold: 0.01,
    prompt: false,
    updateScreenshots: false
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

```js
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


```js
describe('VRT demo test', function() {
    it('Test Google UI loads correctly', function(browser) {
        browser
            .url('https://www.google.co.uk')
            .assert.screenshotIdenticalToBaseline('body',  /* Optional */ 'custom-name', {threshold: 0.0}, 'VRT custom-name complete.')
            .end()
    })
})
```

The first time a test is run, a baseline screenshot will be created and stored on disk. You should always register the baseline screenshot in the code repository. Further executions of this test will compare against this baseline.

### Updating baseline screenshots

The first time a test is run, a baseline screenshot will be created and stored on disk. You should always register the baseline screenshot in the code repository. Further executions of this test will compare against this baseline. 

Baseline screenshots can be updated by running test with a CLI flag `--update-screenshots` or using global setting 'updateScreenshots' 

## Licence
MIT

[build-badge]: https://github.com/nightwatchjs/nightwatch-vrt/actions/workflows/node.js.yml/badge.svg?branch=master
[build]: https://github.com/nightwatchjs/nightwatch-vrt/actions/workflows/node.js.yml
[version-badge]: https://img.shields.io/npm/v/@nightwatch/vrt.svg?style=flat-square
[package]: https://www.npmjs.com/package/@nightwatch/vrt
[license-badge]: https://img.shields.io/npm/l/@nightwatch/vrt.svg?style=flat-square
[license]: https://github.com/nightwatchjs/nightwatch-vrt/blob/main/LICENSE
[discord-badge]: https://img.shields.io/discord/618399631038218240.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square
[discord]: https://discord.gg/SN8Da2X
