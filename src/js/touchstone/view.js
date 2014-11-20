var React = require('react/addons');

/**
 * Touchstone View
 * ===============
 * 
 * This Mixin which should be added to your app's Views.
 */

module.exports = {
	
	goto: function() {
		var args = arguments;
		return function() {
			this.props.app.showView.apply(app, args);
		}.bind(this);
	}
	
};
