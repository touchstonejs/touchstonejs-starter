var React = require('react/addons'),
	SetClass = require('classnames');

module.exports = React.createClass({
	propTypes: {
		className: React.PropTypes.string,
		type: React.PropTypes.string,
		label: React.PropTypes.string,
		noedit: React.PropTypes.bool,
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
		className += this.props.className ? (' ' + this.props.className) : ''

		// output a field, or a div if not editable
		var value = this.props.noedit ? (
			<div className="field">{this.state.value}</div>
		) : (
			<input type={this.props.type} value={this.state.value} onChange={this.updateInputValue} className="field" placeholder={this.props.placeholder} />
		);

		return (
			<label className={className}>
				<div className="field-label">{this.props.label}</div>
				<div className="field-control">
					{value}
				</div>
			</label>
		);
	}
});
