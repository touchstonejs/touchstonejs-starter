var React = require('react/addons'),
	Tappable = require('../tappable');

module.exports = React.createClass({
	propTypes: {
		className: React.PropTypes.string,
		visible: React.PropTypes.bool,
		iconKey: React.PropTypes.string,
		iconType: React.PropTypes.string,
		header: React.PropTypes.string,
		text: React.PropTypes.string,
		actionText: React.PropTypes.string,
		actionFn: React.PropTypes.func
	},
	getDefaultProps: function() {
		return {
			className: ''
		};
	},
	render: function() {
		var className = this.props.className ? ('Modal-dialog ' + this.props.className) : 'Modal-dialog';

		var actionFn = function() {
			return this.props.actionFn(this.props.value)
		}.bind(this)

		var icon = this.props.iconKey ? <div className={'Modal-icon ' + this.props.iconKey + ' ' + this.props.iconType} /> : null;
		var header = this.props.header ? <div className="Modal-header">{this.props.header}</div> : null;
		var text = this.props.text ? <div className="Modal-text" dangerouslySetInnerHTML={{__html: this.props.text}} /> : null;
		var action = this.props.actionText ? <Tappable onTap={this.props.actionFn} className="Modal-action">{this.props.actionText}</Tappable> : null;

		return (
			<div className={this.props.visible ? 'Modal visible' : 'Modal'}>
				<div className={className}>
					{icon}
					{header}
					{text}
					{action}
				</div>
				<div className="Modal-backdrop" />
			</div>
		);
	}
});
