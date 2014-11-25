var React = require('react/addons'),
	SetClass = require('classnames');

module.exports = React.createClass({
	propTypes: {
		className: React.PropTypes.string,
		onChange: React.PropTypes.func,
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
	onChange: function(value) {
		if (this.props.onChange) {
			this.props.onChange(value);
		} else {
			this.setState({
				value: event.target.value
			});
		}
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
			<textarea type={this.props.type} value={this.state.value} onChange={this.onChange.bind(this, value)} className="field" placeholder={this.props.placeholder} rows="3" />
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
