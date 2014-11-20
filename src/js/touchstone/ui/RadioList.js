/** @jsx React.DOM */

var React = require('react'),
	Tappable = require('../../touchstone/tappable');

module.exports = React.createClass({
	displayName: 'RadioList',

	propTypes: {
		options: React.PropTypes.array,
		value: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	onChange: function(value) {
		this.props.onChange(value);
	},

	render: function() {

		var options = this.props.options.map(function(op, i) {
			var className = 'form-item' + (i === 0 ? ' is-first' : '');
			var checkMark = op.value === this.props.value ? (
					<div className="form-tap-button is-primary">
						<div className="form-tap-button-icon ion-checkmark" />
					</div>
				) : null;
			return (
				<Tappable key={'option-' + op.value} onTap={this.onChange.bind(this, op.value)} className={className}>
					<div className="form-tap">
						{op.label}
						{checkMark}
					</div>
				</Tappable>
			);
		}.bind(this));

		return <div className="form-items">{options}</div>;

	}

});
