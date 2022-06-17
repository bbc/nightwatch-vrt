'use strict'

const compareWithBaseline = require('../lib/compare-with-baseline')

/**
 * Asserts if a screenshot that captures the visual representation of
 * an element in the application is identical to a previously captured
 * screenshot used as a baseline.
 *
 * When this assertion is executed and the baseline screenshot doesn't exist,
 * it will save the captured screenshot as the baseline and the assertion will succeed.
 *
 * The baseline screenshot will be saved in the baseline directory passed in
 * the settings here, or the directory specified in the nightwatch configuration
 * (under test_settings/visual_regression), or in a default generated path; in
 * that order. Further assertions will compare against the screenshot that was
 * saved in the first execution of the assertion.
 *
 * @param elementId Identifies the element that will be captured in the screenshot. Could be string or page object.
 * @param {String} fileName Optional file name for this screenshot; defaults to the elementId
 * @param {NightwatchVRTOptions} settings Optional settings to override the defaults and `visual_regression_settings`
 * @param {String} message Optional message for `nightwatch` to log upon completion
 */
exports.assertion = function screenshotIdenticalToBaseline(
    elementId,
    fileName = elementId,
    settings,
    message
) {
    if (elementId === 'body') {
        elementId = 'body';
    } else if (elementId.selector) {
        elementId = elementId.selector
    } else {
        elementId = elementId;
    }
    this.message = message || `No differences found between baseline and screenshot of element <${elementId}>.`
    this.expected = true

    this.pass = function pass(value) {
        return value === this.expected
    }

    this.value = function value(result) {
        return result
    }

    this.command = function command(callback) {
        let screenshot,
            comparisonResult

        this
            .api
            .waitForElementVisible(elementId, 5000)
            .captureElementScreenshot(elementId, (elementScreenshot) => {
                screenshot = elementScreenshot
            })
            .perform((done) => {
                compareWithBaseline(this.api, screenshot, fileName, settings).then((result) => {
                    comparisonResult = result ? result : result.value
                    if (elementId === 'body') {
                        elementId = 'body';
                    } else if (elementId.selector) {
                        elementId = elementId.selector
                    } else {
                        elementId = elementId;
                    }
                    if(result.value === false && result.diff !== result.threshold) {
                        this.message = `The difference between the screenshots for <${elementId}> was ${result.diff} when ${result.threshold} was expected`
                    } else if(result.value === false && result.diff === result.threshold) {
                        this.message = `The difference between the screenshot and baseline for <${elementId}> is less than 0.01. (Threshold: ${result.threshold} and Diff: ${result.fulldiff}) >`
                    }
                    done()
                }, (reject) => {
                    comparisonResult = reject
                    done()
                });
            })
            .perform((done) => {
                callback(comparisonResult)
                done()
            })

        return this
    }
}
