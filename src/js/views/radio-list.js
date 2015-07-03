var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function () {
		return {
			flavour: this.props.user.flavour
		}
	},

	handleFlavourChange: function (newFlavour) {

		this.setState({
			flavour: newFlavour
		});

	},

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type="default" label="Favourite Icecream">
					<UI.HeaderbarButton showView="details" transition="reveal-from-right" viewProps={{ user: this.props.user, flavour: this.state.flavour }} label="Details" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
					<div className="panel panel--first">
						<UI.RadioList value={this.state.flavour} onChange={this.handleFlavourChange} options={[
							{ label: 'Vanilla',    value: 'vanilla' },
							{ label: 'Chocolate',  value: 'chocolate' },
							{ label: 'Caramel',    value: 'caramel' },
							{ label: 'Strawberry', value: 'strawberry' },
							{ label: 'Banana',     value: 'banana' },
							{ label: 'Lemon',      value: 'lemon' },
							{ label: 'Pastaccio',  value: 'pastaccio' }
						]} />
					</div>
				</UI.ViewContent>
			</UI.View>
		);
	}
});
