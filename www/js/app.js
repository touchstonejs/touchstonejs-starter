(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	function classNames () {

		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if ('string' === argType || 'number' === argType) {
				classes += ' ' + arg;

			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);

			} else if ('object' === argType) {
				for (var key in arg) {
					if (arg.hasOwnProperty(key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}

		return classes.substr(1);
	}

	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// AMD. Register as an anonymous module.
		define(function () {
			return classNames;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}

}());

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react');

function hasChildrenWithVerticalFill(children) {
	var result = false;

	React.Children.forEach(children, function (c) {
		if (result) return; // early-exit
		if (!c) return;
		if (!c.type) return;

		result = !!c.type.shouldFillVerticalSpace;
	});

	return result;
}

var Container = React.createClass({
	displayName: 'Container',

	propTypes: {
		align: React.PropTypes.oneOf(['end', 'center', 'start']),
		direction: React.PropTypes.oneOf(['column', 'row']),
		justify: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.oneOf(['end', 'center', 'start'])]),
		grow: React.PropTypes.bool,
		fill: React.PropTypes.bool
	},
	componentDidMount: function componentDidMount() {
		if (this.props.scrollable && this.props.scrollable.mount) {
			this.props.scrollable.mount(this);
		}
	},
	componentWillUnmount: function componentWillUnmount() {
		if (this.props.scrollable && this.props.scrollable.unmount) {
			this.props.scrollable.unmount(this);
		}
	},
	render: function render() {
		var direction = this.props.direction;
		if (!direction) {
			if (hasChildrenWithVerticalFill(this.props.children)) {
				direction = 'column';
			}
		}

		var fill = this.props.fill;
		if (direction === 'column' || this.props.scrollable) {
			fill = true;
		}

		var align = this.props.align;
		if (direction === 'column' && align === 'top') align = 'start';
		if (direction === 'column' && align === 'bottom') align = 'end';
		if (direction === 'row' && align === 'left') align = 'start';
		if (direction === 'row' && align === 'right') align = 'end';

		var className = classnames(this.props.className, {
			'Container--fill': fill,
			'Container--direction-column': direction === 'column',
			'Container--direction-row': direction === 'row',
			'Container--align-center': align === 'center',
			'Container--align-start': align === 'start',
			'Container--align-end': align === 'end',
			'Container--justify-center': this.props.justify === 'center',
			'Container--justify-start': this.props.justify === 'start',
			'Container--justify-end': this.props.justify === 'end',
			'Container--justified': this.props.justify === true,
			'Container--scrollable': this.props.scrollable
		});

		var props = blacklist(this.props, 'className', 'direction', 'fill', 'justify', 'scrollable');

		return React.createElement(
			'div',
			_extends({ className: className }, props),
			this.props.children
		);
	}
});

function initScrollable() {
	var pos;
	var scrollable = {
		reset: function reset() {
			pos = { left: 0, top: 0 };
		},
		mount: function mount(element) {
			var node = React.findDOMNode(element);
			node.scrollLeft = pos.left;
			node.scrollTop = pos.top;
		},
		unmount: function unmount(element) {
			var node = React.findDOMNode(element);
			pos.left = node.scrollLeft;
			pos.top = node.scrollTop;
		}
	};
	scrollable.reset();
	return scrollable;
}

Container.initScrollable = initScrollable;

exports['default'] = Container;
module.exports = exports['default'];
},{"blacklist":3,"classnames":1,"react":undefined}],3:[function(require,module,exports){
module.exports = function blacklist (src) {
  var copy = {}, filter = arguments[1]

  if (typeof filter === 'string') {
    filter = {}
    for (var i = 1; i < arguments.length; i++) {
      filter[arguments[i]] = true
    }
  }

  for (var key in src) {
    // blacklist?
    if (filter[key]) continue

    copy[key] = src[key]
  }

  return copy
}

},{}],4:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

// Enable React Touch Events
React.initializeTouchEvents(true);

function getTouchProps(touch) {
	if (!touch) return {};
	return {
		pageX: touch.pageX,
		pageY: touch.pageY,
		clientX: touch.clientX,
		clientY: touch.clientY
	};
}

function isDataOrAriaProp(key) {
	return key.indexOf('data-') === 0 || key.indexOf('aria-') === 0;
}

function getPinchProps(touches) {
	return {
		touches: Array.prototype.map.call(touches, function copyTouch(touch) {
			return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
		}),
		center: { x: (touches[0].pageX + touches[1].pageX) / 2, y: (touches[0].pageY + touches[1].pageY) / 2 },
		angle: Math.atan() * (touches[1].pageY - touches[0].pageY) / (touches[1].pageX - touches[0].pageX) * 180 / Math.PI,
		distance: Math.sqrt(Math.pow(Math.abs(touches[1].pageX - touches[0].pageX), 2) + Math.pow(Math.abs(touches[1].pageY - touches[0].pageY), 2))
	};
}

/**
 * Tappable Mixin
 * ==============
 */

var Mixin = {
	propTypes: {
		moveThreshold: React.PropTypes.number, // pixels to move before cancelling tap
		activeDelay: React.PropTypes.number, // ms to wait before adding the `-active` class
		pressDelay: React.PropTypes.number, // ms to wait before detecting a press
		pressMoveThreshold: React.PropTypes.number, // pixels to move before cancelling press
		preventDefault: React.PropTypes.bool, // whether to preventDefault on all events
		stopPropagation: React.PropTypes.bool, // whether to stopPropagation on all events

		onTap: React.PropTypes.func, // fires when a tap is detected
		onPress: React.PropTypes.func, // fires when a press is detected
		onTouchStart: React.PropTypes.func, // pass-through touch event
		onTouchMove: React.PropTypes.func, // pass-through touch event
		onTouchEnd: React.PropTypes.func, // pass-through touch event
		onMouseDown: React.PropTypes.func, // pass-through mouse event
		onMouseUp: React.PropTypes.func, // pass-through mouse event
		onMouseMove: React.PropTypes.func, // pass-through mouse event
		onMouseOut: React.PropTypes.func, // pass-through mouse event

		onPinchStart: React.PropTypes.func, // fires when a pinch gesture is started
		onPinchMove: React.PropTypes.func, // fires on every touch-move when a pinch action is active
		onPinchEnd: React.PropTypes.func // fires when a pinch action ends
	},

	getDefaultProps: function getDefaultProps() {
		return {
			activeDelay: 0,
			moveThreshold: 100,
			pressDelay: 1000,
			pressMoveThreshold: 5
		};
	},

	getInitialState: function getInitialState() {
		return {
			isActive: false,
			touchActive: false,
			pinchActive: false
		};
	},

	componentWillUnmount: function componentWillUnmount() {
		this.cleanupScrollDetection();
		this.cancelPressDetection();
		this.clearActiveTimeout();
	},

	processEvent: function processEvent(event) {
		if (this.props.preventDefault) event.preventDefault();
		if (this.props.stopPropagation) event.stopPropagation();
	},

	onTouchStart: function onTouchStart(event) {
		if (this.props.onTouchStart && this.props.onTouchStart(event) === false) return;
		this.processEvent(event);
		window._blockMouseEvents = true;
		if (event.touches.length === 1) {
			this._initialTouch = this._lastTouch = getTouchProps(event.touches[0]);
			this.initScrollDetection();
			this.initPressDetection(event, this.endTouch);
			this._activeTimeout = setTimeout(this.makeActive, this.props.activeDelay);
		} else if ((this.props.onPinchStart || this.props.onPinchMove || this.props.onPinchEnd) && event.touches.length === 2) {
			this.onPinchStart(event);
		}
	},

	makeActive: function makeActive() {
		if (!this.isMounted()) return;
		this.clearActiveTimeout();
		this.setState({
			isActive: true
		});
	},

	clearActiveTimeout: function clearActiveTimeout() {
		clearTimeout(this._activeTimeout);
		this._activeTimeout = false;
	},

	onPinchStart: function onPinchStart(event) {
		// in case the two touches didn't start exactly at the same time
		if (this._initialTouch) {
			this.endTouch();
		}
		var touches = event.touches;
		this._initialPinch = getPinchProps(touches);
		this._initialPinch = _extends(this._initialPinch, {
			displacement: { x: 0, y: 0 },
			displacementVelocity: { x: 0, y: 0 },
			rotation: 0,
			rotationVelocity: 0,
			zoom: 1,
			zoomVelocity: 0,
			time: Date.now()
		});
		this._lastPinch = this._initialPinch;
		this.props.onPinchStart && this.props.onPinchStart(this._initialPinch, event);
	},

	onPinchMove: function onPinchMove(event) {
		if (this._initialTouch) {
			this.endTouch();
		}
		var touches = event.touches;
		if (touches.length !== 2) {
			return this.onPinchEnd(event) // bail out before disaster
			;
		}

		var currentPinch = touches[0].identifier === this._initialPinch.touches[0].identifier && touches[1].identifier === this._initialPinch.touches[1].identifier ? getPinchProps(touches) // the touches are in the correct order
		: touches[1].identifier === this._initialPinch.touches[0].identifier && touches[0].identifier === this._initialPinch.touches[1].identifier ? getPinchProps(touches.reverse()) // the touches have somehow changed order
		: getPinchProps(touches); // something is wrong, but we still have two touch-points, so we try not to fail

		currentPinch.displacement = {
			x: currentPinch.center.x - this._initialPinch.center.x,
			y: currentPinch.center.y - this._initialPinch.center.y
		};

		currentPinch.time = Date.now();
		var timeSinceLastPinch = currentPinch.time - this._lastPinch.time;

		currentPinch.displacementVelocity = {
			x: (currentPinch.displacement.x - this._lastPinch.displacement.x) / timeSinceLastPinch,
			y: (currentPinch.displacement.y - this._lastPinch.displacement.y) / timeSinceLastPinch
		};

		currentPinch.rotation = currentPinch.angle - this._initialPinch.angle;
		currentPinch.rotationVelocity = currentPinch.rotation - this._lastPinch.rotation / timeSinceLastPinch;

		currentPinch.zoom = currentPinch.distance / this._initialPinch.distance;
		currentPinch.zoomVelocity = (currentPinch.zoom - this._lastPinch.zoom) / timeSinceLastPinch;

		this.props.onPinchMove && this.props.onPinchMove(currentPinch, event);

		this._lastPinch = currentPinch;
	},

	onPinchEnd: function onPinchEnd(event) {
		// TODO use helper to order touches by identifier and use actual values on touchEnd.
		var currentPinch = _extends({}, this._lastPinch);
		currentPinch.time = Date.now();

		if (currentPinch.time - this._lastPinch.time > 16) {
			currentPinch.displacementVelocity = 0;
			currentPinch.rotationVelocity = 0;
			currentPinch.zoomVelocity = 0;
		}

		this.props.onPinchEnd && this.props.onPinchEnd(currentPinch, event);

		this._initialPinch = this._lastPinch = null;

		// If one finger is still on screen, it should start a new touch event for swiping etc
		// But it should never fire an onTap or onPress event.
		// Since there is no support swipes yet, this should be disregarded for now
		// if (event.touches.length === 1) {
		// 	this.onTouchStart(event);
		// }
	},

	initScrollDetection: function initScrollDetection() {
		this._scrollPos = { top: 0, left: 0 };
		this._scrollParents = [];
		this._scrollParentPos = [];
		var node = this.getDOMNode();
		while (node) {
			if (node.scrollHeight > node.offsetHeight || node.scrollWidth > node.offsetWidth) {
				this._scrollParents.push(node);
				this._scrollParentPos.push(node.scrollTop + node.scrollLeft);
				this._scrollPos.top += node.scrollTop;
				this._scrollPos.left += node.scrollLeft;
			}
			node = node.parentNode;
		}
	},

	calculateMovement: function calculateMovement(touch) {
		return {
			x: Math.abs(touch.clientX - this._initialTouch.clientX),
			y: Math.abs(touch.clientY - this._initialTouch.clientY)
		};
	},

	detectScroll: function detectScroll() {
		var currentScrollPos = { top: 0, left: 0 };
		for (var i = 0; i < this._scrollParents.length; i++) {
			currentScrollPos.top += this._scrollParents[i].scrollTop;
			currentScrollPos.left += this._scrollParents[i].scrollLeft;
		}
		return !(currentScrollPos.top === this._scrollPos.top && currentScrollPos.left === this._scrollPos.left);
	},

	cleanupScrollDetection: function cleanupScrollDetection() {
		this._scrollParents = undefined;
		this._scrollPos = undefined;
	},

	initPressDetection: function initPressDetection(event, callback) {
		if (!this.props.onPress) return;
		this._pressTimeout = setTimeout((function () {
			this.props.onPress(event);
			callback();
		}).bind(this), this.props.pressDelay);
	},

	cancelPressDetection: function cancelPressDetection() {
		clearTimeout(this._pressTimeout);
	},

	onTouchMove: function onTouchMove(event) {
		if (this._initialTouch) {
			this.processEvent(event);

			if (this.detectScroll()) return this.endTouch(event);

			this.props.onTouchMove && this.props.onTouchMove(event);
			this._lastTouch = getTouchProps(event.touches[0]);
			var movement = this.calculateMovement(this._lastTouch);
			if (movement.x > this.props.pressMoveThreshold || movement.y > this.props.pressMoveThreshold) {
				this.cancelPressDetection();
			}
			if (movement.x > this.props.moveThreshold || movement.y > this.props.moveThreshold) {
				if (this.state.isActive) {
					this.setState({
						isActive: false
					});
				} else if (this._activeTimeout) {
					this.clearActiveTimeout();
				}
			} else {
				if (!this.state.isActive && !this._activeTimeout) {
					this.setState({
						isActive: true
					});
				}
			}
		} else if (this._initialPinch && event.touches.length === 2) {
			this.onPinchMove(event);
			event.preventDefault();
		}
	},

	onTouchEnd: function onTouchEnd(event) {
		var _this = this;

		if (this._initialTouch) {
			this.processEvent(event);
			var afterEndTouch;
			var movement = this.calculateMovement(this._lastTouch);
			if (movement.x <= this.props.moveThreshold && movement.y <= this.props.moveThreshold && this.props.onTap) {
				event.preventDefault();
				afterEndTouch = function () {
					var finalParentScrollPos = _this._scrollParents.map(function (node) {
						return node.scrollTop + node.scrollLeft;
					});
					var stoppedMomentumScroll = _this._scrollParentPos.some(function (end, i) {
						return end !== finalParentScrollPos[i];
					});
					if (!stoppedMomentumScroll) {
						_this.props.onTap(event);
					}
				};
			}
			this.endTouch(event, afterEndTouch);
		} else if (this._initialPinch && event.touches.length + event.changedTouches.length === 2) {
			this.onPinchEnd(event);
			event.preventDefault();
		}
	},

	endTouch: function endTouch(event, callback) {
		this.cancelPressDetection();
		this.clearActiveTimeout();
		if (event && this.props.onTouchEnd) {
			this.props.onTouchEnd(event);
		}
		this._initialTouch = null;
		this._lastTouch = null;
		if (this.state.isActive) {
			this.setState({
				isActive: false
			}, callback);
		} else if (callback) {
			callback();
		}
	},

	onMouseDown: function onMouseDown(event) {
		if (window._blockMouseEvents) {
			window._blockMouseEvents = false;
			return;
		}
		if (this.props.onMouseDown && this.props.onMouseDown(event) === false) return;
		this.processEvent(event);
		this.initPressDetection(event, this.endMouseEvent);
		this._mouseDown = true;
		this.setState({
			isActive: true
		});
	},

	onMouseMove: function onMouseMove(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseMove && this.props.onMouseMove(event);
	},

	onMouseUp: function onMouseUp(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseUp && this.props.onMouseUp(event);
		this.props.onTap && this.props.onTap(event);
		this.endMouseEvent();
	},

	onMouseOut: function onMouseOut(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseOut && this.props.onMouseOut(event);
		this.endMouseEvent();
	},

	endMouseEvent: function endMouseEvent() {
		this.cancelPressDetection();
		this._mouseDown = false;
		this.setState({
			isActive: false
		});
	},

	touchStyles: function touchStyles() {
		return {
			WebkitTapHighlightColor: 'rgba(0,0,0,0)',
			WebkitTouchCallout: 'none',
			WebkitUserSelect: 'none',
			KhtmlUserSelect: 'none',
			MozUserSelect: 'none',
			msUserSelect: 'none',
			userSelect: 'none',
			cursor: 'pointer'
		};
	},

	handlers: function handlers() {
		return {
			onTouchStart: this.onTouchStart,
			onTouchMove: this.onTouchMove,
			onTouchEnd: this.onTouchEnd,
			onMouseDown: this.onMouseDown,
			onMouseUp: this.onMouseUp,
			onMouseMove: this.onMouseMove,
			onMouseOut: this.onMouseOut
		};
	}
};

/**
 * Tappable Component
 * ==================
 */

var Component = React.createClass({

	displayName: 'Tappable',

	mixins: [Mixin],

	propTypes: {
		component: React.PropTypes.any, // component to create
		className: React.PropTypes.string, // optional className
		classBase: React.PropTypes.string, // base for generated classNames
		style: React.PropTypes.object, // additional style properties for the component
		disabled: React.PropTypes.bool // only applies to buttons
	},

	getDefaultProps: function getDefaultProps() {
		return {
			component: 'span',
			classBase: 'Tappable'
		};
	},

	render: function render() {
		var props = this.props;
		var className = props.classBase + (this.state.isActive ? '-active' : '-inactive');

		if (props.className) {
			className += ' ' + props.className;
		}

		var style = {};
		_extends(style, this.touchStyles(), props.style);

		var newComponentProps = _extends({}, props, {
			style: style,
			className: className,
			disabled: props.disabled,
			handlers: this.handlers
		}, this.handlers());

		delete newComponentProps.onTap;
		delete newComponentProps.onPress;
		delete newComponentProps.onPinchStart;
		delete newComponentProps.onPinchMove;
		delete newComponentProps.onPinchEnd;
		delete newComponentProps.moveThreshold;
		delete newComponentProps.pressDelay;
		delete newComponentProps.pressMoveThreshold;
		delete newComponentProps.preventDefault;
		delete newComponentProps.stopPropagation;
		delete newComponentProps.component;

		return React.createElement(props.component, newComponentProps, props.children);
	}
});

Component.Mixin = Mixin;
module.exports = Component;
},{"react":undefined}],5:[function(require,module,exports){
module.exports = function Timers () {
  var intervals = []
  var timeouts = []

  return {
    clearIntervals: function () {
      intervals.forEach(clearInterval)
    },

    clearTimeouts: function () {
      timeouts.forEach(clearTimeout)
    },

    componentWillMount: function () {
      intervals = []
      timeouts = []
    },

    componentWillUnmount: function () {
      this.clearIntervals()
      this.clearTimeouts()
    },

    countDown: function (callback, timeout, interval) {
      var self = this
      var sleep = Math.min(timeout, interval)

      this.setTimeout(function () {
        var remaining = timeout - sleep

        callback(remaining)
        if (remaining <= 0) return

        self.countDown(callback, remaining, interval)
      }, sleep)
    },

    setInterval: function (callback, interval) {
      var self = this

      intervals.push(setInterval(function () {
        if (!self.isMounted()) return

        callback.call(self)
      }, interval))
    },

    setTimeout: function (callback, timeout) {
      var self = this

      timeouts.push(setTimeout(function () {
        if (!self.isMounted()) return

        callback.call(self)
      }, timeout))
    }
  }
}

},{}],6:[function(require,module,exports){
'use strict';

module.exports = {
  'none': {
    'in': false,
    'out': false
  },
  'fade': {
    'in': true,
    'out': true
  },
  'fade-contract': {
    'in': true,
    'out': true
  },
  'fade-expand': {
    'in': true,
    'out': true
  },
  'show-from-left': {
    'in': true,
    'out': true
  },
  'show-from-right': {
    'in': true,
    'out': true
  },
  'show-from-top': {
    'in': true,
    'out': true
  },
  'show-from-bottom': {
    'in': true,
    'out': true
  },
  'reveal-from-left': {
    'in': true,
    'out': true
  },
  'reveal-from-right': {
    'in': true,
    'out': true
  },
  'reveal-from-top': {
    'in': false,
    'out': true
  },
  'reveal-from-bottom': {
    'in': false,
    'out': true
  }
};
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var React = require('react');
var Container = require('react-container');

var ErrorView = React.createClass({
	displayName: 'ErrorView',

	propTypes: {
		children: React.PropTypes.node
	},

	render: function render() {
		return React.createElement(
			Container,
			{ fill: true, className: 'View ErrorView' },
			this.props.children
		);
	}
});

exports['default'] = ErrorView;
module.exports = exports['default'];
},{"react":undefined,"react-container":34}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var React = require('react');
var Tappable = require('react-tappable');
var Transitions = require('../mixins/Transitions');

var Link = React.createClass({
	displayName: 'Link',

	mixins: [Transitions],
	propTypes: {
		children: React.PropTypes.any,
		options: React.PropTypes.object,
		transition: React.PropTypes.string,
		to: React.PropTypes.string,
		viewProps: React.PropTypes.any
	},

	doTransition: function doTransition() {
		var options = _extends({ viewProps: this.props.viewProps, transition: this.props.transition }, this.props.options);
		console.info('Link to "' + this.props.to + '" using transition "' + this.props.transition + '"' + ' with props ', this.props.viewProps);
		this.transitionTo(this.props.to, options);
	},

	render: function render() {
		var tappableProps = blacklist(this.props, 'children', 'options', 'transition', 'viewProps');

		return React.createElement(
			Tappable,
			_extends({ onTap: this.doTransition }, tappableProps),
			this.props.children
		);
	}
});

exports['default'] = Link;
module.exports = exports['default'];
},{"../mixins/Transitions":14,"blacklist":32,"react":undefined,"react-tappable":35}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var React = require('react');

var View = React.createClass({
	displayName: 'View',

	propTypes: {
		component: React.PropTypes.func.isRequired,
		name: React.PropTypes.string.isRequired
	},
	render: function render() {
		throw new Error('TouchstoneJS <View> should not be rendered directly.');
	}
});

exports['default'] = View;
module.exports = exports['default'];
},{"react":undefined}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classNames = require('classnames');
var ErrorView = require('./ErrorView');
var React = require('react/addons');
var Transition = React.addons.CSSTransitionGroup;

function createViewsFromChildren(children) {
	var views = {};
	React.Children.forEach(children, function (view) {
		views[view.props.name] = view;
	});
	return views;
}

var ViewContainer = React.createClass({
	displayName: 'ViewContainer',

	statics: {
		shouldFillVerticalSpace: true
	},
	propTypes: {
		children: React.PropTypes.node
	},
	render: function render() {
		var props = blacklist(this.props, 'children');
		return React.createElement(
			'div',
			props,
			this.props.children
		);
	}
});

var ViewManager = React.createClass({
	displayName: 'ViewManager',

	statics: {
		shouldFillVerticalSpace: true
	},
	contextTypes: {
		app: React.PropTypes.object.isRequired
	},
	propTypes: {
		name: React.PropTypes.string,
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		defaultView: React.PropTypes.string,
		onViewChange: React.PropTypes.func
	},
	getDefaultProps: function getDefaultProps() {
		return {
			name: '__default'
		};
	},
	getInitialState: function getInitialState() {
		return {
			views: createViewsFromChildren(this.props.children),
			currentView: this.props.defaultView,
			options: {}
		};
	},
	componentDidMount: function componentDidMount() {
		this.context.app.viewManagers[this.props.name] = this;
	},
	componentWillUnmount: function componentWillUnmount() {
		delete this.context.app.viewManagers[this.props.name];
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState({
			views: createViewsFromChildren(this.props.children)
		});
		if (nextProps.name !== this.props.name) {
			this.context.app.viewManagers[nextProps.name] = this;
			delete this.context.app.viewManagers[this.props.name];
		}
		if (nextProps.currentView && nextProps.currentView !== this.state.currentView) {
			this.transitionTo(nextProps.currentView, { viewProps: nextProps.viewProps });
		}
	},
	transitionTo: function transitionTo(viewKey, options) {
		var _this = this;

		if (typeof options === 'string') {
			options = { transition: options };
		}
		if (!options) options = {};
		this.activeTransitionOptions = options;
		this.context.app.viewManagerInTransition = this;
		this.props.onViewChange && this.props.onViewChange(viewKey);
		this.setState({
			currentView: viewKey,
			options: options
		}, function () {
			delete _this.activeTransitionOptions;
			delete _this.context.app.viewManagerInTransition;
		});
	},
	renderViewContainer: function renderViewContainer() {
		var viewKey = this.state.currentView;
		if (!viewKey) {
			return React.createElement(
				ErrorView,
				null,
				React.createElement(
					'span',
					{ className: 'ErrorView__heading' },
					'ViewManager: ',
					this.props.name
				),
				React.createElement(
					'span',
					{ className: 'ErrorView__text' },
					'Error: There is no current View.'
				)
			);
		}
		var view = this.state.views[viewKey];
		if (!view || !view.props.component) {
			return React.createElement(
				ErrorView,
				null,
				React.createElement(
					'span',
					{ className: 'ErrorView__heading' },
					'ViewManager: ',
					this.props.name
				),
				React.createElement(
					'span',
					{ className: 'ErrorView__text' },
					'Error: The Current View (',
					viewKey,
					') is invalid.'
				)
			);
		}
		var options = this.state.options || {};
		var viewClassName = classNames('View View--' + viewKey, view.props.className);
		var ViewComponent = view.props.component;
		var viewProps = blacklist(view.props, 'component', 'className');
		_extends(viewProps, options.viewProps);
		var viewElement = React.createElement(ViewComponent, viewProps);

		if (this.__lastRenderedView !== viewKey) {
			// console.log('initialising view ' + viewKey + ' with options', options);
			if (viewElement.type.navigationBar && viewElement.type.getNavigation) {
				var app = this.context.app;
				var transition = options.transition;
				if (app.viewManagerInTransition) {
					transition = app.viewManagerInTransition.activeTransitionOptions.transition;
				}
				setTimeout(function () {
					app.navigationBars[viewElement.type.navigationBar].updateWithTransition(viewElement.type.getNavigation(viewProps, app), transition);
				}, 0);
			}
			this.__lastRenderedView = viewKey;
		}

		return React.createElement(
			ViewContainer,
			{ className: viewClassName, key: viewKey },
			viewElement
		);
	},
	render: function render() {
		var className = classNames('ViewManager', this.props.className);
		var viewContainer = this.renderViewContainer(this.state.currentView, { viewProps: this.state.currentViewProps });

		var transitionName = 'view-transition-instant';
		if (this.state.options.transition) {
			// console.log('applying view transition: ' + this.state.options.transition + ' to view ' + this.state.currentView);
			transitionName = 'view-transition-' + this.state.options.transition;
		}
		return React.createElement(
			Transition,
			{ transitionName: transitionName, transitionEnter: true, transitionLeave: true, className: className, component: 'div' },
			viewContainer
		);
	}
});

exports['default'] = ViewManager;
module.exports = exports['default'];
},{"./ErrorView":7,"blacklist":32,"classnames":33,"react/addons":undefined}],11:[function(require,module,exports){
'use strict';

var animation = require('tween.js');
var React = require('react');

function update() {
	animation.update();
	if (animation.getAll().length) {
		window.requestAnimationFrame(update);
	}
}

function scrollToTop(el, options) {
	options = options || {};
	var from = el.scrollTop;
	var duration = Math.min(Math.max(200, from / 2), 350);
	if (from > 200) duration = 300;
	el.style.webkitOverflowScrolling = 'auto';
	el.style.overflow = 'hidden';
	var tween = new animation.Tween({ pos: from }).to({ pos: 0 }, duration).easing(animation.Easing.Quadratic.Out).onUpdate(function () {
		el.scrollTop = this.pos;
		if (options.onUpdate) {
			options.onUpdate();
		}
	}).onComplete(function () {
		el.style.webkitOverflowScrolling = 'touch';
		el.style.overflow = 'scroll';
		if (options.onComplete) options.onComplete();
	}).start();
	update();
	return tween;
}

exports.scrollToTop = scrollToTop;

var Mixins = exports.Mixins = {};

Mixins.ScrollContainerToTop = {
	componentDidMount: function componentDidMount() {
		window.addEventListener('statusTap', this.scrollContainerToTop);
	},
	componentWillUnmount: function componentWillUnmount() {
		window.removeEventListener('statusTap', this.scrollContainerToTop);
		if (this._scrollContainerAnimation) {
			this._scrollContainerAnimation.stop();
		}
	},
	scrollContainerToTop: function scrollContainerToTop() {
		var _this = this;

		if (!this.isMounted() || !this.refs.scrollContainer) return;
		this._scrollContainerAnimation = scrollToTop(React.findDOMNode(this.refs.scrollContainer), {
			onComplete: function onComplete() {
				delete _this._scrollContainerAnimation;
			}
		});
	}
};
},{"react":undefined,"tween.js":36}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.createApp = createApp;
var React = require('react');

var animation = require('./core/animation');
exports.animation = animation;
var Link = require('./core/Link');
exports.Link = Link;
var View = require('./core/View');
exports.View = View;
var ViewManager = require('./core/ViewManager');

exports.ViewManager = ViewManager;
var Container = require('react-container');
exports.Container = Container;
var Mixins = require('./mixins');
exports.Mixins = Mixins;
var UI = require('./ui');

exports.UI = UI;

function createApp() {
	var app = {
		navigationBars: {},
		viewManagers: {},
		views: {},
		transitionTo: function transitionTo(view, opts) {
			var vm = '__default';
			view = view.split(':');
			if (view.length > 1) {
				vm = view.shift();
			}
			view = view[0];
			app.viewManagers[vm].transitionTo(view, opts);
		}
	};
	return {
		childContextTypes: {
			app: React.PropTypes.object
		},
		getChildContext: function getChildContext() {
			return {
				app: app
			};
		}
	};
}
},{"./core/Link":8,"./core/View":9,"./core/ViewManager":10,"./core/animation":11,"./mixins":15,"./ui":31,"react":undefined,"react-container":34}],13:[function(require,module,exports){
'use strict';

var xtend = require('xtend/mutable');
var transitions = require('../constants/transitions');

module.exports = {
	getCSSTransition: function getCSSTransition(key) {
		key = key in transitions ? key : 'none';

		return xtend({
			key: key,
			name: 'view-transition-' + key,
			'in': false,
			out: false
		}, transitions[key]);
	}
};
},{"../constants/transitions":6,"xtend/mutable":37}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var React = require('react');

var Transitions = {
	contextTypes: {
		app: React.PropTypes.object
	},
	transitionTo: function transitionTo(view, opts) {
		this.context.app.transitionTo(view, opts);
	}
};

exports['default'] = Transitions;
module.exports = exports['default'];
},{"react":undefined}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Transitions = require('./Transitions');
exports.Transitions = Transitions;
},{"./Transitions":14}],16:[function(require,module,exports){
'use strict';

var classnames = require('classnames');
var React = require('react/addons');
var ViewContent = require('./ViewContent');

module.exports = React.createClass({
	displayName: 'Alertbar',
	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		height: React.PropTypes.string,
		pulse: React.PropTypes.bool,
		type: React.PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger'])
	},
	getDefaultProps: function getDefaultProps() {
		return {
			height: '30px',
			type: 'default'
		};
	},
	render: function render() {
		var className = classnames(this.props.className, this.props.type, {
			'Alertbar': true,
			'pulse': this.props.pulse
		});
		var content = this.props.pulse ? React.createElement(
			'div',
			{ className: 'Alertbar-inner' },
			this.props.children
		) : this.props.children;

		return React.createElement(
			ViewContent,
			{ height: this.props.height, className: className },
			content
		);
	}
});
},{"./ViewContent":30,"classnames":33,"react/addons":undefined}],17:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');

var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'Input',
	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		first: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'text'
		};
	},

	render: function render() {
		var className = classnames('field-item list-item', {
			'is-first': this.props.first,
			'u-selectable': this.props.disabled
		}, this.props.className);

		var inputProps = blacklist(this.props, 'children', 'className', 'first');

		return React.createElement(
			'div',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'item-inner' },
				React.createElement(
					'label',
					{ className: 'item-content' },
					React.createElement('input', _extends({ className: 'field' }, inputProps))
				),
				this.props.children
			)
		);
	}
});
},{"blacklist":32,"classnames":33,"react/addons":undefined}],18:[function(require,module,exports){
'use strict';

var React = require('react/addons'),
    classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'ItemMedia',
	propTypes: {
		avatar: React.PropTypes.string,
		avatarInitials: React.PropTypes.string,
		className: React.PropTypes.string,
		icon: React.PropTypes.string,
		thumbnail: React.PropTypes.string
	},

	render: function render() {
		var className = classnames({
			'item-media': true,
			'is-icon': this.props.icon,
			'is-avatar': this.props.avatar || this.props.avatarInitials,
			'is-thumbnail': this.props.thumbnail
		}, this.props.className);

		// media types
		var icon = this.props.icon ? React.createElement('div', { className: 'item-icon ' + this.props.icon }) : null;
		var avatar = this.props.avatar || this.props.avatarInitials ? React.createElement(
			'div',
			{ className: 'item-avatar' },
			this.props.avatar ? React.createElement('img', { src: this.props.avatar }) : this.props.avatarInitials
		) : null;
		var thumbnail = this.props.thumbnail ? React.createElement(
			'div',
			{ className: 'item-thumbnail' },
			React.createElement('img', { src: this.props.thumbnail })
		) : null;

		return React.createElement(
			'div',
			{ className: className },
			icon,
			avatar,
			thumbnail
		);
	}
});
},{"classnames":33,"react/addons":undefined}],19:[function(require,module,exports){
'use strict';

var React = require('react/addons'),
    classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'ItemNote',
	propTypes: {
		className: React.PropTypes.string,
		icon: React.PropTypes.string,
		label: React.PropTypes.string,
		type: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'default'
		};
	},

	render: function render() {
		var className = classnames({
			'item-note': true
		}, this.props.type, this.props.className);

		// elements
		var label = this.props.label ? React.createElement(
			'div',
			{ className: 'item-note-label' },
			this.props.label
		) : null;
		var icon = this.props.icon ? React.createElement('div', { className: 'item-note-icon ' + this.props.icon }) : null;

		return React.createElement(
			'div',
			{ className: className },
			label,
			icon
		);
	}
});
},{"classnames":33,"react/addons":undefined}],20:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'LabelInput',

	propTypes: {
		alignTop: React.PropTypes.bool,
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		first: React.PropTypes.bool,
		label: React.PropTypes.string,
		readOnly: React.PropTypes.bool,
		value: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'text',
			readOnly: false
		};
	},

	render: function render() {
		var className = classnames(this.props.className, 'list-item', 'field-item', {
			'align-top': this.props.alignTop,
			'is-first': this.props.first,
			'u-selectable': this.props.disabled
		});

		var props = blacklist(this.props, 'alignTop', 'children', 'first', 'readOnly');
		var renderInput = this.props.readOnly ? React.createElement(
			'div',
			{ className: 'field u-selectable' },
			this.props.value
		) : React.createElement('input', _extends({ className: 'field' }, props));

		return React.createElement(
			'label',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'item-inner' },
				React.createElement(
					'div',
					{ className: 'field-label' },
					this.props.label
				),
				React.createElement(
					'div',
					{ className: 'field-control' },
					renderInput,
					this.props.children
				)
			)
		);
	}
});
},{"blacklist":32,"classnames":33,"react/addons":undefined}],21:[function(require,module,exports){
'use strict';

var React = require('react/addons'),
    classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'LabelSelect',
	propTypes: {
		className: React.PropTypes.string,
		first: React.PropTypes.bool,
		label: React.PropTypes.string,
		options: React.PropTypes.array,
		value: React.PropTypes.string
	},
	getDefaultProps: function getDefaultProps() {
		return {
			className: ''
		};
	},
	getInitialState: function getInitialState() {
		return {
			value: this.props.value
		};
	},
	updateInputValue: function updateInputValue(event) {
		this.setState({
			value: event.target.value
		});
	},
	render: function render() {
		// Set Classes
		var className = classnames(this.props.className, {
			'list-item': true,
			'is-first': this.props.first
		});

		// Map Options
		var options = this.props.options.map(function (op) {
			return React.createElement(
				'option',
				{ key: 'option-' + op.value, value: op.value },
				op.label
			);
		});

		return React.createElement(
			'label',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'item-inner' },
				React.createElement(
					'div',
					{ className: 'field-label' },
					this.props.label
				),
				React.createElement(
					'div',
					{ className: 'field-control' },
					React.createElement(
						'select',
						{ value: this.state.value, onChange: this.updateInputValue, className: 'select-field' },
						options
					),
					React.createElement(
						'div',
						{ className: 'select-field-indicator' },
						React.createElement('div', { className: 'select-field-indicator-arrow' })
					)
				)
			)
		);
	}
});
},{"classnames":33,"react/addons":undefined}],22:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'LabelTextarea',

	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		first: React.PropTypes.bool,
		label: React.PropTypes.string,
		readOnly: React.PropTypes.bool,
		value: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			rows: 3
		};
	},

	render: function render() {
		var className = classnames(this.props.className, 'list-item', 'field-item', 'align-top', {
			'is-first': this.props.first,
			'u-selectable': this.props.disabled
		});

		var props = blacklist(this.props, 'children', 'className', 'disabled', 'first', 'label', 'readOnly');

		var renderInput = this.props.readOnly ? React.createElement(
			'div',
			{ className: 'field u-selectable' },
			this.props.value
		) : React.createElement('textarea', _extends({}, props, { className: 'field' }));

		return React.createElement(
			'div',
			{ className: className },
			React.createElement(
				'label',
				{ className: 'item-inner' },
				React.createElement(
					'div',
					{ className: 'field-label' },
					this.props.label
				),
				React.createElement(
					'div',
					{ className: 'field-control' },
					renderInput,
					this.props.children
				)
			)
		);
	}
});
},{"blacklist":32,"classnames":33,"react/addons":undefined}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var classNames = require('classnames');
var React = require('react/addons');
var Tappable = require('react-tappable');
var Transition = React.addons.CSSTransitionGroup;

var defaultControllerState = {
	direction: 0,
	fade: false,
	leftArrow: false,
	leftButtonDisabled: false,
	leftIcon: '',
	leftLabel: '',
	leftAction: null,
	rightArrow: false,
	rightButtonDisabled: false,
	rightIcon: '',
	rightLabel: '',
	rightAction: null,
	title: ''
};

function newState(from) {
	var ns = _extends({}, defaultControllerState);
	if (from) _extends(ns, from);
	delete ns.name; // may leak from props
	return ns;
}

var NavigationBar = React.createClass({
	displayName: 'NavigationBar',

	contextTypes: {
		app: React.PropTypes.object
	},
	propTypes: {
		name: React.PropTypes.string
	},
	getInitialState: function getInitialState() {
		return newState(this.props);
	},
	componentDidMount: function componentDidMount() {
		if (this.props.name) {
			this.context.app.navigationBars[this.props.name] = this;
		}
	},
	componentWillUnmount: function componentWillUnmount() {
		if (this.props.name) {
			delete this.context.app.navigationBars[this.props.name];
		}
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		this.setState(newState(nextProps));
		if (nextProps.name !== this.props.name) {
			if (nextProps.name) {
				this.context.app.navigationBars[nextProps.name] = this;
			}
			if (this.props.name) {
				delete this.context.app.navigationBars[this.props.name];
			}
		}
	},
	update: function update(state) {
		state = newState(state);
		// console.info('Updating NavigationBar ' + this.props.name, state);
		this.setState(newState(state));
	},
	updateWithTransition: function updateWithTransition(state, transition) {
		state = newState(state);
		if (transition === ('show-from-right' || 'reveal-from-left')) {
			state.direction = 1;
		} else if (transition === ('reveal-from-right' || 'show-from-left')) {
			state.direction = -1;
		} else if (transition === 'fade') {
			state.fade = true;
		}
		// console.info('Updating NavigationBar ' + this.props.name + ' with transition ' + transition, state);
		this.setState(state);
	},

	renderLeftButton: function renderLeftButton() {
		var className = classNames('NavigationBarLeftButton', {
			'has-arrow': this.state.leftArrow
		});

		return React.createElement(
			Tappable,
			{ onTap: this.state.leftAction, className: className, disabled: this.state.leftButtonDisabled, component: 'button' },
			this.renderLeftArrow(),
			this.renderLeftLabel()
		);
	},
	renderLeftArrow: function renderLeftArrow() {
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade || this.state.direction) {
			transitionName = 'NavigationBarTransition-Fade';
		}

		var arrow = this.state.leftArrow ? React.createElement('span', { className: 'NavigationBarLeftArrow' }) : null;

		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			arrow
		);
	},
	renderLeftLabel: function renderLeftLabel() {
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade) {
			transitionName = 'NavigationBarTransition-Fade';
		} else if (this.state.direction > 0) {
			transitionName = 'NavigationBarTransition-Forwards';
		} else if (this.state.direction < 0) {
			transitionName = 'NavigationBarTransition-Backwards';
		}

		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			React.createElement(
				'span',
				{ key: Date.now(), className: 'NavigationBarLeftLabel' },
				this.state.leftLabel
			)
		);
	},
	renderTitle: function renderTitle() {
		var title = this.state.title ? React.createElement(
			'span',
			{ key: Date.now(), className: 'NavigationBarTitle' },
			this.state.title
		) : null;
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade) {
			transitionName = 'NavigationBarTransition-Fade';
		} else if (this.state.direction > 0) {
			transitionName = 'NavigationBarTransition-Forwards';
		} else if (this.state.direction < 0) {
			transitionName = 'NavigationBarTransition-Backwards';
		}

		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			title
		);
	},
	renderRightButton: function renderRightButton() {
		var transitionName = 'NavigationBarTransition-Instant';
		if (this.state.fade || this.state.direction) {
			transitionName = 'NavigationBarTransition-Fade';
		}
		var button = this.state.rightIcon || this.state.rightLabel ? React.createElement(
			Tappable,
			{ key: Date.now(), onTap: this.state.rightAction, className: 'NavigationBarRightButton', disabled: this.state.rightButtonDisabled, component: 'button' },
			this.renderRightLabel(),
			this.renderRightIcon()
		) : null;
		return React.createElement(
			Transition,
			{ transitionName: transitionName },
			button
		);
	},
	renderRightIcon: function renderRightIcon() {
		if (!this.state.rightIcon) return null;

		var className = classNames('NavigationBarRightIcon', this.state.rightIcon);

		return React.createElement('span', { className: className });
	},
	renderRightLabel: function renderRightLabel() {
		return this.state.rightLabel ? React.createElement(
			'span',
			{ key: Date.now(), className: 'NavigationBarRightLabel' },
			this.state.rightLabel
		) : null;
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'NavigationBar' },
			this.renderLeftButton(),
			this.renderTitle(),
			this.renderRightButton()
		);
	}
});

/*
function createController () {
	var state = newState();
	var listeners = [];
	return {
		update (ns) {
			state = newState(ns);
			listeners.forEach(fn => fn());
		},
		getState () {
			return state;
		},
		addListener (fn) {
			listeners.push(fn);
		},
		removeListener (fn) {
			listeners = listeners.filter(i => fn !== i);
		}
	};
}
*/

exports['default'] = NavigationBar;
module.exports = exports['default'];
},{"classnames":33,"react-tappable":35,"react/addons":undefined}],24:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Transition = require('../mixins/Transition');

var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'Popup',
	mixins: [Transition],

	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		visible: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			transition: 'none'
		};
	},

	renderBackdrop: function renderBackdrop() {
		if (!this.props.visible) return null;
		return React.createElement('div', { className: 'Modal-backdrop' });
	},

	renderDialog: function renderDialog() {
		if (!this.props.visible) return null;

		// Set classnames
		var dialogClassName = classnames('Modal-dialog', this.props.className);

		return React.createElement(
			'div',
			{ className: dialogClassName },
			this.props.children
		);
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'Modal' },
			React.createElement(
				ReactCSSTransitionGroup,
				{ transitionName: 'Modal-dialog', component: 'div' },
				this.renderDialog()
			),
			React.createElement(
				ReactCSSTransitionGroup,
				{ transitionName: 'Modal-background', component: 'div' },
				this.renderBackdrop()
			)
		);
	}
});
},{"../mixins/Transition":13,"classnames":33,"react/addons":undefined}],25:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var classNames = require('classnames');

module.exports = React.createClass({
	displayName: 'PopupIcon',
	propTypes: {
		name: React.PropTypes.string.isRequired,
		type: React.PropTypes.oneOf(['default', 'muted', 'primary', 'success', 'warning', 'danger']),
		spinning: React.PropTypes.bool
	},

	render: function render() {
		var className = classNames('Modal-icon', {
			'is-spinning': this.props.spinning
		}, this.props.name, this.props.type);

		return React.createElement('div', { className: className });
	}
});
},{"classnames":33,"react/addons":undefined}],26:[function(require,module,exports){
'use strict';

var React = require('react');
var Tappable = require('react-tappable');

var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'RadioList',

	propTypes: {
		options: React.PropTypes.array,
		value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
		icon: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	onChange: function onChange(value) {
		this.props.onChange(value);
	},

	render: function render() {
		var self = this;
		var options = this.props.options.map(function (op, i) {
			var iconClassname = classnames('item-icon primary', op.icon);
			var tappableClassname = classnames('list-item', { 'is-first': i === 0 });
			var checkMark = op.value === self.props.value ? React.createElement(
				'div',
				{ className: 'item-note primary' },
				React.createElement('div', { className: 'item-note-icon ion-checkmark' })
			) : null;
			var icon = op.icon ? React.createElement(
				'div',
				{ className: 'item-media' },
				React.createElement('span', { className: iconClassname })
			) : null;

			function onChange() {
				self.onChange(op.value);
			}

			return React.createElement(
				Tappable,
				{ key: 'option-' + i, onTap: onChange, className: tappableClassname },
				icon,
				React.createElement(
					'div',
					{ className: 'item-inner' },
					React.createElement(
						'div',
						{ className: 'item-title' },
						op.label
					),
					checkMark
				)
			);
		});

		return React.createElement(
			'div',
			null,
			options
		);
	}
});
},{"classnames":33,"react":undefined,"react-tappable":35}],27:[function(require,module,exports){
'use strict';

var classnames = require('classnames');
var React = require('react');
var Tappable = require('react-tappable');

module.exports = React.createClass({
	displayName: 'Switch',

	propTypes: {
		disabled: React.PropTypes.bool,
		on: React.PropTypes.bool,
		onTap: React.PropTypes.func,
		type: React.PropTypes.string
	},

	getDefaultProps: function getDefaultProps() {
		return {
			type: 'default'
		};
	},

	render: function render() {
		var className = classnames('Switch', 'Switch--' + this.props.type, {
			'is-disabled': this.props.disabled,
			'is-on': this.props.on
		});

		return React.createElement(
			Tappable,
			{ onTap: this.props.onTap, className: className, component: 'label' },
			React.createElement(
				'div',
				{ className: 'Switch__track' },
				React.createElement('div', { className: 'Switch__handle' })
			)
		);
	}
});
},{"classnames":33,"react":undefined,"react-tappable":35}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var blacklist = require('blacklist');
var classnames = require('classnames');
var React = require('react');
var Tappable = require('react-tappable');

var Navigator = React.createClass({
	displayName: 'Navigator',

	propTypes: {
		children: React.PropTypes.node,
		onChange: React.PropTypes.func,
		value: React.PropTypes.string
	},
	render: function render() {
		var _this = this;

		return React.createElement(
			'div',
			{ className: 'Tabs-Navigator' },
			React.Children.map(this.props.children, function (tab) {
				return React.cloneElement(tab, {
					onSelect: _this.props.onChange,
					navigatorValue: _this.props.value
				});
			})
		);
	}
});

exports.Navigator = Navigator;
var Tab = React.createClass({
	displayName: 'Tab',

	contextTypes: {
		tabNavigator: React.PropTypes.object
	},
	propTypes: {
		children: React.PropTypes.node,
		navigatorValue: React.PropTypes.string,
		onSelect: React.PropTypes.func,
		value: React.PropTypes.string
	},
	onSelect: function onSelect() {
		var tab = blacklist(this.props, 'children');
		this.props.onSelect(tab);
	},
	render: function render() {
		var isCurrent = this.props.navigatorValue === this.props.value;
		var className = classnames('Tabs-Tab', {
			'is-selected': isCurrent
		});
		return React.createElement(
			Tappable,
			{ onTap: this.props.onSelect && this.onSelect, className: className },
			this.props.children
		);
	}
});

exports.Tab = Tab;
var Label = React.createClass({
	displayName: 'Label',

	propTypes: {
		children: React.PropTypes.node
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'Tabs-Label' },
			this.props.children
		);
	}
});
exports.Label = Label;
},{"blacklist":32,"classnames":33,"react":undefined,"react-tappable":35}],29:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var blacklist = require('blacklist');
var classnames = require('classnames');

var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'Textarea',
	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		first: React.PropTypes.bool,
		rows: React.PropTypes.number
	},

	getDefaultProps: function getDefaultProps() {
		return {
			rows: 3
		};
	},

	render: function render() {
		var className = classnames('field-item list-item', {
			'is-first': this.props.first,
			'u-selectable': this.props.disabled
		}, this.props.className);

		var inputProps = blacklist(this.props, 'children', 'className', 'first');

		return React.createElement(
			'div',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'item-inner' },
				React.createElement(
					'label',
					{ className: 'item-content' },
					React.createElement('textarea', _extends({ className: 'field' }, inputProps))
				),
				this.props.children
			)
		);
	}
});
},{"blacklist":32,"classnames":33,"react/addons":undefined}],30:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var classnames = require('classnames');

module.exports = React.createClass({
	displayName: 'ViewContent',
	propTypes: {
		id: React.PropTypes.string,
		height: React.PropTypes.string,
		scrollable: React.PropTypes.bool,
		grow: React.PropTypes.bool
	},

	getDefaultProps: function getDefaultProps() {
		return {
			className: '',
			height: ''
		};
	},

	render: function render() {
		var className = classnames({
			'ViewContent': true,
			'springy-scrolling': this.props.scrollable
		}, this.props.className);

		var inlineStyle = {};

		// set height on blocks if provided
		if (this.props.height) {
			inlineStyle.height = this.props.height;
		}

		// stretch to take up space
		if (this.props.grow) {
			inlineStyle.WebkitBoxFlex = '1';
			inlineStyle.WebkitFlex = '1';
			inlineStyle.MozBoxFlex = '1';
			inlineStyle.MozFlex = '1';
			inlineStyle.MsFlex = '1';
			inlineStyle.flex = '1';
		}

		// allow blocks to be scrollable
		if (this.props.scrollable) {
			inlineStyle.overflowY = 'auto';
			inlineStyle.WebkitOverflowScrolling = 'touch';
		}

		return React.createElement(
			'div',
			{ className: className, id: this.props.id, style: inlineStyle },
			this.props.children
		);
	}
});
},{"classnames":33,"react/addons":undefined}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Alertbar = require('./Alertbar');
exports.Alertbar = Alertbar;
var Input = require('./Input');
exports.Input = Input;
var ItemMedia = require('./ItemMedia');
exports.ItemMedia = ItemMedia;
var ItemNote = require('./ItemNote');
exports.ItemNote = ItemNote;
var LabelInput = require('./LabelInput');
exports.LabelInput = LabelInput;
var LabelSelect = require('./LabelSelect');
exports.LabelSelect = LabelSelect;
var LabelTextarea = require('./LabelTextarea');
exports.LabelTextarea = LabelTextarea;
var NavigationBar = require('./NavigationBar');
exports.NavigationBar = NavigationBar;
var Popup = require('./Popup');
exports.Popup = Popup;
var PopupIcon = require('./PopupIcon');
exports.PopupIcon = PopupIcon;
var RadioList = require('./RadioList');
exports.RadioList = RadioList;
var Switch = require('./Switch');
exports.Switch = Switch;
var Tabs = require('./Tabs');
exports.Tabs = Tabs;
var Textarea = require('./Textarea');
exports.Textarea = Textarea;
},{"./Alertbar":16,"./Input":17,"./ItemMedia":18,"./ItemNote":19,"./LabelInput":20,"./LabelSelect":21,"./LabelTextarea":22,"./NavigationBar":23,"./Popup":24,"./PopupIcon":25,"./RadioList":26,"./Switch":27,"./Tabs":28,"./Textarea":29}],32:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],33:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],34:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"blacklist":32,"classnames":33,"dup":2,"react":undefined}],35:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4,"react":undefined}],36:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

module.exports=TWEEN;
},{}],37:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],38:[function(require,module,exports){
"use strict";

module.exports = [{
	"id": "55826a39a982d103008c4b20",
	"name": "Christopher Chedeau",
	"bio": "Frenchy Front-end Engineer at Facebook. Working on React.",
	"github": "vjeux",
	"isOrganiser": true,
	"isSpeaker": true,
	"picture": "./img/speakers/christopher-chedeau.jpg",
	"twitter": "vjeux",
	"talks": [{
		"key": "keynote",
		"duration": 1800000,
		"endTime": "2015-07-02T08:30:00.000Z",
		"startTime": "2015-07-02T08:00:00.000Z",
		"type": "talk",
		"title": "Keynote",
		"description": "<p>coming soon</p>\n",
		"speakers": ["55826a39a982d103008c4b20"],
		"id": "55826a3ba982d103008c4b4c",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b21",
	"name": "Michael Chan",
	"bio": "Michael Chan is no special flower. He loves ramen and helping JS n00bs learn React. Michael is a developer at Planning Center Online where he gleefully creates shared libraries and components for Planning Center's six applications. Last spring he built the company's first React application, Services Live 3, and continues to develop practices and patterns for writing React.js on Rails.",
	"github": "chantastic",
	"isSpeaker": true,
	"picture": "./img/speakers/michael-chan.jpg",
	"twitter": "chant",
	"talks": [{
		"key": "inline-styles-themes-media-queries-contexts-and-when-its-best-to-use-css",
		"duration": 1800000,
		"endTime": "2015-07-02T09:00:00.000Z",
		"startTime": "2015-07-02T08:30:00.000Z",
		"type": "talk",
		"title": "Inline Styles: themes, media queries, contexts, and when it's best to use CSS",
		"description": "<p>React allows you to write styles inline and bypass a host of CSS shortcomings. Scope, dependency management, dead code elimination, these problems go away when adding your styles directly to components. But it&#39;s not all rainbows and unicorns. Things like theming and media queries become much more difficult when all your styles live directly on components. In this talk, we&#39;ll look at how to solve these problems with contexts and plain old JavaScript. We&#39;ll also look at the role of container-components and when it&#39;s better to &quot;just use CSS.&quot;</p>\n",
		"speakers": ["55826a3aa982d103008c4b21"],
		"id": "55826a3ba982d103008c4b4d",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b22",
	"name": "Elie Rotenberg",
	"bio": "PhD in Computer Science, CTO and Software Architect at Webedia Gaming (editor of jeuxvideo.com and millenium.org), Elie Rotenberg is a specialist in designing and deploying real-time, large-scale web applications, such as Chats, Web TVs, up to tens of thousands of concurrent users.",
	"github": "elierotenberg",
	"isSpeaker": true,
	"picture": "./img/speakers/elie-rotenberg.jpg",
	"twitter": "elier",
	"talks": [{
		"key": "flux-over-the-wire",
		"duration": 3600000,
		"endTime": "2015-07-02T10:00:00.000Z",
		"startTime": "2015-07-02T09:30:00.000Z",
		"type": "talk",
		"title": "Flux over the Wire",
		"description": "<p>Flux is most often used to implement shared state within a single window. But done properly, this architecture can be used to implement real-time, multi-user shared state between many users of the same web applications. Using HTTP requests to dispatch stores, and Websocket to broadcast updates, Flux over the Wire has the potential to trivialize several hard problems. While the idea of using Websockets to back Flux is rather straightforward, doing it in a way that scales up to tens of thousands of concurrent viewers can prove challenging. In addition, Flux over the Wire offers an interface which considerably eases server-side rendering, as it completely abstracts data fetching and data syncing from the React views that tap into its stores and dispatch its actions.</p>\n",
		"speakers": ["55826a3aa982d103008c4b22"],
		"id": "55826a3ba982d103008c4b4f",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b23",
	"name": "Spencer Ahrens",
	"bio": "Spencer has worked on a variety of projects at Facebook over the last several years including Android, iOS, and mobile web product teams, News Feed API, and Search Infrastructure. He's currently working on React Native.",
	"github": "sahrens",
	"isSpeaker": true,
	"picture": "./img/speakers/spencer-ahrens.jpg",
	"twitter": "",
	"talks": [{
		"key": "react-native-building-fluid-user-experiences",
		"duration": 0,
		"endTime": "2015-07-02T10:30:00.000Z",
		"startTime": "2015-07-02T10:00:00.000Z",
		"type": "talk",
		"title": "React Native: Building Fluid User Experiences",
		"description": "<p>React Native&#39;s architecture has opened up many possibilities for re-inventing the clunkier aspects of UX construction on traditional platforms, making it easier and faster to build world-class experiences. This talk will walk through building an advanced gestural UI leveraging the unique power of the React Native layout and animation systems to build a complex and fluid experience.</p>\n",
		"speakers": ["55826a3aa982d103008c4b23"],
		"id": "55826a3ba982d103008c4b50",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b24",
	"name": "Dan Schafer",
	"bio": "Dan Schafer is a co-creator of GraphQL, and designed the data model backing the original GraphQL API, which powered Facebook's news feed. He added GraphQL's support for writes, and has helped maintain Facebook's GraphQL engine and APIs for almost three years.",
	"github": "dschafer",
	"isSpeaker": true,
	"picture": "./img/speakers/dlschafer.jpg",
	"twitter": "dlsch",
	"talks": [{
		"key": "creating-a-graphql-server",
		"duration": 1800000,
		"endTime": "2015-07-03T13:00:00.000Z",
		"startTime": "2015-07-03T12:30:00.000Z",
		"type": "talk",
		"title": "Creating a GraphQL Server",
		"description": "<p>In this talk, we&#39;ll take a deeper dive into putting GraphQL to work. How can we build a GraphQL API to work with an existing REST API or server-side data model? What are best practices when building a GraphQL API, and how do they differ from traditional REST best practices? How does Facebook use GraphQL? Most importantly, what does a complete and coherent GraphQL API looks like, and how can we get started building one?</p>\n",
		"speakers": ["55826a3aa982d103008c4b24", "55826a3aa982d103008c4b25"],
		"id": "55826a3ba982d103008c4b63",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b25",
	"name": "Nick Schrock",
	"bio": "Nick Schrock is a co-creator of GraphQL, and wrote the original version of Facebook's GraphQL engine. An original member of Facebook's Product Infrastructure team, Nick helped create the abstractions that power Facebooks's PHP data model, and built out the Facebook's iOS and Android tooling around GraphQL.",
	"github": "schrockn",
	"isSpeaker": true,
	"picture": "./img/speakers/schrockn.jpg",
	"twitter": "schrockn",
	"talks": [{
		"key": "creating-a-graphql-server",
		"duration": 1800000,
		"endTime": "2015-07-03T13:00:00.000Z",
		"startTime": "2015-07-03T12:30:00.000Z",
		"type": "talk",
		"title": "Creating a GraphQL Server",
		"description": "<p>In this talk, we&#39;ll take a deeper dive into putting GraphQL to work. How can we build a GraphQL API to work with an existing REST API or server-side data model? What are best practices when building a GraphQL API, and how do they differ from traditional REST best practices? How does Facebook use GraphQL? Most importantly, what does a complete and coherent GraphQL API looks like, and how can we get started building one?</p>\n",
		"speakers": ["55826a3aa982d103008c4b24", "55826a3aa982d103008c4b25"],
		"id": "55826a3ba982d103008c4b63",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b26",
	"name": "Ryan Florence",
	"bio": "JavaScript Consultant/Trainer, co-author of React Router.",
	"github": "ryanflorence",
	"isSpeaker": true,
	"picture": "./img/speakers/ryan-florence.jpg",
	"twitter": "ryanf",
	"talks": [{
		"key": "help-i-cant-hear-my-website",
		"duration": 1800000,
		"endTime": "2015-07-02T13:00:00.000Z",
		"startTime": "2015-07-02T12:30:00.000Z",
		"type": "talk",
		"title": "Help! I Can't Hear My Website!",
		"description": "<p>Have you ever used an assistive device like a screen reader on your website? There&#39;s a good chance its about as usable as opening it in IE 5.5. Its not about &quot;alt tags&quot; anymore. Put on your empathy hat, or have one forced on you, while I talk about what its like for people with vision impairment.</p>\n",
		"speakers": ["55826a3aa982d103008c4b26"],
		"id": "55826a3ba982d103008c4b53",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b27",
	"name": "Dan Abramov",
	"bio": "Dan is young developer who began writing JavaScript full-time two years ago.\n    Unsatisifed with Backbone’s shortcomings, Dan found React and Flux to be a very\n    solid foundation for building composite and stateful user interfaces at Stampsy.\n    Dan authored and contributed to several popular React components and libraries.\n    Before getting into JavaScript, he used to write C# for Windows, Linux and iOS.",
	"github": "gaearon",
	"isSpeaker": true,
	"picture": "./img/speakers/dan-abramov.jpg",
	"twitter": "dan_abramov",
	"talks": [{
		"key": "live-react-hot-reloading-with-time-travel",
		"duration": 1800000,
		"endTime": "2015-07-02T14:00:00.000Z",
		"startTime": "2015-07-02T13:30:00.000Z",
		"type": "talk",
		"title": "Live React: Hot Reloading with Time Travel",
		"description": "<p>React’s unique strength is bringing to JavaScript development some of the\n    benefits previously exclusive to more radically functional languages such as\n    Elm and ClojureScript, without forcing you to completely eschew local state\n    or rewrite code with exclusively immutable data structures.\n    In this talk, Dan will demonstrate how React can be used together with\n    Webpack Hot Module Replacement to create a live editing environment with\n    time travel that supercharges your debugging experience and transforms the\n    way you work on real apps every day.</p>\n",
		"speakers": ["55826a3aa982d103008c4b27"],
		"id": "55826a3ba982d103008c4b55",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b28",
	"name": "Joseph Savona",
	"bio": "Joseph Savona is a developer at Facebook working on Relay and GraphQL.",
	"github": "josephsavona",
	"isSpeaker": true,
	"picture": "./img/speakers/joseph-savona.jpg",
	"twitter": "en_js",
	"talks": [{
		"key": "relay-an-application-framework-for-react",
		"duration": 3600000,
		"endTime": "2015-07-02T14:30:00.000Z",
		"startTime": "2015-07-02T14:00:00.000Z",
		"type": "talk",
		"title": "Relay: An Application Framework For React",
		"description": "<p>Relay is a new framework from Facebook that enables declarative data fetching &amp; updates for React applications. Relay components use GraphQL to specify their data requirements, and compose together to form truly modular applications. This talk will explore the problems Relay solves, its architecture and the query lifecycle, and how can you use Relay to build more scalable apps. We’ll also see examples of how Relay powers applications as complex as the Facebook News Feed.</p>\n",
		"speakers": ["55826a3aa982d103008c4b28"],
		"id": "55826a3ba982d103008c4b56",
		"feedback": {}
	}]
}, {
	"id": "55826a3aa982d103008c4b29",
	"name": "Mikhail Davydov",
	"bio": "Mikhail is a full stack JavaScript developer at Productive Mobile and currently working on\n    project which transforms enterprise web applications into mobile. Before that time\n    he worked for Yandex and taught about 200 developers to write awesome JavaScript apps.\n    He has many talks and lectures about JavaScript and related technologies.\n    On leisure time he takes pictures and tries to marry technology and photography in his\n    \"2layer photo-project\".",
	"github": "azproduction",
	"isSpeaker": true,
	"picture": "./img/speakers/mikhail-davydov.jpg",
	"twitter": "azproduction",
	"talks": [{
		"key": "back-to-text-ui",
		"duration": 1800000,
		"endTime": "2015-07-02T15:30:00.000Z",
		"startTime": "2015-07-02T15:00:00.000Z",
		"type": "talk",
		"title": "Back to Text UI",
		"description": "<p>Paradoxically that today it is easier to create GUI than Text UI.\n    Developer has an arsenal of different GUI libraries and layout engines.\n    When one decides to write Terminal Text UI app he faces obstacles\n    of Text UI DSL Library, imperative layouts, constantly increasing\n    complexity and underdeveloped approaches.\n    In this talk I will show you how to ask browser layout engine for help,\n    how to avoid slavery of DSL and build declarative Text UI using only\n    web-technologies like HTML, JS, CSS and React.</p>\n",
		"speakers": ["55826a3aa982d103008c4b29"],
		"id": "55826a3ba982d103008c4b58",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b2a",
	"name": "Sebastian McKenzie",
	"bio": "Sebastian McKenzie is a JavaScript enthusiast based in Sydney, Australia.\n    He's extremely passionate about open source as well as web standards and is\n    always looking to push the boundaries of what is possible.\n    Sebastian is also the creator of the popular Babel compiler that's used by\n    many React developers to bring their JSX and ES6 to life.",
	"github": "sebmck",
	"isSpeaker": true,
	"picture": "./img/speakers/sebastian-mcKenzie.png",
	"twitter": "sebmck",
	"talks": [{
		"key": "improving-your-workflow-with-code-transformation",
		"duration": 1800000,
		"endTime": "2015-07-03T08:30:00.000Z",
		"startTime": "2015-07-03T08:00:00.000Z",
		"type": "talk",
		"title": "Improving Your Workflow With Code Transformation",
		"description": "<p>Most React developers already use a build pipeline to transform their JSX\n    into vanilla JavaScript. This is usually under-utilised only doing basic\n    transformations such as concatenation, minification and linting.\n    In this talk, Sebastian will go over how this already existing infrastructure\n    can be further utilised to perform even more significant code transformations\n    such as transpilation, optimisation, profiling and more, reducing bugs,\n    making your code faster and you as a developer more productive and happy.</p>\n",
		"speakers": ["55826a3ba982d103008c4b2a"],
		"id": "55826a3ba982d103008c4b5c",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b2b",
	"name": "Cheng Lou",
	"bio": "I started making manual animation in Flash, and never really left in spirit.",
	"github": "chenglou",
	"isSpeaker": true,
	"picture": "./img/speakers/cheng-lou.jpg",
	"twitter": "_chenglou",
	"talks": [{
		"key": "the-state-of-animation-in-react",
		"duration": 1800000,
		"endTime": "2015-07-03T09:00:00.000Z",
		"startTime": "2015-07-03T08:30:00.000Z",
		"type": "talk",
		"title": "The State of Animation in React",
		"description": "<p>A talk on the past, the present and the future of animation, and the place\n    React can potentially take in this. I will be focusing on a few experiments\n    on animation I&#39;ve done, specifically: react-tween-state, react-state-stream\n    and some unreleased transition-group related thoughts and work.</p>\n",
		"speakers": ["55826a3ba982d103008c4b2b"],
		"id": "55826a3ba982d103008c4b5d",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b2c",
	"name": "Kevin Robinson",
	"bio": "Software Engineer at Twitter.",
	"github": "kevinrobinson",
	"isSpeaker": true,
	"picture": "./img/speakers/kevin-robinson.png",
	"twitter": "krob",
	"talks": [{
		"key": "simplifying-the-data-layer",
		"duration": 1800000,
		"endTime": "2015-07-03T10:00:00.000Z",
		"startTime": "2015-07-03T09:30:00.000Z",
		"type": "talk",
		"title": "Simplifying the data layer",
		"description": "<p>At Twitter, teams have starting adopting React because it’s enabled UI engineers to forget about time when writing rendering code. And we&#39;ve started exploring similar simplifications in the data layer, embracing the UI’s role as part of a distributed system. First, we&#39;ll share how user experience choices are a primary influence on how we design the data layer, especially for teams developing new products with full-stack capabilities. Working with data from multiple backend services has powerful benefits, and shapes the problem space for UI engineering. Next, we&#39;ll look at how React and Flux approaches can help in our problem scenarios. Yet even after the advances in React’s component model, the data layer is still an important source of complexity as an app grows and changes over time. Finally, we&#39;ll look at new approaches we’ve been exploring, and how designs like decoupling &#39;recording facts&#39; from &#39;computing views of those facts&#39; have influenced UI engineering. These designs nudge teams towards simplicity when creating impactful user-facing improvements like real-time updates, optimistic commits, and graceful handling of network outages.</p>\n",
		"speakers": ["55826a3ba982d103008c4b2c"],
		"id": "55826a3ba982d103008c4b5f",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b2d",
	"name": "Jed Watson",
	"bio": "Partner at @thethinkmill, Javascript / node.js developer, entrepreneur, creator of @KeystoneJS and @TouchstoneJS.",
	"github": "JedWatson",
	"isSpeaker": true,
	"picture": "./img/speakers/jed-watson.jpg",
	"twitter": "JedWatson",
	"talks": [{
		"key": "going-mobile-with-react",
		"duration": 1800000,
		"endTime": "2015-07-03T02:30:00.000Z",
		"startTime": "2015-07-03T02:00:00.000Z",
		"type": "talk",
		"title": "Going Mobile with React",
		"description": "<p>React.js is changing the way developers think about mobile app development, especially with the recent announcement of React Native. However, in many ways hybrid (web + mobile) app development is here to stay for a large number of mobile apps.</p>\n<p>We believe the web is a powerful platform for building awesome mobile apps with the technology you know. At Thinkmill in Sydney, we&#39;ve experienced the power of using ReactJS for mobile apps built on web technology, and developed a framework we call TouchstoneJS to share this capability with developers around the world.</p>\n<p>In this talk I&#39;ll share what we&#39;ve learned and how we&#39;ve approached the unique challenges of mobile web apps. You&#39;ll also hear about TouchstoneJS, React Native, and how we think they could converge in the future.</p>\n",
		"speakers": ["55826a3ba982d103008c4b2d"],
		"id": "55826a3ba982d103008c4b60",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b2e",
	"name": "Michael Jackson",
	"bio": "Thriller. Previously @ycombinator S2013, @twitter and @path.",
	"github": "mjackson",
	"isSpeaker": true,
	"picture": "./img/speakers/michael-jackson.jpg",
	"twitter": "mjack",
	"talks": [{
		"key": "react-router",
		"duration": 1800000,
		"endTime": "2015-07-03T12:30:00.000Z",
		"startTime": "2015-07-03T12:00:00.000Z",
		"type": "talk",
		"title": "React Router",
		"description": "<p>Since May 2014 over 100 people have contributed code to React Router and many, many more have filed issues, given talks, and used the router in both server and client environments. It has been mine and Ryan&#39;s privilege to work with and learn from these wonderful people and to guide the direction of a library that we hope will help us all build amazing products and tools with React over the next few years.</p>\n<p>This year we are introducing support for React Native and we are working closely with the Relay team to ensure the router meets the needs of React developers everywhere React runs. More importantly though, we are focused on bringing great experiences to consumers of applications built using React Router. In this talk, we will discuss how your users can benefit from the many tools the router provides including server-side rendering, real URLs on native devices, and much, much more.</p>\n",
		"speakers": ["55826a3ba982d103008c4b2e"],
		"id": "55826a3ba982d103008c4b62",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b2f",
	"name": "Michael Ridgway",
	"bio": "Mike is software engineer at Yahoo working on node.js and React/Flux\n    frontends that power high-traffic web applications.",
	"github": "mridgway",
	"isSpeaker": true,
	"picture": "./img/speakers/michael-ridgway.jpg",
	"twitter": "TheRidgway",
	"talks": [{
		"key": "isomorphic-flux",
		"duration": 1800000,
		"endTime": "2015-07-03T14:00:00.000Z",
		"startTime": "2015-07-03T13:30:00.000Z",
		"type": "talk",
		"title": "Isomorphic Flux",
		"description": "<p>Flux provides a good framework for building rich client applications, but\n    did you know you can reuse the flux architecture for server rendering? In\n    this talk, I&#39;ll walk you through an isomorphic Flux architecture to give\n    you the holy grail of frontend development. With this architecture you&#39;ll be\n    able to reuse all of your application code on the server and client without\n    worrying about server-side concurrency issues that you may see with stock\n    Flux.\n    Once the concepts have been explained, I will introduce the open source\n    libraries that we have open sourced and are powering many of Yahoo&#39;s\n    high-traffic web applications.</p>\n",
		"speakers": ["55826a3ba982d103008c4b2f"],
		"id": "55826a3ba982d103008c4b65",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b30",
	"name": "Aria Buckles",
	"bio": "Aria has been building interactive educational experiences with React\n    at Khan Academy since September 2013, and maintains one of the oldest\n    large React codebases outside of Facebook.",
	"github": "ariabuckles",
	"isSpeaker": true,
	"picture": "./img/speakers/aria-buckles.jpg",
	"twitter": "ariabuckles",
	"talks": [{
		"key": "building-submarines-that-dont-leak",
		"duration": 3600000,
		"endTime": "2015-07-03T15:00:00.000Z",
		"startTime": "2015-07-03T14:00:00.000Z",
		"type": "talk",
		"title": "Building submarines that don't leak",
		"description": "<p>React provides us with a lot of tools for building components, but\n    isn&#39;t prescriptive about how we use those. Objects can have props,\n    state, and instance fields. When is it best to use each?\n    We&#39;ve heard a lot about pure components, but how do we make pure\n    components when we have to deal with the realities of a stateful\n    world? How do we make more complex components whose props actually\n    represent them?\n    We&#39;ll cover how we&#39;ve answered these questions at Khan Academy,\n    including techniques and patterns to make dealing with large pure\n    components simpler, as well as current open questions.</p>\n",
		"speakers": ["55826a3ba982d103008c4b30"],
		"id": "55826a3ba982d103008c4b66",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b31",
	"name": "Ben Gotow",
	"bio": "Incurable builder, front-end product engineer at Nilas. Formerly principal of @Foundry376, developer of more than 20 iOS apps and the @SparkInspector. Studied HCI at Carnegie Mellon and CS at Vanderbilt University.",
	"github": "bengotow",
	"isSpeaker": true,
	"picture": "./img/speakers/ben-gotow.jpg",
	"twitter": "bengotow",
	"talks": [{
		"key": "how-react-and-flux-turn-applications-into-extensible-platforms",
		"duration": 1800000,
		"endTime": "2015-07-03T15:30:00.000Z",
		"startTime": "2015-07-03T15:00:00.000Z",
		"type": "talk",
		"title": "How React & Flux Turn Applications Into Extensible Platforms",
		"description": "<p>Chrome is great, but 3rd party extensions make it better. The iPhone\n    is great, but apps make it better. You React-app may be great, but\n    imagine if you could safely and robustly allow 3rd party extensions to\n    enhance it.\n    We&#39;ll talk about specific features of React &amp; Flux, React CSS,\n    programming design patterns, and custom libraries, which can turn a\n    static application into a dynamic platform that an ecosystem of\n    developers can build on top of.\n    We&#39;ve built a highly-extensible desktop email client with React &amp; Flux\n    on Atom Shell, and we&#39;ll also show concrete examples of where these\n    tools enabled a 3rd party ecosystem of email plugins.\n    Our goal is for you to take away how to use React to be more than just\n    great application developers, but now great platform developers as\n    well.</p>\n",
		"speakers": ["55826a3ba982d103008c4b31", "55826a3ba982d103008c4b32"],
		"id": "55826a3ba982d103008c4b68",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b32",
	"name": "Evan Morikawa",
	"bio": "Currently a frontend application engineer at Nilas. Before building email clients, Evan founded & customer-funded Proximate, was a dev-in-residence at Techstars, and graduated Olin College of Engineering with a CS degree.",
	"github": "emorikawa",
	"isSpeaker": true,
	"picture": "./img/speakers/evan-morikawa.jpg",
	"twitter": "e0m",
	"talks": [{
		"key": "how-react-and-flux-turn-applications-into-extensible-platforms",
		"duration": 1800000,
		"endTime": "2015-07-03T15:30:00.000Z",
		"startTime": "2015-07-03T15:00:00.000Z",
		"type": "talk",
		"title": "How React & Flux Turn Applications Into Extensible Platforms",
		"description": "<p>Chrome is great, but 3rd party extensions make it better. The iPhone\n    is great, but apps make it better. You React-app may be great, but\n    imagine if you could safely and robustly allow 3rd party extensions to\n    enhance it.\n    We&#39;ll talk about specific features of React &amp; Flux, React CSS,\n    programming design patterns, and custom libraries, which can turn a\n    static application into a dynamic platform that an ecosystem of\n    developers can build on top of.\n    We&#39;ve built a highly-extensible desktop email client with React &amp; Flux\n    on Atom Shell, and we&#39;ll also show concrete examples of where these\n    tools enabled a 3rd party ecosystem of email plugins.\n    Our goal is for you to take away how to use React to be more than just\n    great application developers, but now great platform developers as\n    well.</p>\n",
		"speakers": ["55826a3ba982d103008c4b31", "55826a3ba982d103008c4b32"],
		"id": "55826a3ba982d103008c4b68",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b33",
	"name": "Sebastian Markbage",
	"bio": "React Core Maintainer at Facebook",
	"github": "sebmarkbage",
	"isSpeaker": true,
	"picture": "./img/speakers/SebastianProfile.jpg",
	"twitter": "sebmarkbage",
	"talks": [{
		"key": "dom-as-a-second-class-citizen",
		"duration": 1800000,
		"endTime": "2015-07-02T18:00:00.000Z",
		"startTime": "2015-07-02T17:30:00.000Z",
		"type": "talk",
		"title": "DOM as a Second-class Citizen",
		"description": "<p>React has always been about the Virtual DOM. A nice way to render HTML (and some of SVG and maybe some Web Components). Although there&#39;s also react-art, react-three, react-canvas, react-curses... Oh, and react-native! Even if you bottom out at HTML, most of what React does really well is rendering to OTHER React components. Meanwhile most projects still try to retrofit our needs into HTML and CSS primitives. I&#39;ll talk about why the DOM is flawed and how it is becoming a second-class citizen in the land of React apps.</p>\n",
		"speakers": ["55826a3ba982d103008c4b33"],
		"id": "55826a3ba982d103008c4b59",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b34",
	"name": "Lee Byron",
	"bio": "Making things at Facebook since 2008: React, GraphQL, Immutable.js, Mobile, JavaScript.",
	"github": "leebyron",
	"isSpeaker": true,
	"picture": "./img/speakers/lee-byron.jpg",
	"twitter": "leeb",
	"talks": [{
		"key": "exploring-graphql",
		"duration": 1800000,
		"endTime": "2015-07-02T12:30:00.000Z",
		"startTime": "2015-07-02T12:00:00.000Z",
		"type": "talk",
		"title": "Exploring GraphQL",
		"description": "<p>At React.js Conf last January, we introduced the idea of GraphQL: a data fetching language that allows clients to declaratively describe their data requirements. Let&#39;s explore more of GraphQL, it&#39;s core principles, how it works, and what makes it a powerful tool.</p>\n",
		"speakers": ["55826a3ba982d103008c4b34"],
		"id": "55826a3ba982d103008c4b52",
		"feedback": {}
	}]
}, {
	"id": "55826a3ba982d103008c4b36",
	"name": "Katiuska Gamero",
	"bio": "Chemical engineer turned web dev in ruby/rails/js/html5, foodie and what have you.",
	"github": "katcita",
	"isOrganiser": true,
	"picture": "./img/organisers/katy.jpg",
	"twitter": "katy_gca",
	"talks": [],
	"isSpeaker": false
}, {
	"id": "55826a3ba982d103008c4b35",
	"name": "Patrick Aljord",
	"bio": "Hacker, entrepreneur, cheese eater. @ngeurope and @reacteurope organizer.",
	"github": "patcito",
	"isOrganiser": true,
	"picture": "./img/organisers/pat.jpg",
	"twitter": "patcito",
	"talks": [],
	"isSpeaker": false
}, {
	"id": "55826a3ba982d103008c4b37",
	"name": "Chris Ramon",
	"bio": "Runner, coder, world traveler and open source software enthusiast, lately hacking on Go, Angular and React.",
	"github": "chris-ramon",
	"isOrganiser": true,
	"picture": "./img/organisers/cramon.jpg",
	"twitter": "cramonn",
	"talks": [],
	"isSpeaker": false
}];

},{}],39:[function(require,module,exports){
'use strict';

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var classnames = require('classnames');

var _require = require('touchstonejs');

var Container = _require.Container;
var createApp = _require.createApp;
var UI = _require.UI;
var View = _require.View;
var ViewManager = _require.ViewManager;

var config = require('./config');
var device = require('./lib/device');

/*
var views = {

	// app
	'home': require('./views/home'),

	// components
	'component-feedback': require('./views/component/feedback'),

	'component-headerbar': require('./views/component/bar-header'),
	'component-headerbar-search': require('./views/component/bar-header-search'),
	'component-alertbar': require('./views/component/bar-alert'),
	'component-actionbar': require('./views/component/bar-action'),
	'component-footerbar': require('./views/component/bar-footer'),

	'component-passcode': require('./views/component/passcode'),
	'component-toggle': require('./views/component/toggle'),
	'component-form': require('./views/component/form'),

	'component-simple-list': require('./views/component/list-simple'),
	'component-complex-list': require('./views/component/list-complex'),
	'component-categorised-list': require('./views/component/list-categorised'),

	// transitions
	'transitions': require('./views/transitions'),
	'transitions-target': require('./views/transitions-target'),

	// details view
	'details': require('./views/details'),
	'radio-list': require('./views/radio-list')
};
*/

// App Config
// ------------------------------

var App = React.createClass({
	displayName: 'App',

	mixins: [createApp()],

	render: function render() {
		var appWrapperClassName = 'app-wrapper device--' + device.platform;

		return React.createElement(
			'div',
			{ className: appWrapperClassName },
			React.createElement(
				ViewManager,
				{ name: 'app', defaultView: 'main' },
				React.createElement(View, { name: 'main', component: MainViewController })
			)
		);
	}
});

// Main Controller
// ------------------------------

var MainViewController = React.createClass({
	displayName: 'MainViewController',

	render: function render() {
		return React.createElement(
			Container,
			null,
			React.createElement(UI.NavigationBar, { name: 'main' }),
			React.createElement(
				ViewManager,
				{ name: 'main', defaultView: 'tabs' },
				React.createElement(View, { name: 'tabs', component: TabViewController })
			)
		);
	}
});

// Tab Controller
// ------------------------------

var lastSelectedTab = 'lists';
var TabViewController = React.createClass({
	displayName: 'TabViewController',

	getInitialState: function getInitialState() {
		return {
			selectedTab: lastSelectedTab
		};
	},
	onViewChange: function onViewChange(nextView) {
		lastSelectedTab = nextView;

		this.setState({
			selectedTab: nextView
		});
	},
	selectTab: function selectTab(tab) {
		var viewProps;
		this.refs.vm.transitionTo(tab.value, {
			transition: 'instant',
			viewProps: viewProps
		});
	},
	render: function render() {
		var selectedTab = this.state.selectedTab;

		if (selectedTab === 'lists' || selectedTab === 'list-simple' || selectedTab === 'list-complex') {
			selectedTab = 'lists';
		}
		if (selectedTab === 'transitions' || selectedTab === 'transitions-target') {
			selectedTab = 'transitions';
		}

		return React.createElement(
			Container,
			null,
			React.createElement(
				ViewManager,
				{ ref: 'vm', name: 'tabs', defaultView: this.state.selectedTab, onViewChange: this.onViewChange },
				React.createElement(View, { name: 'lists', component: require('./views/lists') }),
				React.createElement(View, { name: 'list-simple', component: require('./views/list-simple') }),
				React.createElement(View, { name: 'list-complex', component: require('./views/list-complex') }),
				React.createElement(View, { name: 'details', component: require('./views/details') }),
				React.createElement(View, { name: 'form', component: require('./views/form') }),
				React.createElement(View, { name: 'controls', component: require('./views/controls') }),
				React.createElement(View, { name: 'transitions', component: require('./views/transitions') }),
				React.createElement(View, { name: 'transitions-target', component: require('./views/transitions-target') })
			),
			React.createElement(
				UI.Tabs.Navigator,
				{ value: selectedTab, onChange: this.selectTab },
				React.createElement(
					UI.Tabs.Tab,
					{ value: 'lists' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--lists' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Lists'
					)
				),
				React.createElement(
					UI.Tabs.Tab,
					{ value: 'form' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--forms' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Forms'
					)
				),
				React.createElement(
					UI.Tabs.Tab,
					{ value: 'controls' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--controls' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Controls'
					)
				),
				React.createElement(
					UI.Tabs.Tab,
					{ value: 'transitions' },
					React.createElement('span', { className: 'Tabs-Icon Tabs-Icon--transitions' }),
					React.createElement(
						UI.Tabs.Label,
						null,
						'Transitions'
					)
				)
			)
		);
	}
});

function startApp() {
	React.render(React.createElement(App, null), document.getElementById('app'));
}

function onDeviceReady() {
	StatusBar.styleDefault();
	startApp();
}

if (typeof cordova === 'undefined') {
	startApp();
} else {
	document.addEventListener('deviceready', onDeviceReady, false);
}

},{"./config":40,"./lib/device":41,"./views/controls":42,"./views/details":43,"./views/form":44,"./views/list-complex":45,"./views/list-simple":46,"./views/lists":47,"./views/transitions":49,"./views/transitions-target":48,"classnames":1,"react/addons":undefined,"touchstonejs":12}],40:[function(require,module,exports){
"use strict";

module.exports = {};

},{}],41:[function(require,module,exports){
'use strict';

var map = {
	'Android': /Android/,
	'iOS': /(iPad|iPhone)/
};

var userAgent = window.navigator.userAgent;
var deviceType = 'Browser';

for (var key in map) {
	if (map[key].test(userAgent)) {
		deviceType = key;
	}
}

module.exports = {
	platform: deviceType
};

},{}],42:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var Tappable = require('react-tappable');
var UI = require('touchstonejs').UI;

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Controls'
			};
		}
	},
	render: function render() {
		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'UI Elements'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ component: 'div', to: 'component-toggle', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Toggle'
					)
				),
				React.createElement(
					Link,
					{ component: 'div', to: 'component-passcode', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Passcode / Keypad'
					)
				),
				React.createElement(
					Tappable,
					{ component: 'div', onTap: this.showLoadingPopup, className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Loading Spinner'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Application State'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ component: 'div', to: 'component-alertbar', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Alert Bar'
					)
				),
				React.createElement(
					Link,
					{ component: 'div', to: 'transitions', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'View Transitions'
					)
				),
				React.createElement(
					Link,
					{ component: 'div', to: 'invalid-view', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Invalid View'
					)
				)
			)
		);
	}
});

},{"react":undefined,"react-container":2,"react-tappable":4,"touchstonejs":12}],43:[function(require,module,exports){
'use strict';

var React = require('react'),
    Tappable = require('react-tappable'),
    Dialogs = require('touchstonejs').Dialogs,
    Navigation = require('touchstonejs').Navigation,
    UI = require('touchstonejs').UI;

var Timers = require('react-timers');

module.exports = React.createClass({
	displayName: 'exports',

	mixins: [Navigation, Dialogs, Timers()],

	getDefaultProps: function getDefaultProps() {
		return {
			prevView: 'home'
		};
	},

	getInitialState: function getInitialState() {
		return {
			processing: false,
			formIsValid: false,
			bioValue: this.props.user.bio || ''
		};
	},

	showFlavourList: function showFlavourList() {
		this.showView('radio-list', 'show-from-right', { user: this.props.user, flavour: this.state.flavour });
	},

	handleBioInput: function handleBioInput(event) {
		this.setState({
			bioValue: event.target.value,
			formIsValid: event.target.value.length ? true : false
		});
	},

	processForm: function processForm() {
		var self = this;

		this.setState({ processing: true });

		this.setTimeout(function () {
			self.showView('home', 'fade', {});
		}, 750);
	},

	flashAlert: function flashAlert(alertContent, callback) {
		return callback(this.showAlertDialog({ message: alertContent }));
	},

	render: function render() {

		// fields
		return React.createElement(
			UI.View,
			null,
			React.createElement(
				UI.Headerbar,
				{ type: 'default', label: [this.props.user.name.first, this.props.user.name.last].join(' ') },
				React.createElement(UI.HeaderbarButton, { showView: this.props.prevView, transition: 'reveal-from-right', label: 'Back', icon: 'ion-chevron-left' }),
				React.createElement(UI.LoadingButton, { loading: this.state.processing, disabled: !this.state.formIsValid, onTap: this.processForm, label: 'Save', className: 'Headerbar-button right is-primary' })
			),
			React.createElement(
				UI.ViewContent,
				{ grow: true, scrollable: true },
				React.createElement(
					'div',
					{ className: 'panel panel--first' },
					React.createElement(UI.LabelInput, { label: 'Name', value: [this.props.user.name.first, this.props.user.name.last].join(' '), placeholder: 'Full name', first: true }),
					React.createElement(UI.LabelInput, { label: 'Location', value: this.props.user.location, placeholder: 'Suburb, Country' }),
					React.createElement(UI.LabelInput, { label: 'Joined', value: this.props.user.joinedDate, placeholder: 'Date' }),
					React.createElement(UI.LabelTextarea, { label: 'Bio', value: this.state.bioValue, placeholder: '(required)', onChange: this.handleBioInput })
				),
				React.createElement(
					'div',
					{ className: 'panel' },
					React.createElement(
						Tappable,
						{ onTap: this.showFlavourList, className: 'list-item is-first', component: 'div' },
						React.createElement(
							'div',
							{ className: 'item-inner' },
							'Favourite Icecream',
							React.createElement(
								'div',
								{ className: 'item-note default' },
								React.createElement(
									'div',
									{ className: 'item-note-label' },
									this.props.user.flavour
								),
								React.createElement('div', { className: 'item-note-icon ion-chevron-right' })
							)
						)
					)
				),
				React.createElement(
					Tappable,
					{ onTap: this.flashAlert.bind(this, 'You clicked the Primary Button.'), className: 'panel-button primary', component: 'button' },
					'Primary Button'
				),
				React.createElement(
					Tappable,
					{ onTap: this.flashAlert.bind(this, 'You clicked the Default Button.'), className: 'panel-button', component: 'button' },
					'Default Button'
				),
				React.createElement(
					Tappable,
					{ onTap: this.flashAlert.bind(this, 'You clicked the Danger Button.'), className: 'panel-button danger', component: 'button' },
					'Danger Button'
				)
			)
		);
	}
});
/*<div className="panel-header text-caps">Basic details</div>*/

},{"react":undefined,"react-tappable":4,"react-timers":5,"touchstonejs":12}],44:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var UI = require('touchstonejs').UI;

var scrollable = Container.initScrollable();

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Forms'
			};
		}
	},
	getInitialState: function getInitialState() {
		return {
			flavour: 'strawberry'
		};
	},
	handleFlavourChange: function handleFlavourChange(newFlavour) {
		this.setState({
			flavour: newFlavour
		});
	},
	handleSwitch: function handleSwitch(key, event) {
		var newState = {};
		newState[key] = !this.state[key];

		this.setState(newState);
	},
	render: function render() {

		return React.createElement(
			Container,
			{ scrollable: scrollable },
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Checkbox'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					'div',
					{ className: 'list-item' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						React.createElement(
							'div',
							{ className: 'field-label' },
							'Switch'
						),
						React.createElement(UI.Switch, { onTap: this.handleSwitch.bind(this, 'switchValue'), on: this.state.switchValue })
					)
				),
				React.createElement(
					'div',
					{ className: 'list-item' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						React.createElement(
							'div',
							{ className: 'field-label' },
							'Disabled'
						),
						React.createElement(UI.Switch, { disabled: true })
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Radio'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(UI.RadioList, { value: this.state.flavour, onChange: this.handleFlavourChange, options: [{ label: 'Vanilla', value: 'vanilla' }, { label: 'Chocolate', value: 'chocolate' }, { label: 'Caramel', value: 'caramel' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Banana', value: 'banana' }, { label: 'Lemon', value: 'lemon' }, { label: 'Pastaccio', value: 'pastaccio' }] })
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Inputs'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(UI.Input, { placeholder: 'Default' }),
				React.createElement(UI.Input, { defaultValue: 'With Value', placeholder: 'Placeholder' }),
				React.createElement(UI.Textarea, { defaultValue: 'Longtext is good for bios etc.', placeholder: 'Longtext' })
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Labelled Inputs'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(UI.LabelInput, { type: 'email', label: 'Email', placeholder: 'your.name@example.com' }),
				React.createElement(UI.LabelInput, { type: 'url', label: 'URL', placeholder: 'http://www.yourwebsite.com' }),
				React.createElement(UI.LabelInput, { noedit: true, label: 'No Edit', value: 'Un-editable, scrollable, selectable content' }),
				React.createElement(UI.LabelSelect, { label: 'Flavour', value: this.state.flavour, onChange: this.handleFlavourChange, options: [{ label: 'Vanilla', value: 'vanilla' }, { label: 'Chocolate', value: 'chocolate' }, { label: 'Caramel', value: 'caramel' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Banana', value: 'banana' }, { label: 'Lemon', value: 'lemon' }, { label: 'Pastaccio', value: 'pastaccio' }] })
			)
		);
	}
});

},{"react":undefined,"react-container":2,"touchstonejs":12}],45:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var UI = require('touchstonejs').UI;

var PEOPLE = require('../../data/people');

var ComplexListItem = React.createClass({
	displayName: 'ComplexListItem',

	render: function render() {
		var person = this.props.user;

		var firstName = person.name.split(' ').slice(0, -1).join(' ');
		var lastName = person.name.split(' ').slice(-1).join(' ');

		var initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();

		return React.createElement(
			Link,
			{ to: 'details', transition: 'show-from-right', viewProps: { user: person, prevView: 'component-complex-list' }, className: 'list-item', component: 'div' },
			React.createElement(UI.ItemMedia, { avatar: person.picture, avatarInitials: initials }),
			React.createElement(
				'div',
				{ className: 'item-inner' },
				React.createElement(
					'div',
					{ className: 'item-content' },
					React.createElement(
						'div',
						{ className: 'item-title' },
						person.name
					),
					React.createElement(
						'div',
						{ className: 'item-subtitle' },
						person.bio
					)
				),
				React.createElement(UI.ItemNote, { type: 'default', label: 'More', icon: 'ion-chevron-right' })
			)
		);
	}
});

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation(props, app) {
			return {
				leftArrow: true,
				leftLabel: 'Lists',
				leftAction: function leftAction() {
					app.transitionTo('tabs:lists', { transition: 'reveal-from-right' });
				},
				title: 'Complex List'
			};
		}
	},
	render: function render() {
		var list = PEOPLE.map(function (user, i) {
			return React.createElement(ComplexListItem, { key: 'user_' + i, user: user });
		});

		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(
				'div',
				{ className: 'panel panel--first' },
				list
			)
		);
	}
});

},{"../../data/people":38,"react":undefined,"react-container":2,"touchstonejs":12}],46:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var Tappable = require('react-tappable');
var Timers = require('react-timers');

var PEOPLE = require('../../data/people');

var SimpleListItem = React.createClass({
	displayName: 'SimpleListItem',

	render: function render() {
		return React.createElement(
			Link,
			{ to: 'details', transition: 'show-from-right', viewProps: { user: this.props.user, prevView: 'component-simple-list' }, className: 'list-item is-tappable', component: 'div' },
			React.createElement(
				'div',
				{ className: 'item-inner' },
				React.createElement(
					'div',
					{ className: 'item-title' },
					this.props.user.name
				)
			)
		);
	}
});

var Search = React.createClass({
	displayName: 'Search',

	mixins: [Timers()],

	propTypes: {
		searchString: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},

	componentDidMount: function componentDidMount() {
		var self = this;

		this.setTimeout(function () {
			self.refs.input.getDOMNode().focus();
		}, 1000);
	},

	handleChange: function handleChange(event) {
		this.props.onChange(event.target.value);
	},

	reset: function reset() {
		this.props.onChange('');
		this.refs.input.getDOMNode().focus();
	},

	render: function render() {

		var clearIcon = Boolean(this.props.searchString.length) ? React.createElement(Tappable, { onTap: this.reset, className: 'SearchField__icon SearchField__icon--clear' }) : '';

		return React.createElement(
			'div',
			{ className: 'SearchField' },
			React.createElement('span', { className: 'SearchField__icon SearchField__icon--search' }),
			React.createElement('input', { ref: 'input', value: this.props.searchString, onChange: this.handleChange, className: 'SearchField__input', placeholder: 'Search...' }),
			clearIcon
		);
	}

});

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation(props, app) {
			return {
				leftArrow: true,
				leftLabel: 'Lists',
				leftAction: function leftAction() {
					app.transitionTo('tabs:lists', { transition: 'reveal-from-right' });
				},
				title: 'Simple List'
			};
		}
	},
	getInitialState: function getInitialState() {
		return {
			searchString: ''
		};
	},
	updateSearch: function updateSearch(str) {
		this.setState({ searchString: str });
	},
	render: function render() {
		var list = PEOPLE.map(function (user, i) {
			return React.createElement(SimpleListItem, { key: 'user_' + i, user: user });
		});

		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(Search, { searchString: this.state.searchString, onChange: this.updateSearch }),
			React.createElement(
				'div',
				{ className: 'panel mb-0' },
				list
			)
		);
	}
});

},{"../../data/people":38,"react":undefined,"react-container":2,"react-tappable":4,"react-timers":5,"touchstonejs":12}],47:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Lists'
			};
		}
	},

	render: function render() {
		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Lists'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ to: 'tabs:list-simple', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Simple List'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:list-complex', transition: 'show-from-right', className: 'list-item is-tappable' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Complex List'
					)
				)
			)
		);
	}
});
/* This is covered in other components
<Link component="div" to="component-categorised-list" transition="show-from-right" className="list-item is-tappable">
<div className="item-inner">Categorised List</div>
</Link>*/

},{"react":undefined,"react-container":2,"touchstonejs":12}],48:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var React = require('react');
var Timers = require('react-timers');
var Mixins = require('touchstonejs').Mixins;

module.exports = React.createClass({
	displayName: 'exports',

	mixins: [Mixins.Transitions, Timers()],

	componentDidMount: function componentDidMount() {
		var self = this;

		this.setTimeout(function () {
			self.transitionTo('tabs:transitions', { transition: 'fade' });
		}, 1000);
	},

	render: function render() {
		return React.createElement(
			Container,
			null,
			React.createElement('span', { className: 'ion-ios-photos ion-xxl text-muted' }),
			React.createElement(
				'h2',
				null,
				'Hold on a sec...'
			)
		);
	}
});

},{"react":undefined,"react-container":2,"react-timers":5,"touchstonejs":12}],49:[function(require,module,exports){
'use strict';

var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var UI = require('touchstonejs').UI;

module.exports = React.createClass({
	displayName: 'exports',

	statics: {
		navigationBar: 'main',
		getNavigation: function getNavigation() {
			return {
				title: 'Transitions'
			};
		}
	},
	render: function render() {

		return React.createElement(
			Container,
			{ scrollable: true },
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Default'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'None'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Fade'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'fade', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Fade'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'fade-expand', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Fade Expand'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'fade-contract', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Fade Contract'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Show'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'show-from-left', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Show from Left'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'show-from-right', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Show from Right'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'show-from-top', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Show from Top'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'show-from-bottom', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Show from Bottom'
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'panel-header text-caps' },
				'Reveal'
			),
			React.createElement(
				'div',
				{ className: 'panel' },
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'reveal-from-left', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Reveal from Left'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'reveal-from-right', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Reveal from Right'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'reveal-from-top', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Reveal from Top'
					)
				),
				React.createElement(
					Link,
					{ to: 'tabs:transitions-target', transition: 'reveal-from-bottom', className: 'list-item is-tappable', component: 'div' },
					React.createElement(
						'div',
						{ className: 'item-inner' },
						'Reveal from Bottom'
					)
				)
			)
		);
	}
});

},{"react":undefined,"react-container":2,"touchstonejs":12}]},{},[39])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMtdGFza3Mvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9jbGFzc25hbWVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWNvbnRhaW5lci9saWIvQ29udGFpbmVyLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWNvbnRhaW5lci9ub2RlX21vZHVsZXMvYmxhY2tsaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LXRhcHBhYmxlL2xpYi9UYXBwYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC10aW1lcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9jb25zdGFudHMvdHJhbnNpdGlvbnMuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9jb3JlL0Vycm9yVmlldy5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL2NvcmUvTGluay5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL2NvcmUvVmlldy5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL2NvcmUvVmlld01hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9jb3JlL2FuaW1hdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvbWl4aW5zL1RyYW5zaXRpb24uanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9taXhpbnMvVHJhbnNpdGlvbnMuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi9taXhpbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9BbGVydGJhci5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL0lucHV0LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvSXRlbU1lZGlhLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvSXRlbU5vdGUuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9MYWJlbElucHV0LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvTGFiZWxTZWxlY3QuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9MYWJlbFRleHRhcmVhLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvTmF2aWdhdGlvbkJhci5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL1BvcHVwLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvUG9wdXBJY29uLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvUmFkaW9MaXN0LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvU3dpdGNoLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvVGFicy5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbGliL3VpL1RleHRhcmVhLmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9saWIvdWkvVmlld0NvbnRlbnQuanMiLCJub2RlX21vZHVsZXMvdG91Y2hzdG9uZWpzL2xpYi91aS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90b3VjaHN0b25lanMvbm9kZV9tb2R1bGVzL3R3ZWVuLmpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RvdWNoc3RvbmVqcy9ub2RlX21vZHVsZXMveHRlbmQvbXV0YWJsZS5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvZGF0YS9wZW9wbGUuanMiLCIvVXNlcnMvam9zcy9EZXZlbG9wbWVudC90b3VjaHN0b25lLXN0YXJ0ZXIvc3JjL2pzL2FwcC5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvanMvY29uZmlnLmpzIiwiL1VzZXJzL2pvc3MvRGV2ZWxvcG1lbnQvdG91Y2hzdG9uZS1zdGFydGVyL3NyYy9qcy9saWIvZGV2aWNlLmpzIiwiL1VzZXJzL2pvc3MvRGV2ZWxvcG1lbnQvdG91Y2hzdG9uZS1zdGFydGVyL3NyYy9qcy92aWV3cy9jb250cm9scy5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvanMvdmlld3MvZGV0YWlscy5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvanMvdmlld3MvZm9ybS5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvanMvdmlld3MvbGlzdC1jb21wbGV4LmpzIiwiL1VzZXJzL2pvc3MvRGV2ZWxvcG1lbnQvdG91Y2hzdG9uZS1zdGFydGVyL3NyYy9qcy92aWV3cy9saXN0LXNpbXBsZS5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvanMvdmlld3MvbGlzdHMuanMiLCIvVXNlcnMvam9zcy9EZXZlbG9wbWVudC90b3VjaHN0b25lLXN0YXJ0ZXIvc3JjL2pzL3ZpZXdzL3RyYW5zaXRpb25zLXRhcmdldC5qcyIsIi9Vc2Vycy9qb3NzL0RldmVsb3BtZW50L3RvdWNoc3RvbmUtc3RhcnRlci9zcmMvanMvdmlld3MvdHJhbnNpdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QVMsRUFBQyxZQUFZOztNQUF1QjtLQUFPO0lBQzVLO0FBQUMsU0FBSTtPQUFDLEVBQUUsRUFBQyx5QkFBeUIsRUFBQyxVQUFVLEVBQUMsbUJBQW1CLEVBQUMsU0FBUyxFQUFDLHVCQUF1QixFQUFDLFNBQVMsRUFBQyxLQUFLO0tBQUM7O1FBQUssU0FBUyxFQUFDLFlBQVk7O01BQXdCO0tBQU87SUFDOUs7QUFBQyxTQUFJO09BQUMsRUFBRSxFQUFDLHlCQUF5QixFQUFDLFVBQVUsRUFBQyxpQkFBaUIsRUFBQyxTQUFTLEVBQUMsdUJBQXVCLEVBQUMsU0FBUyxFQUFDLEtBQUs7S0FBQzs7UUFBSyxTQUFTLEVBQUMsWUFBWTs7TUFBc0I7S0FBTztJQUMxSztBQUFDLFNBQUk7T0FBQyxFQUFFLEVBQUMseUJBQXlCLEVBQUMsVUFBVSxFQUFDLG9CQUFvQixFQUFDLFNBQVMsRUFBQyx1QkFBdUIsRUFBQyxTQUFTLEVBQUMsS0FBSztLQUFDOztRQUFLLFNBQVMsRUFBQyxZQUFZOztNQUF5QjtLQUFPO0lBQzNLO0dBQ0ssQ0FDWDtFQUNGO0NBQ0QsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICBDb3B5cmlnaHQgKGMpIDIwMTUgSmVkIFdhdHNvbi5cbiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcbiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXG5cdFx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0aWYgKCFhcmcpIGNvbnRpbnVlO1xuXG5cdFx0XHR2YXIgYXJnVHlwZSA9IHR5cGVvZiBhcmc7XG5cblx0XHRcdGlmICgnc3RyaW5nJyA9PT0gYXJnVHlwZSB8fCAnbnVtYmVyJyA9PT0gYXJnVHlwZSkge1xuXHRcdFx0XHRjbGFzc2VzICs9ICcgJyArIGFyZztcblxuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBjbGFzc05hbWVzLmFwcGx5KG51bGwsIGFyZyk7XG5cblx0XHRcdH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IGFyZ1R5cGUpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0XHRcdGlmIChhcmcuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBhcmdba2V5XSkge1xuXHRcdFx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBrZXk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXMuc3Vic3RyKDEpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzc05hbWVzO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcblx0fVxuXG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5mdW5jdGlvbiBoYXNDaGlsZHJlbldpdGhWZXJ0aWNhbEZpbGwoY2hpbGRyZW4pIHtcblx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXG5cdFJlYWN0LkNoaWxkcmVuLmZvckVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uIChjKSB7XG5cdFx0aWYgKHJlc3VsdCkgcmV0dXJuOyAvLyBlYXJseS1leGl0XG5cdFx0aWYgKCFjKSByZXR1cm47XG5cdFx0aWYgKCFjLnR5cGUpIHJldHVybjtcblxuXHRcdHJlc3VsdCA9ICEhYy50eXBlLnNob3VsZEZpbGxWZXJ0aWNhbFNwYWNlO1xuXHR9KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgQ29udGFpbmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0NvbnRhaW5lcicsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0YWxpZ246IFJlYWN0LlByb3BUeXBlcy5vbmVPZihbJ2VuZCcsICdjZW50ZXInLCAnc3RhcnQnXSksXG5cdFx0ZGlyZWN0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydjb2x1bW4nLCAncm93J10pLFxuXHRcdGp1c3RpZnk6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1JlYWN0LlByb3BUeXBlcy5ib29sLCBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydlbmQnLCAnY2VudGVyJywgJ3N0YXJ0J10pXSksXG5cdFx0Z3JvdzogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0ZmlsbDogUmVhY3QuUHJvcFR5cGVzLmJvb2xcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICh0aGlzLnByb3BzLnNjcm9sbGFibGUgJiYgdGhpcy5wcm9wcy5zY3JvbGxhYmxlLm1vdW50KSB7XG5cdFx0XHR0aGlzLnByb3BzLnNjcm9sbGFibGUubW91bnQodGhpcyk7XG5cdFx0fVxuXHR9LFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuc2Nyb2xsYWJsZSAmJiB0aGlzLnByb3BzLnNjcm9sbGFibGUudW5tb3VudCkge1xuXHRcdFx0dGhpcy5wcm9wcy5zY3JvbGxhYmxlLnVubW91bnQodGhpcyk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgZGlyZWN0aW9uID0gdGhpcy5wcm9wcy5kaXJlY3Rpb247XG5cdFx0aWYgKCFkaXJlY3Rpb24pIHtcblx0XHRcdGlmIChoYXNDaGlsZHJlbldpdGhWZXJ0aWNhbEZpbGwodGhpcy5wcm9wcy5jaGlsZHJlbikpIHtcblx0XHRcdFx0ZGlyZWN0aW9uID0gJ2NvbHVtbic7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGZpbGwgPSB0aGlzLnByb3BzLmZpbGw7XG5cdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ2NvbHVtbicgfHwgdGhpcy5wcm9wcy5zY3JvbGxhYmxlKSB7XG5cdFx0XHRmaWxsID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR2YXIgYWxpZ24gPSB0aGlzLnByb3BzLmFsaWduO1xuXHRcdGlmIChkaXJlY3Rpb24gPT09ICdjb2x1bW4nICYmIGFsaWduID09PSAndG9wJykgYWxpZ24gPSAnc3RhcnQnO1xuXHRcdGlmIChkaXJlY3Rpb24gPT09ICdjb2x1bW4nICYmIGFsaWduID09PSAnYm90dG9tJykgYWxpZ24gPSAnZW5kJztcblx0XHRpZiAoZGlyZWN0aW9uID09PSAncm93JyAmJiBhbGlnbiA9PT0gJ2xlZnQnKSBhbGlnbiA9ICdzdGFydCc7XG5cdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ3JvdycgJiYgYWxpZ24gPT09ICdyaWdodCcpIGFsaWduID0gJ2VuZCc7XG5cblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J0NvbnRhaW5lci0tZmlsbCc6IGZpbGwsXG5cdFx0XHQnQ29udGFpbmVyLS1kaXJlY3Rpb24tY29sdW1uJzogZGlyZWN0aW9uID09PSAnY29sdW1uJyxcblx0XHRcdCdDb250YWluZXItLWRpcmVjdGlvbi1yb3cnOiBkaXJlY3Rpb24gPT09ICdyb3cnLFxuXHRcdFx0J0NvbnRhaW5lci0tYWxpZ24tY2VudGVyJzogYWxpZ24gPT09ICdjZW50ZXInLFxuXHRcdFx0J0NvbnRhaW5lci0tYWxpZ24tc3RhcnQnOiBhbGlnbiA9PT0gJ3N0YXJ0Jyxcblx0XHRcdCdDb250YWluZXItLWFsaWduLWVuZCc6IGFsaWduID09PSAnZW5kJyxcblx0XHRcdCdDb250YWluZXItLWp1c3RpZnktY2VudGVyJzogdGhpcy5wcm9wcy5qdXN0aWZ5ID09PSAnY2VudGVyJyxcblx0XHRcdCdDb250YWluZXItLWp1c3RpZnktc3RhcnQnOiB0aGlzLnByb3BzLmp1c3RpZnkgPT09ICdzdGFydCcsXG5cdFx0XHQnQ29udGFpbmVyLS1qdXN0aWZ5LWVuZCc6IHRoaXMucHJvcHMuanVzdGlmeSA9PT0gJ2VuZCcsXG5cdFx0XHQnQ29udGFpbmVyLS1qdXN0aWZpZWQnOiB0aGlzLnByb3BzLmp1c3RpZnkgPT09IHRydWUsXG5cdFx0XHQnQ29udGFpbmVyLS1zY3JvbGxhYmxlJzogdGhpcy5wcm9wcy5zY3JvbGxhYmxlXG5cdFx0fSk7XG5cblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NsYXNzTmFtZScsICdkaXJlY3Rpb24nLCAnZmlsbCcsICdqdXN0aWZ5JywgJ3Njcm9sbGFibGUnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHRfZXh0ZW5kcyh7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sIHByb3BzKSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZnVuY3Rpb24gaW5pdFNjcm9sbGFibGUoKSB7XG5cdHZhciBwb3M7XG5cdHZhciBzY3JvbGxhYmxlID0ge1xuXHRcdHJlc2V0OiBmdW5jdGlvbiByZXNldCgpIHtcblx0XHRcdHBvcyA9IHsgbGVmdDogMCwgdG9wOiAwIH07XG5cdFx0fSxcblx0XHRtb3VudDogZnVuY3Rpb24gbW91bnQoZWxlbWVudCkge1xuXHRcdFx0dmFyIG5vZGUgPSBSZWFjdC5maW5kRE9NTm9kZShlbGVtZW50KTtcblx0XHRcdG5vZGUuc2Nyb2xsTGVmdCA9IHBvcy5sZWZ0O1xuXHRcdFx0bm9kZS5zY3JvbGxUb3AgPSBwb3MudG9wO1xuXHRcdH0sXG5cdFx0dW5tb3VudDogZnVuY3Rpb24gdW5tb3VudChlbGVtZW50KSB7XG5cdFx0XHR2YXIgbm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKGVsZW1lbnQpO1xuXHRcdFx0cG9zLmxlZnQgPSBub2RlLnNjcm9sbExlZnQ7XG5cdFx0XHRwb3MudG9wID0gbm9kZS5zY3JvbGxUb3A7XG5cdFx0fVxuXHR9O1xuXHRzY3JvbGxhYmxlLnJlc2V0KCk7XG5cdHJldHVybiBzY3JvbGxhYmxlO1xufVxuXG5Db250YWluZXIuaW5pdFNjcm9sbGFibGUgPSBpbml0U2Nyb2xsYWJsZTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29udGFpbmVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBibGFja2xpc3QgKHNyYykge1xuICB2YXIgY29weSA9IHt9LCBmaWx0ZXIgPSBhcmd1bWVudHNbMV1cblxuICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ3N0cmluZycpIHtcbiAgICBmaWx0ZXIgPSB7fVxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmaWx0ZXJbYXJndW1lbnRzW2ldXSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gc3JjKSB7XG4gICAgLy8gYmxhY2tsaXN0P1xuICAgIGlmIChmaWx0ZXJba2V5XSkgY29udGludWVcblxuICAgIGNvcHlba2V5XSA9IHNyY1trZXldXG4gIH1cblxuICByZXR1cm4gY29weVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG4vLyBFbmFibGUgUmVhY3QgVG91Y2ggRXZlbnRzXG5SZWFjdC5pbml0aWFsaXplVG91Y2hFdmVudHModHJ1ZSk7XG5cbmZ1bmN0aW9uIGdldFRvdWNoUHJvcHModG91Y2gpIHtcblx0aWYgKCF0b3VjaCkgcmV0dXJuIHt9O1xuXHRyZXR1cm4ge1xuXHRcdHBhZ2VYOiB0b3VjaC5wYWdlWCxcblx0XHRwYWdlWTogdG91Y2gucGFnZVksXG5cdFx0Y2xpZW50WDogdG91Y2guY2xpZW50WCxcblx0XHRjbGllbnRZOiB0b3VjaC5jbGllbnRZXG5cdH07XG59XG5cbmZ1bmN0aW9uIGlzRGF0YU9yQXJpYVByb3Aoa2V5KSB7XG5cdHJldHVybiBrZXkuaW5kZXhPZignZGF0YS0nKSA9PT0gMCB8fCBrZXkuaW5kZXhPZignYXJpYS0nKSA9PT0gMDtcbn1cblxuZnVuY3Rpb24gZ2V0UGluY2hQcm9wcyh0b3VjaGVzKSB7XG5cdHJldHVybiB7XG5cdFx0dG91Y2hlczogQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHRvdWNoZXMsIGZ1bmN0aW9uIGNvcHlUb3VjaCh0b3VjaCkge1xuXHRcdFx0cmV0dXJuIHsgaWRlbnRpZmllcjogdG91Y2guaWRlbnRpZmllciwgcGFnZVg6IHRvdWNoLnBhZ2VYLCBwYWdlWTogdG91Y2gucGFnZVkgfTtcblx0XHR9KSxcblx0XHRjZW50ZXI6IHsgeDogKHRvdWNoZXNbMF0ucGFnZVggKyB0b3VjaGVzWzFdLnBhZ2VYKSAvIDIsIHk6ICh0b3VjaGVzWzBdLnBhZ2VZICsgdG91Y2hlc1sxXS5wYWdlWSkgLyAyIH0sXG5cdFx0YW5nbGU6IE1hdGguYXRhbigpICogKHRvdWNoZXNbMV0ucGFnZVkgLSB0b3VjaGVzWzBdLnBhZ2VZKSAvICh0b3VjaGVzWzFdLnBhZ2VYIC0gdG91Y2hlc1swXS5wYWdlWCkgKiAxODAgLyBNYXRoLlBJLFxuXHRcdGRpc3RhbmNlOiBNYXRoLnNxcnQoTWF0aC5wb3coTWF0aC5hYnModG91Y2hlc1sxXS5wYWdlWCAtIHRvdWNoZXNbMF0ucGFnZVgpLCAyKSArIE1hdGgucG93KE1hdGguYWJzKHRvdWNoZXNbMV0ucGFnZVkgLSB0b3VjaGVzWzBdLnBhZ2VZKSwgMikpXG5cdH07XG59XG5cbi8qKlxuICogVGFwcGFibGUgTWl4aW5cbiAqID09PT09PT09PT09PT09XG4gKi9cblxudmFyIE1peGluID0ge1xuXHRwcm9wVHlwZXM6IHtcblx0XHRtb3ZlVGhyZXNob2xkOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAvLyBwaXhlbHMgdG8gbW92ZSBiZWZvcmUgY2FuY2VsbGluZyB0YXBcblx0XHRhY3RpdmVEZWxheTogUmVhY3QuUHJvcFR5cGVzLm51bWJlciwgLy8gbXMgdG8gd2FpdCBiZWZvcmUgYWRkaW5nIHRoZSBgLWFjdGl2ZWAgY2xhc3Ncblx0XHRwcmVzc0RlbGF5OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAvLyBtcyB0byB3YWl0IGJlZm9yZSBkZXRlY3RpbmcgYSBwcmVzc1xuXHRcdHByZXNzTW92ZVRocmVzaG9sZDogUmVhY3QuUHJvcFR5cGVzLm51bWJlciwgLy8gcGl4ZWxzIHRvIG1vdmUgYmVmb3JlIGNhbmNlbGxpbmcgcHJlc3Ncblx0XHRwcmV2ZW50RGVmYXVsdDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsIC8vIHdoZXRoZXIgdG8gcHJldmVudERlZmF1bHQgb24gYWxsIGV2ZW50c1xuXHRcdHN0b3BQcm9wYWdhdGlvbjogUmVhY3QuUHJvcFR5cGVzLmJvb2wsIC8vIHdoZXRoZXIgdG8gc3RvcFByb3BhZ2F0aW9uIG9uIGFsbCBldmVudHNcblxuXHRcdG9uVGFwOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gZmlyZXMgd2hlbiBhIHRhcCBpcyBkZXRlY3RlZFxuXHRcdG9uUHJlc3M6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBmaXJlcyB3aGVuIGEgcHJlc3MgaXMgZGV0ZWN0ZWRcblx0XHRvblRvdWNoU3RhcnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBwYXNzLXRocm91Z2ggdG91Y2ggZXZlbnRcblx0XHRvblRvdWNoTW92ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIHBhc3MtdGhyb3VnaCB0b3VjaCBldmVudFxuXHRcdG9uVG91Y2hFbmQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAvLyBwYXNzLXRocm91Z2ggdG91Y2ggZXZlbnRcblx0XHRvbk1vdXNlRG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIHBhc3MtdGhyb3VnaCBtb3VzZSBldmVudFxuXHRcdG9uTW91c2VVcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIHBhc3MtdGhyb3VnaCBtb3VzZSBldmVudFxuXHRcdG9uTW91c2VNb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gcGFzcy10aHJvdWdoIG1vdXNlIGV2ZW50XG5cdFx0b25Nb3VzZU91dDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsIC8vIHBhc3MtdGhyb3VnaCBtb3VzZSBldmVudFxuXG5cdFx0b25QaW5jaFN0YXJ0OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gZmlyZXMgd2hlbiBhIHBpbmNoIGdlc3R1cmUgaXMgc3RhcnRlZFxuXHRcdG9uUGluY2hNb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gZmlyZXMgb24gZXZlcnkgdG91Y2gtbW92ZSB3aGVuIGEgcGluY2ggYWN0aW9uIGlzIGFjdGl2ZVxuXHRcdG9uUGluY2hFbmQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jIC8vIGZpcmVzIHdoZW4gYSBwaW5jaCBhY3Rpb24gZW5kc1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhY3RpdmVEZWxheTogMCxcblx0XHRcdG1vdmVUaHJlc2hvbGQ6IDEwMCxcblx0XHRcdHByZXNzRGVsYXk6IDEwMDAsXG5cdFx0XHRwcmVzc01vdmVUaHJlc2hvbGQ6IDVcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0FjdGl2ZTogZmFsc2UsXG5cdFx0XHR0b3VjaEFjdGl2ZTogZmFsc2UsXG5cdFx0XHRwaW5jaEFjdGl2ZTogZmFsc2Vcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR0aGlzLmNsZWFudXBTY3JvbGxEZXRlY3Rpb24oKTtcblx0XHR0aGlzLmNhbmNlbFByZXNzRGV0ZWN0aW9uKCk7XG5cdFx0dGhpcy5jbGVhckFjdGl2ZVRpbWVvdXQoKTtcblx0fSxcblxuXHRwcm9jZXNzRXZlbnQ6IGZ1bmN0aW9uIHByb2Nlc3NFdmVudChldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLnByZXZlbnREZWZhdWx0KSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmICh0aGlzLnByb3BzLnN0b3BQcm9wYWdhdGlvbikgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH0sXG5cblx0b25Ub3VjaFN0YXJ0OiBmdW5jdGlvbiBvblRvdWNoU3RhcnQoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5vblRvdWNoU3RhcnQgJiYgdGhpcy5wcm9wcy5vblRvdWNoU3RhcnQoZXZlbnQpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdHRoaXMucHJvY2Vzc0V2ZW50KGV2ZW50KTtcblx0XHR3aW5kb3cuX2Jsb2NrTW91c2VFdmVudHMgPSB0cnVlO1xuXHRcdGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGhpcy5faW5pdGlhbFRvdWNoID0gdGhpcy5fbGFzdFRvdWNoID0gZ2V0VG91Y2hQcm9wcyhldmVudC50b3VjaGVzWzBdKTtcblx0XHRcdHRoaXMuaW5pdFNjcm9sbERldGVjdGlvbigpO1xuXHRcdFx0dGhpcy5pbml0UHJlc3NEZXRlY3Rpb24oZXZlbnQsIHRoaXMuZW5kVG91Y2gpO1xuXHRcdFx0dGhpcy5fYWN0aXZlVGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5tYWtlQWN0aXZlLCB0aGlzLnByb3BzLmFjdGl2ZURlbGF5KTtcblx0XHR9IGVsc2UgaWYgKCh0aGlzLnByb3BzLm9uUGluY2hTdGFydCB8fCB0aGlzLnByb3BzLm9uUGluY2hNb3ZlIHx8IHRoaXMucHJvcHMub25QaW5jaEVuZCkgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDIpIHtcblx0XHRcdHRoaXMub25QaW5jaFN0YXJ0KGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0bWFrZUFjdGl2ZTogZnVuY3Rpb24gbWFrZUFjdGl2ZSgpIHtcblx0XHRpZiAoIXRoaXMuaXNNb3VudGVkKCkpIHJldHVybjtcblx0XHR0aGlzLmNsZWFyQWN0aXZlVGltZW91dCgpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNBY3RpdmU6IHRydWVcblx0XHR9KTtcblx0fSxcblxuXHRjbGVhckFjdGl2ZVRpbWVvdXQ6IGZ1bmN0aW9uIGNsZWFyQWN0aXZlVGltZW91dCgpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fYWN0aXZlVGltZW91dCk7XG5cdFx0dGhpcy5fYWN0aXZlVGltZW91dCA9IGZhbHNlO1xuXHR9LFxuXG5cdG9uUGluY2hTdGFydDogZnVuY3Rpb24gb25QaW5jaFN0YXJ0KGV2ZW50KSB7XG5cdFx0Ly8gaW4gY2FzZSB0aGUgdHdvIHRvdWNoZXMgZGlkbid0IHN0YXJ0IGV4YWN0bHkgYXQgdGhlIHNhbWUgdGltZVxuXHRcdGlmICh0aGlzLl9pbml0aWFsVG91Y2gpIHtcblx0XHRcdHRoaXMuZW5kVG91Y2goKTtcblx0XHR9XG5cdFx0dmFyIHRvdWNoZXMgPSBldmVudC50b3VjaGVzO1xuXHRcdHRoaXMuX2luaXRpYWxQaW5jaCA9IGdldFBpbmNoUHJvcHModG91Y2hlcyk7XG5cdFx0dGhpcy5faW5pdGlhbFBpbmNoID0gX2V4dGVuZHModGhpcy5faW5pdGlhbFBpbmNoLCB7XG5cdFx0XHRkaXNwbGFjZW1lbnQ6IHsgeDogMCwgeTogMCB9LFxuXHRcdFx0ZGlzcGxhY2VtZW50VmVsb2NpdHk6IHsgeDogMCwgeTogMCB9LFxuXHRcdFx0cm90YXRpb246IDAsXG5cdFx0XHRyb3RhdGlvblZlbG9jaXR5OiAwLFxuXHRcdFx0em9vbTogMSxcblx0XHRcdHpvb21WZWxvY2l0eTogMCxcblx0XHRcdHRpbWU6IERhdGUubm93KClcblx0XHR9KTtcblx0XHR0aGlzLl9sYXN0UGluY2ggPSB0aGlzLl9pbml0aWFsUGluY2g7XG5cdFx0dGhpcy5wcm9wcy5vblBpbmNoU3RhcnQgJiYgdGhpcy5wcm9wcy5vblBpbmNoU3RhcnQodGhpcy5faW5pdGlhbFBpbmNoLCBldmVudCk7XG5cdH0sXG5cblx0b25QaW5jaE1vdmU6IGZ1bmN0aW9uIG9uUGluY2hNb3ZlKGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMuX2luaXRpYWxUb3VjaCkge1xuXHRcdFx0dGhpcy5lbmRUb3VjaCgpO1xuXHRcdH1cblx0XHR2YXIgdG91Y2hlcyA9IGV2ZW50LnRvdWNoZXM7XG5cdFx0aWYgKHRvdWNoZXMubGVuZ3RoICE9PSAyKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vblBpbmNoRW5kKGV2ZW50KSAvLyBiYWlsIG91dCBiZWZvcmUgZGlzYXN0ZXJcblx0XHRcdDtcblx0XHR9XG5cblx0XHR2YXIgY3VycmVudFBpbmNoID0gdG91Y2hlc1swXS5pZGVudGlmaWVyID09PSB0aGlzLl9pbml0aWFsUGluY2gudG91Y2hlc1swXS5pZGVudGlmaWVyICYmIHRvdWNoZXNbMV0uaWRlbnRpZmllciA9PT0gdGhpcy5faW5pdGlhbFBpbmNoLnRvdWNoZXNbMV0uaWRlbnRpZmllciA/IGdldFBpbmNoUHJvcHModG91Y2hlcykgLy8gdGhlIHRvdWNoZXMgYXJlIGluIHRoZSBjb3JyZWN0IG9yZGVyXG5cdFx0OiB0b3VjaGVzWzFdLmlkZW50aWZpZXIgPT09IHRoaXMuX2luaXRpYWxQaW5jaC50b3VjaGVzWzBdLmlkZW50aWZpZXIgJiYgdG91Y2hlc1swXS5pZGVudGlmaWVyID09PSB0aGlzLl9pbml0aWFsUGluY2gudG91Y2hlc1sxXS5pZGVudGlmaWVyID8gZ2V0UGluY2hQcm9wcyh0b3VjaGVzLnJldmVyc2UoKSkgLy8gdGhlIHRvdWNoZXMgaGF2ZSBzb21laG93IGNoYW5nZWQgb3JkZXJcblx0XHQ6IGdldFBpbmNoUHJvcHModG91Y2hlcyk7IC8vIHNvbWV0aGluZyBpcyB3cm9uZywgYnV0IHdlIHN0aWxsIGhhdmUgdHdvIHRvdWNoLXBvaW50cywgc28gd2UgdHJ5IG5vdCB0byBmYWlsXG5cblx0XHRjdXJyZW50UGluY2guZGlzcGxhY2VtZW50ID0ge1xuXHRcdFx0eDogY3VycmVudFBpbmNoLmNlbnRlci54IC0gdGhpcy5faW5pdGlhbFBpbmNoLmNlbnRlci54LFxuXHRcdFx0eTogY3VycmVudFBpbmNoLmNlbnRlci55IC0gdGhpcy5faW5pdGlhbFBpbmNoLmNlbnRlci55XG5cdFx0fTtcblxuXHRcdGN1cnJlbnRQaW5jaC50aW1lID0gRGF0ZS5ub3coKTtcblx0XHR2YXIgdGltZVNpbmNlTGFzdFBpbmNoID0gY3VycmVudFBpbmNoLnRpbWUgLSB0aGlzLl9sYXN0UGluY2gudGltZTtcblxuXHRcdGN1cnJlbnRQaW5jaC5kaXNwbGFjZW1lbnRWZWxvY2l0eSA9IHtcblx0XHRcdHg6IChjdXJyZW50UGluY2guZGlzcGxhY2VtZW50LnggLSB0aGlzLl9sYXN0UGluY2guZGlzcGxhY2VtZW50LngpIC8gdGltZVNpbmNlTGFzdFBpbmNoLFxuXHRcdFx0eTogKGN1cnJlbnRQaW5jaC5kaXNwbGFjZW1lbnQueSAtIHRoaXMuX2xhc3RQaW5jaC5kaXNwbGFjZW1lbnQueSkgLyB0aW1lU2luY2VMYXN0UGluY2hcblx0XHR9O1xuXG5cdFx0Y3VycmVudFBpbmNoLnJvdGF0aW9uID0gY3VycmVudFBpbmNoLmFuZ2xlIC0gdGhpcy5faW5pdGlhbFBpbmNoLmFuZ2xlO1xuXHRcdGN1cnJlbnRQaW5jaC5yb3RhdGlvblZlbG9jaXR5ID0gY3VycmVudFBpbmNoLnJvdGF0aW9uIC0gdGhpcy5fbGFzdFBpbmNoLnJvdGF0aW9uIC8gdGltZVNpbmNlTGFzdFBpbmNoO1xuXG5cdFx0Y3VycmVudFBpbmNoLnpvb20gPSBjdXJyZW50UGluY2guZGlzdGFuY2UgLyB0aGlzLl9pbml0aWFsUGluY2guZGlzdGFuY2U7XG5cdFx0Y3VycmVudFBpbmNoLnpvb21WZWxvY2l0eSA9IChjdXJyZW50UGluY2guem9vbSAtIHRoaXMuX2xhc3RQaW5jaC56b29tKSAvIHRpbWVTaW5jZUxhc3RQaW5jaDtcblxuXHRcdHRoaXMucHJvcHMub25QaW5jaE1vdmUgJiYgdGhpcy5wcm9wcy5vblBpbmNoTW92ZShjdXJyZW50UGluY2gsIGV2ZW50KTtcblxuXHRcdHRoaXMuX2xhc3RQaW5jaCA9IGN1cnJlbnRQaW5jaDtcblx0fSxcblxuXHRvblBpbmNoRW5kOiBmdW5jdGlvbiBvblBpbmNoRW5kKGV2ZW50KSB7XG5cdFx0Ly8gVE9ETyB1c2UgaGVscGVyIHRvIG9yZGVyIHRvdWNoZXMgYnkgaWRlbnRpZmllciBhbmQgdXNlIGFjdHVhbCB2YWx1ZXMgb24gdG91Y2hFbmQuXG5cdFx0dmFyIGN1cnJlbnRQaW5jaCA9IF9leHRlbmRzKHt9LCB0aGlzLl9sYXN0UGluY2gpO1xuXHRcdGN1cnJlbnRQaW5jaC50aW1lID0gRGF0ZS5ub3coKTtcblxuXHRcdGlmIChjdXJyZW50UGluY2gudGltZSAtIHRoaXMuX2xhc3RQaW5jaC50aW1lID4gMTYpIHtcblx0XHRcdGN1cnJlbnRQaW5jaC5kaXNwbGFjZW1lbnRWZWxvY2l0eSA9IDA7XG5cdFx0XHRjdXJyZW50UGluY2gucm90YXRpb25WZWxvY2l0eSA9IDA7XG5cdFx0XHRjdXJyZW50UGluY2guem9vbVZlbG9jaXR5ID0gMDtcblx0XHR9XG5cblx0XHR0aGlzLnByb3BzLm9uUGluY2hFbmQgJiYgdGhpcy5wcm9wcy5vblBpbmNoRW5kKGN1cnJlbnRQaW5jaCwgZXZlbnQpO1xuXG5cdFx0dGhpcy5faW5pdGlhbFBpbmNoID0gdGhpcy5fbGFzdFBpbmNoID0gbnVsbDtcblxuXHRcdC8vIElmIG9uZSBmaW5nZXIgaXMgc3RpbGwgb24gc2NyZWVuLCBpdCBzaG91bGQgc3RhcnQgYSBuZXcgdG91Y2ggZXZlbnQgZm9yIHN3aXBpbmcgZXRjXG5cdFx0Ly8gQnV0IGl0IHNob3VsZCBuZXZlciBmaXJlIGFuIG9uVGFwIG9yIG9uUHJlc3MgZXZlbnQuXG5cdFx0Ly8gU2luY2UgdGhlcmUgaXMgbm8gc3VwcG9ydCBzd2lwZXMgeWV0LCB0aGlzIHNob3VsZCBiZSBkaXNyZWdhcmRlZCBmb3Igbm93XG5cdFx0Ly8gaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0Ly8gXHR0aGlzLm9uVG91Y2hTdGFydChldmVudCk7XG5cdFx0Ly8gfVxuXHR9LFxuXG5cdGluaXRTY3JvbGxEZXRlY3Rpb246IGZ1bmN0aW9uIGluaXRTY3JvbGxEZXRlY3Rpb24oKSB7XG5cdFx0dGhpcy5fc2Nyb2xsUG9zID0geyB0b3A6IDAsIGxlZnQ6IDAgfTtcblx0XHR0aGlzLl9zY3JvbGxQYXJlbnRzID0gW107XG5cdFx0dGhpcy5fc2Nyb2xsUGFyZW50UG9zID0gW107XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcblx0XHR3aGlsZSAobm9kZSkge1xuXHRcdFx0aWYgKG5vZGUuc2Nyb2xsSGVpZ2h0ID4gbm9kZS5vZmZzZXRIZWlnaHQgfHwgbm9kZS5zY3JvbGxXaWR0aCA+IG5vZGUub2Zmc2V0V2lkdGgpIHtcblx0XHRcdFx0dGhpcy5fc2Nyb2xsUGFyZW50cy5wdXNoKG5vZGUpO1xuXHRcdFx0XHR0aGlzLl9zY3JvbGxQYXJlbnRQb3MucHVzaChub2RlLnNjcm9sbFRvcCArIG5vZGUuc2Nyb2xsTGVmdCk7XG5cdFx0XHRcdHRoaXMuX3Njcm9sbFBvcy50b3AgKz0gbm9kZS5zY3JvbGxUb3A7XG5cdFx0XHRcdHRoaXMuX3Njcm9sbFBvcy5sZWZ0ICs9IG5vZGUuc2Nyb2xsTGVmdDtcblx0XHRcdH1cblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG5cdFx0fVxuXHR9LFxuXG5cdGNhbGN1bGF0ZU1vdmVtZW50OiBmdW5jdGlvbiBjYWxjdWxhdGVNb3ZlbWVudCh0b3VjaCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR4OiBNYXRoLmFicyh0b3VjaC5jbGllbnRYIC0gdGhpcy5faW5pdGlhbFRvdWNoLmNsaWVudFgpLFxuXHRcdFx0eTogTWF0aC5hYnModG91Y2guY2xpZW50WSAtIHRoaXMuX2luaXRpYWxUb3VjaC5jbGllbnRZKVxuXHRcdH07XG5cdH0sXG5cblx0ZGV0ZWN0U2Nyb2xsOiBmdW5jdGlvbiBkZXRlY3RTY3JvbGwoKSB7XG5cdFx0dmFyIGN1cnJlbnRTY3JvbGxQb3MgPSB7IHRvcDogMCwgbGVmdDogMCB9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fc2Nyb2xsUGFyZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y3VycmVudFNjcm9sbFBvcy50b3AgKz0gdGhpcy5fc2Nyb2xsUGFyZW50c1tpXS5zY3JvbGxUb3A7XG5cdFx0XHRjdXJyZW50U2Nyb2xsUG9zLmxlZnQgKz0gdGhpcy5fc2Nyb2xsUGFyZW50c1tpXS5zY3JvbGxMZWZ0O1xuXHRcdH1cblx0XHRyZXR1cm4gIShjdXJyZW50U2Nyb2xsUG9zLnRvcCA9PT0gdGhpcy5fc2Nyb2xsUG9zLnRvcCAmJiBjdXJyZW50U2Nyb2xsUG9zLmxlZnQgPT09IHRoaXMuX3Njcm9sbFBvcy5sZWZ0KTtcblx0fSxcblxuXHRjbGVhbnVwU2Nyb2xsRGV0ZWN0aW9uOiBmdW5jdGlvbiBjbGVhbnVwU2Nyb2xsRGV0ZWN0aW9uKCkge1xuXHRcdHRoaXMuX3Njcm9sbFBhcmVudHMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5fc2Nyb2xsUG9zID0gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdGluaXRQcmVzc0RldGVjdGlvbjogZnVuY3Rpb24gaW5pdFByZXNzRGV0ZWN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xuXHRcdGlmICghdGhpcy5wcm9wcy5vblByZXNzKSByZXR1cm47XG5cdFx0dGhpcy5fcHJlc3NUaW1lb3V0ID0gc2V0VGltZW91dCgoZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5wcm9wcy5vblByZXNzKGV2ZW50KTtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fSkuYmluZCh0aGlzKSwgdGhpcy5wcm9wcy5wcmVzc0RlbGF5KTtcblx0fSxcblxuXHRjYW5jZWxQcmVzc0RldGVjdGlvbjogZnVuY3Rpb24gY2FuY2VsUHJlc3NEZXRlY3Rpb24oKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3ByZXNzVGltZW91dCk7XG5cdH0sXG5cblx0b25Ub3VjaE1vdmU6IGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMuX2luaXRpYWxUb3VjaCkge1xuXHRcdFx0dGhpcy5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuXG5cdFx0XHRpZiAodGhpcy5kZXRlY3RTY3JvbGwoKSkgcmV0dXJuIHRoaXMuZW5kVG91Y2goZXZlbnQpO1xuXG5cdFx0XHR0aGlzLnByb3BzLm9uVG91Y2hNb3ZlICYmIHRoaXMucHJvcHMub25Ub3VjaE1vdmUoZXZlbnQpO1xuXHRcdFx0dGhpcy5fbGFzdFRvdWNoID0gZ2V0VG91Y2hQcm9wcyhldmVudC50b3VjaGVzWzBdKTtcblx0XHRcdHZhciBtb3ZlbWVudCA9IHRoaXMuY2FsY3VsYXRlTW92ZW1lbnQodGhpcy5fbGFzdFRvdWNoKTtcblx0XHRcdGlmIChtb3ZlbWVudC54ID4gdGhpcy5wcm9wcy5wcmVzc01vdmVUaHJlc2hvbGQgfHwgbW92ZW1lbnQueSA+IHRoaXMucHJvcHMucHJlc3NNb3ZlVGhyZXNob2xkKSB7XG5cdFx0XHRcdHRoaXMuY2FuY2VsUHJlc3NEZXRlY3Rpb24oKTtcblx0XHRcdH1cblx0XHRcdGlmIChtb3ZlbWVudC54ID4gdGhpcy5wcm9wcy5tb3ZlVGhyZXNob2xkIHx8IG1vdmVtZW50LnkgPiB0aGlzLnByb3BzLm1vdmVUaHJlc2hvbGQpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNBY3RpdmUpIHtcblx0XHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRcdGlzQWN0aXZlOiBmYWxzZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2FjdGl2ZVRpbWVvdXQpIHtcblx0XHRcdFx0XHR0aGlzLmNsZWFyQWN0aXZlVGltZW91dCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIXRoaXMuc3RhdGUuaXNBY3RpdmUgJiYgIXRoaXMuX2FjdGl2ZVRpbWVvdXQpIHtcblx0XHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRcdGlzQWN0aXZlOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMuX2luaXRpYWxQaW5jaCAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0dGhpcy5vblBpbmNoTW92ZShldmVudCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fSxcblxuXHRvblRvdWNoRW5kOiBmdW5jdGlvbiBvblRvdWNoRW5kKGV2ZW50KSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdGlmICh0aGlzLl9pbml0aWFsVG91Y2gpIHtcblx0XHRcdHRoaXMucHJvY2Vzc0V2ZW50KGV2ZW50KTtcblx0XHRcdHZhciBhZnRlckVuZFRvdWNoO1xuXHRcdFx0dmFyIG1vdmVtZW50ID0gdGhpcy5jYWxjdWxhdGVNb3ZlbWVudCh0aGlzLl9sYXN0VG91Y2gpO1xuXHRcdFx0aWYgKG1vdmVtZW50LnggPD0gdGhpcy5wcm9wcy5tb3ZlVGhyZXNob2xkICYmIG1vdmVtZW50LnkgPD0gdGhpcy5wcm9wcy5tb3ZlVGhyZXNob2xkICYmIHRoaXMucHJvcHMub25UYXApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0YWZ0ZXJFbmRUb3VjaCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgZmluYWxQYXJlbnRTY3JvbGxQb3MgPSBfdGhpcy5fc2Nyb2xsUGFyZW50cy5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBub2RlLnNjcm9sbFRvcCArIG5vZGUuc2Nyb2xsTGVmdDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR2YXIgc3RvcHBlZE1vbWVudHVtU2Nyb2xsID0gX3RoaXMuX3Njcm9sbFBhcmVudFBvcy5zb21lKGZ1bmN0aW9uIChlbmQsIGkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlbmQgIT09IGZpbmFsUGFyZW50U2Nyb2xsUG9zW2ldO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmICghc3RvcHBlZE1vbWVudHVtU2Nyb2xsKSB7XG5cdFx0XHRcdFx0XHRfdGhpcy5wcm9wcy5vblRhcChldmVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lbmRUb3VjaChldmVudCwgYWZ0ZXJFbmRUb3VjaCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9pbml0aWFsUGluY2ggJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggKyBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPT09IDIpIHtcblx0XHRcdHRoaXMub25QaW5jaEVuZChldmVudCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fSxcblxuXHRlbmRUb3VjaDogZnVuY3Rpb24gZW5kVG91Y2goZXZlbnQsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5jYW5jZWxQcmVzc0RldGVjdGlvbigpO1xuXHRcdHRoaXMuY2xlYXJBY3RpdmVUaW1lb3V0KCk7XG5cdFx0aWYgKGV2ZW50ICYmIHRoaXMucHJvcHMub25Ub3VjaEVuZCkge1xuXHRcdFx0dGhpcy5wcm9wcy5vblRvdWNoRW5kKGV2ZW50KTtcblx0XHR9XG5cdFx0dGhpcy5faW5pdGlhbFRvdWNoID0gbnVsbDtcblx0XHR0aGlzLl9sYXN0VG91Y2ggPSBudWxsO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzQWN0aXZlKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNBY3RpdmU6IGZhbHNlXG5cdFx0XHR9LCBjYWxsYmFjayk7XG5cdFx0fSBlbHNlIGlmIChjYWxsYmFjaykge1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cdH0sXG5cblx0b25Nb3VzZURvd246IGZ1bmN0aW9uIG9uTW91c2VEb3duKGV2ZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5fYmxvY2tNb3VzZUV2ZW50cykge1xuXHRcdFx0d2luZG93Ll9ibG9ja01vdXNlRXZlbnRzID0gZmFsc2U7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICh0aGlzLnByb3BzLm9uTW91c2VEb3duICYmIHRoaXMucHJvcHMub25Nb3VzZURvd24oZXZlbnQpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdHRoaXMucHJvY2Vzc0V2ZW50KGV2ZW50KTtcblx0XHR0aGlzLmluaXRQcmVzc0RldGVjdGlvbihldmVudCwgdGhpcy5lbmRNb3VzZUV2ZW50KTtcblx0XHR0aGlzLl9tb3VzZURvd24gPSB0cnVlO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNBY3RpdmU6IHRydWVcblx0XHR9KTtcblx0fSxcblxuXHRvbk1vdXNlTW92ZTogZnVuY3Rpb24gb25Nb3VzZU1vdmUoZXZlbnQpIHtcblx0XHRpZiAod2luZG93Ll9ibG9ja01vdXNlRXZlbnRzIHx8ICF0aGlzLl9tb3VzZURvd24pIHJldHVybjtcblx0XHR0aGlzLnByb2Nlc3NFdmVudChldmVudCk7XG5cdFx0dGhpcy5wcm9wcy5vbk1vdXNlTW92ZSAmJiB0aGlzLnByb3BzLm9uTW91c2VNb3ZlKGV2ZW50KTtcblx0fSxcblxuXHRvbk1vdXNlVXA6IGZ1bmN0aW9uIG9uTW91c2VVcChldmVudCkge1xuXHRcdGlmICh3aW5kb3cuX2Jsb2NrTW91c2VFdmVudHMgfHwgIXRoaXMuX21vdXNlRG93bikgcmV0dXJuO1xuXHRcdHRoaXMucHJvY2Vzc0V2ZW50KGV2ZW50KTtcblx0XHR0aGlzLnByb3BzLm9uTW91c2VVcCAmJiB0aGlzLnByb3BzLm9uTW91c2VVcChldmVudCk7XG5cdFx0dGhpcy5wcm9wcy5vblRhcCAmJiB0aGlzLnByb3BzLm9uVGFwKGV2ZW50KTtcblx0XHR0aGlzLmVuZE1vdXNlRXZlbnQoKTtcblx0fSxcblxuXHRvbk1vdXNlT3V0OiBmdW5jdGlvbiBvbk1vdXNlT3V0KGV2ZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5fYmxvY2tNb3VzZUV2ZW50cyB8fCAhdGhpcy5fbW91c2VEb3duKSByZXR1cm47XG5cdFx0dGhpcy5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuXHRcdHRoaXMucHJvcHMub25Nb3VzZU91dCAmJiB0aGlzLnByb3BzLm9uTW91c2VPdXQoZXZlbnQpO1xuXHRcdHRoaXMuZW5kTW91c2VFdmVudCgpO1xuXHR9LFxuXG5cdGVuZE1vdXNlRXZlbnQ6IGZ1bmN0aW9uIGVuZE1vdXNlRXZlbnQoKSB7XG5cdFx0dGhpcy5jYW5jZWxQcmVzc0RldGVjdGlvbigpO1xuXHRcdHRoaXMuX21vdXNlRG93biA9IGZhbHNlO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNBY3RpdmU6IGZhbHNlXG5cdFx0fSk7XG5cdH0sXG5cblx0dG91Y2hTdHlsZXM6IGZ1bmN0aW9uIHRvdWNoU3R5bGVzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRXZWJraXRUYXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknLFxuXHRcdFx0V2Via2l0VG91Y2hDYWxsb3V0OiAnbm9uZScsXG5cdFx0XHRXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsXG5cdFx0XHRLaHRtbFVzZXJTZWxlY3Q6ICdub25lJyxcblx0XHRcdE1velVzZXJTZWxlY3Q6ICdub25lJyxcblx0XHRcdG1zVXNlclNlbGVjdDogJ25vbmUnLFxuXHRcdFx0dXNlclNlbGVjdDogJ25vbmUnLFxuXHRcdFx0Y3Vyc29yOiAncG9pbnRlcidcblx0XHR9O1xuXHR9LFxuXG5cdGhhbmRsZXJzOiBmdW5jdGlvbiBoYW5kbGVycygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0b25Ub3VjaFN0YXJ0OiB0aGlzLm9uVG91Y2hTdGFydCxcblx0XHRcdG9uVG91Y2hNb3ZlOiB0aGlzLm9uVG91Y2hNb3ZlLFxuXHRcdFx0b25Ub3VjaEVuZDogdGhpcy5vblRvdWNoRW5kLFxuXHRcdFx0b25Nb3VzZURvd246IHRoaXMub25Nb3VzZURvd24sXG5cdFx0XHRvbk1vdXNlVXA6IHRoaXMub25Nb3VzZVVwLFxuXHRcdFx0b25Nb3VzZU1vdmU6IHRoaXMub25Nb3VzZU1vdmUsXG5cdFx0XHRvbk1vdXNlT3V0OiB0aGlzLm9uTW91c2VPdXRcblx0XHR9O1xuXHR9XG59O1xuXG4vKipcbiAqIFRhcHBhYmxlIENvbXBvbmVudFxuICogPT09PT09PT09PT09PT09PT09XG4gKi9cblxudmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1RhcHBhYmxlJyxcblxuXHRtaXhpbnM6IFtNaXhpbl0sXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0Y29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuYW55LCAvLyBjb21wb25lbnQgdG8gY3JlYXRlXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAvLyBvcHRpb25hbCBjbGFzc05hbWVcblx0XHRjbGFzc0Jhc2U6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsIC8vIGJhc2UgZm9yIGdlbmVyYXRlZCBjbGFzc05hbWVzXG5cdFx0c3R5bGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsIC8vIGFkZGl0aW9uYWwgc3R5bGUgcHJvcGVydGllcyBmb3IgdGhlIGNvbXBvbmVudFxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCAvLyBvbmx5IGFwcGxpZXMgdG8gYnV0dG9uc1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb21wb25lbnQ6ICdzcGFuJyxcblx0XHRcdGNsYXNzQmFzZTogJ1RhcHBhYmxlJ1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIHByb3BzID0gdGhpcy5wcm9wcztcblx0XHR2YXIgY2xhc3NOYW1lID0gcHJvcHMuY2xhc3NCYXNlICsgKHRoaXMuc3RhdGUuaXNBY3RpdmUgPyAnLWFjdGl2ZScgOiAnLWluYWN0aXZlJyk7XG5cblx0XHRpZiAocHJvcHMuY2xhc3NOYW1lKSB7XG5cdFx0XHRjbGFzc05hbWUgKz0gJyAnICsgcHJvcHMuY2xhc3NOYW1lO1xuXHRcdH1cblxuXHRcdHZhciBzdHlsZSA9IHt9O1xuXHRcdF9leHRlbmRzKHN0eWxlLCB0aGlzLnRvdWNoU3R5bGVzKCksIHByb3BzLnN0eWxlKTtcblxuXHRcdHZhciBuZXdDb21wb25lbnRQcm9wcyA9IF9leHRlbmRzKHt9LCBwcm9wcywge1xuXHRcdFx0c3R5bGU6IHN0eWxlLFxuXHRcdFx0Y2xhc3NOYW1lOiBjbGFzc05hbWUsXG5cdFx0XHRkaXNhYmxlZDogcHJvcHMuZGlzYWJsZWQsXG5cdFx0XHRoYW5kbGVyczogdGhpcy5oYW5kbGVyc1xuXHRcdH0sIHRoaXMuaGFuZGxlcnMoKSk7XG5cblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMub25UYXA7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLm9uUHJlc3M7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLm9uUGluY2hTdGFydDtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMub25QaW5jaE1vdmU7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLm9uUGluY2hFbmQ7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLm1vdmVUaHJlc2hvbGQ7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLnByZXNzRGVsYXk7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLnByZXNzTW92ZVRocmVzaG9sZDtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMucHJldmVudERlZmF1bHQ7XG5cdFx0ZGVsZXRlIG5ld0NvbXBvbmVudFByb3BzLnN0b3BQcm9wYWdhdGlvbjtcblx0XHRkZWxldGUgbmV3Q29tcG9uZW50UHJvcHMuY29tcG9uZW50O1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQocHJvcHMuY29tcG9uZW50LCBuZXdDb21wb25lbnRQcm9wcywgcHJvcHMuY2hpbGRyZW4pO1xuXHR9XG59KTtcblxuQ29tcG9uZW50Lk1peGluID0gTWl4aW47XG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFRpbWVycyAoKSB7XG4gIHZhciBpbnRlcnZhbHMgPSBbXVxuICB2YXIgdGltZW91dHMgPSBbXVxuXG4gIHJldHVybiB7XG4gICAgY2xlYXJJbnRlcnZhbHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGludGVydmFscy5mb3JFYWNoKGNsZWFySW50ZXJ2YWwpXG4gICAgfSxcblxuICAgIGNsZWFyVGltZW91dHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRpbWVvdXRzLmZvckVhY2goY2xlYXJUaW1lb3V0KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGludGVydmFscyA9IFtdXG4gICAgICB0aW1lb3V0cyA9IFtdXG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsZWFySW50ZXJ2YWxzKClcbiAgICAgIHRoaXMuY2xlYXJUaW1lb3V0cygpXG4gICAgfSxcblxuICAgIGNvdW50RG93bjogZnVuY3Rpb24gKGNhbGxiYWNrLCB0aW1lb3V0LCBpbnRlcnZhbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICB2YXIgc2xlZXAgPSBNYXRoLm1pbih0aW1lb3V0LCBpbnRlcnZhbClcblxuICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRpbWVvdXQgLSBzbGVlcFxuXG4gICAgICAgIGNhbGxiYWNrKHJlbWFpbmluZylcbiAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSByZXR1cm5cblxuICAgICAgICBzZWxmLmNvdW50RG93bihjYWxsYmFjaywgcmVtYWluaW5nLCBpbnRlcnZhbClcbiAgICAgIH0sIHNsZWVwKVxuICAgIH0sXG5cbiAgICBzZXRJbnRlcnZhbDogZnVuY3Rpb24gKGNhbGxiYWNrLCBpbnRlcnZhbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgIGludGVydmFscy5wdXNoKHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFzZWxmLmlzTW91bnRlZCgpKSByZXR1cm5cblxuICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYpXG4gICAgICB9LCBpbnRlcnZhbCkpXG4gICAgfSxcblxuICAgIHNldFRpbWVvdXQ6IGZ1bmN0aW9uIChjYWxsYmFjaywgdGltZW91dCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgIHRpbWVvdXRzLnB1c2goc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghc2VsZi5pc01vdW50ZWQoKSkgcmV0dXJuXG5cbiAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmKVxuICAgICAgfSwgdGltZW91dCkpXG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnbm9uZSc6IHtcbiAgICAnaW4nOiBmYWxzZSxcbiAgICAnb3V0JzogZmFsc2VcbiAgfSxcbiAgJ2ZhZGUnOiB7XG4gICAgJ2luJzogdHJ1ZSxcbiAgICAnb3V0JzogdHJ1ZVxuICB9LFxuICAnZmFkZS1jb250cmFjdCc6IHtcbiAgICAnaW4nOiB0cnVlLFxuICAgICdvdXQnOiB0cnVlXG4gIH0sXG4gICdmYWRlLWV4cGFuZCc6IHtcbiAgICAnaW4nOiB0cnVlLFxuICAgICdvdXQnOiB0cnVlXG4gIH0sXG4gICdzaG93LWZyb20tbGVmdCc6IHtcbiAgICAnaW4nOiB0cnVlLFxuICAgICdvdXQnOiB0cnVlXG4gIH0sXG4gICdzaG93LWZyb20tcmlnaHQnOiB7XG4gICAgJ2luJzogdHJ1ZSxcbiAgICAnb3V0JzogdHJ1ZVxuICB9LFxuICAnc2hvdy1mcm9tLXRvcCc6IHtcbiAgICAnaW4nOiB0cnVlLFxuICAgICdvdXQnOiB0cnVlXG4gIH0sXG4gICdzaG93LWZyb20tYm90dG9tJzoge1xuICAgICdpbic6IHRydWUsXG4gICAgJ291dCc6IHRydWVcbiAgfSxcbiAgJ3JldmVhbC1mcm9tLWxlZnQnOiB7XG4gICAgJ2luJzogdHJ1ZSxcbiAgICAnb3V0JzogdHJ1ZVxuICB9LFxuICAncmV2ZWFsLWZyb20tcmlnaHQnOiB7XG4gICAgJ2luJzogdHJ1ZSxcbiAgICAnb3V0JzogdHJ1ZVxuICB9LFxuICAncmV2ZWFsLWZyb20tdG9wJzoge1xuICAgICdpbic6IGZhbHNlLFxuICAgICdvdXQnOiB0cnVlXG4gIH0sXG4gICdyZXZlYWwtZnJvbS1ib3R0b20nOiB7XG4gICAgJ2luJzogZmFsc2UsXG4gICAgJ291dCc6IHRydWVcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcblxudmFyIEVycm9yVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdFcnJvclZpZXcnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZVxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0Q29udGFpbmVyLFxuXHRcdFx0eyBmaWxsOiB0cnVlLCBjbGFzc05hbWU6ICdWaWV3IEVycm9yVmlldycgfSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXJyb3JWaWV3O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG52YXIgVHJhbnNpdGlvbnMgPSByZXF1aXJlKCcuLi9taXhpbnMvVHJhbnNpdGlvbnMnKTtcblxudmFyIExpbmsgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTGluaycsXG5cblx0bWl4aW5zOiBbVHJhbnNpdGlvbnNdLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLmFueSxcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuXHRcdHRyYW5zaXRpb246IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0dG86IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0dmlld1Byb3BzOiBSZWFjdC5Qcm9wVHlwZXMuYW55XG5cdH0sXG5cblx0ZG9UcmFuc2l0aW9uOiBmdW5jdGlvbiBkb1RyYW5zaXRpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSBfZXh0ZW5kcyh7IHZpZXdQcm9wczogdGhpcy5wcm9wcy52aWV3UHJvcHMsIHRyYW5zaXRpb246IHRoaXMucHJvcHMudHJhbnNpdGlvbiB9LCB0aGlzLnByb3BzLm9wdGlvbnMpO1xuXHRcdGNvbnNvbGUuaW5mbygnTGluayB0byBcIicgKyB0aGlzLnByb3BzLnRvICsgJ1wiIHVzaW5nIHRyYW5zaXRpb24gXCInICsgdGhpcy5wcm9wcy50cmFuc2l0aW9uICsgJ1wiJyArICcgd2l0aCBwcm9wcyAnLCB0aGlzLnByb3BzLnZpZXdQcm9wcyk7XG5cdFx0dGhpcy50cmFuc2l0aW9uVG8odGhpcy5wcm9wcy50bywgb3B0aW9ucyk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIHRhcHBhYmxlUHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NoaWxkcmVuJywgJ29wdGlvbnMnLCAndHJhbnNpdGlvbicsICd2aWV3UHJvcHMnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VGFwcGFibGUsXG5cdFx0XHRfZXh0ZW5kcyh7IG9uVGFwOiB0aGlzLmRvVHJhbnNpdGlvbiB9LCB0YXBwYWJsZVByb3BzKSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTGluaztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdWaWV3JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVG91Y2hzdG9uZUpTIDxWaWV3PiBzaG91bGQgbm90IGJlIHJlbmRlcmVkIGRpcmVjdGx5LicpO1xuXHR9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVmlldztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIEVycm9yVmlldyA9IHJlcXVpcmUoJy4vRXJyb3JWaWV3Jyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBUcmFuc2l0aW9uID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcblxuZnVuY3Rpb24gY3JlYXRlVmlld3NGcm9tQ2hpbGRyZW4oY2hpbGRyZW4pIHtcblx0dmFyIHZpZXdzID0ge307XG5cdFJlYWN0LkNoaWxkcmVuLmZvckVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uICh2aWV3KSB7XG5cdFx0dmlld3Nbdmlldy5wcm9wcy5uYW1lXSA9IHZpZXc7XG5cdH0pO1xuXHRyZXR1cm4gdmlld3M7XG59XG5cbnZhciBWaWV3Q29udGFpbmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1ZpZXdDb250YWluZXInLFxuXG5cdHN0YXRpY3M6IHtcblx0XHRzaG91bGRGaWxsVmVydGljYWxTcGFjZTogdHJ1ZVxuXHR9LFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGVcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIHByb3BzID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjaGlsZHJlbicpO1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHRwcm9wcyxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxudmFyIFZpZXdNYW5hZ2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1ZpZXdNYW5hZ2VyJyxcblxuXHRzdGF0aWNzOiB7XG5cdFx0c2hvdWxkRmlsbFZlcnRpY2FsU3BhY2U6IHRydWVcblx0fSxcblx0Y29udGV4dFR5cGVzOiB7XG5cdFx0YXBwOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcblx0fSxcblx0cHJvcFR5cGVzOiB7XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGRlZmF1bHRWaWV3OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdG9uVmlld0NoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcblx0fSxcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6ICdfX2RlZmF1bHQnXG5cdFx0fTtcblx0fSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZpZXdzOiBjcmVhdGVWaWV3c0Zyb21DaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKSxcblx0XHRcdGN1cnJlbnRWaWV3OiB0aGlzLnByb3BzLmRlZmF1bHRWaWV3LFxuXHRcdFx0b3B0aW9uczoge31cblx0XHR9O1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5jb250ZXh0LmFwcC52aWV3TWFuYWdlcnNbdGhpcy5wcm9wcy5uYW1lXSA9IHRoaXM7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRkZWxldGUgdGhpcy5jb250ZXh0LmFwcC52aWV3TWFuYWdlcnNbdGhpcy5wcm9wcy5uYW1lXTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHZpZXdzOiBjcmVhdGVWaWV3c0Zyb21DaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKVxuXHRcdH0pO1xuXHRcdGlmIChuZXh0UHJvcHMubmFtZSAhPT0gdGhpcy5wcm9wcy5uYW1lKSB7XG5cdFx0XHR0aGlzLmNvbnRleHQuYXBwLnZpZXdNYW5hZ2Vyc1tuZXh0UHJvcHMubmFtZV0gPSB0aGlzO1xuXHRcdFx0ZGVsZXRlIHRoaXMuY29udGV4dC5hcHAudmlld01hbmFnZXJzW3RoaXMucHJvcHMubmFtZV07XG5cdFx0fVxuXHRcdGlmIChuZXh0UHJvcHMuY3VycmVudFZpZXcgJiYgbmV4dFByb3BzLmN1cnJlbnRWaWV3ICE9PSB0aGlzLnN0YXRlLmN1cnJlbnRWaWV3KSB7XG5cdFx0XHR0aGlzLnRyYW5zaXRpb25UbyhuZXh0UHJvcHMuY3VycmVudFZpZXcsIHsgdmlld1Byb3BzOiBuZXh0UHJvcHMudmlld1Byb3BzIH0pO1xuXHRcdH1cblx0fSxcblx0dHJhbnNpdGlvblRvOiBmdW5jdGlvbiB0cmFuc2l0aW9uVG8odmlld0tleSwgb3B0aW9ucykge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRvcHRpb25zID0geyB0cmFuc2l0aW9uOiBvcHRpb25zIH07XG5cdFx0fVxuXHRcdGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXHRcdHRoaXMuYWN0aXZlVHJhbnNpdGlvbk9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuY29udGV4dC5hcHAudmlld01hbmFnZXJJblRyYW5zaXRpb24gPSB0aGlzO1xuXHRcdHRoaXMucHJvcHMub25WaWV3Q2hhbmdlICYmIHRoaXMucHJvcHMub25WaWV3Q2hhbmdlKHZpZXdLZXkpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Y3VycmVudFZpZXc6IHZpZXdLZXksXG5cdFx0XHRvcHRpb25zOiBvcHRpb25zXG5cdFx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0ZGVsZXRlIF90aGlzLmFjdGl2ZVRyYW5zaXRpb25PcHRpb25zO1xuXHRcdFx0ZGVsZXRlIF90aGlzLmNvbnRleHQuYXBwLnZpZXdNYW5hZ2VySW5UcmFuc2l0aW9uO1xuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXJWaWV3Q29udGFpbmVyOiBmdW5jdGlvbiByZW5kZXJWaWV3Q29udGFpbmVyKCkge1xuXHRcdHZhciB2aWV3S2V5ID0gdGhpcy5zdGF0ZS5jdXJyZW50Vmlldztcblx0XHRpZiAoIXZpZXdLZXkpIHtcblx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRFcnJvclZpZXcsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnRXJyb3JWaWV3X19oZWFkaW5nJyB9LFxuXHRcdFx0XHRcdCdWaWV3TWFuYWdlcjogJyxcblx0XHRcdFx0XHR0aGlzLnByb3BzLm5hbWVcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdFcnJvclZpZXdfX3RleHQnIH0sXG5cdFx0XHRcdFx0J0Vycm9yOiBUaGVyZSBpcyBubyBjdXJyZW50IFZpZXcuJ1xuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgdmlldyA9IHRoaXMuc3RhdGUudmlld3Nbdmlld0tleV07XG5cdFx0aWYgKCF2aWV3IHx8ICF2aWV3LnByb3BzLmNvbXBvbmVudCkge1xuXHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdEVycm9yVmlldyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdFcnJvclZpZXdfX2hlYWRpbmcnIH0sXG5cdFx0XHRcdFx0J1ZpZXdNYW5hZ2VyOiAnLFxuXHRcdFx0XHRcdHRoaXMucHJvcHMubmFtZVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ0Vycm9yVmlld19fdGV4dCcgfSxcblx0XHRcdFx0XHQnRXJyb3I6IFRoZSBDdXJyZW50IFZpZXcgKCcsXG5cdFx0XHRcdFx0dmlld0tleSxcblx0XHRcdFx0XHQnKSBpcyBpbnZhbGlkLidcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnMgfHwge307XG5cdFx0dmFyIHZpZXdDbGFzc05hbWUgPSBjbGFzc05hbWVzKCdWaWV3IFZpZXctLScgKyB2aWV3S2V5LCB2aWV3LnByb3BzLmNsYXNzTmFtZSk7XG5cdFx0dmFyIFZpZXdDb21wb25lbnQgPSB2aWV3LnByb3BzLmNvbXBvbmVudDtcblx0XHR2YXIgdmlld1Byb3BzID0gYmxhY2tsaXN0KHZpZXcucHJvcHMsICdjb21wb25lbnQnLCAnY2xhc3NOYW1lJyk7XG5cdFx0X2V4dGVuZHModmlld1Byb3BzLCBvcHRpb25zLnZpZXdQcm9wcyk7XG5cdFx0dmFyIHZpZXdFbGVtZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChWaWV3Q29tcG9uZW50LCB2aWV3UHJvcHMpO1xuXG5cdFx0aWYgKHRoaXMuX19sYXN0UmVuZGVyZWRWaWV3ICE9PSB2aWV3S2V5KSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygnaW5pdGlhbGlzaW5nIHZpZXcgJyArIHZpZXdLZXkgKyAnIHdpdGggb3B0aW9ucycsIG9wdGlvbnMpO1xuXHRcdFx0aWYgKHZpZXdFbGVtZW50LnR5cGUubmF2aWdhdGlvbkJhciAmJiB2aWV3RWxlbWVudC50eXBlLmdldE5hdmlnYXRpb24pIHtcblx0XHRcdFx0dmFyIGFwcCA9IHRoaXMuY29udGV4dC5hcHA7XG5cdFx0XHRcdHZhciB0cmFuc2l0aW9uID0gb3B0aW9ucy50cmFuc2l0aW9uO1xuXHRcdFx0XHRpZiAoYXBwLnZpZXdNYW5hZ2VySW5UcmFuc2l0aW9uKSB7XG5cdFx0XHRcdFx0dHJhbnNpdGlvbiA9IGFwcC52aWV3TWFuYWdlckluVHJhbnNpdGlvbi5hY3RpdmVUcmFuc2l0aW9uT3B0aW9ucy50cmFuc2l0aW9uO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGFwcC5uYXZpZ2F0aW9uQmFyc1t2aWV3RWxlbWVudC50eXBlLm5hdmlnYXRpb25CYXJdLnVwZGF0ZVdpdGhUcmFuc2l0aW9uKHZpZXdFbGVtZW50LnR5cGUuZ2V0TmF2aWdhdGlvbih2aWV3UHJvcHMsIGFwcCksIHRyYW5zaXRpb24pO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX19sYXN0UmVuZGVyZWRWaWV3ID0gdmlld0tleTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFZpZXdDb250YWluZXIsXG5cdFx0XHR7IGNsYXNzTmFtZTogdmlld0NsYXNzTmFtZSwga2V5OiB2aWV3S2V5IH0sXG5cdFx0XHR2aWV3RWxlbWVudFxuXHRcdCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdWaWV3TWFuYWdlcicsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblx0XHR2YXIgdmlld0NvbnRhaW5lciA9IHRoaXMucmVuZGVyVmlld0NvbnRhaW5lcih0aGlzLnN0YXRlLmN1cnJlbnRWaWV3LCB7IHZpZXdQcm9wczogdGhpcy5zdGF0ZS5jdXJyZW50Vmlld1Byb3BzIH0pO1xuXG5cdFx0dmFyIHRyYW5zaXRpb25OYW1lID0gJ3ZpZXctdHJhbnNpdGlvbi1pbnN0YW50Jztcblx0XHRpZiAodGhpcy5zdGF0ZS5vcHRpb25zLnRyYW5zaXRpb24pIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdhcHBseWluZyB2aWV3IHRyYW5zaXRpb246ICcgKyB0aGlzLnN0YXRlLm9wdGlvbnMudHJhbnNpdGlvbiArICcgdG8gdmlldyAnICsgdGhpcy5zdGF0ZS5jdXJyZW50Vmlldyk7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICd2aWV3LXRyYW5zaXRpb24tJyArIHRoaXMuc3RhdGUub3B0aW9ucy50cmFuc2l0aW9uO1xuXHRcdH1cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFRyYW5zaXRpb24sXG5cdFx0XHR7IHRyYW5zaXRpb25OYW1lOiB0cmFuc2l0aW9uTmFtZSwgdHJhbnNpdGlvbkVudGVyOiB0cnVlLCB0cmFuc2l0aW9uTGVhdmU6IHRydWUsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdkaXYnIH0sXG5cdFx0XHR2aWV3Q29udGFpbmVyXG5cdFx0KTtcblx0fVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFZpZXdNYW5hZ2VyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5pbWF0aW9uID0gcmVxdWlyZSgndHdlZW4uanMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcblx0YW5pbWF0aW9uLnVwZGF0ZSgpO1xuXHRpZiAoYW5pbWF0aW9uLmdldEFsbCgpLmxlbmd0aCkge1xuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcblx0fVxufVxuXG5mdW5jdGlvbiBzY3JvbGxUb1RvcChlbCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIGZyb20gPSBlbC5zY3JvbGxUb3A7XG5cdHZhciBkdXJhdGlvbiA9IE1hdGgubWluKE1hdGgubWF4KDIwMCwgZnJvbSAvIDIpLCAzNTApO1xuXHRpZiAoZnJvbSA+IDIwMCkgZHVyYXRpb24gPSAzMDA7XG5cdGVsLnN0eWxlLndlYmtpdE92ZXJmbG93U2Nyb2xsaW5nID0gJ2F1dG8nO1xuXHRlbC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXHR2YXIgdHdlZW4gPSBuZXcgYW5pbWF0aW9uLlR3ZWVuKHsgcG9zOiBmcm9tIH0pLnRvKHsgcG9zOiAwIH0sIGR1cmF0aW9uKS5lYXNpbmcoYW5pbWF0aW9uLkVhc2luZy5RdWFkcmF0aWMuT3V0KS5vblVwZGF0ZShmdW5jdGlvbiAoKSB7XG5cdFx0ZWwuc2Nyb2xsVG9wID0gdGhpcy5wb3M7XG5cdFx0aWYgKG9wdGlvbnMub25VcGRhdGUpIHtcblx0XHRcdG9wdGlvbnMub25VcGRhdGUoKTtcblx0XHR9XG5cdH0pLm9uQ29tcGxldGUoZnVuY3Rpb24gKCkge1xuXHRcdGVsLnN0eWxlLndlYmtpdE92ZXJmbG93U2Nyb2xsaW5nID0gJ3RvdWNoJztcblx0XHRlbC5zdHlsZS5vdmVyZmxvdyA9ICdzY3JvbGwnO1xuXHRcdGlmIChvcHRpb25zLm9uQ29tcGxldGUpIG9wdGlvbnMub25Db21wbGV0ZSgpO1xuXHR9KS5zdGFydCgpO1xuXHR1cGRhdGUoKTtcblx0cmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnRzLnNjcm9sbFRvVG9wID0gc2Nyb2xsVG9Ub3A7XG5cbnZhciBNaXhpbnMgPSBleHBvcnRzLk1peGlucyA9IHt9O1xuXG5NaXhpbnMuU2Nyb2xsQ29udGFpbmVyVG9Ub3AgPSB7XG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RhdHVzVGFwJywgdGhpcy5zY3JvbGxDb250YWluZXJUb1RvcCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RhdHVzVGFwJywgdGhpcy5zY3JvbGxDb250YWluZXJUb1RvcCk7XG5cdFx0aWYgKHRoaXMuX3Njcm9sbENvbnRhaW5lckFuaW1hdGlvbikge1xuXHRcdFx0dGhpcy5fc2Nyb2xsQ29udGFpbmVyQW5pbWF0aW9uLnN0b3AoKTtcblx0XHR9XG5cdH0sXG5cdHNjcm9sbENvbnRhaW5lclRvVG9wOiBmdW5jdGlvbiBzY3JvbGxDb250YWluZXJUb1RvcCgpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0aWYgKCF0aGlzLmlzTW91bnRlZCgpIHx8ICF0aGlzLnJlZnMuc2Nyb2xsQ29udGFpbmVyKSByZXR1cm47XG5cdFx0dGhpcy5fc2Nyb2xsQ29udGFpbmVyQW5pbWF0aW9uID0gc2Nyb2xsVG9Ub3AoUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnNjcm9sbENvbnRhaW5lciksIHtcblx0XHRcdG9uQ29tcGxldGU6IGZ1bmN0aW9uIG9uQ29tcGxldGUoKSB7XG5cdFx0XHRcdGRlbGV0ZSBfdGhpcy5fc2Nyb2xsQ29udGFpbmVyQW5pbWF0aW9uO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZUFwcCA9IGNyZWF0ZUFwcDtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBhbmltYXRpb24gPSByZXF1aXJlKCcuL2NvcmUvYW5pbWF0aW9uJyk7XG5leHBvcnRzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbnZhciBMaW5rID0gcmVxdWlyZSgnLi9jb3JlL0xpbmsnKTtcbmV4cG9ydHMuTGluayA9IExpbms7XG52YXIgVmlldyA9IHJlcXVpcmUoJy4vY29yZS9WaWV3Jyk7XG5leHBvcnRzLlZpZXcgPSBWaWV3O1xudmFyIFZpZXdNYW5hZ2VyID0gcmVxdWlyZSgnLi9jb3JlL1ZpZXdNYW5hZ2VyJyk7XG5cbmV4cG9ydHMuVmlld01hbmFnZXIgPSBWaWV3TWFuYWdlcjtcbnZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbmV4cG9ydHMuQ29udGFpbmVyID0gQ29udGFpbmVyO1xudmFyIE1peGlucyA9IHJlcXVpcmUoJy4vbWl4aW5zJyk7XG5leHBvcnRzLk1peGlucyA9IE1peGlucztcbnZhciBVSSA9IHJlcXVpcmUoJy4vdWknKTtcblxuZXhwb3J0cy5VSSA9IFVJO1xuXG5mdW5jdGlvbiBjcmVhdGVBcHAoKSB7XG5cdHZhciBhcHAgPSB7XG5cdFx0bmF2aWdhdGlvbkJhcnM6IHt9LFxuXHRcdHZpZXdNYW5hZ2Vyczoge30sXG5cdFx0dmlld3M6IHt9LFxuXHRcdHRyYW5zaXRpb25UbzogZnVuY3Rpb24gdHJhbnNpdGlvblRvKHZpZXcsIG9wdHMpIHtcblx0XHRcdHZhciB2bSA9ICdfX2RlZmF1bHQnO1xuXHRcdFx0dmlldyA9IHZpZXcuc3BsaXQoJzonKTtcblx0XHRcdGlmICh2aWV3Lmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0dm0gPSB2aWV3LnNoaWZ0KCk7XG5cdFx0XHR9XG5cdFx0XHR2aWV3ID0gdmlld1swXTtcblx0XHRcdGFwcC52aWV3TWFuYWdlcnNbdm1dLnRyYW5zaXRpb25Ubyh2aWV3LCBvcHRzKTtcblx0XHR9XG5cdH07XG5cdHJldHVybiB7XG5cdFx0Y2hpbGRDb250ZXh0VHlwZXM6IHtcblx0XHRcdGFwcDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuXHRcdH0sXG5cdFx0Z2V0Q2hpbGRDb250ZXh0OiBmdW5jdGlvbiBnZXRDaGlsZENvbnRleHQoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhcHA6IGFwcFxuXHRcdFx0fTtcblx0XHR9XG5cdH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgeHRlbmQgPSByZXF1aXJlKCd4dGVuZC9tdXRhYmxlJyk7XG52YXIgdHJhbnNpdGlvbnMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvdHJhbnNpdGlvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGdldENTU1RyYW5zaXRpb246IGZ1bmN0aW9uIGdldENTU1RyYW5zaXRpb24oa2V5KSB7XG5cdFx0a2V5ID0ga2V5IGluIHRyYW5zaXRpb25zID8ga2V5IDogJ25vbmUnO1xuXG5cdFx0cmV0dXJuIHh0ZW5kKHtcblx0XHRcdGtleToga2V5LFxuXHRcdFx0bmFtZTogJ3ZpZXctdHJhbnNpdGlvbi0nICsga2V5LFxuXHRcdFx0J2luJzogZmFsc2UsXG5cdFx0XHRvdXQ6IGZhbHNlXG5cdFx0fSwgdHJhbnNpdGlvbnNba2V5XSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBUcmFuc2l0aW9ucyA9IHtcblx0Y29udGV4dFR5cGVzOiB7XG5cdFx0YXBwOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG5cdH0sXG5cdHRyYW5zaXRpb25UbzogZnVuY3Rpb24gdHJhbnNpdGlvblRvKHZpZXcsIG9wdHMpIHtcblx0XHR0aGlzLmNvbnRleHQuYXBwLnRyYW5zaXRpb25Ubyh2aWV3LCBvcHRzKTtcblx0fVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVHJhbnNpdGlvbnM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIFRyYW5zaXRpb25zID0gcmVxdWlyZSgnLi9UcmFuc2l0aW9ucycpO1xuZXhwb3J0cy5UcmFuc2l0aW9ucyA9IFRyYW5zaXRpb25zOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBWaWV3Q29udGVudCA9IHJlcXVpcmUoJy4vVmlld0NvbnRlbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnQWxlcnRiYXInLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGhlaWdodDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRwdWxzZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0dHlwZTogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsnZGVmYXVsdCcsICdwcmltYXJ5JywgJ3N1Y2Nlc3MnLCAnd2FybmluZycsICdkYW5nZXInXSlcblx0fSxcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGhlaWdodDogJzMwcHgnLFxuXHRcdFx0dHlwZTogJ2RlZmF1bHQnXG5cdFx0fTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXModGhpcy5wcm9wcy5jbGFzc05hbWUsIHRoaXMucHJvcHMudHlwZSwge1xuXHRcdFx0J0FsZXJ0YmFyJzogdHJ1ZSxcblx0XHRcdCdwdWxzZSc6IHRoaXMucHJvcHMucHVsc2Vcblx0XHR9KTtcblx0XHR2YXIgY29udGVudCA9IHRoaXMucHJvcHMucHVsc2UgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ0FsZXJ0YmFyLWlubmVyJyB9LFxuXHRcdFx0dGhpcy5wcm9wcy5jaGlsZHJlblxuXHRcdCkgOiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRWaWV3Q29udGVudCxcblx0XHRcdHsgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCwgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdGNvbnRlbnRcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnSW5wdXQnLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRmaXJzdDogUmVhY3QuUHJvcFR5cGVzLmJvb2xcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogJ3RleHQnXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnZmllbGQtaXRlbSBsaXN0LWl0ZW0nLCB7XG5cdFx0XHQnaXMtZmlyc3QnOiB0aGlzLnByb3BzLmZpcnN0LFxuXHRcdFx0J3Utc2VsZWN0YWJsZSc6IHRoaXMucHJvcHMuZGlzYWJsZWRcblx0XHR9LCB0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG5cblx0XHR2YXIgaW5wdXRQcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnY2hpbGRyZW4nLCAnY2xhc3NOYW1lJywgJ2ZpcnN0Jyk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6IGNsYXNzTmFtZSB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdHsgY2xhc3NOYW1lOiAnaXRlbS1pbm5lcicgfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnbGFiZWwnLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnaXRlbS1jb250ZW50JyB9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdmaWVsZCcgfSwgaW5wdXRQcm9wcykpXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpLFxuICAgIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ0l0ZW1NZWRpYScsXG5cdHByb3BUeXBlczoge1xuXHRcdGF2YXRhcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRhdmF0YXJJbml0aWFsczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0aWNvbjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHR0aHVtYm5haWw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh7XG5cdFx0XHQnaXRlbS1tZWRpYSc6IHRydWUsXG5cdFx0XHQnaXMtaWNvbic6IHRoaXMucHJvcHMuaWNvbixcblx0XHRcdCdpcy1hdmF0YXInOiB0aGlzLnByb3BzLmF2YXRhciB8fCB0aGlzLnByb3BzLmF2YXRhckluaXRpYWxzLFxuXHRcdFx0J2lzLXRodW1ibmFpbCc6IHRoaXMucHJvcHMudGh1bWJuYWlsXG5cdFx0fSwgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXG5cdFx0Ly8gbWVkaWEgdHlwZXNcblx0XHR2YXIgaWNvbiA9IHRoaXMucHJvcHMuaWNvbiA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnaXRlbS1pY29uICcgKyB0aGlzLnByb3BzLmljb24gfSkgOiBudWxsO1xuXHRcdHZhciBhdmF0YXIgPSB0aGlzLnByb3BzLmF2YXRhciB8fCB0aGlzLnByb3BzLmF2YXRhckluaXRpYWxzID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLWF2YXRhcicgfSxcblx0XHRcdHRoaXMucHJvcHMuYXZhdGFyID8gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJywgeyBzcmM6IHRoaXMucHJvcHMuYXZhdGFyIH0pIDogdGhpcy5wcm9wcy5hdmF0YXJJbml0aWFsc1xuXHRcdCkgOiBudWxsO1xuXHRcdHZhciB0aHVtYm5haWwgPSB0aGlzLnByb3BzLnRodW1ibmFpbCA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiAnaXRlbS10aHVtYm5haWwnIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdpbWcnLCB7IHNyYzogdGhpcy5wcm9wcy50aHVtYm5haWwgfSlcblx0XHQpIDogbnVsbDtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sXG5cdFx0XHRpY29uLFxuXHRcdFx0YXZhdGFyLFxuXHRcdFx0dGh1bWJuYWlsXG5cdFx0KTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKSxcbiAgICBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdJdGVtTm90ZScsXG5cdHByb3BUeXBlczoge1xuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRpY29uOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGxhYmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdHR5cGU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogJ2RlZmF1bHQnXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh7XG5cdFx0XHQnaXRlbS1ub3RlJzogdHJ1ZVxuXHRcdH0sIHRoaXMucHJvcHMudHlwZSwgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXG5cdFx0Ly8gZWxlbWVudHNcblx0XHR2YXIgbGFiZWwgPSB0aGlzLnByb3BzLmxhYmVsID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLW5vdGUtbGFiZWwnIH0sXG5cdFx0XHR0aGlzLnByb3BzLmxhYmVsXG5cdFx0KSA6IG51bGw7XG5cdFx0dmFyIGljb24gPSB0aGlzLnByb3BzLmljb24gPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ2l0ZW0tbm90ZS1pY29uICcgKyB0aGlzLnByb3BzLmljb24gfSkgOiBudWxsO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdGxhYmVsLFxuXHRcdFx0aWNvblxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTGFiZWxJbnB1dCcsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0YWxpZ25Ub3A6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZSxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGZpcnN0OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRsYWJlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRyZWFkT25seTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0cmVhZE9ubHk6IGZhbHNlXG5cdFx0fTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh0aGlzLnByb3BzLmNsYXNzTmFtZSwgJ2xpc3QtaXRlbScsICdmaWVsZC1pdGVtJywge1xuXHRcdFx0J2FsaWduLXRvcCc6IHRoaXMucHJvcHMuYWxpZ25Ub3AsXG5cdFx0XHQnaXMtZmlyc3QnOiB0aGlzLnByb3BzLmZpcnN0LFxuXHRcdFx0J3Utc2VsZWN0YWJsZSc6IHRoaXMucHJvcHMuZGlzYWJsZWRcblx0XHR9KTtcblxuXHRcdHZhciBwcm9wcyA9IGJsYWNrbGlzdCh0aGlzLnByb3BzLCAnYWxpZ25Ub3AnLCAnY2hpbGRyZW4nLCAnZmlyc3QnLCAncmVhZE9ubHknKTtcblx0XHR2YXIgcmVuZGVySW5wdXQgPSB0aGlzLnByb3BzLnJlYWRPbmx5ID8gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdmaWVsZCB1LXNlbGVjdGFibGUnIH0sXG5cdFx0XHR0aGlzLnByb3BzLnZhbHVlXG5cdFx0KSA6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgX2V4dGVuZHMoeyBjbGFzc05hbWU6ICdmaWVsZCcgfSwgcHJvcHMpKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2xhYmVsJyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ2l0ZW0taW5uZXInIH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdmaWVsZC1sYWJlbCcgfSxcblx0XHRcdFx0XHR0aGlzLnByb3BzLmxhYmVsXG5cdFx0XHRcdCksXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdmaWVsZC1jb250cm9sJyB9LFxuXHRcdFx0XHRcdHJlbmRlcklucHV0LFxuXHRcdFx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyksXG4gICAgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTGFiZWxTZWxlY3QnLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0Zmlyc3Q6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGxhYmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdG9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSxcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2xhc3NOYW1lOiAnJ1xuXHRcdH07XG5cdH0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZVxuXHRcdH07XG5cdH0sXG5cdHVwZGF0ZUlucHV0VmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUlucHV0VmFsdWUoZXZlbnQpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcblx0XHR9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0Ly8gU2V0IENsYXNzZXNcblx0XHR2YXIgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyh0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J2xpc3QtaXRlbSc6IHRydWUsXG5cdFx0XHQnaXMtZmlyc3QnOiB0aGlzLnByb3BzLmZpcnN0XG5cdFx0fSk7XG5cblx0XHQvLyBNYXAgT3B0aW9uc1xuXHRcdHZhciBvcHRpb25zID0gdGhpcy5wcm9wcy5vcHRpb25zLm1hcChmdW5jdGlvbiAob3ApIHtcblx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnb3B0aW9uJyxcblx0XHRcdFx0eyBrZXk6ICdvcHRpb24tJyArIG9wLnZhbHVlLCB2YWx1ZTogb3AudmFsdWUgfSxcblx0XHRcdFx0b3AubGFiZWxcblx0XHRcdCk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdsYWJlbCcsXG5cdFx0XHR7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLWlubmVyJyB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnZmllbGQtbGFiZWwnIH0sXG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5sYWJlbFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnZmllbGQtY29udHJvbCcgfSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3NlbGVjdCcsXG5cdFx0XHRcdFx0XHR7IHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLCBvbkNoYW5nZTogdGhpcy51cGRhdGVJbnB1dFZhbHVlLCBjbGFzc05hbWU6ICdzZWxlY3QtZmllbGQnIH0sXG5cdFx0XHRcdFx0XHRvcHRpb25zXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ3NlbGVjdC1maWVsZC1pbmRpY2F0b3InIH0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogJ3NlbGVjdC1maWVsZC1pbmRpY2F0b3ItYXJyb3cnIH0pXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgYmxhY2tsaXN0ID0gcmVxdWlyZSgnYmxhY2tsaXN0Jyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdMYWJlbFRleHRhcmVhJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRmaXJzdDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0bGFiZWw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0cmVhZE9ubHk6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHJvd3M6IDNcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCAnbGlzdC1pdGVtJywgJ2ZpZWxkLWl0ZW0nLCAnYWxpZ24tdG9wJywge1xuXHRcdFx0J2lzLWZpcnN0JzogdGhpcy5wcm9wcy5maXJzdCxcblx0XHRcdCd1LXNlbGVjdGFibGUnOiB0aGlzLnByb3BzLmRpc2FibGVkXG5cdFx0fSk7XG5cblx0XHR2YXIgcHJvcHMgPSBibGFja2xpc3QodGhpcy5wcm9wcywgJ2NoaWxkcmVuJywgJ2NsYXNzTmFtZScsICdkaXNhYmxlZCcsICdmaXJzdCcsICdsYWJlbCcsICdyZWFkT25seScpO1xuXG5cdFx0dmFyIHJlbmRlcklucHV0ID0gdGhpcy5wcm9wcy5yZWFkT25seSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiAnZmllbGQgdS1zZWxlY3RhYmxlJyB9LFxuXHRcdFx0dGhpcy5wcm9wcy52YWx1ZVxuXHRcdCkgOiBSZWFjdC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBjbGFzc05hbWU6ICdmaWVsZCcgfSkpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdsYWJlbCcsXG5cdFx0XHRcdHsgY2xhc3NOYW1lOiAnaXRlbS1pbm5lcicgfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ2ZpZWxkLWxhYmVsJyB9LFxuXHRcdFx0XHRcdHRoaXMucHJvcHMubGFiZWxcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ2ZpZWxkLWNvbnRyb2wnIH0sXG5cdFx0XHRcdFx0cmVuZGVySW5wdXQsXG5cdFx0XHRcdFx0dGhpcy5wcm9wcy5jaGlsZHJlblxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG52YXIgVHJhbnNpdGlvbiA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbnZhciBkZWZhdWx0Q29udHJvbGxlclN0YXRlID0ge1xuXHRkaXJlY3Rpb246IDAsXG5cdGZhZGU6IGZhbHNlLFxuXHRsZWZ0QXJyb3c6IGZhbHNlLFxuXHRsZWZ0QnV0dG9uRGlzYWJsZWQ6IGZhbHNlLFxuXHRsZWZ0SWNvbjogJycsXG5cdGxlZnRMYWJlbDogJycsXG5cdGxlZnRBY3Rpb246IG51bGwsXG5cdHJpZ2h0QXJyb3c6IGZhbHNlLFxuXHRyaWdodEJ1dHRvbkRpc2FibGVkOiBmYWxzZSxcblx0cmlnaHRJY29uOiAnJyxcblx0cmlnaHRMYWJlbDogJycsXG5cdHJpZ2h0QWN0aW9uOiBudWxsLFxuXHR0aXRsZTogJydcbn07XG5cbmZ1bmN0aW9uIG5ld1N0YXRlKGZyb20pIHtcblx0dmFyIG5zID0gX2V4dGVuZHMoe30sIGRlZmF1bHRDb250cm9sbGVyU3RhdGUpO1xuXHRpZiAoZnJvbSkgX2V4dGVuZHMobnMsIGZyb20pO1xuXHRkZWxldGUgbnMubmFtZTsgLy8gbWF5IGxlYWsgZnJvbSBwcm9wc1xuXHRyZXR1cm4gbnM7XG59XG5cbnZhciBOYXZpZ2F0aW9uQmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ05hdmlnYXRpb25CYXInLFxuXG5cdGNvbnRleHRUeXBlczoge1xuXHRcdGFwcDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuXHR9LFxuXHRwcm9wVHlwZXM6IHtcblx0XHRuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiBuZXdTdGF0ZSh0aGlzLnByb3BzKTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGlmICh0aGlzLnByb3BzLm5hbWUpIHtcblx0XHRcdHRoaXMuY29udGV4dC5hcHAubmF2aWdhdGlvbkJhcnNbdGhpcy5wcm9wcy5uYW1lXSA9IHRoaXM7XG5cdFx0fVxuXHR9LFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMubmFtZSkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuY29udGV4dC5hcHAubmF2aWdhdGlvbkJhcnNbdGhpcy5wcm9wcy5uYW1lXTtcblx0XHR9XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZShuZXh0UHJvcHMpKTtcblx0XHRpZiAobmV4dFByb3BzLm5hbWUgIT09IHRoaXMucHJvcHMubmFtZSkge1xuXHRcdFx0aWYgKG5leHRQcm9wcy5uYW1lKSB7XG5cdFx0XHRcdHRoaXMuY29udGV4dC5hcHAubmF2aWdhdGlvbkJhcnNbbmV4dFByb3BzLm5hbWVdID0gdGhpcztcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnByb3BzLm5hbWUpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuY29udGV4dC5hcHAubmF2aWdhdGlvbkJhcnNbdGhpcy5wcm9wcy5uYW1lXTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHN0YXRlKSB7XG5cdFx0c3RhdGUgPSBuZXdTdGF0ZShzdGF0ZSk7XG5cdFx0Ly8gY29uc29sZS5pbmZvKCdVcGRhdGluZyBOYXZpZ2F0aW9uQmFyICcgKyB0aGlzLnByb3BzLm5hbWUsIHN0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKHN0YXRlKSk7XG5cdH0sXG5cdHVwZGF0ZVdpdGhUcmFuc2l0aW9uOiBmdW5jdGlvbiB1cGRhdGVXaXRoVHJhbnNpdGlvbihzdGF0ZSwgdHJhbnNpdGlvbikge1xuXHRcdHN0YXRlID0gbmV3U3RhdGUoc3RhdGUpO1xuXHRcdGlmICh0cmFuc2l0aW9uID09PSAoJ3Nob3ctZnJvbS1yaWdodCcgfHwgJ3JldmVhbC1mcm9tLWxlZnQnKSkge1xuXHRcdFx0c3RhdGUuZGlyZWN0aW9uID0gMTtcblx0XHR9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09ICgncmV2ZWFsLWZyb20tcmlnaHQnIHx8ICdzaG93LWZyb20tbGVmdCcpKSB7XG5cdFx0XHRzdGF0ZS5kaXJlY3Rpb24gPSAtMTtcblx0XHR9IGVsc2UgaWYgKHRyYW5zaXRpb24gPT09ICdmYWRlJykge1xuXHRcdFx0c3RhdGUuZmFkZSA9IHRydWU7XG5cdFx0fVxuXHRcdC8vIGNvbnNvbGUuaW5mbygnVXBkYXRpbmcgTmF2aWdhdGlvbkJhciAnICsgdGhpcy5wcm9wcy5uYW1lICsgJyB3aXRoIHRyYW5zaXRpb24gJyArIHRyYW5zaXRpb24sIHN0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKHN0YXRlKTtcblx0fSxcblxuXHRyZW5kZXJMZWZ0QnV0dG9uOiBmdW5jdGlvbiByZW5kZXJMZWZ0QnV0dG9uKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdOYXZpZ2F0aW9uQmFyTGVmdEJ1dHRvbicsIHtcblx0XHRcdCdoYXMtYXJyb3cnOiB0aGlzLnN0YXRlLmxlZnRBcnJvd1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUYXBwYWJsZSxcblx0XHRcdHsgb25UYXA6IHRoaXMuc3RhdGUubGVmdEFjdGlvbiwgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGRpc2FibGVkOiB0aGlzLnN0YXRlLmxlZnRCdXR0b25EaXNhYmxlZCwgY29tcG9uZW50OiAnYnV0dG9uJyB9LFxuXHRcdFx0dGhpcy5yZW5kZXJMZWZ0QXJyb3coKSxcblx0XHRcdHRoaXMucmVuZGVyTGVmdExhYmVsKClcblx0XHQpO1xuXHR9LFxuXHRyZW5kZXJMZWZ0QXJyb3c6IGZ1bmN0aW9uIHJlbmRlckxlZnRBcnJvdygpIHtcblx0XHR2YXIgdHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tSW5zdGFudCc7XG5cdFx0aWYgKHRoaXMuc3RhdGUuZmFkZSB8fCB0aGlzLnN0YXRlLmRpcmVjdGlvbikge1xuXHRcdFx0dHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tRmFkZSc7XG5cdFx0fVxuXG5cdFx0dmFyIGFycm93ID0gdGhpcy5zdGF0ZS5sZWZ0QXJyb3cgPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdOYXZpZ2F0aW9uQmFyTGVmdEFycm93JyB9KSA6IG51bGw7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFRyYW5zaXRpb24sXG5cdFx0XHR7IHRyYW5zaXRpb25OYW1lOiB0cmFuc2l0aW9uTmFtZSB9LFxuXHRcdFx0YXJyb3dcblx0XHQpO1xuXHR9LFxuXHRyZW5kZXJMZWZ0TGFiZWw6IGZ1bmN0aW9uIHJlbmRlckxlZnRMYWJlbCgpIHtcblx0XHR2YXIgdHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tSW5zdGFudCc7XG5cdFx0aWYgKHRoaXMuc3RhdGUuZmFkZSkge1xuXHRcdFx0dHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tRmFkZSc7XG5cdFx0fSBlbHNlIGlmICh0aGlzLnN0YXRlLmRpcmVjdGlvbiA+IDApIHtcblx0XHRcdHRyYW5zaXRpb25OYW1lID0gJ05hdmlnYXRpb25CYXJUcmFuc2l0aW9uLUZvcndhcmRzJztcblx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZGlyZWN0aW9uIDwgMCkge1xuXHRcdFx0dHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tQmFja3dhcmRzJztcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFRyYW5zaXRpb24sXG5cdFx0XHR7IHRyYW5zaXRpb25OYW1lOiB0cmFuc2l0aW9uTmFtZSB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHR7IGtleTogRGF0ZS5ub3coKSwgY2xhc3NOYW1lOiAnTmF2aWdhdGlvbkJhckxlZnRMYWJlbCcgfSxcblx0XHRcdFx0dGhpcy5zdGF0ZS5sZWZ0TGFiZWxcblx0XHRcdClcblx0XHQpO1xuXHR9LFxuXHRyZW5kZXJUaXRsZTogZnVuY3Rpb24gcmVuZGVyVGl0bGUoKSB7XG5cdFx0dmFyIHRpdGxlID0gdGhpcy5zdGF0ZS50aXRsZSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnc3BhbicsXG5cdFx0XHR7IGtleTogRGF0ZS5ub3coKSwgY2xhc3NOYW1lOiAnTmF2aWdhdGlvbkJhclRpdGxlJyB9LFxuXHRcdFx0dGhpcy5zdGF0ZS50aXRsZVxuXHRcdCkgOiBudWxsO1xuXHRcdHZhciB0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1JbnN0YW50Jztcblx0XHRpZiAodGhpcy5zdGF0ZS5mYWRlKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1GYWRlJztcblx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZGlyZWN0aW9uID4gMCkge1xuXHRcdFx0dHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tRm9yd2FyZHMnO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5kaXJlY3Rpb24gPCAwKSB7XG5cdFx0XHR0cmFuc2l0aW9uTmFtZSA9ICdOYXZpZ2F0aW9uQmFyVHJhbnNpdGlvbi1CYWNrd2FyZHMnO1xuXHRcdH1cblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VHJhbnNpdGlvbixcblx0XHRcdHsgdHJhbnNpdGlvbk5hbWU6IHRyYW5zaXRpb25OYW1lIH0sXG5cdFx0XHR0aXRsZVxuXHRcdCk7XG5cdH0sXG5cdHJlbmRlclJpZ2h0QnV0dG9uOiBmdW5jdGlvbiByZW5kZXJSaWdodEJ1dHRvbigpIHtcblx0XHR2YXIgdHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tSW5zdGFudCc7XG5cdFx0aWYgKHRoaXMuc3RhdGUuZmFkZSB8fCB0aGlzLnN0YXRlLmRpcmVjdGlvbikge1xuXHRcdFx0dHJhbnNpdGlvbk5hbWUgPSAnTmF2aWdhdGlvbkJhclRyYW5zaXRpb24tRmFkZSc7XG5cdFx0fVxuXHRcdHZhciBidXR0b24gPSB0aGlzLnN0YXRlLnJpZ2h0SWNvbiB8fCB0aGlzLnN0YXRlLnJpZ2h0TGFiZWwgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VGFwcGFibGUsXG5cdFx0XHR7IGtleTogRGF0ZS5ub3coKSwgb25UYXA6IHRoaXMuc3RhdGUucmlnaHRBY3Rpb24sIGNsYXNzTmFtZTogJ05hdmlnYXRpb25CYXJSaWdodEJ1dHRvbicsIGRpc2FibGVkOiB0aGlzLnN0YXRlLnJpZ2h0QnV0dG9uRGlzYWJsZWQsIGNvbXBvbmVudDogJ2J1dHRvbicgfSxcblx0XHRcdHRoaXMucmVuZGVyUmlnaHRMYWJlbCgpLFxuXHRcdFx0dGhpcy5yZW5kZXJSaWdodEljb24oKVxuXHRcdCkgOiBudWxsO1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0VHJhbnNpdGlvbixcblx0XHRcdHsgdHJhbnNpdGlvbk5hbWU6IHRyYW5zaXRpb25OYW1lIH0sXG5cdFx0XHRidXR0b25cblx0XHQpO1xuXHR9LFxuXHRyZW5kZXJSaWdodEljb246IGZ1bmN0aW9uIHJlbmRlclJpZ2h0SWNvbigpIHtcblx0XHRpZiAoIXRoaXMuc3RhdGUucmlnaHRJY29uKSByZXR1cm4gbnVsbDtcblxuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdOYXZpZ2F0aW9uQmFyUmlnaHRJY29uJywgdGhpcy5zdGF0ZS5yaWdodEljb24pO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0pO1xuXHR9LFxuXHRyZW5kZXJSaWdodExhYmVsOiBmdW5jdGlvbiByZW5kZXJSaWdodExhYmVsKCkge1xuXHRcdHJldHVybiB0aGlzLnN0YXRlLnJpZ2h0TGFiZWwgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3NwYW4nLFxuXHRcdFx0eyBrZXk6IERhdGUubm93KCksIGNsYXNzTmFtZTogJ05hdmlnYXRpb25CYXJSaWdodExhYmVsJyB9LFxuXHRcdFx0dGhpcy5zdGF0ZS5yaWdodExhYmVsXG5cdFx0KSA6IG51bGw7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ05hdmlnYXRpb25CYXInIH0sXG5cdFx0XHR0aGlzLnJlbmRlckxlZnRCdXR0b24oKSxcblx0XHRcdHRoaXMucmVuZGVyVGl0bGUoKSxcblx0XHRcdHRoaXMucmVuZGVyUmlnaHRCdXR0b24oKVxuXHRcdCk7XG5cdH1cbn0pO1xuXG4vKlxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlciAoKSB7XG5cdHZhciBzdGF0ZSA9IG5ld1N0YXRlKCk7XG5cdHZhciBsaXN0ZW5lcnMgPSBbXTtcblx0cmV0dXJuIHtcblx0XHR1cGRhdGUgKG5zKSB7XG5cdFx0XHRzdGF0ZSA9IG5ld1N0YXRlKG5zKTtcblx0XHRcdGxpc3RlbmVycy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuXHRcdH0sXG5cdFx0Z2V0U3RhdGUgKCkge1xuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHRcdH0sXG5cdFx0YWRkTGlzdGVuZXIgKGZuKSB7XG5cdFx0XHRsaXN0ZW5lcnMucHVzaChmbik7XG5cdFx0fSxcblx0XHRyZW1vdmVMaXN0ZW5lciAoZm4pIHtcblx0XHRcdGxpc3RlbmVycyA9IGxpc3RlbmVycy5maWx0ZXIoaSA9PiBmbiAhPT0gaSk7XG5cdFx0fVxuXHR9O1xufVxuKi9cblxuZXhwb3J0c1snZGVmYXVsdCddID0gTmF2aWdhdGlvbkJhcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xudmFyIFRyYW5zaXRpb24gPSByZXF1aXJlKCcuLi9taXhpbnMvVHJhbnNpdGlvbicpO1xuXG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnUG9wdXAnLFxuXHRtaXhpbnM6IFtUcmFuc2l0aW9uXSxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdHZpc2libGU6IFJlYWN0LlByb3BUeXBlcy5ib29sXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRyYW5zaXRpb246ICdub25lJ1xuXHRcdH07XG5cdH0sXG5cblx0cmVuZGVyQmFja2Ryb3A6IGZ1bmN0aW9uIHJlbmRlckJhY2tkcm9wKCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy52aXNpYmxlKSByZXR1cm4gbnVsbDtcblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdNb2RhbC1iYWNrZHJvcCcgfSk7XG5cdH0sXG5cblx0cmVuZGVyRGlhbG9nOiBmdW5jdGlvbiByZW5kZXJEaWFsb2coKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLnZpc2libGUpIHJldHVybiBudWxsO1xuXG5cdFx0Ly8gU2V0IGNsYXNzbmFtZXNcblx0XHR2YXIgZGlhbG9nQ2xhc3NOYW1lID0gY2xhc3NuYW1lcygnTW9kYWwtZGlhbG9nJywgdGhpcy5wcm9wcy5jbGFzc05hbWUpO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBkaWFsb2dDbGFzc05hbWUgfSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ01vZGFsJyB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0UmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAsXG5cdFx0XHRcdHsgdHJhbnNpdGlvbk5hbWU6ICdNb2RhbC1kaWFsb2cnLCBjb21wb25lbnQ6ICdkaXYnIH0sXG5cdFx0XHRcdHRoaXMucmVuZGVyRGlhbG9nKClcblx0XHRcdCksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRSZWFjdENTU1RyYW5zaXRpb25Hcm91cCxcblx0XHRcdFx0eyB0cmFuc2l0aW9uTmFtZTogJ01vZGFsLWJhY2tncm91bmQnLCBjb21wb25lbnQ6ICdkaXYnIH0sXG5cdFx0XHRcdHRoaXMucmVuZGVyQmFja2Ryb3AoKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnUG9wdXBJY29uJyxcblx0cHJvcFR5cGVzOiB7XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRcdHR5cGU6IFJlYWN0LlByb3BUeXBlcy5vbmVPZihbJ2RlZmF1bHQnLCAnbXV0ZWQnLCAncHJpbWFyeScsICdzdWNjZXNzJywgJ3dhcm5pbmcnLCAnZGFuZ2VyJ10pLFxuXHRcdHNwaW5uaW5nOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdNb2RhbC1pY29uJywge1xuXHRcdFx0J2lzLXNwaW5uaW5nJzogdGhpcy5wcm9wcy5zcGlubmluZ1xuXHRcdH0sIHRoaXMucHJvcHMubmFtZSwgdGhpcy5wcm9wcy50eXBlKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0pO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGFwcGFibGUgPSByZXF1aXJlKCdyZWFjdC10YXBwYWJsZScpO1xuXG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnUmFkaW9MaXN0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1JlYWN0LlByb3BUeXBlcy5zdHJpbmcsIFJlYWN0LlByb3BUeXBlcy5udW1iZXJdKSxcblx0XHRpY29uOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRcdG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuXHR9LFxuXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZSh2YWx1ZSkge1xuXHRcdHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24gKG9wLCBpKSB7XG5cdFx0XHR2YXIgaWNvbkNsYXNzbmFtZSA9IGNsYXNzbmFtZXMoJ2l0ZW0taWNvbiBwcmltYXJ5Jywgb3AuaWNvbik7XG5cdFx0XHR2YXIgdGFwcGFibGVDbGFzc25hbWUgPSBjbGFzc25hbWVzKCdsaXN0LWl0ZW0nLCB7ICdpcy1maXJzdCc6IGkgPT09IDAgfSk7XG5cdFx0XHR2YXIgY2hlY2tNYXJrID0gb3AudmFsdWUgPT09IHNlbGYucHJvcHMudmFsdWUgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLW5vdGUgcHJpbWFyeScgfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdpdGVtLW5vdGUtaWNvbiBpb24tY2hlY2ttYXJrJyB9KVxuXHRcdFx0KSA6IG51bGw7XG5cdFx0XHR2YXIgaWNvbiA9IG9wLmljb24gPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLW1lZGlhJyB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IGljb25DbGFzc25hbWUgfSlcblx0XHRcdCkgOiBudWxsO1xuXG5cdFx0XHRmdW5jdGlvbiBvbkNoYW5nZSgpIHtcblx0XHRcdFx0c2VsZi5vbkNoYW5nZShvcC52YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRUYXBwYWJsZSxcblx0XHRcdFx0eyBrZXk6ICdvcHRpb24tJyArIGksIG9uVGFwOiBvbkNoYW5nZSwgY2xhc3NOYW1lOiB0YXBwYWJsZUNsYXNzbmFtZSB9LFxuXHRcdFx0XHRpY29uLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdHsgY2xhc3NOYW1lOiAnaXRlbS1pbm5lcicgfSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ2l0ZW0tdGl0bGUnIH0sXG5cdFx0XHRcdFx0XHRvcC5sYWJlbFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0Y2hlY2tNYXJrXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0bnVsbCxcblx0XHRcdG9wdGlvbnNcblx0XHQpO1xuXHR9XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1N3aXRjaCcsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdG9uOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRvblRhcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdFx0dHlwZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiAnZGVmYXVsdCdcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdTd2l0Y2gnLCAnU3dpdGNoLS0nICsgdGhpcy5wcm9wcy50eXBlLCB7XG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2lzLW9uJzogdGhpcy5wcm9wcy5vblxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUYXBwYWJsZSxcblx0XHRcdHsgb25UYXA6IHRoaXMucHJvcHMub25UYXAsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBjb21wb25lbnQ6ICdsYWJlbCcgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ1N3aXRjaF9fdHJhY2snIH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnU3dpdGNoX19oYW5kbGUnIH0pXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbnZhciBibGFja2xpc3QgPSByZXF1aXJlKCdibGFja2xpc3QnKTtcbnZhciBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUYXBwYWJsZSA9IHJlcXVpcmUoJ3JlYWN0LXRhcHBhYmxlJyk7XG5cbnZhciBOYXZpZ2F0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTmF2aWdhdG9yJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdUYWJzLU5hdmlnYXRvcicgfSxcblx0XHRcdFJlYWN0LkNoaWxkcmVuLm1hcCh0aGlzLnByb3BzLmNoaWxkcmVuLCBmdW5jdGlvbiAodGFiKSB7XG5cdFx0XHRcdHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQodGFiLCB7XG5cdFx0XHRcdFx0b25TZWxlY3Q6IF90aGlzLnByb3BzLm9uQ2hhbmdlLFxuXHRcdFx0XHRcdG5hdmlnYXRvclZhbHVlOiBfdGhpcy5wcm9wcy52YWx1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0KTtcblx0fVxufSk7XG5cbmV4cG9ydHMuTmF2aWdhdG9yID0gTmF2aWdhdG9yO1xudmFyIFRhYiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdUYWInLFxuXG5cdGNvbnRleHRUeXBlczoge1xuXHRcdHRhYk5hdmlnYXRvcjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuXHR9LFxuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0bmF2aWdhdG9yVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0b25TZWxlY3Q6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG5cdH0sXG5cdG9uU2VsZWN0OiBmdW5jdGlvbiBvblNlbGVjdCgpIHtcblx0XHR2YXIgdGFiID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjaGlsZHJlbicpO1xuXHRcdHRoaXMucHJvcHMub25TZWxlY3QodGFiKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGlzQ3VycmVudCA9IHRoaXMucHJvcHMubmF2aWdhdG9yVmFsdWUgPT09IHRoaXMucHJvcHMudmFsdWU7XG5cdFx0dmFyIGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ1RhYnMtVGFiJywge1xuXHRcdFx0J2lzLXNlbGVjdGVkJzogaXNDdXJyZW50XG5cdFx0fSk7XG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRUYXBwYWJsZSxcblx0XHRcdHsgb25UYXA6IHRoaXMucHJvcHMub25TZWxlY3QgJiYgdGhpcy5vblNlbGVjdCwgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSxcblx0XHRcdHRoaXMucHJvcHMuY2hpbGRyZW5cblx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0cy5UYWIgPSBUYWI7XG52YXIgTGFiZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnTGFiZWwnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZVxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdUYWJzLUxhYmVsJyB9LFxuXHRcdFx0dGhpcy5wcm9wcy5jaGlsZHJlblxuXHRcdCk7XG5cdH1cbn0pO1xuZXhwb3J0cy5MYWJlbCA9IExhYmVsOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIGJsYWNrbGlzdCA9IHJlcXVpcmUoJ2JsYWNrbGlzdCcpO1xudmFyIGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdUZXh0YXJlYScsXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZSxcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRcdGZpcnN0OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0XHRyb3dzOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG5cdH0sXG5cblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHJvd3M6IDNcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdmaWVsZC1pdGVtIGxpc3QtaXRlbScsIHtcblx0XHRcdCdpcy1maXJzdCc6IHRoaXMucHJvcHMuZmlyc3QsXG5cdFx0XHQndS1zZWxlY3RhYmxlJzogdGhpcy5wcm9wcy5kaXNhYmxlZFxuXHRcdH0sIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblxuXHRcdHZhciBpbnB1dFByb3BzID0gYmxhY2tsaXN0KHRoaXMucHJvcHMsICdjaGlsZHJlbicsICdjbGFzc05hbWUnLCAnZmlyc3QnKTtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLWlubmVyJyB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdsYWJlbCcsXG5cdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdpdGVtLWNvbnRlbnQnIH0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnLCBfZXh0ZW5kcyh7IGNsYXNzTmFtZTogJ2ZpZWxkJyB9LCBpbnB1dFByb3BzKSlcblx0XHRcdFx0KSxcblx0XHRcdFx0dGhpcy5wcm9wcy5jaGlsZHJlblxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnVmlld0NvbnRlbnQnLFxuXHRwcm9wVHlwZXM6IHtcblx0XHRpZDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0XHRoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0c2Nyb2xsYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdFx0Z3JvdzogUmVhY3QuUHJvcFR5cGVzLmJvb2xcblx0fSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2xhc3NOYW1lOiAnJyxcblx0XHRcdGhlaWdodDogJydcblx0XHR9O1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcblx0XHRcdCdWaWV3Q29udGVudCc6IHRydWUsXG5cdFx0XHQnc3ByaW5neS1zY3JvbGxpbmcnOiB0aGlzLnByb3BzLnNjcm9sbGFibGVcblx0XHR9LCB0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG5cblx0XHR2YXIgaW5saW5lU3R5bGUgPSB7fTtcblxuXHRcdC8vIHNldCBoZWlnaHQgb24gYmxvY2tzIGlmIHByb3ZpZGVkXG5cdFx0aWYgKHRoaXMucHJvcHMuaGVpZ2h0KSB7XG5cdFx0XHRpbmxpbmVTdHlsZS5oZWlnaHQgPSB0aGlzLnByb3BzLmhlaWdodDtcblx0XHR9XG5cblx0XHQvLyBzdHJldGNoIHRvIHRha2UgdXAgc3BhY2Vcblx0XHRpZiAodGhpcy5wcm9wcy5ncm93KSB7XG5cdFx0XHRpbmxpbmVTdHlsZS5XZWJraXRCb3hGbGV4ID0gJzEnO1xuXHRcdFx0aW5saW5lU3R5bGUuV2Via2l0RmxleCA9ICcxJztcblx0XHRcdGlubGluZVN0eWxlLk1vekJveEZsZXggPSAnMSc7XG5cdFx0XHRpbmxpbmVTdHlsZS5Nb3pGbGV4ID0gJzEnO1xuXHRcdFx0aW5saW5lU3R5bGUuTXNGbGV4ID0gJzEnO1xuXHRcdFx0aW5saW5lU3R5bGUuZmxleCA9ICcxJztcblx0XHR9XG5cblx0XHQvLyBhbGxvdyBibG9ja3MgdG8gYmUgc2Nyb2xsYWJsZVxuXHRcdGlmICh0aGlzLnByb3BzLnNjcm9sbGFibGUpIHtcblx0XHRcdGlubGluZVN0eWxlLm92ZXJmbG93WSA9ICdhdXRvJztcblx0XHRcdGlubGluZVN0eWxlLldlYmtpdE92ZXJmbG93U2Nyb2xsaW5nID0gJ3RvdWNoJztcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgaWQ6IHRoaXMucHJvcHMuaWQsIHN0eWxlOiBpbmxpbmVTdHlsZSB9LFxuXHRcdFx0dGhpcy5wcm9wcy5jaGlsZHJlblxuXHRcdCk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgQWxlcnRiYXIgPSByZXF1aXJlKCcuL0FsZXJ0YmFyJyk7XG5leHBvcnRzLkFsZXJ0YmFyID0gQWxlcnRiYXI7XG52YXIgSW5wdXQgPSByZXF1aXJlKCcuL0lucHV0Jyk7XG5leHBvcnRzLklucHV0ID0gSW5wdXQ7XG52YXIgSXRlbU1lZGlhID0gcmVxdWlyZSgnLi9JdGVtTWVkaWEnKTtcbmV4cG9ydHMuSXRlbU1lZGlhID0gSXRlbU1lZGlhO1xudmFyIEl0ZW1Ob3RlID0gcmVxdWlyZSgnLi9JdGVtTm90ZScpO1xuZXhwb3J0cy5JdGVtTm90ZSA9IEl0ZW1Ob3RlO1xudmFyIExhYmVsSW5wdXQgPSByZXF1aXJlKCcuL0xhYmVsSW5wdXQnKTtcbmV4cG9ydHMuTGFiZWxJbnB1dCA9IExhYmVsSW5wdXQ7XG52YXIgTGFiZWxTZWxlY3QgPSByZXF1aXJlKCcuL0xhYmVsU2VsZWN0Jyk7XG5leHBvcnRzLkxhYmVsU2VsZWN0ID0gTGFiZWxTZWxlY3Q7XG52YXIgTGFiZWxUZXh0YXJlYSA9IHJlcXVpcmUoJy4vTGFiZWxUZXh0YXJlYScpO1xuZXhwb3J0cy5MYWJlbFRleHRhcmVhID0gTGFiZWxUZXh0YXJlYTtcbnZhciBOYXZpZ2F0aW9uQmFyID0gcmVxdWlyZSgnLi9OYXZpZ2F0aW9uQmFyJyk7XG5leHBvcnRzLk5hdmlnYXRpb25CYXIgPSBOYXZpZ2F0aW9uQmFyO1xudmFyIFBvcHVwID0gcmVxdWlyZSgnLi9Qb3B1cCcpO1xuZXhwb3J0cy5Qb3B1cCA9IFBvcHVwO1xudmFyIFBvcHVwSWNvbiA9IHJlcXVpcmUoJy4vUG9wdXBJY29uJyk7XG5leHBvcnRzLlBvcHVwSWNvbiA9IFBvcHVwSWNvbjtcbnZhciBSYWRpb0xpc3QgPSByZXF1aXJlKCcuL1JhZGlvTGlzdCcpO1xuZXhwb3J0cy5SYWRpb0xpc3QgPSBSYWRpb0xpc3Q7XG52YXIgU3dpdGNoID0gcmVxdWlyZSgnLi9Td2l0Y2gnKTtcbmV4cG9ydHMuU3dpdGNoID0gU3dpdGNoO1xudmFyIFRhYnMgPSByZXF1aXJlKCcuL1RhYnMnKTtcbmV4cG9ydHMuVGFicyA9IFRhYnM7XG52YXIgVGV4dGFyZWEgPSByZXF1aXJlKCcuL1RleHRhcmVhJyk7XG5leHBvcnRzLlRleHRhcmVhID0gVGV4dGFyZWE7IiwiLyoqXG4gKiBUd2Vlbi5qcyAtIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3NvbGUvdHdlZW4uanNcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3NvbGUvdHdlZW4uanMvZ3JhcGhzL2NvbnRyaWJ1dG9ycyBmb3IgdGhlIGZ1bGwgbGlzdCBvZiBjb250cmlidXRvcnMuXG4gKiBUaGFuayB5b3UgYWxsLCB5b3UncmUgYXdlc29tZSFcbiAqL1xuXG4vLyBEYXRlLm5vdyBzaGltIGZvciAoYWhlbSkgSW50ZXJuZXQgRXhwbG8oZHxyKWVyXG5pZiAoIERhdGUubm93ID09PSB1bmRlZmluZWQgKSB7XG5cblx0RGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gbmV3IERhdGUoKS52YWx1ZU9mKCk7XG5cblx0fTtcblxufVxuXG52YXIgVFdFRU4gPSBUV0VFTiB8fCAoIGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgX3R3ZWVucyA9IFtdO1xuXG5cdHJldHVybiB7XG5cblx0XHRSRVZJU0lPTjogJzE0JyxcblxuXHRcdGdldEFsbDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRyZXR1cm4gX3R3ZWVucztcblxuXHRcdH0sXG5cblx0XHRyZW1vdmVBbGw6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0X3R3ZWVucyA9IFtdO1xuXG5cdFx0fSxcblxuXHRcdGFkZDogZnVuY3Rpb24gKCB0d2VlbiApIHtcblxuXHRcdFx0X3R3ZWVucy5wdXNoKCB0d2VlbiApO1xuXG5cdFx0fSxcblxuXHRcdHJlbW92ZTogZnVuY3Rpb24gKCB0d2VlbiApIHtcblxuXHRcdFx0dmFyIGkgPSBfdHdlZW5zLmluZGV4T2YoIHR3ZWVuICk7XG5cblx0XHRcdGlmICggaSAhPT0gLTEgKSB7XG5cblx0XHRcdFx0X3R3ZWVucy5zcGxpY2UoIGksIDEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0XHRpZiAoIF90d2VlbnMubGVuZ3RoID09PSAwICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdHRpbWUgPSB0aW1lICE9PSB1bmRlZmluZWQgPyB0aW1lIDogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGVyZm9ybWFuY2UgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ICE9PSB1bmRlZmluZWQgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBEYXRlLm5vdygpICk7XG5cblx0XHRcdHdoaWxlICggaSA8IF90d2VlbnMubGVuZ3RoICkge1xuXG5cdFx0XHRcdGlmICggX3R3ZWVuc1sgaSBdLnVwZGF0ZSggdGltZSApICkge1xuXG5cdFx0XHRcdFx0aSsrO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRfdHdlZW5zLnNwbGljZSggaSwgMSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH1cblx0fTtcblxufSApKCk7XG5cblRXRUVOLlR3ZWVuID0gZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cblx0dmFyIF9vYmplY3QgPSBvYmplY3Q7XG5cdHZhciBfdmFsdWVzU3RhcnQgPSB7fTtcblx0dmFyIF92YWx1ZXNFbmQgPSB7fTtcblx0dmFyIF92YWx1ZXNTdGFydFJlcGVhdCA9IHt9O1xuXHR2YXIgX2R1cmF0aW9uID0gMTAwMDtcblx0dmFyIF9yZXBlYXQgPSAwO1xuXHR2YXIgX3lveW8gPSBmYWxzZTtcblx0dmFyIF9pc1BsYXlpbmcgPSBmYWxzZTtcblx0dmFyIF9yZXZlcnNlZCA9IGZhbHNlO1xuXHR2YXIgX2RlbGF5VGltZSA9IDA7XG5cdHZhciBfc3RhcnRUaW1lID0gbnVsbDtcblx0dmFyIF9lYXNpbmdGdW5jdGlvbiA9IFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZTtcblx0dmFyIF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLkxpbmVhcjtcblx0dmFyIF9jaGFpbmVkVHdlZW5zID0gW107XG5cdHZhciBfb25TdGFydENhbGxiYWNrID0gbnVsbDtcblx0dmFyIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuXHR2YXIgX29uVXBkYXRlQ2FsbGJhY2sgPSBudWxsO1xuXHR2YXIgX29uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG5cdHZhciBfb25TdG9wQ2FsbGJhY2sgPSBudWxsO1xuXG5cdC8vIFNldCBhbGwgc3RhcnRpbmcgdmFsdWVzIHByZXNlbnQgb24gdGhlIHRhcmdldCBvYmplY3Rcblx0Zm9yICggdmFyIGZpZWxkIGluIG9iamVjdCApIHtcblxuXHRcdF92YWx1ZXNTdGFydFsgZmllbGQgXSA9IHBhcnNlRmxvYXQob2JqZWN0W2ZpZWxkXSwgMTApO1xuXG5cdH1cblxuXHR0aGlzLnRvID0gZnVuY3Rpb24gKCBwcm9wZXJ0aWVzLCBkdXJhdGlvbiApIHtcblxuXHRcdGlmICggZHVyYXRpb24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0X2R1cmF0aW9uID0gZHVyYXRpb247XG5cblx0XHR9XG5cblx0XHRfdmFsdWVzRW5kID0gcHJvcGVydGllcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5zdGFydCA9IGZ1bmN0aW9uICggdGltZSApIHtcblxuXHRcdFRXRUVOLmFkZCggdGhpcyApO1xuXG5cdFx0X2lzUGxheWluZyA9IHRydWU7XG5cblx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSBmYWxzZTtcblxuXHRcdF9zdGFydFRpbWUgPSB0aW1lICE9PSB1bmRlZmluZWQgPyB0aW1lIDogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGVyZm9ybWFuY2UgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ICE9PSB1bmRlZmluZWQgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBEYXRlLm5vdygpICk7XG5cdFx0X3N0YXJ0VGltZSArPSBfZGVsYXlUaW1lO1xuXG5cdFx0Zm9yICggdmFyIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cblx0XHRcdC8vIGNoZWNrIGlmIGFuIEFycmF5IHdhcyBwcm92aWRlZCBhcyBwcm9wZXJ0eSB2YWx1ZVxuXHRcdFx0aWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0aWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdLmxlbmd0aCA9PT0gMCApIHtcblxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBjcmVhdGUgYSBsb2NhbCBjb3B5IG9mIHRoZSBBcnJheSB3aXRoIHRoZSBzdGFydCB2YWx1ZSBhdCB0aGUgZnJvbnRcblx0XHRcdFx0X3ZhbHVlc0VuZFsgcHJvcGVydHkgXSA9IFsgX29iamVjdFsgcHJvcGVydHkgXSBdLmNvbmNhdCggX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF9vYmplY3RbIHByb3BlcnR5IF07XG5cblx0XHRcdGlmKCAoIF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSBpbnN0YW5jZW9mIEFycmF5ICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHRfdmFsdWVzU3RhcnRbIHByb3BlcnR5IF0gKj0gMS4wOyAvLyBFbnN1cmVzIHdlJ3JlIHVzaW5nIG51bWJlcnMsIG5vdCBzdHJpbmdzXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoICFfaXNQbGF5aW5nICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0VFdFRU4ucmVtb3ZlKCB0aGlzICk7XG5cdFx0X2lzUGxheWluZyA9IGZhbHNlO1xuXG5cdFx0aWYgKCBfb25TdG9wQ2FsbGJhY2sgIT09IG51bGwgKSB7XG5cblx0XHRcdF9vblN0b3BDYWxsYmFjay5jYWxsKCBfb2JqZWN0ICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrICkge1xuXG5cdFx0XHRfY2hhaW5lZFR3ZWVuc1sgaSBdLnN0b3AoKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZGVsYXkgPSBmdW5jdGlvbiAoIGFtb3VudCApIHtcblxuXHRcdF9kZWxheVRpbWUgPSBhbW91bnQ7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnJlcGVhdCA9IGZ1bmN0aW9uICggdGltZXMgKSB7XG5cblx0XHRfcmVwZWF0ID0gdGltZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnlveW8gPSBmdW5jdGlvbiggeW95byApIHtcblxuXHRcdF95b3lvID0geW95bztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cblx0dGhpcy5lYXNpbmcgPSBmdW5jdGlvbiAoIGVhc2luZyApIHtcblxuXHRcdF9lYXNpbmdGdW5jdGlvbiA9IGVhc2luZztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuaW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uICggaW50ZXJwb2xhdGlvbiApIHtcblxuXHRcdF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBpbnRlcnBvbGF0aW9uO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5jaGFpbiA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9jaGFpbmVkVHdlZW5zID0gYXJndW1lbnRzO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblN0YXJ0ID0gZnVuY3Rpb24gKCBjYWxsYmFjayApIHtcblxuXHRcdF9vblN0YXJ0Q2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25VcGRhdGUgPSBmdW5jdGlvbiAoIGNhbGxiYWNrICkge1xuXG5cdFx0X29uVXBkYXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25Db21wbGV0ZSA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25Db21wbGV0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLm9uU3RvcCA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25TdG9wQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0dmFyIHByb3BlcnR5O1xuXG5cdFx0aWYgKCB0aW1lIDwgX3N0YXJ0VGltZSApIHtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cblx0XHRpZiAoIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9PT0gZmFsc2UgKSB7XG5cblx0XHRcdGlmICggX29uU3RhcnRDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRfb25TdGFydENhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0dmFyIGVsYXBzZWQgPSAoIHRpbWUgLSBfc3RhcnRUaW1lICkgLyBfZHVyYXRpb247XG5cdFx0ZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cblx0XHR2YXIgdmFsdWUgPSBfZWFzaW5nRnVuY3Rpb24oIGVsYXBzZWQgKTtcblxuXHRcdGZvciAoIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cblx0XHRcdHZhciBzdGFydCA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXHRcdFx0dmFyIGVuZCA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cblx0XHRcdGlmICggZW5kIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0X29iamVjdFsgcHJvcGVydHkgXSA9IF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24oIGVuZCwgdmFsdWUgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBQYXJzZXMgcmVsYXRpdmUgZW5kIHZhbHVlcyB3aXRoIHN0YXJ0IGFzIGJhc2UgKGUuZy46ICsxMCwgLTMpXG5cdFx0XHRcdGlmICggdHlwZW9mKGVuZCkgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdFx0ZW5kID0gc3RhcnQgKyBwYXJzZUZsb2F0KGVuZCwgMTApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcHJvdGVjdCBhZ2FpbnN0IG5vbiBudW1lcmljIHByb3BlcnRpZXMuXG5cdFx0XHRcdGlmICggdHlwZW9mKGVuZCkgPT09IFwibnVtYmVyXCIgKSB7XG5cdFx0XHRcdFx0X29iamVjdFsgcHJvcGVydHkgXSA9IHN0YXJ0ICsgKCBlbmQgLSBzdGFydCApICogdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKCBfb25VcGRhdGVDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0X29uVXBkYXRlQ2FsbGJhY2suY2FsbCggX29iamVjdCwgdmFsdWUgKTtcblxuXHRcdH1cblxuXHRcdGlmICggZWxhcHNlZCA9PSAxICkge1xuXG5cdFx0XHRpZiAoIF9yZXBlYXQgPiAwICkge1xuXG5cdFx0XHRcdGlmKCBpc0Zpbml0ZSggX3JlcGVhdCApICkge1xuXHRcdFx0XHRcdF9yZXBlYXQtLTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHJlYXNzaWduIHN0YXJ0aW5nIHZhbHVlcywgcmVzdGFydCBieSBtYWtpbmcgc3RhcnRUaW1lID0gbm93XG5cdFx0XHRcdGZvciggcHJvcGVydHkgaW4gX3ZhbHVlc1N0YXJ0UmVwZWF0ICkge1xuXG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YoIF92YWx1ZXNFbmRbIHByb3BlcnR5IF0gKSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSArIHBhcnNlRmxvYXQoX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSwgMTApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChfeW95bykge1xuXHRcdFx0XHRcdFx0dmFyIHRtcCA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cdFx0XHRcdFx0XHRfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdID0gdG1wO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKF95b3lvKSB7XG5cdFx0XHRcdFx0X3JldmVyc2VkID0gIV9yZXZlcnNlZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9zdGFydFRpbWUgPSB0aW1lICsgX2RlbGF5VGltZTtcblxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZiAoIF9vbkNvbXBsZXRlQ2FsbGJhY2sgIT09IG51bGwgKSB7XG5cblx0XHRcdFx0XHRfb25Db21wbGV0ZUNhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrICkge1xuXG5cdFx0XHRcdFx0X2NoYWluZWRUd2VlbnNbIGkgXS5zdGFydCggdGltZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cbn07XG5cblxuVFdFRU4uRWFzaW5nID0ge1xuXG5cdExpbmVhcjoge1xuXG5cdFx0Tm9uZTogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gaztcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YWRyYXRpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqICggMiAtIGsgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIC0gMC41ICogKCAtLWsgKiAoIGsgLSAyICkgLSAxICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRDdWJpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogaztcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiBrICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrICogaztcblx0XHRcdHJldHVybiAwLjUgKiAoICggayAtPSAyICkgKiBrICogayArIDIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YXJ0aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrICogayAqIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMSAtICggLS1rICogayAqIGsgKiBrICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSkgcmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGs7XG5cdFx0XHRyZXR1cm4gLSAwLjUgKiAoICggayAtPSAyICkgKiBrICogayAqIGsgLSAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRRdWludGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqIGsgKiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAtLWsgKiBrICogayAqIGsgKiBrICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiBrICogayAqIGsgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRTaW51c29pZGFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMSAtIE1hdGguY29zKCBrICogTWF0aC5QSSAvIDIgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc2luKCBrICogTWF0aC5QSSAvIDIgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMC41ICogKCAxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiBrICkgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEV4cG9uZW50aWFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayA9PT0gMCA/IDAgOiBNYXRoLnBvdyggMTAyNCwgayAtIDEgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgPT09IDEgPyAxIDogMSAtIE1hdGgucG93KCAyLCAtIDEwICogayApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIE1hdGgucG93KCAxMDI0LCBrIC0gMSApO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggLSBNYXRoLnBvdyggMiwgLSAxMCAqICggayAtIDEgKSApICsgMiApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0Q2lyY3VsYXI6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gTWF0aC5zcXJ0KCAxIC0gayAqIGsgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc3FydCggMSAtICggLS1rICogayApICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSkgcmV0dXJuIC0gMC41ICogKCBNYXRoLnNxcnQoIDEgLSBrICogaykgLSAxKTtcblx0XHRcdHJldHVybiAwLjUgKiAoIE1hdGguc3FydCggMSAtICggayAtPSAyKSAqIGspICsgMSk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRFbGFzdGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG5cdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0cmV0dXJuIC0gKCBhICogTWF0aC5wb3coIDIsIDEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG5cdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0cmV0dXJuICggYSAqIE1hdGgucG93KCAyLCAtIDEwICogaykgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICsgMSApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzLCBhID0gMC4xLCBwID0gMC40O1xuXHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRpZiAoIGsgPT09IDEgKSByZXR1cm4gMTtcblx0XHRcdGlmICggIWEgfHwgYSA8IDEgKSB7IGEgPSAxOyBzID0gcCAvIDQ7IH1cblx0XHRcdGVsc2UgcyA9IHAgKiBNYXRoLmFzaW4oIDEgLyBhICkgLyAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIC0gMC41ICogKCBhICogTWF0aC5wb3coIDIsIDEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuXHRcdFx0cmV0dXJuIGEgKiBNYXRoLnBvdyggMiwgLTEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSAqIDAuNSArIDE7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCYWNrOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTg7XG5cdFx0XHRyZXR1cm4gayAqIGsgKiAoICggcyArIDEgKSAqIGsgLSBzICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1ODtcblx0XHRcdHJldHVybiAtLWsgKiBrICogKCAoIHMgKyAxICkgKiBrICsgcyApICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogKCBrICogayAqICggKCBzICsgMSApICogayAtIHMgKSApO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiAoICggcyArIDEgKSAqIGsgKyBzICkgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCb3VuY2U6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQoIDEgLSBrICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA8ICggMSAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogayAqIGs7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGsgPCAoIDIgLyAyLjc1ICkgKSB7XG5cblx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDEuNSAvIDIuNzUgKSApICogayArIDAuNzU7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGsgPCAoIDIuNSAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMi4yNSAvIDIuNzUgKSApICogayArIDAuOTM3NTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMi42MjUgLyAyLjc1ICkgKSAqIGsgKyAwLjk4NDM3NTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA8IDAuNSApIHJldHVybiBUV0VFTi5FYXNpbmcuQm91bmNlLkluKCBrICogMiApICogMC41O1xuXHRcdFx0cmV0dXJuIFRXRUVOLkVhc2luZy5Cb3VuY2UuT3V0KCBrICogMiAtIDEgKSAqIDAuNSArIDAuNTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cblRXRUVOLkludGVycG9sYXRpb24gPSB7XG5cblx0TGluZWFyOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cblx0XHR2YXIgbSA9IHYubGVuZ3RoIC0gMSwgZiA9IG0gKiBrLCBpID0gTWF0aC5mbG9vciggZiApLCBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuTGluZWFyO1xuXG5cdFx0aWYgKCBrIDwgMCApIHJldHVybiBmbiggdlsgMCBdLCB2WyAxIF0sIGYgKTtcblx0XHRpZiAoIGsgPiAxICkgcmV0dXJuIGZuKCB2WyBtIF0sIHZbIG0gLSAxIF0sIG0gLSBmICk7XG5cblx0XHRyZXR1cm4gZm4oIHZbIGkgXSwgdlsgaSArIDEgPiBtID8gbSA6IGkgKyAxIF0sIGYgLSBpICk7XG5cblx0fSxcblxuXHRCZXppZXI6IGZ1bmN0aW9uICggdiwgayApIHtcblxuXHRcdHZhciBiID0gMCwgbiA9IHYubGVuZ3RoIC0gMSwgcHcgPSBNYXRoLnBvdywgYm4gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkJlcm5zdGVpbiwgaTtcblxuXHRcdGZvciAoIGkgPSAwOyBpIDw9IG47IGkrKyApIHtcblx0XHRcdGIgKz0gcHcoIDEgLSBrLCBuIC0gaSApICogcHcoIGssIGkgKSAqIHZbIGkgXSAqIGJuKCBuLCBpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGI7XG5cblx0fSxcblxuXHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cblx0XHR2YXIgbSA9IHYubGVuZ3RoIC0gMSwgZiA9IG0gKiBrLCBpID0gTWF0aC5mbG9vciggZiApLCBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuQ2F0bXVsbFJvbTtcblxuXHRcdGlmICggdlsgMCBdID09PSB2WyBtIF0gKSB7XG5cblx0XHRcdGlmICggayA8IDAgKSBpID0gTWF0aC5mbG9vciggZiA9IG0gKiAoIDEgKyBrICkgKTtcblxuXHRcdFx0cmV0dXJuIGZuKCB2WyAoIGkgLSAxICsgbSApICUgbSBdLCB2WyBpIF0sIHZbICggaSArIDEgKSAlIG0gXSwgdlsgKCBpICsgMiApICUgbSBdLCBmIC0gaSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYgKCBrIDwgMCApIHJldHVybiB2WyAwIF0gLSAoIGZuKCB2WyAwIF0sIHZbIDAgXSwgdlsgMSBdLCB2WyAxIF0sIC1mICkgLSB2WyAwIF0gKTtcblx0XHRcdGlmICggayA+IDEgKSByZXR1cm4gdlsgbSBdIC0gKCBmbiggdlsgbSBdLCB2WyBtIF0sIHZbIG0gLSAxIF0sIHZbIG0gLSAxIF0sIGYgLSBtICkgLSB2WyBtIF0gKTtcblxuXHRcdFx0cmV0dXJuIGZuKCB2WyBpID8gaSAtIDEgOiAwIF0sIHZbIGkgXSwgdlsgbSA8IGkgKyAxID8gbSA6IGkgKyAxIF0sIHZbIG0gPCBpICsgMiA/IG0gOiBpICsgMiBdLCBmIC0gaSApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0VXRpbHM6IHtcblxuXHRcdExpbmVhcjogZnVuY3Rpb24gKCBwMCwgcDEsIHQgKSB7XG5cblx0XHRcdHJldHVybiAoIHAxIC0gcDAgKSAqIHQgKyBwMDtcblxuXHRcdH0sXG5cblx0XHRCZXJuc3RlaW46IGZ1bmN0aW9uICggbiAsIGkgKSB7XG5cblx0XHRcdHZhciBmYyA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuRmFjdG9yaWFsO1xuXHRcdFx0cmV0dXJuIGZjKCBuICkgLyBmYyggaSApIC8gZmMoIG4gLSBpICk7XG5cblx0XHR9LFxuXG5cdFx0RmFjdG9yaWFsOiAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0dmFyIGEgPSBbIDEgXTtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICggbiApIHtcblxuXHRcdFx0XHR2YXIgcyA9IDEsIGk7XG5cdFx0XHRcdGlmICggYVsgbiBdICkgcmV0dXJuIGFbIG4gXTtcblx0XHRcdFx0Zm9yICggaSA9IG47IGkgPiAxOyBpLS0gKSBzICo9IGk7XG5cdFx0XHRcdHJldHVybiBhWyBuIF0gPSBzO1xuXG5cdFx0XHR9O1xuXG5cdFx0fSApKCksXG5cblx0XHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAoIHAwLCBwMSwgcDIsIHAzLCB0ICkge1xuXG5cdFx0XHR2YXIgdjAgPSAoIHAyIC0gcDAgKSAqIDAuNSwgdjEgPSAoIHAzIC0gcDEgKSAqIDAuNSwgdDIgPSB0ICogdCwgdDMgPSB0ICogdDI7XG5cdFx0XHRyZXR1cm4gKCAyICogcDEgLSAyICogcDIgKyB2MCArIHYxICkgKiB0MyArICggLSAzICogcDEgKyAzICogcDIgLSAyICogdjAgLSB2MSApICogdDIgKyB2MCAqIHQgKyBwMTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzPVRXRUVOOyIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBbXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhMzlhOTgyZDEwMzAwOGM0YjIwXCIsXG5cdFx0XCJuYW1lXCI6IFwiQ2hyaXN0b3BoZXIgQ2hlZGVhdVwiLFxuXHRcdFwiYmlvXCI6IFwiRnJlbmNoeSBGcm9udC1lbmQgRW5naW5lZXIgYXQgRmFjZWJvb2suIFdvcmtpbmcgb24gUmVhY3QuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJ2amV1eFwiLFxuXHRcdFwiaXNPcmdhbmlzZXJcIjogdHJ1ZSxcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL2NocmlzdG9waGVyLWNoZWRlYXUuanBnXCIsXG5cdFx0XCJ0d2l0dGVyXCI6IFwidmpldXhcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJrZXlub3RlXCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wMlQwODozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wMlQwODowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIktleW5vdGVcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPmNvbWluZyBzb29uPC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTM5YTk4MmQxMDMwMDhjNGIyMFwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNGNcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjFcIixcblx0XHRcIm5hbWVcIjogXCJNaWNoYWVsIENoYW5cIixcblx0XHRcImJpb1wiOiBcIk1pY2hhZWwgQ2hhbiBpcyBubyBzcGVjaWFsIGZsb3dlci4gSGUgbG92ZXMgcmFtZW4gYW5kIGhlbHBpbmcgSlMgbjAwYnMgbGVhcm4gUmVhY3QuIE1pY2hhZWwgaXMgYSBkZXZlbG9wZXIgYXQgUGxhbm5pbmcgQ2VudGVyIE9ubGluZSB3aGVyZSBoZSBnbGVlZnVsbHkgY3JlYXRlcyBzaGFyZWQgbGlicmFyaWVzIGFuZCBjb21wb25lbnRzIGZvciBQbGFubmluZyBDZW50ZXIncyBzaXggYXBwbGljYXRpb25zLiBMYXN0IHNwcmluZyBoZSBidWlsdCB0aGUgY29tcGFueSdzIGZpcnN0IFJlYWN0IGFwcGxpY2F0aW9uLCBTZXJ2aWNlcyBMaXZlIDMsIGFuZCBjb250aW51ZXMgdG8gZGV2ZWxvcCBwcmFjdGljZXMgYW5kIHBhdHRlcm5zIGZvciB3cml0aW5nIFJlYWN0LmpzIG9uIFJhaWxzLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiY2hhbnRhc3RpY1wiLFxuXHRcdFwiaXNTcGVha2VyXCI6IHRydWUsXG5cdFx0XCJwaWN0dXJlXCI6IFwiLi9pbWcvc3BlYWtlcnMvbWljaGFlbC1jaGFuLmpwZ1wiLFxuXHRcdFwidHdpdHRlclwiOiBcImNoYW50XCIsXG5cdFx0XCJ0YWxrc1wiOiBbXG5cdFx0XHR7XG5cdFx0XHRcdFwia2V5XCI6IFwiaW5saW5lLXN0eWxlcy10aGVtZXMtbWVkaWEtcXVlcmllcy1jb250ZXh0cy1hbmQtd2hlbi1pdHMtYmVzdC10by11c2UtY3NzXCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wMlQwOTowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wMlQwODozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIklubGluZSBTdHlsZXM6IHRoZW1lcywgbWVkaWEgcXVlcmllcywgY29udGV4dHMsIGFuZCB3aGVuIGl0J3MgYmVzdCB0byB1c2UgQ1NTXCIsXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIjogXCI8cD5SZWFjdCBhbGxvd3MgeW91IHRvIHdyaXRlIHN0eWxlcyBpbmxpbmUgYW5kIGJ5cGFzcyBhIGhvc3Qgb2YgQ1NTIHNob3J0Y29taW5ncy4gU2NvcGUsIGRlcGVuZGVuY3kgbWFuYWdlbWVudCwgZGVhZCBjb2RlIGVsaW1pbmF0aW9uLCB0aGVzZSBwcm9ibGVtcyBnbyBhd2F5IHdoZW4gYWRkaW5nIHlvdXIgc3R5bGVzIGRpcmVjdGx5IHRvIGNvbXBvbmVudHMuIEJ1dCBpdCYjMzk7cyBub3QgYWxsIHJhaW5ib3dzIGFuZCB1bmljb3Jucy4gVGhpbmdzIGxpa2UgdGhlbWluZyBhbmQgbWVkaWEgcXVlcmllcyBiZWNvbWUgbXVjaCBtb3JlIGRpZmZpY3VsdCB3aGVuIGFsbCB5b3VyIHN0eWxlcyBsaXZlIGRpcmVjdGx5IG9uIGNvbXBvbmVudHMuIEluIHRoaXMgdGFsaywgd2UmIzM5O2xsIGxvb2sgYXQgaG93IHRvIHNvbHZlIHRoZXNlIHByb2JsZW1zIHdpdGggY29udGV4dHMgYW5kIHBsYWluIG9sZCBKYXZhU2NyaXB0LiBXZSYjMzk7bGwgYWxzbyBsb29rIGF0IHRoZSByb2xlIG9mIGNvbnRhaW5lci1jb21wb25lbnRzIGFuZCB3aGVuIGl0JiMzOTtzIGJldHRlciB0byAmcXVvdDtqdXN0IHVzZSBDU1MuJnF1b3Q7PC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTNhYTk4MmQxMDMwMDhjNGIyMVwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNGRcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjJcIixcblx0XHRcIm5hbWVcIjogXCJFbGllIFJvdGVuYmVyZ1wiLFxuXHRcdFwiYmlvXCI6IFwiUGhEIGluIENvbXB1dGVyIFNjaWVuY2UsIENUTyBhbmQgU29mdHdhcmUgQXJjaGl0ZWN0IGF0IFdlYmVkaWEgR2FtaW5nIChlZGl0b3Igb2YgamV1eHZpZGVvLmNvbSBhbmQgbWlsbGVuaXVtLm9yZyksIEVsaWUgUm90ZW5iZXJnIGlzIGEgc3BlY2lhbGlzdCBpbiBkZXNpZ25pbmcgYW5kIGRlcGxveWluZyByZWFsLXRpbWUsIGxhcmdlLXNjYWxlIHdlYiBhcHBsaWNhdGlvbnMsIHN1Y2ggYXMgQ2hhdHMsIFdlYiBUVnMsIHVwIHRvIHRlbnMgb2YgdGhvdXNhbmRzIG9mIGNvbmN1cnJlbnQgdXNlcnMuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJlbGllcm90ZW5iZXJnXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9lbGllLXJvdGVuYmVyZy5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJlbGllclwiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImZsdXgtb3Zlci10aGUtd2lyZVwiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDM2MDAwMDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDJUMTA6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDJUMDk6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJGbHV4IG92ZXIgdGhlIFdpcmVcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPkZsdXggaXMgbW9zdCBvZnRlbiB1c2VkIHRvIGltcGxlbWVudCBzaGFyZWQgc3RhdGUgd2l0aGluIGEgc2luZ2xlIHdpbmRvdy4gQnV0IGRvbmUgcHJvcGVybHksIHRoaXMgYXJjaGl0ZWN0dXJlIGNhbiBiZSB1c2VkIHRvIGltcGxlbWVudCByZWFsLXRpbWUsIG11bHRpLXVzZXIgc2hhcmVkIHN0YXRlIGJldHdlZW4gbWFueSB1c2VycyBvZiB0aGUgc2FtZSB3ZWIgYXBwbGljYXRpb25zLiBVc2luZyBIVFRQIHJlcXVlc3RzIHRvIGRpc3BhdGNoIHN0b3JlcywgYW5kIFdlYnNvY2tldCB0byBicm9hZGNhc3QgdXBkYXRlcywgRmx1eCBvdmVyIHRoZSBXaXJlIGhhcyB0aGUgcG90ZW50aWFsIHRvIHRyaXZpYWxpemUgc2V2ZXJhbCBoYXJkIHByb2JsZW1zLiBXaGlsZSB0aGUgaWRlYSBvZiB1c2luZyBXZWJzb2NrZXRzIHRvIGJhY2sgRmx1eCBpcyByYXRoZXIgc3RyYWlnaHRmb3J3YXJkLCBkb2luZyBpdCBpbiBhIHdheSB0aGF0IHNjYWxlcyB1cCB0byB0ZW5zIG9mIHRob3VzYW5kcyBvZiBjb25jdXJyZW50IHZpZXdlcnMgY2FuIHByb3ZlIGNoYWxsZW5naW5nLiBJbiBhZGRpdGlvbiwgRmx1eCBvdmVyIHRoZSBXaXJlIG9mZmVycyBhbiBpbnRlcmZhY2Ugd2hpY2ggY29uc2lkZXJhYmx5IGVhc2VzIHNlcnZlci1zaWRlIHJlbmRlcmluZywgYXMgaXQgY29tcGxldGVseSBhYnN0cmFjdHMgZGF0YSBmZXRjaGluZyBhbmQgZGF0YSBzeW5jaW5nIGZyb20gdGhlIFJlYWN0IHZpZXdzIHRoYXQgdGFwIGludG8gaXRzIHN0b3JlcyBhbmQgZGlzcGF0Y2ggaXRzIGFjdGlvbnMuPC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTNhYTk4MmQxMDMwMDhjNGIyMlwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNGZcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjNcIixcblx0XHRcIm5hbWVcIjogXCJTcGVuY2VyIEFocmVuc1wiLFxuXHRcdFwiYmlvXCI6IFwiU3BlbmNlciBoYXMgd29ya2VkIG9uIGEgdmFyaWV0eSBvZiBwcm9qZWN0cyBhdCBGYWNlYm9vayBvdmVyIHRoZSBsYXN0IHNldmVyYWwgeWVhcnMgaW5jbHVkaW5nIEFuZHJvaWQsIGlPUywgYW5kIG1vYmlsZSB3ZWIgcHJvZHVjdCB0ZWFtcywgTmV3cyBGZWVkIEFQSSwgYW5kIFNlYXJjaCBJbmZyYXN0cnVjdHVyZS4gSGUncyBjdXJyZW50bHkgd29ya2luZyBvbiBSZWFjdCBOYXRpdmUuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJzYWhyZW5zXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9zcGVuY2VyLWFocmVucy5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJyZWFjdC1uYXRpdmUtYnVpbGRpbmctZmx1aWQtdXNlci1leHBlcmllbmNlc1wiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDJUMTA6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDJUMTA6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJSZWFjdCBOYXRpdmU6IEJ1aWxkaW5nIEZsdWlkIFVzZXIgRXhwZXJpZW5jZXNcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPlJlYWN0IE5hdGl2ZSYjMzk7cyBhcmNoaXRlY3R1cmUgaGFzIG9wZW5lZCB1cCBtYW55IHBvc3NpYmlsaXRpZXMgZm9yIHJlLWludmVudGluZyB0aGUgY2x1bmtpZXIgYXNwZWN0cyBvZiBVWCBjb25zdHJ1Y3Rpb24gb24gdHJhZGl0aW9uYWwgcGxhdGZvcm1zLCBtYWtpbmcgaXQgZWFzaWVyIGFuZCBmYXN0ZXIgdG8gYnVpbGQgd29ybGQtY2xhc3MgZXhwZXJpZW5jZXMuIFRoaXMgdGFsayB3aWxsIHdhbGsgdGhyb3VnaCBidWlsZGluZyBhbiBhZHZhbmNlZCBnZXN0dXJhbCBVSSBsZXZlcmFnaW5nIHRoZSB1bmlxdWUgcG93ZXIgb2YgdGhlIFJlYWN0IE5hdGl2ZSBsYXlvdXQgYW5kIGFuaW1hdGlvbiBzeXN0ZW1zIHRvIGJ1aWxkIGEgY29tcGxleCBhbmQgZmx1aWQgZXhwZXJpZW5jZS48L3A+XFxuXCIsXG5cdFx0XHRcdFwic3BlYWtlcnNcIjogW1xuXHRcdFx0XHRcdFwiNTU4MjZhM2FhOTgyZDEwMzAwOGM0YjIzXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGI1MFwiLFxuXHRcdFx0XHRcImZlZWRiYWNrXCI6IHt9XG5cdFx0XHR9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0XCJpZFwiOiBcIjU1ODI2YTNhYTk4MmQxMDMwMDhjNGIyNFwiLFxuXHRcdFwibmFtZVwiOiBcIkRhbiBTY2hhZmVyXCIsXG5cdFx0XCJiaW9cIjogXCJEYW4gU2NoYWZlciBpcyBhIGNvLWNyZWF0b3Igb2YgR3JhcGhRTCwgYW5kIGRlc2lnbmVkIHRoZSBkYXRhIG1vZGVsIGJhY2tpbmcgdGhlIG9yaWdpbmFsIEdyYXBoUUwgQVBJLCB3aGljaCBwb3dlcmVkIEZhY2Vib29rJ3MgbmV3cyBmZWVkLiBIZSBhZGRlZCBHcmFwaFFMJ3Mgc3VwcG9ydCBmb3Igd3JpdGVzLCBhbmQgaGFzIGhlbHBlZCBtYWludGFpbiBGYWNlYm9vaydzIEdyYXBoUUwgZW5naW5lIGFuZCBBUElzIGZvciBhbG1vc3QgdGhyZWUgeWVhcnMuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJkc2NoYWZlclwiLFxuXHRcdFwiaXNTcGVha2VyXCI6IHRydWUsXG5cdFx0XCJwaWN0dXJlXCI6IFwiLi9pbWcvc3BlYWtlcnMvZGxzY2hhZmVyLmpwZ1wiLFxuXHRcdFwidHdpdHRlclwiOiBcImRsc2NoXCIsXG5cdFx0XCJ0YWxrc1wiOiBbXG5cdFx0XHR7XG5cdFx0XHRcdFwia2V5XCI6IFwiY3JlYXRpbmctYS1ncmFwaHFsLXNlcnZlclwiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDE4MDAwMDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDNUMTM6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDNUMTI6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJDcmVhdGluZyBhIEdyYXBoUUwgU2VydmVyXCIsXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIjogXCI8cD5JbiB0aGlzIHRhbGssIHdlJiMzOTtsbCB0YWtlIGEgZGVlcGVyIGRpdmUgaW50byBwdXR0aW5nIEdyYXBoUUwgdG8gd29yay4gSG93IGNhbiB3ZSBidWlsZCBhIEdyYXBoUUwgQVBJIHRvIHdvcmsgd2l0aCBhbiBleGlzdGluZyBSRVNUIEFQSSBvciBzZXJ2ZXItc2lkZSBkYXRhIG1vZGVsPyBXaGF0IGFyZSBiZXN0IHByYWN0aWNlcyB3aGVuIGJ1aWxkaW5nIGEgR3JhcGhRTCBBUEksIGFuZCBob3cgZG8gdGhleSBkaWZmZXIgZnJvbSB0cmFkaXRpb25hbCBSRVNUIGJlc3QgcHJhY3RpY2VzPyBIb3cgZG9lcyBGYWNlYm9vayB1c2UgR3JhcGhRTD8gTW9zdCBpbXBvcnRhbnRseSwgd2hhdCBkb2VzIGEgY29tcGxldGUgYW5kIGNvaGVyZW50IEdyYXBoUUwgQVBJIGxvb2tzIGxpa2UsIGFuZCBob3cgY2FuIHdlIGdldCBzdGFydGVkIGJ1aWxkaW5nIG9uZT88L3A+XFxuXCIsXG5cdFx0XHRcdFwic3BlYWtlcnNcIjogW1xuXHRcdFx0XHRcdFwiNTU4MjZhM2FhOTgyZDEwMzAwOGM0YjI0XCIsXG5cdFx0XHRcdFx0XCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjVcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjYzXCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2FhOTgyZDEwMzAwOGM0YjI1XCIsXG5cdFx0XCJuYW1lXCI6IFwiTmljayBTY2hyb2NrXCIsXG5cdFx0XCJiaW9cIjogXCJOaWNrIFNjaHJvY2sgaXMgYSBjby1jcmVhdG9yIG9mIEdyYXBoUUwsIGFuZCB3cm90ZSB0aGUgb3JpZ2luYWwgdmVyc2lvbiBvZiBGYWNlYm9vaydzIEdyYXBoUUwgZW5naW5lLiBBbiBvcmlnaW5hbCBtZW1iZXIgb2YgRmFjZWJvb2sncyBQcm9kdWN0IEluZnJhc3RydWN0dXJlIHRlYW0sIE5pY2sgaGVscGVkIGNyZWF0ZSB0aGUgYWJzdHJhY3Rpb25zIHRoYXQgcG93ZXIgRmFjZWJvb2tzJ3MgUEhQIGRhdGEgbW9kZWwsIGFuZCBidWlsdCBvdXQgdGhlIEZhY2Vib29rJ3MgaU9TIGFuZCBBbmRyb2lkIHRvb2xpbmcgYXJvdW5kIEdyYXBoUUwuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJzY2hyb2NrblwiLFxuXHRcdFwiaXNTcGVha2VyXCI6IHRydWUsXG5cdFx0XCJwaWN0dXJlXCI6IFwiLi9pbWcvc3BlYWtlcnMvc2Nocm9ja24uanBnXCIsXG5cdFx0XCJ0d2l0dGVyXCI6IFwic2Nocm9ja25cIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJjcmVhdGluZy1hLWdyYXBocWwtc2VydmVyXCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxMzowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxMjozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIkNyZWF0aW5nIGEgR3JhcGhRTCBTZXJ2ZXJcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPkluIHRoaXMgdGFsaywgd2UmIzM5O2xsIHRha2UgYSBkZWVwZXIgZGl2ZSBpbnRvIHB1dHRpbmcgR3JhcGhRTCB0byB3b3JrLiBIb3cgY2FuIHdlIGJ1aWxkIGEgR3JhcGhRTCBBUEkgdG8gd29yayB3aXRoIGFuIGV4aXN0aW5nIFJFU1QgQVBJIG9yIHNlcnZlci1zaWRlIGRhdGEgbW9kZWw/IFdoYXQgYXJlIGJlc3QgcHJhY3RpY2VzIHdoZW4gYnVpbGRpbmcgYSBHcmFwaFFMIEFQSSwgYW5kIGhvdyBkbyB0aGV5IGRpZmZlciBmcm9tIHRyYWRpdGlvbmFsIFJFU1QgYmVzdCBwcmFjdGljZXM/IEhvdyBkb2VzIEZhY2Vib29rIHVzZSBHcmFwaFFMPyBNb3N0IGltcG9ydGFudGx5LCB3aGF0IGRvZXMgYSBjb21wbGV0ZSBhbmQgY29oZXJlbnQgR3JhcGhRTCBBUEkgbG9va3MgbGlrZSwgYW5kIGhvdyBjYW4gd2UgZ2V0IHN0YXJ0ZWQgYnVpbGRpbmcgb25lPzwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjRcIixcblx0XHRcdFx0XHRcIjU1ODI2YTNhYTk4MmQxMDMwMDhjNGIyNVwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNjNcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjZcIixcblx0XHRcIm5hbWVcIjogXCJSeWFuIEZsb3JlbmNlXCIsXG5cdFx0XCJiaW9cIjogXCJKYXZhU2NyaXB0IENvbnN1bHRhbnQvVHJhaW5lciwgY28tYXV0aG9yIG9mIFJlYWN0IFJvdXRlci5cIixcblx0XHRcImdpdGh1YlwiOiBcInJ5YW5mbG9yZW5jZVwiLFxuXHRcdFwiaXNTcGVha2VyXCI6IHRydWUsXG5cdFx0XCJwaWN0dXJlXCI6IFwiLi9pbWcvc3BlYWtlcnMvcnlhbi1mbG9yZW5jZS5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJyeWFuZlwiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImhlbHAtaS1jYW50LWhlYXItbXktd2Vic2l0ZVwiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDE4MDAwMDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDJUMTM6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDJUMTI6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJIZWxwISBJIENhbid0IEhlYXIgTXkgV2Vic2l0ZSFcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPkhhdmUgeW91IGV2ZXIgdXNlZCBhbiBhc3Npc3RpdmUgZGV2aWNlIGxpa2UgYSBzY3JlZW4gcmVhZGVyIG9uIHlvdXIgd2Vic2l0ZT8gVGhlcmUmIzM5O3MgYSBnb29kIGNoYW5jZSBpdHMgYWJvdXQgYXMgdXNhYmxlIGFzIG9wZW5pbmcgaXQgaW4gSUUgNS41LiBJdHMgbm90IGFib3V0ICZxdW90O2FsdCB0YWdzJnF1b3Q7IGFueW1vcmUuIFB1dCBvbiB5b3VyIGVtcGF0aHkgaGF0LCBvciBoYXZlIG9uZSBmb3JjZWQgb24geW91LCB3aGlsZSBJIHRhbGsgYWJvdXQgd2hhdCBpdHMgbGlrZSBmb3IgcGVvcGxlIHdpdGggdmlzaW9uIGltcGFpcm1lbnQuPC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTNhYTk4MmQxMDMwMDhjNGIyNlwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNTNcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjdcIixcblx0XHRcIm5hbWVcIjogXCJEYW4gQWJyYW1vdlwiLFxuXHRcdFwiYmlvXCI6IFwiRGFuIGlzIHlvdW5nIGRldmVsb3BlciB3aG8gYmVnYW4gd3JpdGluZyBKYXZhU2NyaXB0IGZ1bGwtdGltZSB0d28geWVhcnMgYWdvLlxcbiAgICBVbnNhdGlzaWZlZCB3aXRoIEJhY2tib25l4oCZcyBzaG9ydGNvbWluZ3MsIERhbiBmb3VuZCBSZWFjdCBhbmQgRmx1eCB0byBiZSBhIHZlcnlcXG4gICAgc29saWQgZm91bmRhdGlvbiBmb3IgYnVpbGRpbmcgY29tcG9zaXRlIGFuZCBzdGF0ZWZ1bCB1c2VyIGludGVyZmFjZXMgYXQgU3RhbXBzeS5cXG4gICAgRGFuIGF1dGhvcmVkIGFuZCBjb250cmlidXRlZCB0byBzZXZlcmFsIHBvcHVsYXIgUmVhY3QgY29tcG9uZW50cyBhbmQgbGlicmFyaWVzLlxcbiAgICBCZWZvcmUgZ2V0dGluZyBpbnRvIEphdmFTY3JpcHQsIGhlIHVzZWQgdG8gd3JpdGUgQyMgZm9yIFdpbmRvd3MsIExpbnV4IGFuZCBpT1MuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJnYWVhcm9uXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9kYW4tYWJyYW1vdi5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJkYW5fYWJyYW1vdlwiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImxpdmUtcmVhY3QtaG90LXJlbG9hZGluZy13aXRoLXRpbWUtdHJhdmVsXCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wMlQxNDowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wMlQxMzozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIkxpdmUgUmVhY3Q6IEhvdCBSZWxvYWRpbmcgd2l0aCBUaW1lIFRyYXZlbFwiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+UmVhY3TigJlzIHVuaXF1ZSBzdHJlbmd0aCBpcyBicmluZ2luZyB0byBKYXZhU2NyaXB0IGRldmVsb3BtZW50IHNvbWUgb2YgdGhlXFxuICAgIGJlbmVmaXRzIHByZXZpb3VzbHkgZXhjbHVzaXZlIHRvIG1vcmUgcmFkaWNhbGx5IGZ1bmN0aW9uYWwgbGFuZ3VhZ2VzIHN1Y2ggYXNcXG4gICAgRWxtIGFuZCBDbG9qdXJlU2NyaXB0LCB3aXRob3V0IGZvcmNpbmcgeW91IHRvIGNvbXBsZXRlbHkgZXNjaGV3IGxvY2FsIHN0YXRlXFxuICAgIG9yIHJld3JpdGUgY29kZSB3aXRoIGV4Y2x1c2l2ZWx5IGltbXV0YWJsZSBkYXRhIHN0cnVjdHVyZXMuXFxuICAgIEluIHRoaXMgdGFsaywgRGFuIHdpbGwgZGVtb25zdHJhdGUgaG93IFJlYWN0IGNhbiBiZSB1c2VkIHRvZ2V0aGVyIHdpdGhcXG4gICAgV2VicGFjayBIb3QgTW9kdWxlIFJlcGxhY2VtZW50IHRvIGNyZWF0ZSBhIGxpdmUgZWRpdGluZyBlbnZpcm9ubWVudCB3aXRoXFxuICAgIHRpbWUgdHJhdmVsIHRoYXQgc3VwZXJjaGFyZ2VzIHlvdXIgZGVidWdnaW5nIGV4cGVyaWVuY2UgYW5kIHRyYW5zZm9ybXMgdGhlXFxuICAgIHdheSB5b3Ugd29yayBvbiByZWFsIGFwcHMgZXZlcnkgZGF5LjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjdcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjU1XCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2FhOTgyZDEwMzAwOGM0YjI4XCIsXG5cdFx0XCJuYW1lXCI6IFwiSm9zZXBoIFNhdm9uYVwiLFxuXHRcdFwiYmlvXCI6IFwiSm9zZXBoIFNhdm9uYSBpcyBhIGRldmVsb3BlciBhdCBGYWNlYm9vayB3b3JraW5nIG9uIFJlbGF5IGFuZCBHcmFwaFFMLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiam9zZXBoc2F2b25hXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9qb3NlcGgtc2F2b25hLmpwZ1wiLFxuXHRcdFwidHdpdHRlclwiOiBcImVuX2pzXCIsXG5cdFx0XCJ0YWxrc1wiOiBbXG5cdFx0XHR7XG5cdFx0XHRcdFwia2V5XCI6IFwicmVsYXktYW4tYXBwbGljYXRpb24tZnJhbWV3b3JrLWZvci1yZWFjdFwiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDM2MDAwMDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDJUMTQ6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDJUMTQ6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJSZWxheTogQW4gQXBwbGljYXRpb24gRnJhbWV3b3JrIEZvciBSZWFjdFwiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+UmVsYXkgaXMgYSBuZXcgZnJhbWV3b3JrIGZyb20gRmFjZWJvb2sgdGhhdCBlbmFibGVzIGRlY2xhcmF0aXZlIGRhdGEgZmV0Y2hpbmcgJmFtcDsgdXBkYXRlcyBmb3IgUmVhY3QgYXBwbGljYXRpb25zLiBSZWxheSBjb21wb25lbnRzIHVzZSBHcmFwaFFMIHRvIHNwZWNpZnkgdGhlaXIgZGF0YSByZXF1aXJlbWVudHMsIGFuZCBjb21wb3NlIHRvZ2V0aGVyIHRvIGZvcm0gdHJ1bHkgbW9kdWxhciBhcHBsaWNhdGlvbnMuIFRoaXMgdGFsayB3aWxsIGV4cGxvcmUgdGhlIHByb2JsZW1zIFJlbGF5IHNvbHZlcywgaXRzIGFyY2hpdGVjdHVyZSBhbmQgdGhlIHF1ZXJ5IGxpZmVjeWNsZSwgYW5kIGhvdyBjYW4geW91IHVzZSBSZWxheSB0byBidWlsZCBtb3JlIHNjYWxhYmxlIGFwcHMuIFdl4oCZbGwgYWxzbyBzZWUgZXhhbXBsZXMgb2YgaG93IFJlbGF5IHBvd2VycyBhcHBsaWNhdGlvbnMgYXMgY29tcGxleCBhcyB0aGUgRmFjZWJvb2sgTmV3cyBGZWVkLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYWE5ODJkMTAzMDA4YzRiMjhcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjU2XCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2FhOTgyZDEwMzAwOGM0YjI5XCIsXG5cdFx0XCJuYW1lXCI6IFwiTWlraGFpbCBEYXZ5ZG92XCIsXG5cdFx0XCJiaW9cIjogXCJNaWtoYWlsIGlzIGEgZnVsbCBzdGFjayBKYXZhU2NyaXB0IGRldmVsb3BlciBhdCBQcm9kdWN0aXZlIE1vYmlsZSBhbmQgY3VycmVudGx5IHdvcmtpbmcgb25cXG4gICAgcHJvamVjdCB3aGljaCB0cmFuc2Zvcm1zIGVudGVycHJpc2Ugd2ViIGFwcGxpY2F0aW9ucyBpbnRvIG1vYmlsZS4gQmVmb3JlIHRoYXQgdGltZVxcbiAgICBoZSB3b3JrZWQgZm9yIFlhbmRleCBhbmQgdGF1Z2h0IGFib3V0IDIwMCBkZXZlbG9wZXJzIHRvIHdyaXRlIGF3ZXNvbWUgSmF2YVNjcmlwdCBhcHBzLlxcbiAgICBIZSBoYXMgbWFueSB0YWxrcyBhbmQgbGVjdHVyZXMgYWJvdXQgSmF2YVNjcmlwdCBhbmQgcmVsYXRlZCB0ZWNobm9sb2dpZXMuXFxuICAgIE9uIGxlaXN1cmUgdGltZSBoZSB0YWtlcyBwaWN0dXJlcyBhbmQgdHJpZXMgdG8gbWFycnkgdGVjaG5vbG9neSBhbmQgcGhvdG9ncmFwaHkgaW4gaGlzXFxuICAgIFxcXCIybGF5ZXIgcGhvdG8tcHJvamVjdFxcXCIuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJhenByb2R1Y3Rpb25cIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL21pa2hhaWwtZGF2eWRvdi5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJhenByb2R1Y3Rpb25cIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJiYWNrLXRvLXRleHQtdWlcIixcblx0XHRcdFx0XCJkdXJhdGlvblwiOiAxODAwMDAwLFxuXHRcdFx0XHRcImVuZFRpbWVcIjogXCIyMDE1LTA3LTAyVDE1OjMwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJzdGFydFRpbWVcIjogXCIyMDE1LTA3LTAyVDE1OjAwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJ0eXBlXCI6IFwidGFsa1wiLFxuXHRcdFx0XHRcInRpdGxlXCI6IFwiQmFjayB0byBUZXh0IFVJXCIsXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIjogXCI8cD5QYXJhZG94aWNhbGx5IHRoYXQgdG9kYXkgaXQgaXMgZWFzaWVyIHRvIGNyZWF0ZSBHVUkgdGhhbiBUZXh0IFVJLlxcbiAgICBEZXZlbG9wZXIgaGFzIGFuIGFyc2VuYWwgb2YgZGlmZmVyZW50IEdVSSBsaWJyYXJpZXMgYW5kIGxheW91dCBlbmdpbmVzLlxcbiAgICBXaGVuIG9uZSBkZWNpZGVzIHRvIHdyaXRlIFRlcm1pbmFsIFRleHQgVUkgYXBwIGhlIGZhY2VzIG9ic3RhY2xlc1xcbiAgICBvZiBUZXh0IFVJIERTTCBMaWJyYXJ5LCBpbXBlcmF0aXZlIGxheW91dHMsIGNvbnN0YW50bHkgaW5jcmVhc2luZ1xcbiAgICBjb21wbGV4aXR5IGFuZCB1bmRlcmRldmVsb3BlZCBhcHByb2FjaGVzLlxcbiAgICBJbiB0aGlzIHRhbGsgSSB3aWxsIHNob3cgeW91IGhvdyB0byBhc2sgYnJvd3NlciBsYXlvdXQgZW5naW5lIGZvciBoZWxwLFxcbiAgICBob3cgdG8gYXZvaWQgc2xhdmVyeSBvZiBEU0wgYW5kIGJ1aWxkIGRlY2xhcmF0aXZlIFRleHQgVUkgdXNpbmcgb25seVxcbiAgICB3ZWItdGVjaG5vbG9naWVzIGxpa2UgSFRNTCwgSlMsIENTUyBhbmQgUmVhY3QuPC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTNhYTk4MmQxMDMwMDhjNGIyOVwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNThcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMmFcIixcblx0XHRcIm5hbWVcIjogXCJTZWJhc3RpYW4gTWNLZW56aWVcIixcblx0XHRcImJpb1wiOiBcIlNlYmFzdGlhbiBNY0tlbnppZSBpcyBhIEphdmFTY3JpcHQgZW50aHVzaWFzdCBiYXNlZCBpbiBTeWRuZXksIEF1c3RyYWxpYS5cXG4gICAgSGUncyBleHRyZW1lbHkgcGFzc2lvbmF0ZSBhYm91dCBvcGVuIHNvdXJjZSBhcyB3ZWxsIGFzIHdlYiBzdGFuZGFyZHMgYW5kIGlzXFxuICAgIGFsd2F5cyBsb29raW5nIHRvIHB1c2ggdGhlIGJvdW5kYXJpZXMgb2Ygd2hhdCBpcyBwb3NzaWJsZS5cXG4gICAgU2ViYXN0aWFuIGlzIGFsc28gdGhlIGNyZWF0b3Igb2YgdGhlIHBvcHVsYXIgQmFiZWwgY29tcGlsZXIgdGhhdCdzIHVzZWQgYnlcXG4gICAgbWFueSBSZWFjdCBkZXZlbG9wZXJzIHRvIGJyaW5nIHRoZWlyIEpTWCBhbmQgRVM2IHRvIGxpZmUuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJzZWJtY2tcIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL3NlYmFzdGlhbi1tY0tlbnppZS5wbmdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJzZWJtY2tcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJpbXByb3ZpbmcteW91ci13b3JrZmxvdy13aXRoLWNvZGUtdHJhbnNmb3JtYXRpb25cIixcblx0XHRcdFx0XCJkdXJhdGlvblwiOiAxODAwMDAwLFxuXHRcdFx0XHRcImVuZFRpbWVcIjogXCIyMDE1LTA3LTAzVDA4OjMwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJzdGFydFRpbWVcIjogXCIyMDE1LTA3LTAzVDA4OjAwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJ0eXBlXCI6IFwidGFsa1wiLFxuXHRcdFx0XHRcInRpdGxlXCI6IFwiSW1wcm92aW5nIFlvdXIgV29ya2Zsb3cgV2l0aCBDb2RlIFRyYW5zZm9ybWF0aW9uXCIsXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIjogXCI8cD5Nb3N0IFJlYWN0IGRldmVsb3BlcnMgYWxyZWFkeSB1c2UgYSBidWlsZCBwaXBlbGluZSB0byB0cmFuc2Zvcm0gdGhlaXIgSlNYXFxuICAgIGludG8gdmFuaWxsYSBKYXZhU2NyaXB0LiBUaGlzIGlzIHVzdWFsbHkgdW5kZXItdXRpbGlzZWQgb25seSBkb2luZyBiYXNpY1xcbiAgICB0cmFuc2Zvcm1hdGlvbnMgc3VjaCBhcyBjb25jYXRlbmF0aW9uLCBtaW5pZmljYXRpb24gYW5kIGxpbnRpbmcuXFxuICAgIEluIHRoaXMgdGFsaywgU2ViYXN0aWFuIHdpbGwgZ28gb3ZlciBob3cgdGhpcyBhbHJlYWR5IGV4aXN0aW5nIGluZnJhc3RydWN0dXJlXFxuICAgIGNhbiBiZSBmdXJ0aGVyIHV0aWxpc2VkIHRvIHBlcmZvcm0gZXZlbiBtb3JlIHNpZ25pZmljYW50IGNvZGUgdHJhbnNmb3JtYXRpb25zXFxuICAgIHN1Y2ggYXMgdHJhbnNwaWxhdGlvbiwgb3B0aW1pc2F0aW9uLCBwcm9maWxpbmcgYW5kIG1vcmUsIHJlZHVjaW5nIGJ1Z3MsXFxuICAgIG1ha2luZyB5b3VyIGNvZGUgZmFzdGVyIGFuZCB5b3UgYXMgYSBkZXZlbG9wZXIgbW9yZSBwcm9kdWN0aXZlIGFuZCBoYXBweS48L3A+XFxuXCIsXG5cdFx0XHRcdFwic3BlYWtlcnNcIjogW1xuXHRcdFx0XHRcdFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjJhXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGI1Y1wiLFxuXHRcdFx0XHRcImZlZWRiYWNrXCI6IHt9XG5cdFx0XHR9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIyYlwiLFxuXHRcdFwibmFtZVwiOiBcIkNoZW5nIExvdVwiLFxuXHRcdFwiYmlvXCI6IFwiSSBzdGFydGVkIG1ha2luZyBtYW51YWwgYW5pbWF0aW9uIGluIEZsYXNoLCBhbmQgbmV2ZXIgcmVhbGx5IGxlZnQgaW4gc3Bpcml0LlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiY2hlbmdsb3VcIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL2NoZW5nLWxvdS5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJfY2hlbmdsb3VcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJ0aGUtc3RhdGUtb2YtYW5pbWF0aW9uLWluLXJlYWN0XCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wM1QwOTowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wM1QwODozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIlRoZSBTdGF0ZSBvZiBBbmltYXRpb24gaW4gUmVhY3RcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPkEgdGFsayBvbiB0aGUgcGFzdCwgdGhlIHByZXNlbnQgYW5kIHRoZSBmdXR1cmUgb2YgYW5pbWF0aW9uLCBhbmQgdGhlIHBsYWNlXFxuICAgIFJlYWN0IGNhbiBwb3RlbnRpYWxseSB0YWtlIGluIHRoaXMuIEkgd2lsbCBiZSBmb2N1c2luZyBvbiBhIGZldyBleHBlcmltZW50c1xcbiAgICBvbiBhbmltYXRpb24gSSYjMzk7dmUgZG9uZSwgc3BlY2lmaWNhbGx5OiByZWFjdC10d2Vlbi1zdGF0ZSwgcmVhY3Qtc3RhdGUtc3RyZWFtXFxuICAgIGFuZCBzb21lIHVucmVsZWFzZWQgdHJhbnNpdGlvbi1ncm91cCByZWxhdGVkIHRob3VnaHRzIGFuZCB3b3JrLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMmJcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjVkXCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjJjXCIsXG5cdFx0XCJuYW1lXCI6IFwiS2V2aW4gUm9iaW5zb25cIixcblx0XHRcImJpb1wiOiBcIlNvZnR3YXJlIEVuZ2luZWVyIGF0IFR3aXR0ZXIuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJrZXZpbnJvYmluc29uXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9rZXZpbi1yb2JpbnNvbi5wbmdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJrcm9iXCIsXG5cdFx0XCJ0YWxrc1wiOiBbXG5cdFx0XHR7XG5cdFx0XHRcdFwia2V5XCI6IFwic2ltcGxpZnlpbmctdGhlLWRhdGEtbGF5ZXJcIixcblx0XHRcdFx0XCJkdXJhdGlvblwiOiAxODAwMDAwLFxuXHRcdFx0XHRcImVuZFRpbWVcIjogXCIyMDE1LTA3LTAzVDEwOjAwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJzdGFydFRpbWVcIjogXCIyMDE1LTA3LTAzVDA5OjMwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJ0eXBlXCI6IFwidGFsa1wiLFxuXHRcdFx0XHRcInRpdGxlXCI6IFwiU2ltcGxpZnlpbmcgdGhlIGRhdGEgbGF5ZXJcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPkF0IFR3aXR0ZXIsIHRlYW1zIGhhdmUgc3RhcnRpbmcgYWRvcHRpbmcgUmVhY3QgYmVjYXVzZSBpdOKAmXMgZW5hYmxlZCBVSSBlbmdpbmVlcnMgdG8gZm9yZ2V0IGFib3V0IHRpbWUgd2hlbiB3cml0aW5nIHJlbmRlcmluZyBjb2RlLiBBbmQgd2UmIzM5O3ZlIHN0YXJ0ZWQgZXhwbG9yaW5nIHNpbWlsYXIgc2ltcGxpZmljYXRpb25zIGluIHRoZSBkYXRhIGxheWVyLCBlbWJyYWNpbmcgdGhlIFVJ4oCZcyByb2xlIGFzIHBhcnQgb2YgYSBkaXN0cmlidXRlZCBzeXN0ZW0uIEZpcnN0LCB3ZSYjMzk7bGwgc2hhcmUgaG93IHVzZXIgZXhwZXJpZW5jZSBjaG9pY2VzIGFyZSBhIHByaW1hcnkgaW5mbHVlbmNlIG9uIGhvdyB3ZSBkZXNpZ24gdGhlIGRhdGEgbGF5ZXIsIGVzcGVjaWFsbHkgZm9yIHRlYW1zIGRldmVsb3BpbmcgbmV3IHByb2R1Y3RzIHdpdGggZnVsbC1zdGFjayBjYXBhYmlsaXRpZXMuIFdvcmtpbmcgd2l0aCBkYXRhIGZyb20gbXVsdGlwbGUgYmFja2VuZCBzZXJ2aWNlcyBoYXMgcG93ZXJmdWwgYmVuZWZpdHMsIGFuZCBzaGFwZXMgdGhlIHByb2JsZW0gc3BhY2UgZm9yIFVJIGVuZ2luZWVyaW5nLiBOZXh0LCB3ZSYjMzk7bGwgbG9vayBhdCBob3cgUmVhY3QgYW5kIEZsdXggYXBwcm9hY2hlcyBjYW4gaGVscCBpbiBvdXIgcHJvYmxlbSBzY2VuYXJpb3MuIFlldCBldmVuIGFmdGVyIHRoZSBhZHZhbmNlcyBpbiBSZWFjdOKAmXMgY29tcG9uZW50IG1vZGVsLCB0aGUgZGF0YSBsYXllciBpcyBzdGlsbCBhbiBpbXBvcnRhbnQgc291cmNlIG9mIGNvbXBsZXhpdHkgYXMgYW4gYXBwIGdyb3dzIGFuZCBjaGFuZ2VzIG92ZXIgdGltZS4gRmluYWxseSwgd2UmIzM5O2xsIGxvb2sgYXQgbmV3IGFwcHJvYWNoZXMgd2XigJl2ZSBiZWVuIGV4cGxvcmluZywgYW5kIGhvdyBkZXNpZ25zIGxpa2UgZGVjb3VwbGluZyAmIzM5O3JlY29yZGluZyBmYWN0cyYjMzk7IGZyb20gJiMzOTtjb21wdXRpbmcgdmlld3Mgb2YgdGhvc2UgZmFjdHMmIzM5OyBoYXZlIGluZmx1ZW5jZWQgVUkgZW5naW5lZXJpbmcuIFRoZXNlIGRlc2lnbnMgbnVkZ2UgdGVhbXMgdG93YXJkcyBzaW1wbGljaXR5IHdoZW4gY3JlYXRpbmcgaW1wYWN0ZnVsIHVzZXItZmFjaW5nIGltcHJvdmVtZW50cyBsaWtlIHJlYWwtdGltZSB1cGRhdGVzLCBvcHRpbWlzdGljIGNvbW1pdHMsIGFuZCBncmFjZWZ1bCBoYW5kbGluZyBvZiBuZXR3b3JrIG91dGFnZXMuPC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIyY1wiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNWZcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMmRcIixcblx0XHRcIm5hbWVcIjogXCJKZWQgV2F0c29uXCIsXG5cdFx0XCJiaW9cIjogXCJQYXJ0bmVyIGF0IEB0aGV0aGlua21pbGwsIEphdmFzY3JpcHQgLyBub2RlLmpzIGRldmVsb3BlciwgZW50cmVwcmVuZXVyLCBjcmVhdG9yIG9mIEBLZXlzdG9uZUpTIGFuZCBAVG91Y2hzdG9uZUpTLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiSmVkV2F0c29uXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9qZWQtd2F0c29uLmpwZ1wiLFxuXHRcdFwidHdpdHRlclwiOiBcIkplZFdhdHNvblwiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImdvaW5nLW1vYmlsZS13aXRoLXJlYWN0XCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wM1QwMjozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wM1QwMjowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIkdvaW5nIE1vYmlsZSB3aXRoIFJlYWN0XCIsXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIjogXCI8cD5SZWFjdC5qcyBpcyBjaGFuZ2luZyB0aGUgd2F5IGRldmVsb3BlcnMgdGhpbmsgYWJvdXQgbW9iaWxlIGFwcCBkZXZlbG9wbWVudCwgZXNwZWNpYWxseSB3aXRoIHRoZSByZWNlbnQgYW5ub3VuY2VtZW50IG9mIFJlYWN0IE5hdGl2ZS4gSG93ZXZlciwgaW4gbWFueSB3YXlzIGh5YnJpZCAod2ViICsgbW9iaWxlKSBhcHAgZGV2ZWxvcG1lbnQgaXMgaGVyZSB0byBzdGF5IGZvciBhIGxhcmdlIG51bWJlciBvZiBtb2JpbGUgYXBwcy48L3A+XFxuPHA+V2UgYmVsaWV2ZSB0aGUgd2ViIGlzIGEgcG93ZXJmdWwgcGxhdGZvcm0gZm9yIGJ1aWxkaW5nIGF3ZXNvbWUgbW9iaWxlIGFwcHMgd2l0aCB0aGUgdGVjaG5vbG9neSB5b3Uga25vdy4gQXQgVGhpbmttaWxsIGluIFN5ZG5leSwgd2UmIzM5O3ZlIGV4cGVyaWVuY2VkIHRoZSBwb3dlciBvZiB1c2luZyBSZWFjdEpTIGZvciBtb2JpbGUgYXBwcyBidWlsdCBvbiB3ZWIgdGVjaG5vbG9neSwgYW5kIGRldmVsb3BlZCBhIGZyYW1ld29yayB3ZSBjYWxsIFRvdWNoc3RvbmVKUyB0byBzaGFyZSB0aGlzIGNhcGFiaWxpdHkgd2l0aCBkZXZlbG9wZXJzIGFyb3VuZCB0aGUgd29ybGQuPC9wPlxcbjxwPkluIHRoaXMgdGFsayBJJiMzOTtsbCBzaGFyZSB3aGF0IHdlJiMzOTt2ZSBsZWFybmVkIGFuZCBob3cgd2UmIzM5O3ZlIGFwcHJvYWNoZWQgdGhlIHVuaXF1ZSBjaGFsbGVuZ2VzIG9mIG1vYmlsZSB3ZWIgYXBwcy4gWW91JiMzOTtsbCBhbHNvIGhlYXIgYWJvdXQgVG91Y2hzdG9uZUpTLCBSZWFjdCBOYXRpdmUsIGFuZCBob3cgd2UgdGhpbmsgdGhleSBjb3VsZCBjb252ZXJnZSBpbiB0aGUgZnV0dXJlLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMmRcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjYwXCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjJlXCIsXG5cdFx0XCJuYW1lXCI6IFwiTWljaGFlbCBKYWNrc29uXCIsXG5cdFx0XCJiaW9cIjogXCJUaHJpbGxlci4gUHJldmlvdXNseSBAeWNvbWJpbmF0b3IgUzIwMTMsIEB0d2l0dGVyIGFuZCBAcGF0aC5cIixcblx0XHRcImdpdGh1YlwiOiBcIm1qYWNrc29uXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9taWNoYWVsLWphY2tzb24uanBnXCIsXG5cdFx0XCJ0d2l0dGVyXCI6IFwibWphY2tcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJyZWFjdC1yb3V0ZXJcIixcblx0XHRcdFx0XCJkdXJhdGlvblwiOiAxODAwMDAwLFxuXHRcdFx0XHRcImVuZFRpbWVcIjogXCIyMDE1LTA3LTAzVDEyOjMwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJzdGFydFRpbWVcIjogXCIyMDE1LTA3LTAzVDEyOjAwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJ0eXBlXCI6IFwidGFsa1wiLFxuXHRcdFx0XHRcInRpdGxlXCI6IFwiUmVhY3QgUm91dGVyXCIsXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIjogXCI8cD5TaW5jZSBNYXkgMjAxNCBvdmVyIDEwMCBwZW9wbGUgaGF2ZSBjb250cmlidXRlZCBjb2RlIHRvIFJlYWN0IFJvdXRlciBhbmQgbWFueSwgbWFueSBtb3JlIGhhdmUgZmlsZWQgaXNzdWVzLCBnaXZlbiB0YWxrcywgYW5kIHVzZWQgdGhlIHJvdXRlciBpbiBib3RoIHNlcnZlciBhbmQgY2xpZW50IGVudmlyb25tZW50cy4gSXQgaGFzIGJlZW4gbWluZSBhbmQgUnlhbiYjMzk7cyBwcml2aWxlZ2UgdG8gd29yayB3aXRoIGFuZCBsZWFybiBmcm9tIHRoZXNlIHdvbmRlcmZ1bCBwZW9wbGUgYW5kIHRvIGd1aWRlIHRoZSBkaXJlY3Rpb24gb2YgYSBsaWJyYXJ5IHRoYXQgd2UgaG9wZSB3aWxsIGhlbHAgdXMgYWxsIGJ1aWxkIGFtYXppbmcgcHJvZHVjdHMgYW5kIHRvb2xzIHdpdGggUmVhY3Qgb3ZlciB0aGUgbmV4dCBmZXcgeWVhcnMuPC9wPlxcbjxwPlRoaXMgeWVhciB3ZSBhcmUgaW50cm9kdWNpbmcgc3VwcG9ydCBmb3IgUmVhY3QgTmF0aXZlIGFuZCB3ZSBhcmUgd29ya2luZyBjbG9zZWx5IHdpdGggdGhlIFJlbGF5IHRlYW0gdG8gZW5zdXJlIHRoZSByb3V0ZXIgbWVldHMgdGhlIG5lZWRzIG9mIFJlYWN0IGRldmVsb3BlcnMgZXZlcnl3aGVyZSBSZWFjdCBydW5zLiBNb3JlIGltcG9ydGFudGx5IHRob3VnaCwgd2UgYXJlIGZvY3VzZWQgb24gYnJpbmdpbmcgZ3JlYXQgZXhwZXJpZW5jZXMgdG8gY29uc3VtZXJzIG9mIGFwcGxpY2F0aW9ucyBidWlsdCB1c2luZyBSZWFjdCBSb3V0ZXIuIEluIHRoaXMgdGFsaywgd2Ugd2lsbCBkaXNjdXNzIGhvdyB5b3VyIHVzZXJzIGNhbiBiZW5lZml0IGZyb20gdGhlIG1hbnkgdG9vbHMgdGhlIHJvdXRlciBwcm92aWRlcyBpbmNsdWRpbmcgc2VydmVyLXNpZGUgcmVuZGVyaW5nLCByZWFsIFVSTHMgb24gbmF0aXZlIGRldmljZXMsIGFuZCBtdWNoLCBtdWNoIG1vcmUuPC9wPlxcblwiLFxuXHRcdFx0XHRcInNwZWFrZXJzXCI6IFtcblx0XHRcdFx0XHRcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIyZVwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNjJcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMmZcIixcblx0XHRcIm5hbWVcIjogXCJNaWNoYWVsIFJpZGd3YXlcIixcblx0XHRcImJpb1wiOiBcIk1pa2UgaXMgc29mdHdhcmUgZW5naW5lZXIgYXQgWWFob28gd29ya2luZyBvbiBub2RlLmpzIGFuZCBSZWFjdC9GbHV4XFxuICAgIGZyb250ZW5kcyB0aGF0IHBvd2VyIGhpZ2gtdHJhZmZpYyB3ZWIgYXBwbGljYXRpb25zLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwibXJpZGd3YXlcIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL21pY2hhZWwtcmlkZ3dheS5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJUaGVSaWRnd2F5XCIsXG5cdFx0XCJ0YWxrc1wiOiBbXG5cdFx0XHR7XG5cdFx0XHRcdFwia2V5XCI6IFwiaXNvbW9ycGhpYy1mbHV4XCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxNDowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxMzozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIklzb21vcnBoaWMgRmx1eFwiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+Rmx1eCBwcm92aWRlcyBhIGdvb2QgZnJhbWV3b3JrIGZvciBidWlsZGluZyByaWNoIGNsaWVudCBhcHBsaWNhdGlvbnMsIGJ1dFxcbiAgICBkaWQgeW91IGtub3cgeW91IGNhbiByZXVzZSB0aGUgZmx1eCBhcmNoaXRlY3R1cmUgZm9yIHNlcnZlciByZW5kZXJpbmc/IEluXFxuICAgIHRoaXMgdGFsaywgSSYjMzk7bGwgd2FsayB5b3UgdGhyb3VnaCBhbiBpc29tb3JwaGljIEZsdXggYXJjaGl0ZWN0dXJlIHRvIGdpdmVcXG4gICAgeW91IHRoZSBob2x5IGdyYWlsIG9mIGZyb250ZW5kIGRldmVsb3BtZW50LiBXaXRoIHRoaXMgYXJjaGl0ZWN0dXJlIHlvdSYjMzk7bGwgYmVcXG4gICAgYWJsZSB0byByZXVzZSBhbGwgb2YgeW91ciBhcHBsaWNhdGlvbiBjb2RlIG9uIHRoZSBzZXJ2ZXIgYW5kIGNsaWVudCB3aXRob3V0XFxuICAgIHdvcnJ5aW5nIGFib3V0IHNlcnZlci1zaWRlIGNvbmN1cnJlbmN5IGlzc3VlcyB0aGF0IHlvdSBtYXkgc2VlIHdpdGggc3RvY2tcXG4gICAgRmx1eC5cXG4gICAgT25jZSB0aGUgY29uY2VwdHMgaGF2ZSBiZWVuIGV4cGxhaW5lZCwgSSB3aWxsIGludHJvZHVjZSB0aGUgb3BlbiBzb3VyY2VcXG4gICAgbGlicmFyaWVzIHRoYXQgd2UgaGF2ZSBvcGVuIHNvdXJjZWQgYW5kIGFyZSBwb3dlcmluZyBtYW55IG9mIFlhaG9vJiMzOTtzXFxuICAgIGhpZ2gtdHJhZmZpYyB3ZWIgYXBwbGljYXRpb25zLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMmZcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjY1XCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjMwXCIsXG5cdFx0XCJuYW1lXCI6IFwiQXJpYSBCdWNrbGVzXCIsXG5cdFx0XCJiaW9cIjogXCJBcmlhIGhhcyBiZWVuIGJ1aWxkaW5nIGludGVyYWN0aXZlIGVkdWNhdGlvbmFsIGV4cGVyaWVuY2VzIHdpdGggUmVhY3RcXG4gICAgYXQgS2hhbiBBY2FkZW15IHNpbmNlIFNlcHRlbWJlciAyMDEzLCBhbmQgbWFpbnRhaW5zIG9uZSBvZiB0aGUgb2xkZXN0XFxuICAgIGxhcmdlIFJlYWN0IGNvZGViYXNlcyBvdXRzaWRlIG9mIEZhY2Vib29rLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiYXJpYWJ1Y2tsZXNcIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL2FyaWEtYnVja2xlcy5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJhcmlhYnVja2xlc1wiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImJ1aWxkaW5nLXN1Ym1hcmluZXMtdGhhdC1kb250LWxlYWtcIixcblx0XHRcdFx0XCJkdXJhdGlvblwiOiAzNjAwMDAwLFxuXHRcdFx0XHRcImVuZFRpbWVcIjogXCIyMDE1LTA3LTAzVDE1OjAwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJzdGFydFRpbWVcIjogXCIyMDE1LTA3LTAzVDE0OjAwOjAwLjAwMFpcIixcblx0XHRcdFx0XCJ0eXBlXCI6IFwidGFsa1wiLFxuXHRcdFx0XHRcInRpdGxlXCI6IFwiQnVpbGRpbmcgc3VibWFyaW5lcyB0aGF0IGRvbid0IGxlYWtcIixcblx0XHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIjxwPlJlYWN0IHByb3ZpZGVzIHVzIHdpdGggYSBsb3Qgb2YgdG9vbHMgZm9yIGJ1aWxkaW5nIGNvbXBvbmVudHMsIGJ1dFxcbiAgICBpc24mIzM5O3QgcHJlc2NyaXB0aXZlIGFib3V0IGhvdyB3ZSB1c2UgdGhvc2UuIE9iamVjdHMgY2FuIGhhdmUgcHJvcHMsXFxuICAgIHN0YXRlLCBhbmQgaW5zdGFuY2UgZmllbGRzLiBXaGVuIGlzIGl0IGJlc3QgdG8gdXNlIGVhY2g/XFxuICAgIFdlJiMzOTt2ZSBoZWFyZCBhIGxvdCBhYm91dCBwdXJlIGNvbXBvbmVudHMsIGJ1dCBob3cgZG8gd2UgbWFrZSBwdXJlXFxuICAgIGNvbXBvbmVudHMgd2hlbiB3ZSBoYXZlIHRvIGRlYWwgd2l0aCB0aGUgcmVhbGl0aWVzIG9mIGEgc3RhdGVmdWxcXG4gICAgd29ybGQ/IEhvdyBkbyB3ZSBtYWtlIG1vcmUgY29tcGxleCBjb21wb25lbnRzIHdob3NlIHByb3BzIGFjdHVhbGx5XFxuICAgIHJlcHJlc2VudCB0aGVtP1xcbiAgICBXZSYjMzk7bGwgY292ZXIgaG93IHdlJiMzOTt2ZSBhbnN3ZXJlZCB0aGVzZSBxdWVzdGlvbnMgYXQgS2hhbiBBY2FkZW15LFxcbiAgICBpbmNsdWRpbmcgdGVjaG5pcXVlcyBhbmQgcGF0dGVybnMgdG8gbWFrZSBkZWFsaW5nIHdpdGggbGFyZ2UgcHVyZVxcbiAgICBjb21wb25lbnRzIHNpbXBsZXIsIGFzIHdlbGwgYXMgY3VycmVudCBvcGVuIHF1ZXN0aW9ucy48L3A+XFxuXCIsXG5cdFx0XHRcdFwic3BlYWtlcnNcIjogW1xuXHRcdFx0XHRcdFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjMwXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGI2NlwiLFxuXHRcdFx0XHRcImZlZWRiYWNrXCI6IHt9XG5cdFx0XHR9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIzMVwiLFxuXHRcdFwibmFtZVwiOiBcIkJlbiBHb3Rvd1wiLFxuXHRcdFwiYmlvXCI6IFwiSW5jdXJhYmxlIGJ1aWxkZXIsIGZyb250LWVuZCBwcm9kdWN0IGVuZ2luZWVyIGF0IE5pbGFzLiBGb3JtZXJseSBwcmluY2lwYWwgb2YgQEZvdW5kcnkzNzYsIGRldmVsb3BlciBvZiBtb3JlIHRoYW4gMjAgaU9TIGFwcHMgYW5kIHRoZSBAU3BhcmtJbnNwZWN0b3IuIFN0dWRpZWQgSENJIGF0IENhcm5lZ2llIE1lbGxvbiBhbmQgQ1MgYXQgVmFuZGVyYmlsdCBVbml2ZXJzaXR5LlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiYmVuZ290b3dcIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL2Jlbi1nb3Rvdy5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJiZW5nb3Rvd1wiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImhvdy1yZWFjdC1hbmQtZmx1eC10dXJuLWFwcGxpY2F0aW9ucy1pbnRvLWV4dGVuc2libGUtcGxhdGZvcm1zXCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxNTozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxNTowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIkhvdyBSZWFjdCAmIEZsdXggVHVybiBBcHBsaWNhdGlvbnMgSW50byBFeHRlbnNpYmxlIFBsYXRmb3Jtc1wiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+Q2hyb21lIGlzIGdyZWF0LCBidXQgM3JkIHBhcnR5IGV4dGVuc2lvbnMgbWFrZSBpdCBiZXR0ZXIuIFRoZSBpUGhvbmVcXG4gICAgaXMgZ3JlYXQsIGJ1dCBhcHBzIG1ha2UgaXQgYmV0dGVyLiBZb3UgUmVhY3QtYXBwIG1heSBiZSBncmVhdCwgYnV0XFxuICAgIGltYWdpbmUgaWYgeW91IGNvdWxkIHNhZmVseSBhbmQgcm9idXN0bHkgYWxsb3cgM3JkIHBhcnR5IGV4dGVuc2lvbnMgdG9cXG4gICAgZW5oYW5jZSBpdC5cXG4gICAgV2UmIzM5O2xsIHRhbGsgYWJvdXQgc3BlY2lmaWMgZmVhdHVyZXMgb2YgUmVhY3QgJmFtcDsgRmx1eCwgUmVhY3QgQ1NTLFxcbiAgICBwcm9ncmFtbWluZyBkZXNpZ24gcGF0dGVybnMsIGFuZCBjdXN0b20gbGlicmFyaWVzLCB3aGljaCBjYW4gdHVybiBhXFxuICAgIHN0YXRpYyBhcHBsaWNhdGlvbiBpbnRvIGEgZHluYW1pYyBwbGF0Zm9ybSB0aGF0IGFuIGVjb3N5c3RlbSBvZlxcbiAgICBkZXZlbG9wZXJzIGNhbiBidWlsZCBvbiB0b3Agb2YuXFxuICAgIFdlJiMzOTt2ZSBidWlsdCBhIGhpZ2hseS1leHRlbnNpYmxlIGRlc2t0b3AgZW1haWwgY2xpZW50IHdpdGggUmVhY3QgJmFtcDsgRmx1eFxcbiAgICBvbiBBdG9tIFNoZWxsLCBhbmQgd2UmIzM5O2xsIGFsc28gc2hvdyBjb25jcmV0ZSBleGFtcGxlcyBvZiB3aGVyZSB0aGVzZVxcbiAgICB0b29scyBlbmFibGVkIGEgM3JkIHBhcnR5IGVjb3N5c3RlbSBvZiBlbWFpbCBwbHVnaW5zLlxcbiAgICBPdXIgZ29hbCBpcyBmb3IgeW91IHRvIHRha2UgYXdheSBob3cgdG8gdXNlIFJlYWN0IHRvIGJlIG1vcmUgdGhhbiBqdXN0XFxuICAgIGdyZWF0IGFwcGxpY2F0aW9uIGRldmVsb3BlcnMsIGJ1dCBub3cgZ3JlYXQgcGxhdGZvcm0gZGV2ZWxvcGVycyBhc1xcbiAgICB3ZWxsLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMzFcIixcblx0XHRcdFx0XHRcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIzMlwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNjhcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMzJcIixcblx0XHRcIm5hbWVcIjogXCJFdmFuIE1vcmlrYXdhXCIsXG5cdFx0XCJiaW9cIjogXCJDdXJyZW50bHkgYSBmcm9udGVuZCBhcHBsaWNhdGlvbiBlbmdpbmVlciBhdCBOaWxhcy4gQmVmb3JlIGJ1aWxkaW5nIGVtYWlsIGNsaWVudHMsIEV2YW4gZm91bmRlZCAmIGN1c3RvbWVyLWZ1bmRlZCBQcm94aW1hdGUsIHdhcyBhIGRldi1pbi1yZXNpZGVuY2UgYXQgVGVjaHN0YXJzLCBhbmQgZ3JhZHVhdGVkIE9saW4gQ29sbGVnZSBvZiBFbmdpbmVlcmluZyB3aXRoIGEgQ1MgZGVncmVlLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiZW1vcmlrYXdhXCIsXG5cdFx0XCJpc1NwZWFrZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9zcGVha2Vycy9ldmFuLW1vcmlrYXdhLmpwZ1wiLFxuXHRcdFwidHdpdHRlclwiOiBcImUwbVwiLFxuXHRcdFwidGFsa3NcIjogW1xuXHRcdFx0e1xuXHRcdFx0XHRcImtleVwiOiBcImhvdy1yZWFjdC1hbmQtZmx1eC10dXJuLWFwcGxpY2F0aW9ucy1pbnRvLWV4dGVuc2libGUtcGxhdGZvcm1zXCIsXG5cdFx0XHRcdFwiZHVyYXRpb25cIjogMTgwMDAwMCxcblx0XHRcdFx0XCJlbmRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxNTozMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwic3RhcnRUaW1lXCI6IFwiMjAxNS0wNy0wM1QxNTowMDowMC4wMDBaXCIsXG5cdFx0XHRcdFwidHlwZVwiOiBcInRhbGtcIixcblx0XHRcdFx0XCJ0aXRsZVwiOiBcIkhvdyBSZWFjdCAmIEZsdXggVHVybiBBcHBsaWNhdGlvbnMgSW50byBFeHRlbnNpYmxlIFBsYXRmb3Jtc1wiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+Q2hyb21lIGlzIGdyZWF0LCBidXQgM3JkIHBhcnR5IGV4dGVuc2lvbnMgbWFrZSBpdCBiZXR0ZXIuIFRoZSBpUGhvbmVcXG4gICAgaXMgZ3JlYXQsIGJ1dCBhcHBzIG1ha2UgaXQgYmV0dGVyLiBZb3UgUmVhY3QtYXBwIG1heSBiZSBncmVhdCwgYnV0XFxuICAgIGltYWdpbmUgaWYgeW91IGNvdWxkIHNhZmVseSBhbmQgcm9idXN0bHkgYWxsb3cgM3JkIHBhcnR5IGV4dGVuc2lvbnMgdG9cXG4gICAgZW5oYW5jZSBpdC5cXG4gICAgV2UmIzM5O2xsIHRhbGsgYWJvdXQgc3BlY2lmaWMgZmVhdHVyZXMgb2YgUmVhY3QgJmFtcDsgRmx1eCwgUmVhY3QgQ1NTLFxcbiAgICBwcm9ncmFtbWluZyBkZXNpZ24gcGF0dGVybnMsIGFuZCBjdXN0b20gbGlicmFyaWVzLCB3aGljaCBjYW4gdHVybiBhXFxuICAgIHN0YXRpYyBhcHBsaWNhdGlvbiBpbnRvIGEgZHluYW1pYyBwbGF0Zm9ybSB0aGF0IGFuIGVjb3N5c3RlbSBvZlxcbiAgICBkZXZlbG9wZXJzIGNhbiBidWlsZCBvbiB0b3Agb2YuXFxuICAgIFdlJiMzOTt2ZSBidWlsdCBhIGhpZ2hseS1leHRlbnNpYmxlIGRlc2t0b3AgZW1haWwgY2xpZW50IHdpdGggUmVhY3QgJmFtcDsgRmx1eFxcbiAgICBvbiBBdG9tIFNoZWxsLCBhbmQgd2UmIzM5O2xsIGFsc28gc2hvdyBjb25jcmV0ZSBleGFtcGxlcyBvZiB3aGVyZSB0aGVzZVxcbiAgICB0b29scyBlbmFibGVkIGEgM3JkIHBhcnR5IGVjb3N5c3RlbSBvZiBlbWFpbCBwbHVnaW5zLlxcbiAgICBPdXIgZ29hbCBpcyBmb3IgeW91IHRvIHRha2UgYXdheSBob3cgdG8gdXNlIFJlYWN0IHRvIGJlIG1vcmUgdGhhbiBqdXN0XFxuICAgIGdyZWF0IGFwcGxpY2F0aW9uIGRldmVsb3BlcnMsIGJ1dCBub3cgZ3JlYXQgcGxhdGZvcm0gZGV2ZWxvcGVycyBhc1xcbiAgICB3ZWxsLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMzFcIixcblx0XHRcdFx0XHRcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIzMlwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiNjhcIixcblx0XHRcdFx0XCJmZWVkYmFja1wiOiB7fVxuXHRcdFx0fVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMzNcIixcblx0XHRcIm5hbWVcIjogXCJTZWJhc3RpYW4gTWFya2JhZ2VcIixcblx0XHRcImJpb1wiOiBcIlJlYWN0IENvcmUgTWFpbnRhaW5lciBhdCBGYWNlYm9va1wiLFxuXHRcdFwiZ2l0aHViXCI6IFwic2VibWFya2JhZ2VcIixcblx0XHRcImlzU3BlYWtlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL3NwZWFrZXJzL1NlYmFzdGlhblByb2ZpbGUuanBnXCIsXG5cdFx0XCJ0d2l0dGVyXCI6IFwic2VibWFya2JhZ2VcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJkb20tYXMtYS1zZWNvbmQtY2xhc3MtY2l0aXplblwiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDE4MDAwMDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDJUMTg6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDJUMTc6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJET00gYXMgYSBTZWNvbmQtY2xhc3MgQ2l0aXplblwiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+UmVhY3QgaGFzIGFsd2F5cyBiZWVuIGFib3V0IHRoZSBWaXJ0dWFsIERPTS4gQSBuaWNlIHdheSB0byByZW5kZXIgSFRNTCAoYW5kIHNvbWUgb2YgU1ZHIGFuZCBtYXliZSBzb21lIFdlYiBDb21wb25lbnRzKS4gQWx0aG91Z2ggdGhlcmUmIzM5O3MgYWxzbyByZWFjdC1hcnQsIHJlYWN0LXRocmVlLCByZWFjdC1jYW52YXMsIHJlYWN0LWN1cnNlcy4uLiBPaCwgYW5kIHJlYWN0LW5hdGl2ZSEgRXZlbiBpZiB5b3UgYm90dG9tIG91dCBhdCBIVE1MLCBtb3N0IG9mIHdoYXQgUmVhY3QgZG9lcyByZWFsbHkgd2VsbCBpcyByZW5kZXJpbmcgdG8gT1RIRVIgUmVhY3QgY29tcG9uZW50cy4gTWVhbndoaWxlIG1vc3QgcHJvamVjdHMgc3RpbGwgdHJ5IHRvIHJldHJvZml0IG91ciBuZWVkcyBpbnRvIEhUTUwgYW5kIENTUyBwcmltaXRpdmVzLiBJJiMzOTtsbCB0YWxrIGFib3V0IHdoeSB0aGUgRE9NIGlzIGZsYXdlZCBhbmQgaG93IGl0IGlzIGJlY29taW5nIGEgc2Vjb25kLWNsYXNzIGNpdGl6ZW4gaW4gdGhlIGxhbmQgb2YgUmVhY3QgYXBwcy48L3A+XFxuXCIsXG5cdFx0XHRcdFwic3BlYWtlcnNcIjogW1xuXHRcdFx0XHRcdFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjMzXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGI1OVwiLFxuXHRcdFx0XHRcImZlZWRiYWNrXCI6IHt9XG5cdFx0XHR9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIzNFwiLFxuXHRcdFwibmFtZVwiOiBcIkxlZSBCeXJvblwiLFxuXHRcdFwiYmlvXCI6IFwiTWFraW5nIHRoaW5ncyBhdCBGYWNlYm9vayBzaW5jZSAyMDA4OiBSZWFjdCwgR3JhcGhRTCwgSW1tdXRhYmxlLmpzLCBNb2JpbGUsIEphdmFTY3JpcHQuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJsZWVieXJvblwiLFxuXHRcdFwiaXNTcGVha2VyXCI6IHRydWUsXG5cdFx0XCJwaWN0dXJlXCI6IFwiLi9pbWcvc3BlYWtlcnMvbGVlLWJ5cm9uLmpwZ1wiLFxuXHRcdFwidHdpdHRlclwiOiBcImxlZWJcIixcblx0XHRcInRhbGtzXCI6IFtcblx0XHRcdHtcblx0XHRcdFx0XCJrZXlcIjogXCJleHBsb3JpbmctZ3JhcGhxbFwiLFxuXHRcdFx0XHRcImR1cmF0aW9uXCI6IDE4MDAwMDAsXG5cdFx0XHRcdFwiZW5kVGltZVwiOiBcIjIwMTUtMDctMDJUMTI6MzA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInN0YXJ0VGltZVwiOiBcIjIwMTUtMDctMDJUMTI6MDA6MDAuMDAwWlwiLFxuXHRcdFx0XHRcInR5cGVcIjogXCJ0YWxrXCIsXG5cdFx0XHRcdFwidGl0bGVcIjogXCJFeHBsb3JpbmcgR3JhcGhRTFwiLFxuXHRcdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiPHA+QXQgUmVhY3QuanMgQ29uZiBsYXN0IEphbnVhcnksIHdlIGludHJvZHVjZWQgdGhlIGlkZWEgb2YgR3JhcGhRTDogYSBkYXRhIGZldGNoaW5nIGxhbmd1YWdlIHRoYXQgYWxsb3dzIGNsaWVudHMgdG8gZGVjbGFyYXRpdmVseSBkZXNjcmliZSB0aGVpciBkYXRhIHJlcXVpcmVtZW50cy4gTGV0JiMzOTtzIGV4cGxvcmUgbW9yZSBvZiBHcmFwaFFMLCBpdCYjMzk7cyBjb3JlIHByaW5jaXBsZXMsIGhvdyBpdCB3b3JrcywgYW5kIHdoYXQgbWFrZXMgaXQgYSBwb3dlcmZ1bCB0b29sLjwvcD5cXG5cIixcblx0XHRcdFx0XCJzcGVha2Vyc1wiOiBbXG5cdFx0XHRcdFx0XCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMzRcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjUyXCIsXG5cdFx0XHRcdFwiZmVlZGJhY2tcIjoge31cblx0XHRcdH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRcImlkXCI6IFwiNTU4MjZhM2JhOTgyZDEwMzAwOGM0YjM2XCIsXG5cdFx0XCJuYW1lXCI6IFwiS2F0aXVza2EgR2FtZXJvXCIsXG5cdFx0XCJiaW9cIjogXCJDaGVtaWNhbCBlbmdpbmVlciB0dXJuZWQgd2ViIGRldiBpbiBydWJ5L3JhaWxzL2pzL2h0bWw1LCBmb29kaWUgYW5kIHdoYXQgaGF2ZSB5b3UuXCIsXG5cdFx0XCJnaXRodWJcIjogXCJrYXRjaXRhXCIsXG5cdFx0XCJpc09yZ2FuaXNlclwiOiB0cnVlLFxuXHRcdFwicGljdHVyZVwiOiBcIi4vaW1nL29yZ2FuaXNlcnMva2F0eS5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJrYXR5X2djYVwiLFxuXHRcdFwidGFsa3NcIjogW10sXG5cdFx0XCJpc1NwZWFrZXJcIjogZmFsc2Vcblx0fSxcblx0e1xuXHRcdFwiaWRcIjogXCI1NTgyNmEzYmE5ODJkMTAzMDA4YzRiMzVcIixcblx0XHRcIm5hbWVcIjogXCJQYXRyaWNrIEFsam9yZFwiLFxuXHRcdFwiYmlvXCI6IFwiSGFja2VyLCBlbnRyZXByZW5ldXIsIGNoZWVzZSBlYXRlci4gQG5nZXVyb3BlIGFuZCBAcmVhY3RldXJvcGUgb3JnYW5pemVyLlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwicGF0Y2l0b1wiLFxuXHRcdFwiaXNPcmdhbmlzZXJcIjogdHJ1ZSxcblx0XHRcInBpY3R1cmVcIjogXCIuL2ltZy9vcmdhbmlzZXJzL3BhdC5qcGdcIixcblx0XHRcInR3aXR0ZXJcIjogXCJwYXRjaXRvXCIsXG5cdFx0XCJ0YWxrc1wiOiBbXSxcblx0XHRcImlzU3BlYWtlclwiOiBmYWxzZVxuXHR9LFxuXHR7XG5cdFx0XCJpZFwiOiBcIjU1ODI2YTNiYTk4MmQxMDMwMDhjNGIzN1wiLFxuXHRcdFwibmFtZVwiOiBcIkNocmlzIFJhbW9uXCIsXG5cdFx0XCJiaW9cIjogXCJSdW5uZXIsIGNvZGVyLCB3b3JsZCB0cmF2ZWxlciBhbmQgb3BlbiBzb3VyY2Ugc29mdHdhcmUgZW50aHVzaWFzdCwgbGF0ZWx5IGhhY2tpbmcgb24gR28sIEFuZ3VsYXIgYW5kIFJlYWN0LlwiLFxuXHRcdFwiZ2l0aHViXCI6IFwiY2hyaXMtcmFtb25cIixcblx0XHRcImlzT3JnYW5pc2VyXCI6IHRydWUsXG5cdFx0XCJwaWN0dXJlXCI6IFwiLi9pbWcvb3JnYW5pc2Vycy9jcmFtb24uanBnXCIsXG5cdFx0XCJ0d2l0dGVyXCI6IFwiY3JhbW9ublwiLFxuXHRcdFwidGFsa3NcIjogW10sXG5cdFx0XCJpc1NwZWFrZXJcIjogZmFsc2Vcblx0fVxuXTsiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG52YXIgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciB7XG5cdENvbnRhaW5lcixcblx0Y3JlYXRlQXBwLFxuXHRVSSxcblx0Vmlldyxcblx0Vmlld01hbmFnZXJcbn0gPSByZXF1aXJlKCd0b3VjaHN0b25lanMnKTtcblxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG52YXIgZGV2aWNlID0gcmVxdWlyZSgnLi9saWIvZGV2aWNlJylcblxuLypcbnZhciB2aWV3cyA9IHtcblxuXHQvLyBhcHBcblx0J2hvbWUnOiByZXF1aXJlKCcuL3ZpZXdzL2hvbWUnKSxcblxuXHQvLyBjb21wb25lbnRzXG5cdCdjb21wb25lbnQtZmVlZGJhY2snOiByZXF1aXJlKCcuL3ZpZXdzL2NvbXBvbmVudC9mZWVkYmFjaycpLFxuXG5cdCdjb21wb25lbnQtaGVhZGVyYmFyJzogcmVxdWlyZSgnLi92aWV3cy9jb21wb25lbnQvYmFyLWhlYWRlcicpLFxuXHQnY29tcG9uZW50LWhlYWRlcmJhci1zZWFyY2gnOiByZXF1aXJlKCcuL3ZpZXdzL2NvbXBvbmVudC9iYXItaGVhZGVyLXNlYXJjaCcpLFxuXHQnY29tcG9uZW50LWFsZXJ0YmFyJzogcmVxdWlyZSgnLi92aWV3cy9jb21wb25lbnQvYmFyLWFsZXJ0JyksXG5cdCdjb21wb25lbnQtYWN0aW9uYmFyJzogcmVxdWlyZSgnLi92aWV3cy9jb21wb25lbnQvYmFyLWFjdGlvbicpLFxuXHQnY29tcG9uZW50LWZvb3RlcmJhcic6IHJlcXVpcmUoJy4vdmlld3MvY29tcG9uZW50L2Jhci1mb290ZXInKSxcblxuXHQnY29tcG9uZW50LXBhc3Njb2RlJzogcmVxdWlyZSgnLi92aWV3cy9jb21wb25lbnQvcGFzc2NvZGUnKSxcblx0J2NvbXBvbmVudC10b2dnbGUnOiByZXF1aXJlKCcuL3ZpZXdzL2NvbXBvbmVudC90b2dnbGUnKSxcblx0J2NvbXBvbmVudC1mb3JtJzogcmVxdWlyZSgnLi92aWV3cy9jb21wb25lbnQvZm9ybScpLFxuXG5cdCdjb21wb25lbnQtc2ltcGxlLWxpc3QnOiByZXF1aXJlKCcuL3ZpZXdzL2NvbXBvbmVudC9saXN0LXNpbXBsZScpLFxuXHQnY29tcG9uZW50LWNvbXBsZXgtbGlzdCc6IHJlcXVpcmUoJy4vdmlld3MvY29tcG9uZW50L2xpc3QtY29tcGxleCcpLFxuXHQnY29tcG9uZW50LWNhdGVnb3Jpc2VkLWxpc3QnOiByZXF1aXJlKCcuL3ZpZXdzL2NvbXBvbmVudC9saXN0LWNhdGVnb3Jpc2VkJyksXG5cblx0Ly8gdHJhbnNpdGlvbnNcblx0J3RyYW5zaXRpb25zJzogcmVxdWlyZSgnLi92aWV3cy90cmFuc2l0aW9ucycpLFxuXHQndHJhbnNpdGlvbnMtdGFyZ2V0JzogcmVxdWlyZSgnLi92aWV3cy90cmFuc2l0aW9ucy10YXJnZXQnKSxcblxuXHQvLyBkZXRhaWxzIHZpZXdcblx0J2RldGFpbHMnOiByZXF1aXJlKCcuL3ZpZXdzL2RldGFpbHMnKSxcblx0J3JhZGlvLWxpc3QnOiByZXF1aXJlKCcuL3ZpZXdzL3JhZGlvLWxpc3QnKVxufTtcbiovXG5cblxuXG5cbi8vIEFwcCBDb25maWdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtjcmVhdGVBcHAoKV0sXG5cblx0cmVuZGVyICgpIHtcblx0XHR2YXIgYXBwV3JhcHBlckNsYXNzTmFtZSA9ICdhcHAtd3JhcHBlciBkZXZpY2UtLScgKyBkZXZpY2UucGxhdGZvcm07XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2FwcFdyYXBwZXJDbGFzc05hbWV9PlxuXHRcdFx0XHQ8Vmlld01hbmFnZXIgbmFtZT1cImFwcFwiIGRlZmF1bHRWaWV3PVwibWFpblwiPlxuXHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJtYWluXCIgY29tcG9uZW50PXtNYWluVmlld0NvbnRyb2xsZXJ9IC8+XG5cdFx0XHRcdDwvVmlld01hbmFnZXI+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxuXG5cblxuLy8gTWFpbiBDb250cm9sbGVyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIE1haW5WaWV3Q29udHJvbGxlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cmVuZGVyICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lcj5cblx0XHRcdFx0PFVJLk5hdmlnYXRpb25CYXIgbmFtZT1cIm1haW5cIiAvPlxuXHRcdFx0XHQ8Vmlld01hbmFnZXIgbmFtZT1cIm1haW5cIiBkZWZhdWx0Vmlldz1cInRhYnNcIj5cblx0XHRcdFx0XHQ8VmlldyBuYW1lPVwidGFic1wiIGNvbXBvbmVudD17VGFiVmlld0NvbnRyb2xsZXJ9IC8+XG5cdFx0XHRcdDwvVmlld01hbmFnZXI+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcblxuXG5cblxuLy8gVGFiIENvbnRyb2xsZXJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgbGFzdFNlbGVjdGVkVGFiID0gJ2xpc3RzJ1xudmFyIFRhYlZpZXdDb250cm9sbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGUgKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RlZFRhYjogbGFzdFNlbGVjdGVkVGFiXG5cdFx0fTtcblx0fSxcblx0b25WaWV3Q2hhbmdlIChuZXh0Vmlldykge1xuXHRcdGxhc3RTZWxlY3RlZFRhYiA9IG5leHRWaWV3XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHNlbGVjdGVkVGFiOiBuZXh0Vmlld1xuXHRcdH0pO1xuXHR9LFxuXHRzZWxlY3RUYWIgKHRhYikge1xuXHRcdHZhciB2aWV3UHJvcHM7XG5cdFx0dGhpcy5yZWZzLnZtLnRyYW5zaXRpb25Ubyh0YWIudmFsdWUsIHtcblx0XHRcdHRyYW5zaXRpb246ICdpbnN0YW50Jyxcblx0XHRcdHZpZXdQcm9wczogdmlld1Byb3BzXG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIHNlbGVjdGVkVGFiID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRhYjtcblx0XHRcblx0XHRpZiAoc2VsZWN0ZWRUYWIgPT09ICdsaXN0cycgfHwgc2VsZWN0ZWRUYWIgPT09ICdsaXN0LXNpbXBsZScgfHwgc2VsZWN0ZWRUYWIgPT09ICdsaXN0LWNvbXBsZXgnKSB7XG5cdFx0XHRzZWxlY3RlZFRhYiA9ICdsaXN0cyc7XG5cdFx0fVxuXHRcdGlmIChzZWxlY3RlZFRhYiA9PT0gJ3RyYW5zaXRpb25zJyB8fCBzZWxlY3RlZFRhYiA9PT0gJ3RyYW5zaXRpb25zLXRhcmdldCcpIHtcblx0XHRcdHNlbGVjdGVkVGFiID0gJ3RyYW5zaXRpb25zJztcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lcj5cblx0XHRcdFx0PFZpZXdNYW5hZ2VyIHJlZj1cInZtXCIgbmFtZT1cInRhYnNcIiBkZWZhdWx0Vmlldz17dGhpcy5zdGF0ZS5zZWxlY3RlZFRhYn0gb25WaWV3Q2hhbmdlPXt0aGlzLm9uVmlld0NoYW5nZX0+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImxpc3RzXCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL2xpc3RzJyl9IC8+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImxpc3Qtc2ltcGxlXCIgY29tcG9uZW50PXtyZXF1aXJlKCcuL3ZpZXdzL2xpc3Qtc2ltcGxlJyl9IC8+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImxpc3QtY29tcGxleFwiIGNvbXBvbmVudD17cmVxdWlyZSgnLi92aWV3cy9saXN0LWNvbXBsZXgnKX0gLz5cblx0XHRcdFx0XHQ8VmlldyBuYW1lPVwiZGV0YWlsc1wiIGNvbXBvbmVudD17cmVxdWlyZSgnLi92aWV3cy9kZXRhaWxzJyl9IC8+XG5cdFx0XHRcdFx0PFZpZXcgbmFtZT1cImZvcm1cIiBjb21wb25lbnQ9e3JlcXVpcmUoJy4vdmlld3MvZm9ybScpfSAvPlxuXHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJjb250cm9sc1wiIGNvbXBvbmVudD17cmVxdWlyZSgnLi92aWV3cy9jb250cm9scycpfSAvPlxuXHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJ0cmFuc2l0aW9uc1wiIGNvbXBvbmVudD17cmVxdWlyZSgnLi92aWV3cy90cmFuc2l0aW9ucycpfSAvPlxuXHRcdFx0XHRcdDxWaWV3IG5hbWU9XCJ0cmFuc2l0aW9ucy10YXJnZXRcIiBjb21wb25lbnQ9e3JlcXVpcmUoJy4vdmlld3MvdHJhbnNpdGlvbnMtdGFyZ2V0Jyl9IC8+XG5cdFx0XHRcdDwvVmlld01hbmFnZXI+XG5cdFx0XHRcdDxVSS5UYWJzLk5hdmlnYXRvciB2YWx1ZT17c2VsZWN0ZWRUYWJ9IG9uQ2hhbmdlPXt0aGlzLnNlbGVjdFRhYn0+XG5cdFx0XHRcdFx0PFVJLlRhYnMuVGFiIHZhbHVlPVwibGlzdHNcIj5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlRhYnMtSWNvbiBUYWJzLUljb24tLWxpc3RzXCIgLz5cblx0XHRcdFx0XHRcdDxVSS5UYWJzLkxhYmVsPkxpc3RzPC9VSS5UYWJzLkxhYmVsPlxuXHRcdFx0XHRcdDwvVUkuVGFicy5UYWI+XG5cdFx0XHRcdFx0PFVJLlRhYnMuVGFiIHZhbHVlPVwiZm9ybVwiPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiVGFicy1JY29uIFRhYnMtSWNvbi0tZm9ybXNcIiAvPlxuXHRcdFx0XHRcdFx0PFVJLlRhYnMuTGFiZWw+Rm9ybXM8L1VJLlRhYnMuTGFiZWw+XG5cdFx0XHRcdFx0PC9VSS5UYWJzLlRhYj5cblx0XHRcdFx0XHQ8VUkuVGFicy5UYWIgdmFsdWU9XCJjb250cm9sc1wiPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiVGFicy1JY29uIFRhYnMtSWNvbi0tY29udHJvbHNcIiAvPlxuXHRcdFx0XHRcdFx0PFVJLlRhYnMuTGFiZWw+Q29udHJvbHM8L1VJLlRhYnMuTGFiZWw+XG5cdFx0XHRcdFx0PC9VSS5UYWJzLlRhYj5cblx0XHRcdFx0XHQ8VUkuVGFicy5UYWIgdmFsdWU9XCJ0cmFuc2l0aW9uc1wiPlxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiVGFicy1JY29uIFRhYnMtSWNvbi0tdHJhbnNpdGlvbnNcIiAvPlxuXHRcdFx0XHRcdFx0PFVJLlRhYnMuTGFiZWw+VHJhbnNpdGlvbnM8L1VJLlRhYnMuTGFiZWw+XG5cdFx0XHRcdFx0PC9VSS5UYWJzLlRhYj5cblx0XHRcdFx0PC9VSS5UYWJzLk5hdmlnYXRvcj5cblx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5mdW5jdGlvbiBzdGFydEFwcCAoKSB7XG5cdFJlYWN0LnJlbmRlcig8QXBwIC8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykpO1xufVxuXG5mdW5jdGlvbiBvbkRldmljZVJlYWR5ICgpIHtcblx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRzdGFydEFwcCgpO1xufVxuXG5pZiAodHlwZW9mIGNvcmRvdmEgPT09ICd1bmRlZmluZWQnKSB7XG5cdHN0YXJ0QXBwKCk7XG59IGVsc2Uge1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsIG9uRGV2aWNlUmVhZHksIGZhbHNlKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJ2YXIgbWFwID0ge1xuXHQnQW5kcm9pZCc6IC9BbmRyb2lkLyxcblx0J2lPUyc6IC8oaVBhZHxpUGhvbmUpL1xufVxuXG52YXIgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnRcbnZhciBkZXZpY2VUeXBlID0gJ0Jyb3dzZXInXG5cbmZvciAodmFyIGtleSBpbiBtYXApIHtcblx0aWYgKG1hcFtrZXldLnRlc3QodXNlckFnZW50KSkge1xuXHRcdGRldmljZVR5cGUgPSBrZXlcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cGxhdGZvcm06IGRldmljZVR5cGVcbn1cbiIsInZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbnZhciBMaW5rID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJykuTGluaztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGFwcGFibGUgPSByZXF1aXJlKCdyZWFjdC10YXBwYWJsZScpO1xudmFyIFVJID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJykuVUk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRzdGF0aWNzOiB7XG5cdFx0bmF2aWdhdGlvbkJhcjogJ21haW4nLFxuXHRcdGdldE5hdmlnYXRpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGl0bGU6ICdDb250cm9scydcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlbmRlciAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkZXIgdGV4dC1jYXBzXCI+VUkgRWxlbWVudHM8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbFwiPlxuXHRcdFx0XHRcdDxMaW5rIGNvbXBvbmVudD1cImRpdlwiIHRvPVwiY29tcG9uZW50LXRvZ2dsZVwiICAgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1yaWdodFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+VG9nZ2xlPC9kaXY+XG5cdFx0XHRcdFx0PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIGNvbXBvbmVudD1cImRpdlwiIHRvPVwiY29tcG9uZW50LXBhc3Njb2RlXCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1yaWdodFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+UGFzc2NvZGUgLyBLZXlwYWQ8L2Rpdj5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdFx0PFRhcHBhYmxlIGNvbXBvbmVudD1cImRpdlwiIG9uVGFwPXt0aGlzLnNob3dMb2FkaW5nUG9wdXB9IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+TG9hZGluZyBTcGlubmVyPC9kaXY+XG5cdFx0XHRcdFx0PC9UYXBwYWJsZT5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGVyIHRleHQtY2Fwc1wiPkFwcGxpY2F0aW9uIFN0YXRlPC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8TGluayBjb21wb25lbnQ9XCJkaXZcIiB0bz1cImNvbXBvbmVudC1hbGVydGJhclwiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPkFsZXJ0IEJhcjwvZGl2PlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0XHQ8TGluayBjb21wb25lbnQ9XCJkaXZcIiB0bz1cInRyYW5zaXRpb25zXCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1yaWdodFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+VmlldyBUcmFuc2l0aW9uczwvZGl2PlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0XHQ8TGluayBjb21wb25lbnQ9XCJkaXZcIiB0bz1cImludmFsaWQtdmlld1wiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPkludmFsaWQgVmlldzwvZGl2PlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG5cdFRhcHBhYmxlID0gcmVxdWlyZSgncmVhY3QtdGFwcGFibGUnKSxcblx0RGlhbG9ncyA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpLkRpYWxvZ3MsXG5cdE5hdmlnYXRpb24gPSByZXF1aXJlKCd0b3VjaHN0b25lanMnKS5OYXZpZ2F0aW9uLFxuXHRVSSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpLlVJO1xuXG52YXIgVGltZXJzID0gcmVxdWlyZSgncmVhY3QtdGltZXJzJylcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW05hdmlnYXRpb24sIERpYWxvZ3MsIFRpbWVycygpXSxcblxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cHJldlZpZXc6ICdob21lJ1xuXHRcdH1cblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cHJvY2Vzc2luZzogZmFsc2UsXG5cdFx0XHRmb3JtSXNWYWxpZDogZmFsc2UsXG5cdFx0XHRiaW9WYWx1ZTogdGhpcy5wcm9wcy51c2VyLmJpbyB8fCAnJ1xuXHRcdH1cblx0fSxcblxuXHRzaG93Rmxhdm91ckxpc3Q6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnNob3dWaWV3KCdyYWRpby1saXN0JywgJ3Nob3ctZnJvbS1yaWdodCcsIHsgdXNlcjogdGhpcy5wcm9wcy51c2VyLCBmbGF2b3VyOiB0aGlzLnN0YXRlLmZsYXZvdXIgfSk7XG5cdH0sXG5cblx0aGFuZGxlQmlvSW5wdXQ6IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0YmlvVmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdGZvcm1Jc1ZhbGlkOiBldmVudC50YXJnZXQudmFsdWUubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlXG5cdFx0fSk7XG5cdH0sXG5cblx0cHJvY2Vzc0Zvcm06IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLnNldFN0YXRlKHsgcHJvY2Vzc2luZzogdHJ1ZSB9KTtcblxuXHRcdHRoaXMuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnNob3dWaWV3KCdob21lJywgJ2ZhZGUnLCB7fSk7XG5cdFx0fSwgNzUwKTtcblx0fSxcblxuXHRmbGFzaEFsZXJ0OiBmdW5jdGlvbiAoYWxlcnRDb250ZW50LCBjYWxsYmFjaykge1xuXHRcdHJldHVybiBjYWxsYmFjayh0aGlzLnNob3dBbGVydERpYWxvZyh7IG1lc3NhZ2U6IGFsZXJ0Q29udGVudCB9KSk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHQvLyBmaWVsZHNcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFVJLlZpZXc+XG5cdFx0XHRcdDxVSS5IZWFkZXJiYXIgdHlwZT1cImRlZmF1bHRcIiBsYWJlbD17W3RoaXMucHJvcHMudXNlci5uYW1lLmZpcnN0LCB0aGlzLnByb3BzLnVzZXIubmFtZS5sYXN0XS5qb2luKCcgJyl9PlxuXHRcdFx0XHRcdDxVSS5IZWFkZXJiYXJCdXR0b24gc2hvd1ZpZXc9e3RoaXMucHJvcHMucHJldlZpZXd9IHRyYW5zaXRpb249XCJyZXZlYWwtZnJvbS1yaWdodFwiIGxhYmVsPVwiQmFja1wiIGljb249XCJpb24tY2hldnJvbi1sZWZ0XCIgLz5cblx0XHRcdFx0XHQ8VUkuTG9hZGluZ0J1dHRvbiBsb2FkaW5nPXt0aGlzLnN0YXRlLnByb2Nlc3Npbmd9IGRpc2FibGVkPXshdGhpcy5zdGF0ZS5mb3JtSXNWYWxpZH0gb25UYXA9e3RoaXMucHJvY2Vzc0Zvcm19IGxhYmVsPVwiU2F2ZVwiIGNsYXNzTmFtZT1cIkhlYWRlcmJhci1idXR0b24gcmlnaHQgaXMtcHJpbWFyeVwiIC8+XG5cdFx0XHRcdDwvVUkuSGVhZGVyYmFyPlxuXHRcdFx0XHQ8VUkuVmlld0NvbnRlbnQgZ3JvdyBzY3JvbGxhYmxlPlxuXHRcdFx0XHRcdHsvKjxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGVyIHRleHQtY2Fwc1wiPkJhc2ljIGRldGFpbHM8L2Rpdj4qL31cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBhbmVsIHBhbmVsLS1maXJzdFwiPlxuXHRcdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgbGFiZWw9XCJOYW1lXCIgICAgIHZhbHVlPXtbdGhpcy5wcm9wcy51c2VyLm5hbWUuZmlyc3QsIHRoaXMucHJvcHMudXNlci5uYW1lLmxhc3RdLmpvaW4oJyAnKX0gICAgICAgcGxhY2Vob2xkZXI9XCJGdWxsIG5hbWVcIiBmaXJzdCAvPlxuXHRcdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgbGFiZWw9XCJMb2NhdGlvblwiIHZhbHVlPXt0aGlzLnByb3BzLnVzZXIubG9jYXRpb259ICAgcGxhY2Vob2xkZXI9XCJTdWJ1cmIsIENvdW50cnlcIiAvPlxuXHRcdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgbGFiZWw9XCJKb2luZWRcIiAgIHZhbHVlPXt0aGlzLnByb3BzLnVzZXIuam9pbmVkRGF0ZX0gcGxhY2Vob2xkZXI9XCJEYXRlXCIgLz5cblx0XHRcdFx0XHRcdDxVSS5MYWJlbFRleHRhcmVhIGxhYmVsPVwiQmlvXCIgICB2YWx1ZT17dGhpcy5zdGF0ZS5iaW9WYWx1ZX0gICAgICAgIHBsYWNlaG9sZGVyPVwiKHJlcXVpcmVkKVwiIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUJpb0lucHV0fSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHRcdDxUYXBwYWJsZSBvblRhcD17dGhpcy5zaG93Rmxhdm91ckxpc3R9IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy1maXJzdFwiIGNvbXBvbmVudD1cImRpdlwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIml0ZW0taW5uZXJcIj5cblx0XHRcdFx0XHRcdFx0XHRGYXZvdXJpdGUgSWNlY3JlYW1cblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIml0ZW0tbm90ZSBkZWZhdWx0XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIml0ZW0tbm90ZS1sYWJlbFwiPnt0aGlzLnByb3BzLnVzZXIuZmxhdm91cn08L2Rpdj5cblx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1ub3RlLWljb24gaW9uLWNoZXZyb24tcmlnaHRcIiAvPlxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvVGFwcGFibGU+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PFRhcHBhYmxlIG9uVGFwPXt0aGlzLmZsYXNoQWxlcnQuYmluZCh0aGlzLCAnWW91IGNsaWNrZWQgdGhlIFByaW1hcnkgQnV0dG9uLicpfSBjbGFzc05hbWU9XCJwYW5lbC1idXR0b24gcHJpbWFyeVwiIGNvbXBvbmVudD1cImJ1dHRvblwiPlxuXHRcdFx0XHRcdFx0UHJpbWFyeSBCdXR0b25cblx0XHRcdFx0XHQ8L1RhcHBhYmxlPlxuXHRcdFx0XHRcdDxUYXBwYWJsZSBvblRhcD17dGhpcy5mbGFzaEFsZXJ0LmJpbmQodGhpcywgJ1lvdSBjbGlja2VkIHRoZSBEZWZhdWx0IEJ1dHRvbi4nKX0gY2xhc3NOYW1lPVwicGFuZWwtYnV0dG9uXCIgY29tcG9uZW50PVwiYnV0dG9uXCI+XG5cdFx0XHRcdFx0XHREZWZhdWx0IEJ1dHRvblxuXHRcdFx0XHRcdDwvVGFwcGFibGU+XG5cdFx0XHRcdFx0PFRhcHBhYmxlIG9uVGFwPXt0aGlzLmZsYXNoQWxlcnQuYmluZCh0aGlzLCAnWW91IGNsaWNrZWQgdGhlIERhbmdlciBCdXR0b24uJyl9IGNsYXNzTmFtZT1cInBhbmVsLWJ1dHRvbiBkYW5nZXJcIiBjb21wb25lbnQ9XCJidXR0b25cIj5cblx0XHRcdFx0XHRcdERhbmdlciBCdXR0b25cblx0XHRcdFx0XHQ8L1RhcHBhYmxlPlxuXHRcdFx0XHQ8L1VJLlZpZXdDb250ZW50PlxuXHRcdFx0PC9VSS5WaWV3PlxuXHRcdCk7XG5cdH1cbn0pO1xuIiwidmFyIENvbnRhaW5lciA9IHJlcXVpcmUoJ3JlYWN0LWNvbnRhaW5lcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBVSSA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpLlVJO1xuXG5jb25zdCBzY3JvbGxhYmxlID0gQ29udGFpbmVyLmluaXRTY3JvbGxhYmxlKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRzdGF0aWNzOiB7XG5cdFx0bmF2aWdhdGlvbkJhcjogJ21haW4nLFxuXHRcdGdldE5hdmlnYXRpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGl0bGU6ICdGb3Jtcydcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGdldEluaXRpYWxTdGF0ZSAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZsYXZvdXI6ICdzdHJhd2JlcnJ5J1xuXHRcdH1cblx0fSxcblx0aGFuZGxlRmxhdm91ckNoYW5nZSAobmV3Rmxhdm91cikge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zmxhdm91cjogbmV3Rmxhdm91clxuXHRcdH0pO1xuXHR9LFxuXHRoYW5kbGVTd2l0Y2ggKGtleSwgZXZlbnQpIHtcblx0XHR2YXIgbmV3U3RhdGUgPSB7fTtcblx0XHRuZXdTdGF0ZVtrZXldID0gIXRoaXMuc3RhdGVba2V5XTtcblxuXHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHR9LFxuXHRyZW5kZXIgKCkge1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT17c2Nyb2xsYWJsZX0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGVyIHRleHQtY2Fwc1wiPkNoZWNrYm94PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZmllbGQtbGFiZWxcIj5Td2l0Y2g8L2Rpdj5cblx0XHRcdFx0XHRcdFx0PFVJLlN3aXRjaCBvblRhcD17dGhpcy5oYW5kbGVTd2l0Y2guYmluZCh0aGlzLCAnc3dpdGNoVmFsdWUnKX0gb249e3RoaXMuc3RhdGUuc3dpdGNoVmFsdWV9IC8+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZmllbGQtbGFiZWxcIj5EaXNhYmxlZDwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8VUkuU3dpdGNoIGRpc2FibGVkIC8+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGVyIHRleHQtY2Fwc1wiPlJhZGlvPC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8VUkuUmFkaW9MaXN0IHZhbHVlPXt0aGlzLnN0YXRlLmZsYXZvdXJ9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUZsYXZvdXJDaGFuZ2V9IG9wdGlvbnM9e1tcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdWYW5pbGxhJywgICAgdmFsdWU6ICd2YW5pbGxhJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0Nob2NvbGF0ZScsICB2YWx1ZTogJ2Nob2NvbGF0ZScgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdDYXJhbWVsJywgICAgdmFsdWU6ICdjYXJhbWVsJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ1N0cmF3YmVycnknLCB2YWx1ZTogJ3N0cmF3YmVycnknIH0sXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQmFuYW5hJywgICAgIHZhbHVlOiAnYmFuYW5hJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0xlbW9uJywgICAgICB2YWx1ZTogJ2xlbW9uJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ1Bhc3RhY2NpbycsICB2YWx1ZTogJ3Bhc3RhY2NpbycgfVxuXHRcdFx0XHRcdF19IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWhlYWRlciB0ZXh0LWNhcHNcIj5JbnB1dHM8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbFwiPlxuXHRcdFx0XHRcdDxVSS5JbnB1dCBwbGFjZWhvbGRlcj1cIkRlZmF1bHRcIiAvPlxuXHRcdFx0XHRcdDxVSS5JbnB1dCBkZWZhdWx0VmFsdWU9XCJXaXRoIFZhbHVlXCIgcGxhY2Vob2xkZXI9XCJQbGFjZWhvbGRlclwiIC8+XG5cdFx0XHRcdFx0PFVJLlRleHRhcmVhIGRlZmF1bHRWYWx1ZT1cIkxvbmd0ZXh0IGlzIGdvb2QgZm9yIGJpb3MgZXRjLlwiIHBsYWNlaG9sZGVyPVwiTG9uZ3RleHRcIiAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkZXIgdGV4dC1jYXBzXCI+TGFiZWxsZWQgSW5wdXRzPC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8VUkuTGFiZWxJbnB1dCB0eXBlPVwiZW1haWxcIiBsYWJlbD1cIkVtYWlsXCIgICBwbGFjZWhvbGRlcj1cInlvdXIubmFtZUBleGFtcGxlLmNvbVwiIC8+XG5cdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgdHlwZT1cInVybFwiICAgbGFiZWw9XCJVUkxcIiAgICAgcGxhY2Vob2xkZXI9XCJodHRwOi8vd3d3LnlvdXJ3ZWJzaXRlLmNvbVwiIC8+XG5cdFx0XHRcdFx0PFVJLkxhYmVsSW5wdXQgbm9lZGl0ICAgICAgIGxhYmVsPVwiTm8gRWRpdFwiIHZhbHVlPVwiVW4tZWRpdGFibGUsIHNjcm9sbGFibGUsIHNlbGVjdGFibGUgY29udGVudFwiIC8+XG5cdFx0XHRcdFx0PFVJLkxhYmVsU2VsZWN0IGxhYmVsPVwiRmxhdm91clwiIHZhbHVlPXt0aGlzLnN0YXRlLmZsYXZvdXJ9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUZsYXZvdXJDaGFuZ2V9IG9wdGlvbnM9e1tcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdWYW5pbGxhJywgICAgdmFsdWU6ICd2YW5pbGxhJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0Nob2NvbGF0ZScsICB2YWx1ZTogJ2Nob2NvbGF0ZScgfSxcblx0XHRcdFx0XHRcdHsgbGFiZWw6ICdDYXJhbWVsJywgICAgdmFsdWU6ICdjYXJhbWVsJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ1N0cmF3YmVycnknLCB2YWx1ZTogJ3N0cmF3YmVycnknIH0sXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiAnQmFuYW5hJywgICAgIHZhbHVlOiAnYmFuYW5hJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ0xlbW9uJywgICAgICB2YWx1ZTogJ2xlbW9uJyB9LFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogJ1Bhc3RhY2NpbycsICB2YWx1ZTogJ3Bhc3RhY2NpbycgfVxuXHRcdFx0XHRcdF19IC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxufSk7XG4iLCJ2YXIgQ29udGFpbmVyID0gcmVxdWlyZSgncmVhY3QtY29udGFpbmVyJyk7XG52YXIgTGluayA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpLkxpbms7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFVJID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJykuVUk7XG5cbmNvbnN0IFBFT1BMRSA9IHJlcXVpcmUoJy4uLy4uL2RhdGEvcGVvcGxlJyk7XG5cbnZhciBDb21wbGV4TGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIHBlcnNvbiA9IHRoaXMucHJvcHMudXNlcjtcblxuXHRcdHZhciBmaXJzdE5hbWUgPSBwZXJzb24ubmFtZS5zcGxpdCgnICcpLnNsaWNlKDAsIC0xKS5qb2luKCcgJyk7XG5cdFx0dmFyIGxhc3ROYW1lID0gcGVyc29uLm5hbWUuc3BsaXQoJyAnKS5zbGljZSgtMSkuam9pbignICcpO1xuXHRcdFxuXHRcdHZhciBpbml0aWFscyA9IGZpcnN0TmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGxhc3ROYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxMaW5rIHRvPVwiZGV0YWlsc1wiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIiB2aWV3UHJvcHM9e3sgdXNlcjogcGVyc29uLCBwcmV2VmlldzogJ2NvbXBvbmVudC1jb21wbGV4LWxpc3QnIH19IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiIGNvbXBvbmVudD1cImRpdlwiPlxuXHRcdFx0XHQ8VUkuSXRlbU1lZGlhIGF2YXRhcj17cGVyc29uLnBpY3R1cmV9IGF2YXRhckluaXRpYWxzPXtpbml0aWFsc30gLz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWNvbnRlbnRcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS10aXRsZVwiPntwZXJzb24ubmFtZX08L2Rpdj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1zdWJ0aXRsZVwiPntwZXJzb24uYmlvfTwvZGl2PlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxVSS5JdGVtTm90ZSB0eXBlPVwiZGVmYXVsdFwiIGxhYmVsPVwiTW9yZVwiIGljb249XCJpb24tY2hldnJvbi1yaWdodFwiIC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9MaW5rPlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0c3RhdGljczoge1xuXHRcdG5hdmlnYXRpb25CYXI6ICdtYWluJyxcblx0XHRnZXROYXZpZ2F0aW9uIChwcm9wcywgYXBwKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRsZWZ0QXJyb3c6IHRydWUsXG5cdFx0XHRcdGxlZnRMYWJlbDogJ0xpc3RzJyxcblx0XHRcdFx0bGVmdEFjdGlvbjogKCkgPT4geyBhcHAudHJhbnNpdGlvblRvKCd0YWJzOmxpc3RzJywgeyB0cmFuc2l0aW9uOiAncmV2ZWFsLWZyb20tcmlnaHQnIH0pIH0sXG5cdFx0XHRcdHRpdGxlOiAnQ29tcGxleCBMaXN0J1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVuZGVyICgpIHtcblx0XHR2YXIgbGlzdCA9IFBFT1BMRS5tYXAoKHVzZXIsIGkpID0+IHtcblx0XHRcdHJldHVybiA8Q29tcGxleExpc3RJdGVtIGtleT17J3VzZXJfJytpfSB1c2VyPXt1c2VyfSAvPlxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbCBwYW5lbC0tZmlyc3RcIj5cblx0XHRcdFx0XHR7bGlzdH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiIsInZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbnZhciBMaW5rID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJykuTGluaztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGFwcGFibGUgPSByZXF1aXJlKCdyZWFjdC10YXBwYWJsZScpO1xudmFyIFRpbWVycyA9IHJlcXVpcmUoJ3JlYWN0LXRpbWVycycpO1xuXG5jb25zdCBQRU9QTEUgPSByZXF1aXJlKCcuLi8uLi9kYXRhL3Blb3BsZScpO1xuXG52YXIgU2ltcGxlTGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHJlbmRlciAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxMaW5rIHRvPVwiZGV0YWlsc1wiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIiB2aWV3UHJvcHM9e3sgdXNlcjogdGhpcy5wcm9wcy51c2VyLCBwcmV2VmlldzogJ2NvbXBvbmVudC1zaW1wbGUtbGlzdCcgfX0gY2xhc3NOYW1lPVwibGlzdC1pdGVtIGlzLXRhcHBhYmxlXCIgY29tcG9uZW50PVwiZGl2XCI+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS10aXRsZVwiPnt0aGlzLnByb3BzLnVzZXIubmFtZX08L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0xpbms+XG5cdFx0KTtcblx0fVxufSk7XG5cbnZhciBTZWFyY2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1RpbWVycygpXSxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRzZWFyY2hTdHJpbmc6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnJlZnMuaW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG5cdFx0fSwgMTAwMCk7XG5cdH0sXG5cblx0aGFuZGxlQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdH0sXG5cblx0cmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKCcnKTtcblx0XHR0aGlzLnJlZnMuaW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgY2xlYXJJY29uID0gQm9vbGVhbih0aGlzLnByb3BzLnNlYXJjaFN0cmluZy5sZW5ndGgpID8gPFRhcHBhYmxlIG9uVGFwPXt0aGlzLnJlc2V0fSBjbGFzc05hbWU9XCJTZWFyY2hGaWVsZF9faWNvbiBTZWFyY2hGaWVsZF9faWNvbi0tY2xlYXJcIiAvPiA6ICcnO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VhcmNoRmllbGRcIj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VhcmNoRmllbGRfX2ljb24gU2VhcmNoRmllbGRfX2ljb24tLXNlYXJjaFwiIC8+XG5cdFx0XHRcdDxpbnB1dCByZWY9XCJpbnB1dFwiIHZhbHVlPXt0aGlzLnByb3BzLnNlYXJjaFN0cmluZ30gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlfSBjbGFzc05hbWU9XCJTZWFyY2hGaWVsZF9faW5wdXRcIiBwbGFjZWhvbGRlcj0nU2VhcmNoLi4uJyAvPlxuXHRcdFx0XHR7Y2xlYXJJY29ufVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHN0YXRpY3M6IHtcblx0XHRuYXZpZ2F0aW9uQmFyOiAnbWFpbicsXG5cdFx0Z2V0TmF2aWdhdGlvbiAocHJvcHMsIGFwcCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bGVmdEFycm93OiB0cnVlLFxuXHRcdFx0XHRsZWZ0TGFiZWw6ICdMaXN0cycsXG5cdFx0XHRcdGxlZnRBY3Rpb246ICgpID0+IHsgYXBwLnRyYW5zaXRpb25UbygndGFiczpsaXN0cycsIHsgdHJhbnNpdGlvbjogJ3JldmVhbC1mcm9tLXJpZ2h0JyB9KSB9LFxuXHRcdFx0XHR0aXRsZTogJ1NpbXBsZSBMaXN0J1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Z2V0SW5pdGlhbFN0YXRlICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VhcmNoU3RyaW5nOiAnJ1xuXHRcdH1cblx0fSxcblx0dXBkYXRlU2VhcmNoIChzdHIpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgc2VhcmNoU3RyaW5nOiBzdHIgfSk7XG5cdH0sXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIGxpc3QgPSBQRU9QTEUubWFwKCh1c2VyLCBpKSA9PiB7XG5cdFx0XHRyZXR1cm4gPFNpbXBsZUxpc3RJdGVtIGtleT17J3VzZXJfJytpfSB1c2VyPXt1c2VyfSAvPlxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXIgc2Nyb2xsYWJsZT5cblx0XHRcdFx0PFNlYXJjaCBzZWFyY2hTdHJpbmc9e3RoaXMuc3RhdGUuc2VhcmNoU3RyaW5nfSBvbkNoYW5nZT17dGhpcy51cGRhdGVTZWFyY2h9IC8+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWwgbWItMFwiPlxuXHRcdFx0XHRcdHtsaXN0fVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvQ29udGFpbmVyPlxuXHRcdCk7XG5cdH1cbn0pO1xuIiwidmFyIENvbnRhaW5lciA9IHJlcXVpcmUoJ3JlYWN0LWNvbnRhaW5lcicpO1xudmFyIExpbmsgPSByZXF1aXJlKCd0b3VjaHN0b25lanMnKS5MaW5rO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHN0YXRpY3M6IHtcblx0XHRuYXZpZ2F0aW9uQmFyOiAnbWFpbicsXG5cdFx0Z2V0TmF2aWdhdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0aXRsZTogJ0xpc3RzJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lciBzY3JvbGxhYmxlPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWhlYWRlciB0ZXh0LWNhcHNcIj5MaXN0czwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBhbmVsXCI+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOmxpc3Qtc2ltcGxlXCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1yaWdodFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+U2ltcGxlIExpc3Q8L2Rpdj5cblx0XHRcdFx0XHQ8L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOmxpc3QtY29tcGxleFwiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPkNvbXBsZXggTGlzdDwvZGl2PlxuXHRcdFx0XHRcdDwvTGluaz5cblx0XHRcdFx0XHR7LyogVGhpcyBpcyBjb3ZlcmVkIGluIG90aGVyIGNvbXBvbmVudHNcblx0XHRcdFx0XHQ8TGluayBjb21wb25lbnQ9XCJkaXZcIiB0bz1cImNvbXBvbmVudC1jYXRlZ29yaXNlZC1saXN0XCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1yaWdodFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+Q2F0ZWdvcmlzZWQgTGlzdDwvZGl2PlxuXHRcdFx0XHRcdDwvTGluaz4qL31cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiIsInZhciBDb250YWluZXIgPSByZXF1aXJlKCdyZWFjdC1jb250YWluZXInKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGltZXJzID0gcmVxdWlyZSgncmVhY3QtdGltZXJzJyk7XG52YXIgTWl4aW5zID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJykuTWl4aW5zO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbTWl4aW5zLlRyYW5zaXRpb25zLCBUaW1lcnMoKV0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi50cmFuc2l0aW9uVG8oJ3RhYnM6dHJhbnNpdGlvbnMnLCB7IHRyYW5zaXRpb246ICdmYWRlJyB9KTtcblx0XHR9LCAxMDAwKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lcj5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiaW9uLWlvcy1waG90b3MgaW9uLXh4bCB0ZXh0LW11dGVkXCIgLz5cblx0XHRcdFx0PGgyPkhvbGQgb24gYSBzZWMuLi48L2gyPlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxufSk7XG4iLCJ2YXIgQ29udGFpbmVyID0gcmVxdWlyZSgncmVhY3QtY29udGFpbmVyJyk7XG52YXIgTGluayA9IHJlcXVpcmUoJ3RvdWNoc3RvbmVqcycpLkxpbms7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFVJID0gcmVxdWlyZSgndG91Y2hzdG9uZWpzJykuVUk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRzdGF0aWNzOiB7XG5cdFx0bmF2aWdhdGlvbkJhcjogJ21haW4nLFxuXHRcdGdldE5hdmlnYXRpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGl0bGU6ICdUcmFuc2l0aW9ucydcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlbmRlciAoKSB7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PENvbnRhaW5lciBzY3JvbGxhYmxlPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWhlYWRlciB0ZXh0LWNhcHNcIj5EZWZhdWx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8TGluayB0bz1cInRhYnM6dHJhbnNpdGlvbnMtdGFyZ2V0XCIgY2xhc3NOYW1lPVwibGlzdC1pdGVtIGlzLXRhcHBhYmxlXCIgY29tcG9uZW50PVwiZGl2XCI+PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+Tm9uZTwvZGl2PjwvTGluaz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGVyIHRleHQtY2Fwc1wiPkZhZGU8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbFwiPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczp0cmFuc2l0aW9ucy10YXJnZXRcIiB0cmFuc2l0aW9uPVwiZmFkZVwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiIGNvbXBvbmVudD1cImRpdlwiPjxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPkZhZGU8L2Rpdj48L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJmYWRlLWV4cGFuZFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiIGNvbXBvbmVudD1cImRpdlwiPjxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPkZhZGUgRXhwYW5kPC9kaXY+PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczp0cmFuc2l0aW9ucy10YXJnZXRcIiB0cmFuc2l0aW9uPVwiZmFkZS1jb250cmFjdFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiIGNvbXBvbmVudD1cImRpdlwiPjxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPkZhZGUgQ29udHJhY3Q8L2Rpdj48L0xpbms+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWhlYWRlciB0ZXh0LWNhcHNcIj5TaG93PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8TGluayB0bz1cInRhYnM6dHJhbnNpdGlvbnMtdGFyZ2V0XCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1sZWZ0XCIgY2xhc3NOYW1lPVwibGlzdC1pdGVtIGlzLXRhcHBhYmxlXCIgY29tcG9uZW50PVwiZGl2XCI+PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+U2hvdyBmcm9tIExlZnQ8L2Rpdj48L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJzaG93LWZyb20tcmlnaHRcIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIiBjb21wb25lbnQ9XCJkaXZcIj48ZGl2IGNsYXNzTmFtZT1cIml0ZW0taW5uZXJcIj5TaG93IGZyb20gUmlnaHQ8L2Rpdj48L0xpbms+XG5cdFx0XHRcdFx0PExpbmsgdG89XCJ0YWJzOnRyYW5zaXRpb25zLXRhcmdldFwiIHRyYW5zaXRpb249XCJzaG93LWZyb20tdG9wXCIgY2xhc3NOYW1lPVwibGlzdC1pdGVtIGlzLXRhcHBhYmxlXCIgY29tcG9uZW50PVwiZGl2XCI+PGRpdiBjbGFzc05hbWU9XCJpdGVtLWlubmVyXCI+U2hvdyBmcm9tIFRvcDwvZGl2PjwvTGluaz5cblx0XHRcdFx0XHQ8TGluayB0bz1cInRhYnM6dHJhbnNpdGlvbnMtdGFyZ2V0XCIgdHJhbnNpdGlvbj1cInNob3ctZnJvbS1ib3R0b21cIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIiBjb21wb25lbnQ9XCJkaXZcIj48ZGl2IGNsYXNzTmFtZT1cIml0ZW0taW5uZXJcIj5TaG93IGZyb20gQm90dG9tPC9kaXY+PC9MaW5rPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkZXIgdGV4dC1jYXBzXCI+UmV2ZWFsPC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cblx0XHRcdFx0XHQ8TGluayB0bz1cInRhYnM6dHJhbnNpdGlvbnMtdGFyZ2V0XCIgdHJhbnNpdGlvbj1cInJldmVhbC1mcm9tLWxlZnRcIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIiBjb21wb25lbnQ9XCJkaXZcIj48ZGl2IGNsYXNzTmFtZT1cIml0ZW0taW5uZXJcIj5SZXZlYWwgZnJvbSBMZWZ0PC9kaXY+PC9MaW5rPlxuXHRcdFx0XHRcdDxMaW5rIHRvPVwidGFiczp0cmFuc2l0aW9ucy10YXJnZXRcIiB0cmFuc2l0aW9uPVwicmV2ZWFsLWZyb20tcmlnaHRcIiBjbGFzc05hbWU9XCJsaXN0LWl0ZW0gaXMtdGFwcGFibGVcIiBjb21wb25lbnQ9XCJkaXZcIj48ZGl2IGNsYXNzTmFtZT1cIml0ZW0taW5uZXJcIj5SZXZlYWwgZnJvbSBSaWdodDwvZGl2PjwvTGluaz5cblx0XHRcdFx0XHQ8TGluayB0bz1cInRhYnM6dHJhbnNpdGlvbnMtdGFyZ2V0XCIgdHJhbnNpdGlvbj1cInJldmVhbC1mcm9tLXRvcFwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiIGNvbXBvbmVudD1cImRpdlwiPjxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPlJldmVhbCBmcm9tIFRvcDwvZGl2PjwvTGluaz5cblx0XHRcdFx0XHQ8TGluayB0bz1cInRhYnM6dHJhbnNpdGlvbnMtdGFyZ2V0XCIgdHJhbnNpdGlvbj1cInJldmVhbC1mcm9tLWJvdHRvbVwiIGNsYXNzTmFtZT1cImxpc3QtaXRlbSBpcy10YXBwYWJsZVwiIGNvbXBvbmVudD1cImRpdlwiPjxkaXYgY2xhc3NOYW1lPVwiaXRlbS1pbm5lclwiPlJldmVhbCBmcm9tIEJvdHRvbTwvZGl2PjwvTGluaz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0NvbnRhaW5lcj5cblx0XHQpO1xuXHR9XG59KTtcbiJdfQ==
