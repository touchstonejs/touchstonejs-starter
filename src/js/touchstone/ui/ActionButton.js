var React = require('react/addons'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation');

module.exports = React.createClass({
	displayName: 'ActionButton',
	mixins: [Navigation],
	propTypes: {
		className: React.PropTypes.string,
		showView: React.PropTypes.string,
		viewTransition: React.PropTypes.string,
		viewProps: React.PropTypes.object,
		disabled: React.PropTypes.bool,
		onTap: React.PropTypes.func,
		label: React.PropTypes.string,
		icon: React.PropTypes.string
	},
	getDefaultProps: function() {
		return {
			className: '',
			disabled: false
		};
	},
	render: function() {
		var className = this.props.className ? (this.props.className + ' action-button') : 'action-button';
			className += this.props.disabled ? ' disabled' : '';
		var icon = this.props.icon ? <div className={'action-button-icon ' + this.props.icon} /> : null;
		var label = this.props.label ? <div className="action-button-label">{this.props.label}</div> : null;
		var action = this.props.showView ? this.showViewFn(this.props.showView, this.props.viewTransition, this.props.viewProps) : this.props.onTap;
		return (
			<div className="action-button-cell">
				<Tappable className={className} component="div" onTap={action}>
					<div className="action-button-inner">
						{icon}
						{label}
						{this.props.children}
					</div>
				</Tappable>
			</div>
		);
	}
});
