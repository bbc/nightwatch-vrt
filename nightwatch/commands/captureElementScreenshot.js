'use strict'

const EventEmitter = require('events').EventEmitter,
    util = require('util'),
    Jimp = require('jimp'),
    Buffer = require('buffer').Buffer,
    promisifyCommand = require('../../lib/promisify-command')

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
        promisifyCommand(api, 'takeElementScreenshot', [selector])
    ]).then(async ([screenshotEncoded]) => {

        Jimp.read(new Buffer(screenshotEncoded, 'base64')).then((screenshot) => {
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
