var React = require('react'),
	Navigation = require('touchstonejs').Navigation,
	UI = require('touchstonejs').UI;

var Timers = require('react-timers')

module.exports = React.createClass({
	mixins: [Navigation, Timers()],

	componentDidMount: function () {
		var self = this;

		this.setTimeout(function () {
			self.showView('transitions', 'fade');
		}, 1000);
	},

	render: function () {
		return (
			<UI.View>
				<UI.Headerbar type="default" label="Target View" />
				<UI.ViewContent>
					<UI.Feedback iconKey="ion-ios7-photos" iconType="muted" text="Hold on a sec..." />
				</UI.ViewContent>
			</UI.View>
		);
	}
});
