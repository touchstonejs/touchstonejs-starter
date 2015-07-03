var React = require('react');
var UI = require('touchstonejs').UI;

module.exports = React.createClass({
	flashAlert: function (alertContent) {
		window.alert(alertContent);
	},

	render: function () {
		return (
			<UI.View>
				<UI.Headerbar type="default" label="Feedback">
					<UI.HeaderbarButton showView="home" transition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.ViewContent>
					<UI.Feedback iconName="ion-compass" iconType="primary" header="Optional Header" subheader="Subheader, also optional" text="Feedback message copy goes here. It can be of any length." actionText="Optional Action" actionFn={this.flashAlert.bind(this, 'You clicked the action.')} />
				</UI.ViewContent>
			</UI.View>
		);
	}
});
