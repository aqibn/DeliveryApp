var common = require("./animation-common");
var trace = require("trace");
var enums = require("ui/enums");
global.moduleMerge(common, exports);
var _transform = "_transform";
var _skip = "_skip";
var FLT_MAX = 340282346638528859811704183484516925440.000000;
var AnimationInfo = (function () {
    function AnimationInfo() {
    }
    return AnimationInfo;
}());
var AnimationDelegateImpl = (function (_super) {
    __extends(AnimationDelegateImpl, _super);
    function AnimationDelegateImpl() {
        _super.apply(this, arguments);
    }
    AnimationDelegateImpl.initWithFinishedCallback = function (finishedCallback, propertyAnimation) {
        var delegate = AnimationDelegateImpl.new();
        delegate._finishedCallback = finishedCallback;
        delegate._propertyAnimation = propertyAnimation;
        return delegate;
    };
    AnimationDelegateImpl.prototype.animationDidStart = function (anim) {
        var value = this._propertyAnimation.value;
        this._propertyAnimation.target._suspendPresentationLayerUpdates();
        switch (this._propertyAnimation.property) {
            case common.Properties.backgroundColor:
                this._propertyAnimation.target.backgroundColor = value;
                break;
            case common.Properties.opacity:
                this._propertyAnimation.target.opacity = value;
                break;
            case common.Properties.rotate:
                this._propertyAnimation.target.rotate = value;
                break;
            case _transform:
                if (value[common.Properties.translate] !== undefined) {
                    this._propertyAnimation.target.translateX = value[common.Properties.translate].x;
                    this._propertyAnimation.target.translateY = value[common.Properties.translate].y;
                }
                if (value[common.Properties.scale] !== undefined) {
                    this._propertyAnimation.target.scaleX = value[common.Properties.scale].x;
                    this._propertyAnimation.target.scaleY = value[common.Properties.scale].y;
                }
                break;
        }
        this._propertyAnimation.target._resumePresentationLayerUpdates();
    };
    AnimationDelegateImpl.prototype.animationDidStopFinished = function (anim, finished) {
        if (this._finishedCallback) {
            this._finishedCallback(!finished);
        }
        if (!finished) {
            if (this._propertyAnimation._propertyResetCallback) {
                this._propertyAnimation._propertyResetCallback(this._propertyAnimation._originalValue);
            }
        }
        if (finished && this.nextAnimation) {
            this.nextAnimation();
        }
    };
    return AnimationDelegateImpl;
}(NSObject));
var Animation = (function (_super) {
    __extends(Animation, _super);
    function Animation(animationDefinitions, playSequentially) {
        _super.call(this, animationDefinitions, playSequentially);
        trace.write("Non-merged Property Animations: " + this._propertyAnimations.length, trace.categories.Animation);
        this._mergedPropertyAnimations = Animation._mergeAffineTransformAnimations(this._propertyAnimations);
        trace.write("Merged Property Animations: " + this._mergedPropertyAnimations.length, trace.categories.Animation);
        var that = this;
        var animationFinishedCallback = function (cancelled) {
            if (that._playSequentially) {
                if (cancelled) {
                    that._rejectAnimationFinishedPromise();
                }
                else {
                    that._resolveAnimationFinishedPromise();
                }
            }
            else {
                if (cancelled) {
                    that._cancelledAnimations++;
                }
                else {
                    that._finishedAnimations++;
                }
                if (that._cancelledAnimations > 0 && (that._cancelledAnimations + that._finishedAnimations) === that._mergedPropertyAnimations.length) {
                    trace.write(that._cancelledAnimations + " animations cancelled.", trace.categories.Animation);
                    that._rejectAnimationFinishedPromise();
                }
                else if (that._finishedAnimations === that._mergedPropertyAnimations.length) {
                    trace.write(that._finishedAnimations + " animations finished.", trace.categories.Animation);
                    that._resolveAnimationFinishedPromise();
                }
            }
        };
        this._iOSAnimationFunction = Animation._createiOSAnimationFunction(this._mergedPropertyAnimations, 0, this._playSequentially, animationFinishedCallback);
    }
    Animation.prototype.play = function () {
        var animationFinishedPromise = _super.prototype.play.call(this);
        this._finishedAnimations = 0;
        this._cancelledAnimations = 0;
        this._iOSAnimationFunction();
        return animationFinishedPromise;
    };
    Animation.prototype.cancel = function () {
        _super.prototype.cancel.call(this);
        var i = 0;
        var length = this._mergedPropertyAnimations.length;
        for (; i < length; i++) {
            this._mergedPropertyAnimations[i].target._nativeView.layer.removeAllAnimations();
        }
    };
    Animation._createiOSAnimationFunction = function (propertyAnimations, index, playSequentially, finishedCallback) {
        return function (cancelled) {
            if (cancelled && finishedCallback) {
                trace.write("Animation " + (index - 1).toString() + " was cancelled. Will skip the rest of animations and call finishedCallback(true).", trace.categories.Animation);
                finishedCallback(cancelled);
                return;
            }
            var animation = propertyAnimations[index];
            var args = Animation._getNativeAnimationArguments(animation);
            if (animation.curve === enums.AnimationCurve.spring) {
                Animation._createNativeSpringAnimation(propertyAnimations, index, playSequentially, args, animation, finishedCallback);
            }
            else {
                Animation._createNativeAnimation(propertyAnimations, index, playSequentially, args, animation, finishedCallback);
            }
        };
    };
    Animation._getNativeAnimationArguments = function (animation) {
        var nativeView = animation.target._nativeView;
        var presentationLayer = nativeView.layer.presentationLayer();
        var propertyNameToAnimate = animation.property;
        var value = animation.value;
        var originalValue;
        var tempRotate = animation.target.rotate * Math.PI / 180;
        var abs;
        switch (animation.property) {
            case common.Properties.backgroundColor:
                animation._originalValue = animation.target.backgroundColor;
                animation._propertyResetCallback = function (value) { animation.target.backgroundColor = value; };
                if (presentationLayer != null) {
                    originalValue = presentationLayer.backgroundColor;
                }
                else {
                    originalValue = nativeView.layer.backgroundColor;
                }
                if (nativeView instanceof UILabel) {
                    originalValue = nativeView.layer.backgroundColor;
                    nativeView.setValueForKey(UIColor.clearColor(), "backgroundColor");
                }
                value = value.CGColor;
                break;
            case common.Properties.opacity:
                animation._originalValue = animation.target.opacity;
                animation._propertyResetCallback = function (value) { animation.target.opacity = value; };
                if (presentationLayer != null) {
                    originalValue = presentationLayer.opacity;
                }
                else {
                    originalValue = nativeView.layer.opacity;
                }
                break;
            case common.Properties.rotate:
                animation._originalValue = animation.target.rotate;
                animation._propertyResetCallback = function (value) { animation.target.rotate = value; };
                propertyNameToAnimate = "transform.rotation";
                if (presentationLayer != null) {
                    originalValue = presentationLayer.valueForKeyPath("transform.rotation");
                }
                else {
                    originalValue = nativeView.layer.valueForKeyPath("transform.rotation");
                }
                value = value * Math.PI / 180;
                abs = fabs(originalValue - value);
                if (abs < 0.001 && originalValue !== tempRotate) {
                    originalValue = tempRotate;
                }
                break;
            case common.Properties.translate:
                animation._originalValue = { x: animation.target.translateX, y: animation.target.translateY };
                animation._propertyResetCallback = function (value) { animation.target.translateX = value.x; animation.target.translateY = value.y; };
                propertyNameToAnimate = "transform";
                if (presentationLayer != null) {
                    originalValue = NSValue.valueWithCATransform3D(presentationLayer.transform);
                }
                else {
                    originalValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                }
                value = NSValue.valueWithCATransform3D(CATransform3DTranslate(nativeView.layer.transform, value.x, value.y, 0));
                break;
            case common.Properties.scale:
                animation._originalValue = { x: animation.target.scaleX, y: animation.target.scaleY };
                animation._propertyResetCallback = function (value) { animation.target.scaleX = value.x; animation.target.scaleY = value.y; };
                propertyNameToAnimate = "transform";
                if (presentationLayer != null) {
                    originalValue = NSValue.valueWithCATransform3D(presentationLayer.transform);
                }
                else {
                    originalValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                }
                value = NSValue.valueWithCATransform3D(CATransform3DScale(nativeView.layer.transform, value.x, value.y, 1));
                break;
            case _transform:
                if (presentationLayer != null) {
                    originalValue = NSValue.valueWithCATransform3D(presentationLayer.transform);
                }
                else {
                    originalValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
                }
                animation._originalValue = { xs: animation.target.scaleX, ys: animation.target.scaleY,
                    xt: animation.target.translateX, yt: animation.target.translateY };
                animation._propertyResetCallback = function (value) {
                    animation.target.translateX = value.xt;
                    animation.target.translateY = value.yt;
                    animation.target.scaleX = value.xs;
                    animation.target.scaleY = value.ys;
                };
                propertyNameToAnimate = "transform";
                value = NSValue.valueWithCATransform3D(Animation._createNativeAffineTransform(animation));
                break;
            default:
                throw new Error("Cannot animate " + animation.property);
        }
        var duration = 0.3;
        if (animation.duration !== undefined) {
            duration = animation.duration / 1000.0;
        }
        var delay = undefined;
        if (animation.delay) {
            delay = animation.delay / 1000.0;
        }
        var repeatCount = undefined;
        if (animation.iterations !== undefined) {
            if (animation.iterations === Number.POSITIVE_INFINITY) {
                repeatCount = FLT_MAX;
            }
            else {
                repeatCount = animation.iterations - 1;
            }
        }
        return {
            propertyNameToAnimate: propertyNameToAnimate,
            fromValue: originalValue,
            toValue: value,
            duration: duration,
            repeatCount: repeatCount,
            delay: delay
        };
    };
    Animation._createNativeAnimation = function (propertyAnimations, index, playSequentially, args, animation, finishedCallback) {
        var nativeView = animation.target._nativeView;
        var nativeAnimation = CABasicAnimation.animationWithKeyPath(args.propertyNameToAnimate);
        nativeAnimation.fromValue = args.fromValue;
        nativeAnimation.toValue = args.toValue;
        nativeAnimation.duration = args.duration;
        if (args.repeatCount !== undefined) {
            nativeAnimation.repeatCount = args.repeatCount;
        }
        if (args.delay !== undefined) {
            nativeAnimation.beginTime = CACurrentMediaTime() + args.delay;
        }
        if (animation.curve !== undefined) {
            nativeAnimation.timingFunction = animation.curve;
        }
        var animationDelegate = AnimationDelegateImpl.initWithFinishedCallback(finishedCallback, animation);
        nativeAnimation.setValueForKey(animationDelegate, "delegate");
        nativeView.layer.addAnimationForKey(nativeAnimation, args.propertyNameToAnimate);
        var callback = undefined;
        if (index + 1 < propertyAnimations.length) {
            callback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, finishedCallback);
            if (!playSequentially) {
                callback();
            }
            else {
                animationDelegate.nextAnimation = callback;
            }
        }
    };
    Animation._createNativeSpringAnimation = function (propertyAnimations, index, playSequentially, args, animation, finishedCallback) {
        var nativeView = animation.target._nativeView;
        var callback = undefined;
        var nextAnimation;
        if (index + 1 < propertyAnimations.length) {
            callback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, finishedCallback);
            if (!playSequentially) {
                callback();
            }
            else {
                nextAnimation = callback;
            }
        }
        var delay = 0;
        if (args.delay) {
            delay = args.delay;
        }
        UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(args.duration, delay, 0.2, 0, UIViewKeyframeAnimationOptions.UIViewKeyframeAnimationOptionCalculationModeLinear, function () {
            if (args.repeatCount !== undefined) {
                UIView.setAnimationRepeatCount(args.repeatCount);
            }
            switch (animation.property) {
                case common.Properties.backgroundColor:
                    animation.target.backgroundColor = args.toValue;
                    break;
                case common.Properties.opacity:
                    animation.target.opacity = args.toValue;
                    break;
                case common.Properties.rotate:
                    nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                    break;
                case _transform:
                    animation._originalValue = nativeView.layer.transform;
                    nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
                    animation._propertyResetCallback = function (value) {
                        nativeView.layer.transform = value;
                    };
                    break;
            }
        }, function (finished) {
            if (finished) {
                if (animation.property === _transform) {
                    if (animation.value[common.Properties.translate] !== undefined) {
                        animation.target.translateX = animation.value[common.Properties.translate].x;
                        animation.target.translateY = animation.value[common.Properties.translate].y;
                    }
                    if (animation.value[common.Properties.scale] !== undefined) {
                        animation.target.scaleX = animation.value[common.Properties.scale].x;
                        animation.target.scaleY = animation.value[common.Properties.scale].y;
                    }
                }
            }
            else {
                if (animation._propertyResetCallback) {
                    animation._propertyResetCallback(animation._originalValue);
                }
            }
            if (finishedCallback) {
                var cancelled = !finished;
                finishedCallback(cancelled);
            }
            if (finished && nextAnimation) {
                nextAnimation();
            }
        });
    };
    Animation._createNativeAffineTransform = function (animation) {
        var value = animation.value;
        var result = CATransform3DIdentity;
        if (value[common.Properties.translate] !== undefined) {
            var x = value[common.Properties.translate].x;
            var y = value[common.Properties.translate].y;
            result = CATransform3DTranslate(result, x, y, 0);
        }
        if (value[common.Properties.scale] !== undefined) {
            var x = value[common.Properties.scale].x;
            var y = value[common.Properties.scale].y;
            result = CATransform3DScale(result, x, y, 1);
        }
        return result;
    };
    Animation._isAffineTransform = function (property) {
        return property === _transform
            || property === common.Properties.translate
            || property === common.Properties.scale;
    };
    Animation._canBeMerged = function (animation1, animation2) {
        var result = Animation._isAffineTransform(animation1.property) &&
            Animation._isAffineTransform(animation2.property) &&
            animation1.target === animation2.target &&
            animation1.duration === animation2.duration &&
            animation1.delay === animation2.delay &&
            animation1.iterations === animation2.iterations &&
            animation1.curve === animation2.curve;
        return result;
    };
    Animation._mergeAffineTransformAnimations = function (propertyAnimations) {
        var result = new Array();
        var i = 0;
        var j;
        var length = propertyAnimations.length;
        for (; i < length; i++) {
            if (propertyAnimations[i][_skip]) {
                continue;
            }
            if (!Animation._isAffineTransform(propertyAnimations[i].property)) {
                result.push(propertyAnimations[i]);
            }
            else {
                var newTransformAnimation = {
                    target: propertyAnimations[i].target,
                    property: _transform,
                    value: {},
                    duration: propertyAnimations[i].duration,
                    delay: propertyAnimations[i].delay,
                    iterations: propertyAnimations[i].iterations,
                    curve: propertyAnimations[i].curve
                };
                trace.write("Curve: " + propertyAnimations[i].curve, trace.categories.Animation);
                newTransformAnimation.value[propertyAnimations[i].property] = propertyAnimations[i].value;
                trace.write("Created new transform animation: " + common.Animation._getAnimationInfo(newTransformAnimation), trace.categories.Animation);
                j = i + 1;
                if (j < length) {
                    for (; j < length; j++) {
                        if (Animation._canBeMerged(propertyAnimations[i], propertyAnimations[j])) {
                            trace.write("Merging animations: " + common.Animation._getAnimationInfo(newTransformAnimation) + " + " + common.Animation._getAnimationInfo(propertyAnimations[j]) + ";", trace.categories.Animation);
                            newTransformAnimation.value[propertyAnimations[j].property] = propertyAnimations[j].value;
                            propertyAnimations[j][_skip] = true;
                        }
                    }
                }
                result.push(newTransformAnimation);
            }
        }
        return result;
    };
    return Animation;
}(common.Animation));
exports.Animation = Animation;
function _resolveAnimationCurve(curve) {
    switch (curve) {
        case enums.AnimationCurve.easeIn:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseIn);
        case enums.AnimationCurve.easeOut:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseOut);
        case enums.AnimationCurve.easeInOut:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut);
        case enums.AnimationCurve.linear:
            return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
        case enums.AnimationCurve.spring:
            return curve;
        default:
            if (curve instanceof CAMediaTimingFunction) {
                return curve;
            }
            else if (curve instanceof common.CubicBezierAnimationCurve) {
                var animationCurve = curve;
                return CAMediaTimingFunction.functionWithControlPoints(animationCurve.x1, animationCurve.y1, animationCurve.x2, animationCurve.y2);
            }
            return undefined;
    }
}
exports._resolveAnimationCurve = _resolveAnimationCurve;
function _getTransformMismatchErrorMessage(view) {
    var result = CGAffineTransformIdentity;
    result = CGAffineTransformTranslate(result, view.translateX, view.translateY);
    result = CGAffineTransformRotate(result, view.rotate * Math.PI / 180);
    result = CGAffineTransformScale(result, view.scaleX, view.scaleY);
    var viewTransform = NSStringFromCGAffineTransform(result);
    var nativeTransform = NSStringFromCGAffineTransform(view._nativeView.transform);
    if (viewTransform !== nativeTransform) {
        return "View and Native transforms do not match. View: " + viewTransform + "; Native: " + nativeTransform;
    }
    return undefined;
}
exports._getTransformMismatchErrorMessage = _getTransformMismatchErrorMessage;
