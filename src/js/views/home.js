/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

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
		this.setState({
			modalMessageVisible: true,
			modalMessageText: 'It will close in 5 seconds...'
		});
	},

	hideMessageModal: function() {
		this.setState({
			modalMessageVisible: false
		});
	},

	showLoadingModal: function() {
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
				<UI.Headerbar label="TouchstoneJS" />
				<UI.FlexBlock scrollable>
					<div className="panel-header text-caps">Bars</div>
					<div className="panel">
						<Link component="div" to="component-headerbar" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Header Bar</div>
						</Link>
						<Link component="div" to="component-headerbar-search" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Header Bar Search</div>
						</Link>
						<Link component="div" to="component-alertbar" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Alert Bar</div>
						</Link>
						<Link component="div" to="component-footerbar" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Footer Bar</div>
						</Link>
					</div>
					<div className="panel-header text-caps">Lists</div>
					<div className="panel">
						<Link component="div" to="component-simple-list" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Simple List</div>
						</Link>
						<Link component="div" to="component-complex-list" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Complex List</div>
						</Link>
						<Link component="div" to="component-categorised-list" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Categorised List</div>
						</Link>
					</div>
					<div className="panel-header text-caps">UI Elements</div>
					<div className="panel">
						<Link component="div" to="component-passcode" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Passcode / Keypad</div>
						</Link>
						<Link component="div" to="component-toggle"   viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Toggle</div>
						</Link>
						<Link component="div" to="component-form"     viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Form Fields</div>
						</Link>
					</div>
					<div className="panel-header text-caps">Application State</div>
					<div className="panel">
						<Link component="div" to="transitions" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">View Transitions</div>
						</Link>
						<Link component="div" to="component-feedback" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">View Feedback</div>
						</Link>
					</div>
					<div className="panel-header text-caps">Modals</div>
					<div className="panel">
						<Tappable component="div" onTap={this.showMessageModal} className="list-item is-tappable">
							<div className="item-inner">Modal Message</div>
						</Tappable>
						<Tappable component="div" onTap={this.showLoadingModal} className="list-item is-tappable">
							<div className="item-inner">Modal Loading</div>
						</Tappable>
					</div>
				</UI.FlexBlock>
				<UI.Modal header="This is a modal" text="This is the body. Modals can have up to two actions." visible={this.state.modalMessageVisible} className="text-center" primaryActionText="Okay" primaryActionFn={this.hideMessageModal} secondaryActionText="Cancel" secondaryActionFn={this.hideMessageModal} />
				<UI.Modal header="Loading" iconKey="ion-load-c" iconType="default" visible={this.state.modalLoadingVisible} className="Modal-loading" />
			</UI.FlexLayout>
		);
	}
});

