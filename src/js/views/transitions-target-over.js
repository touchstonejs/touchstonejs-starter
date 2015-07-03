var Container = require('react-container');
var React = require('react');
var Timers = require('react-timers');
var { Mixins, UI } = require('touchstonejs');

module.exports = React.createClass({
	mixins: [Mixins.Transitions, Timers()],
	componentDidMount () {
		var self = this;
		this.setTimeout(function () {
			self.transitionTo('app:main', { transition: 'fade' });
		}, 1000);
	},
	render () {
		return (
			<Container direction="column">
				<UI.NavigationBar name="over" title={this.props.navbarTitle} />
				<Container direction="column" align="center" justify="center" className="no-results">
					<div className="no-results__icon ion-ios-photos" />
					<div className="no-results__text">Hold on a sec...</div>
				</Container>
			</Container>
		);
	}
});
