/** @jsx React.DOM */

var React = require('react'),
	Dialogs = require('touchstonejs').Dialogs,
	Navigation = require('touchstonejs').Navigation,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation, Dialogs],

	getInitialState: function() {
		return {}
	},

	handlePasscode: function(passcode) {
		return this.showAlertDialog({ title: 'Alert with Callback', message: 'Your passcode is "' + passcode + '".' }, function() {
			this.showView('home', 'fade')
		}.bind(this));
	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar type="default" label="Enter Passcode">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.Passcode action={this.handlePasscode} helpText="Enter a passcode" />
			</UI.FlexLayout>
		);
	}
});
