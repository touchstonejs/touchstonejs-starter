/** @jsx React.DOM */

var React = require('react'),
	UI = require('touchstonejs').UI;

module.exports = React.createClass({

	getInitialState: function() {
		return {}
	},

	handlePasscode: function(passCode) {
		alert('Your passcode is "' + passCode + '".');
	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Enter Passcode">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.Passcode action={this.handlePasscode} helpText="Enter a passcode" />
			</UI.FlexLayout>
		);
	}
});
