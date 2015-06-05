var React = require('react'),
	Dialogs = require('touchstonejs').Dialogs,
	Navigation = require('touchstonejs').Navigation,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation, Dialogs],

	getInitialState: function () {
		return {}
	},

	handlePasscode: function (passcode) {
		alert('Your passcode is "' + passcode + '".');

		this.showView('home', 'fade');
	},

	render: function () {
		return (
			<UI.View className={this.props.viewClassName}>
				<UI.Headerbar type="default" label="Enter Passcode">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.Passcode action={this.handlePasscode} helpText="Enter a passcode" />
			</UI.View>
		);
	}
});
