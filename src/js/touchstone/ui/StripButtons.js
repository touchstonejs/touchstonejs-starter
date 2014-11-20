var React = require('react/addons');

module.exports = React.createClass({
	displayName: 'StripButtons',
	propTypes: {
		className: React.PropTypes.string
	},
	getDefaultProps: function() {
		return {
			className: ''
		};
	},
	render: function() {
		var className = this.props.className ? (this.props.className + ' strip-buttons') : 'strip-buttons';
		return <div className={className}>{this.props.children}</div>;
	}
});
