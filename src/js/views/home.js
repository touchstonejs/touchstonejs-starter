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
			modalLoadingVisible: false
		};
	},

	showMessageModal: function() {
		console.log('modal should open');
		this.setState({
			modalMessageVisible: true
		});

		setTimeout(function() {
			this.setState({
				modalMessageVisible: false
			});
		}.bind(this), 5000);
	},

	showLoadingModal: function() {
		console.log('modal should open');
		this.setState({
			modalLoadingVisible: true
		});

		setTimeout(function() {
			this.setState({
				modalLoadingVisible: false
			});
		}.bind(this), 5000);
	},

	render: function() {

		var modalMessageClass = !this.state.modalMessageVisible ? 'hidden' : '';

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="Headerbar">
					<div className="Headerbar-label">TouchstoneJS</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="view-header text-caps">Bars</div>
					<div className="panel ios-list">
						<Link to="components-headerbar" viewTransition="show-from-right" className="list-item is-tappable">Header Bar</Link>
						<Link to="components-alertbar" viewTransition="show-from-right" className="list-item is-tappable">Alert Bar</Link>
						<Link to="components-actionbar" viewTransition="show-from-right" className="list-item is-tappable">Action Bar</Link>
						<Link to="components-footerbar" viewTransition="show-from-right" className="list-item is-tappable">Footer Bar</Link>
					</div>
					<div className="view-header text-caps">Lists</div>
					<div className="panel ios-list">
						<Link to="components-simple-list" viewTransition="show-from-right" className="list-item is-tappable">Simple List</Link>
						<Link to="components-complex-list" viewTransition="show-from-right" className="list-item is-tappable">Complex List</Link>
						<Link to="components-header-list" viewTransition="show-from-right" className="list-item is-tappable">Header List</Link>
					</div>
					<div className="view-header text-caps">UI Elements</div>
					<div className="panel ios-list">
						<div className="list-item">Buttons</div>
						<div className="list-item">Keypad</div>
						<div className="list-item">Passcode</div>
					</div>
					<div className="view-header text-caps">Scaffolding</div>
					<div className="panel ios-list">
						<Link to="transitions" viewTransition="show-from-right" className="list-item is-tappable">View Transitions</Link>
						<Link to="components-feedback" viewTransition="show-from-right" className="list-item is-tappable">View Feedback</Link>
					</div>
					<div className="view-header text-caps">Modals</div>
					<div className="panel ios-list">
						<Tappable onTap={this.showMessageModal} className="list-item is-tappable">Modal Message</Tappable>
						<Tappable onTap={this.showLoadingModal} className="list-item is-tappable">Modal Loading</Tappable>
					</div>
				</UI.FlexBlock>
				<UI.Modal header="This is a modal" text="It will close in 5 seconds" visible={this.state.modalMessageVisible} className="text-center" />
				<UI.Modal text="Loading..." iconKey="ion-load-d" iconType="default" visible={this.state.modalLoadingVisible} className="Modal-loading" />
			</UI.FlexLayout>
		);
	}
});

