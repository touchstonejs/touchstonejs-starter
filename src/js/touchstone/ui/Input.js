var React = require('react/addons'),
	SetClass = require('classnames'),
	Navigation = require('../../touchstone/navigation');

module.exports = React.createClass({
	mixins: [Navigation],
	propTypes: {
		className: React.PropTypes.string,
		type: React.PropTypes.string,
		label: React.PropTypes.string,
		first: React.PropTypes.bool
	},
	getDefaultProps: function() {
		return {
			className: ''
		};
	},
	getInitialState: function() {
		return {
			value: this.props.value
		};
	},
	updateInputValue: function(event) {
		this.setState({
			value: event.target.value
		});
	},
	render: function() {
		var className = SetClass({
			'field-item': true,
			'is-first': this.props.first
		});
		className += this.props.className + (this.props.className ? (' ' + this.props.className) : '')

		return (
			<label className={className}>
				<div className="field-label">{this.props.label}</div>
				<input type={this.props.type} value={this.state.value} onChange={this.updateInputValue} className="field" placeholder={this.props.placeholder} />
			</label>
		);
	}
});
