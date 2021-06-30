'use strict'

const EventEmitter = require('events').EventEmitter,
    util = require('util'),
    Jimp = require('jimp'),
    Buffer = require('buffer').Buffer,
    promisifyCommand = require('../lib/promisify-command')

/**
 * Takes a screenshot of the visible region encompassed by the bounding rectangle
 * of an element.
*
 * @link
 * @param {string} id ID of the element to route the command to.
 * @param {function} callback Callback function which is called with the captured screenshot as an argument.
 * @returns {Object} The captured screenshot. This object is a Jimp (library) image instance.
 */
function CaptureElementScreenshot() {
    EventEmitter.call(this)
}

util.inherits(CaptureElementScreenshot, EventEmitter)

CaptureElementScreenshot.prototype.command = function command(
    selector,
    callback = () => {} // eslint-disable-line no-empty-function
) {
    const api = this.client.api

    Promise.all([
        promisifyCommand(api, 'getLocationInView', [selector]),
        promisifyCommand(api, 'getElementSize', [selector]),
        promisifyCommand(api, 'screenshot', [false])
    ]).then(async ([location, size, screenshotEncoded]) => {

        /*
         * Here we get the pixel density of the window and 
         * ensure that we adjust the width and height accordingly
         */
        await new Promise((resolve) => {
            api.execute(function () {
                return window.devicePixelRatio
            }, [], function (devicePixelRatio) {
                location.x *= devicePixelRatio.value
                location.y *= devicePixelRatio.value
                size.width *= devicePixelRatio.value
                size.height *= devicePixelRatio.value
                resolve()
            })
        })

        if (size.width === 0 || size.height === 0) {
            this.api.assert.fail(`The element identified by the selector <${selector}> is not visible or its dimensions equals 0. width: ${size.width}, height: ${size.height}`)
        }

        Jimp.read(new Buffer(screenshotEncoded, 'base64')).then((screenshot) => {
            /**
             * https://www.w3.org/TR/webdriver/#take-screenshot
             * "The Take Screenshot command takes a screenshot of the top-level browsing context’s viewport."
             *
             * If the target element extends outside of the viewport, the expected
             * dimentions will exceed the actual dimensions, resulting in a
             * "RangeError: out of range index" exception (from Buffer)
             */
            if ((location.y + size.height) > screenshot.bitmap.height) {
                size.height = (screenshot.bitmap.height - location.y)
            }

            if ((location.x + size.width) > screenshot.bitmap.width) {
                size.width = (screenshot.bitmap.width - location.x)
            }

            screenshot.crop(location.x, location.y, size.width, size.height)
            this.api.assert.ok(true, `The screenshot for selector <${selector}> was captured successfully.`);

            callback(screenshot)
            this.emit('complete', screenshot)
        })
    }).catch((errorMessage) => {
        console.log(errorMessage);
        this.api.assert.fail(`The screenshot for selector <${selector}> could not be captured.`);
        this.emit('complete', errorMessage, this)
    })
}

module.exports = CaptureElementScreenshot
