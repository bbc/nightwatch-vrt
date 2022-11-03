'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const Jimp = require('jimp');
const Buffer = require('buffer').Buffer;
const promisifyCommand = require('../../lib/promisify-command');

/**
 * Takes a screenshot of the visible region encompassed by the bounding rectangle
 * of an element.
*
 * @link
 * @param {string} id ID of the element to route the command to.
 * @param {function} callback Callback function which is called with the captured screenshot as an argument.
 * @returns {Object} The captured screenshot. This object is a Jimp (library) image instance.
 */

class CaptureElementScreenshot extends EventEmitter {
  async command(
    selector,
    callback = () => {} // eslint-disable-line no-empty-function
  ) {
    try {

      const screenshotData = await this.api.takeElementScreenshot(selector);
      const screenshot = await Jimp.read(Buffer.from(screenshotData, 'base64'));
      this.api.assert.ok(true, `The screenshot for selector <${selector}> was captured successfully.`);
      callback(screenshot);
      this.emit('complete', screenshot);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      this.api.assert.fail(`The screenshot for selector <${selector}> could not be captured.`);
      this.emit('complete', err, this);
    }
  };
}


module.exports = CaptureElementScreenshot;
