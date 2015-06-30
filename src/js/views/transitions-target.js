var Container = require('react-container');
var React = require('react');
var Timers = require('react-timers');
var Mixins = require('touchstonejs').Mixins;

module.exports = React.createClass({
	mixins: [Mixins.Transitions, Timers()],

	componentDidMount: function () {
		var self = this;

		this.setTimeout(function () {
			self.transitionTo('tabs:transitions', { transition: 'fade' });
		}, 1000);
	},

	render: function () {
		return (
			<Container>
				<span className="ion-ios-photos ion-xxl text-muted" />
				<h2>Hold on a sec...</h2>
			</Container>
		);
	}
});
