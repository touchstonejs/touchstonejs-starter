/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	Link = require('../touchstone/link'),
	UI = require('../touchstone/ui');

var Icons = {
	Logo: require('../components/svg/icon-logo')
};

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function() {
		return {
			modalMessageVisible: false,
			modalLoadingVisible: false,
			modalMessageText: ''
		};
	},

	showMessageModal: function() {
		console.log('modal should open');
		this.setState({
			modalMessageVisible: true,
			modalMessageText: 'It will close in 5 seconds...'
		});

		setTimeout(function() {
			this.setState({ modalMessageText: 'It will close in 4 seconds...' });
		}.bind(this), 1000);

		setTimeout(function() {
			this.setState({ modalMessageText: 'It will close in 3 seconds...' });
		}.bind(this), 2000);

		setTimeout(function() {
			this.setState({ modalMessageText: 'It will close in 2 seconds...' });
		}.bind(this), 3000);

		setTimeout(function() {
			this.setState({ modalMessageText: 'It will close in 1 second...' });
		}.bind(this), 4000);

		setTimeout(function() {
			this.setState({ modalMessageVisible: false });
		}.bind(this), 5000);
	},

	showLoadingModal: function() {
		console.log('modal should open');
		this.setState({
			modalLoadingVisible: true
		});

		setTimeout(function() {
			this.setState({ modalLoadingVisible: false });
		}.bind(this), 2000);
	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="Headerbar primary">
					<div className="Headerbar-label">TouchstoneJS</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="view-header text-caps">Bars</div>
					<div className="panel ios-list">
						<Link component="div" to="component-headerbar" viewTransition="show-from-right" className="list-item is-tappable">Header Bar</Link>
						<Link component="div" to="component-alertbar" viewTransition="show-from-right" className="list-item is-tappable">Alert Bar</Link>
						<Link component="div" to="component-actionbar" viewTransition="show-from-right" className="list-item is-tappable">Action Bar</Link>
						<Link component="div" to="component-footerbar" viewTransition="show-from-right" className="list-item is-tappable">Footer Bar</Link>
					</div>
					<div className="view-header text-caps">Lists</div>
					<div className="panel ios-list">
						<Link component="div" to="component-simple-list" viewTransition="show-from-right" className="list-item is-tappable">Simple List</Link>
						<Link component="div" to="component-complex-list" viewTransition="show-from-right" className="list-item is-tappable">Complex List</Link>
						<Link component="div" to="component-header-list" viewTransition="show-from-right" className="list-item is-tappable">Categorised List</Link>
					</div>
					<div className="view-header text-caps">UI Elements</div>
					<div className="panel ios-list">
						<Link component="div" to="component-passcode" viewTransition="show-from-right" className="list-item is-tappable">Passcode / Keypad</Link>
					</div>
					<div className="view-header text-caps">Application State</div>
					<div className="panel ios-list">
						<Link component="div" to="transitions" viewTransition="show-from-right" className="list-item is-tappable">View Transitions</Link>
						<Link component="div" to="component-feedback" viewTransition="show-from-right" className="list-item is-tappable">View Feedback</Link>
					</div>
					<div className="view-header text-caps">Modals</div>
					<div className="panel ios-list">
						<Tappable component="div" onTap={this.showMessageModal} className="list-item is-tappable">Modal Message</Tappable>
						<Tappable component="div" onTap={this.showLoadingModal} className="list-item is-tappable">Modal Loading</Tappable>
					</div>
				</UI.FlexBlock>
				<UI.Modal header="This is a modal" text={this.state.modalMessageText} visible={this.state.modalMessageVisible} className="text-center" />
				<UI.Modal text="Loading..." iconKey="ion-load-d" iconType="default" visible={this.state.modalLoadingVisible} className="Modal-loading" />
			</UI.FlexLayout>
		);
	}
});

