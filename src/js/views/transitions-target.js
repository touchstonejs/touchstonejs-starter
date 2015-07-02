var Container = require('react-container');
var React = require('react');
var Timers = require('react-timers');
var { Mixins } = require('touchstonejs');

module.exports = React.createClass({
	mixins: [Mixins.Transitions, Timers()],
	statics: {
		navigationBar: 'main',
		getNavigation (props) {
			return {
				title: props.navbarTitle
			}
		}
	},
	componentDidMount () {
		var self = this;

		this.setTimeout(function () {
			self.transitionTo('tabs:transitions', { transition: 'fade' });
		}, 1000);
	},
	render () {
		return (
			<Container direction="column" align="center" justify="center" className="no-results">
				<div className="no-results__icon ion-ios-photos" />
				<div className="no-results__text">Hold on a sec...</div>
			</Container>
		);
	}
});
