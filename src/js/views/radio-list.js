/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	Link = require('../touchstone/link'),
	UI = require('../touchstone/ui');

var RadioList = React.createClass({

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

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function() {
		return {
			flavour: this.props.flavour
		}
	},

	handleFlavourChange: function(newFlavour) {

		this.setState({
			flavour: newFlavour
		});

	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="details" viewTransition="reveal-from-right" params={{ session: this.props.session, flavour: this.state.flavour }} className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Details</div>
					</Link>
					<div className="headerbar-label">Radio List</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="panel gap-top">
						<RadioList value={this.state.flavour} onChange={this.handleFlavourChange} options={[
							{ label: 'Vanilla',    value: 'vanilla' },
							{ label: 'Chocolate',  value: 'chocolate' },
							{ label: 'Caramel',    value: 'caramel' },
							{ label: 'Strawberry', value: 'strawberry' },
							{ label: 'Banana',     value: 'banana' },
							{ label: 'Lemon',      value: 'lemon' },
							{ label: 'Pastaccio',  value: 'pastaccio' }
						]} />
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
