/**********************************************************************************
 * (c) 2016, Master Technology
 * Licensed under the MIT license or contact me for a Support or Commercial License
 *
 * I do contract work in most languages, so let me solve your problems!
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.2                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

/* jshint camelcase: false */
/* global UIDevice, UIDeviceOrientation, getElementsByTagName, android */

var application = require('application');
var view = require('ui/core/view');
var enums = require('ui/enums');
var frame = require('ui/frame');
var Page = require('ui/page').Page;
require('nativescript-globalevents');

/**
 * Helper function hooked to the Application to get the current orientation
 */
if (global.android) {
    application.getOrientation = function () {
        switch (application.android.context.getResources().getConfiguration().orientation) {
            case android.content.res.Configuration.ORIENTATION_LANDSCAPE:
                return enums.DeviceOrientation.landscape;
            case android.content.res.Configuration.ORIENTATION_PORTRAIT:
                return enums.DeviceOrientation.portrait;
            default:
                return false;
        }
    };
} else if (global.ios || global.NSObject) {
    application.getOrientation = function () {
        switch (UIDevice.currentDevice().orientation) {
            case UIDeviceOrientation.UIDeviceOrientationLandscapeRight:
            case UIDeviceOrientation.UIDeviceOrientationLandscapeLeft:
                return enums.DeviceOrientation.landscape;
            case UIDeviceOrientation.UIDeviceOrientationPortraitUpsideDown:
            case UIDeviceOrientation.UIDeviceOrientationPortrait:
                return enums.DeviceOrientation.portrait;
            default:
                return false;
        }
    };
}

/**
 * Helper function to look for children that have refresh (i.e. like ListView's) and call their refresh since the
 * CSS changes will probably impact them
 * @param child
 * @returns {boolean}
 */
function resetChildrenRefreshes(child)
{
    if (typeof child.refresh === 'function') {
        child.refresh();
    }
    return true;
}

/**
 * Function that does the majority of the work
 * @param args
 */
var setOrientation = function(args) {
    var currentPage = frame.topmost().currentPage;

    if (currentPage) {
        var isLandscape = application.getOrientation() === enums.DeviceOrientation.landscape;
        var data = currentPage.cssClass || '';
        // If the user is using nativescript-dom, then use the NS-dom methods as faster and better
        if (currentPage.classList) {
            currentPage.classList.toggle('landscape', isLandscape);
        } else {
            // Quick and dirty landscape adder/remover
            if (isLandscape) {
                if (data.indexOf('landscape') === -1) {
                    if (data.length) {
                        currentPage.cssClass = data + ' landscape';
                    } else {
                        currentPage.cssClass = 'landscape';
                    }
                }
            } else {
                currentPage.cssClass = data.replace(/landscape/g, '').trim();
            }
        }

        currentPage._refreshCss();
        currentPage.style._resetCssValues();
        currentPage._applyStyleFromScope();
        if (args != null) {
            view.eachDescendant(currentPage, resetChildrenRefreshes);
        }
        if (currentPage.exports && typeof currentPage.exports.orientation === "function") {
            currentPage.exports.orientation({landscape: isLandscape, page: currentPage});
        }
    }
};

// Setup Events
Page.on(Page.navigatedToEvent, setOrientation);
application.on(application.orientationChangedEvent, setOrientation);

