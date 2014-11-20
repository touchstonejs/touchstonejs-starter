var React = require('react/addons'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation');

module.exports = React.createClass({
	mixins: [Navigation],
	propTypes: {
		className: React.PropTypes.string,
		showView: React.PropTypes.string,
		viewTransition: React.PropTypes.string,
		viewProps: React.PropTypes.object,
		action: React.PropTypes.func,
		label: React.PropTypes.string
	},
	getDefaultProps: function() {
		return {
			className: ''
		};
	},
	render: function() {
		var className = this.props.className + ' loading-button';
		var label = this.props.label ? <div className="loading-button-text">{this.props.label}</div> : null;
		var action = this.props.showView ? this.showViewFn(this.props.showView, this.props.viewTransition, this.props.viewProps) : this.props.action;
		return (
			<Tappable className={className} component="div" onTap={action}>
				<span className="loading-button-icon-wrapper">
					<span className="loading-button-icon" />
				</span>
				{label}
			</Tappable>
		);
	}
});
