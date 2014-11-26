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

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<div className="headerbar-label">TouchstoneJS</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="page-header text-caps">Bars</div>
					<div className="panel ios-list">
						<Link to="components-headerbar" viewTransition="show-from-right" className="list-item is-tappable">Header Bar</Link>
						<Link to="components-statusbar" viewTransition="show-from-right" className="list-item is-tappable">Status Bar</Link>
						<Link to="components-footerbar" viewTransition="show-from-right" className="list-item is-tappable">Footer Bar</Link>
						<Link to="components-actionbar" viewTransition="show-from-right" className="list-item is-tappable">Action Bar</Link>
					</div>
					<div className="page-header text-caps">Lists</div>
					<div className="panel ios-list">
						<Link to="components-simple-list" viewTransition="show-from-right" className="list-item is-tappable">Simple List</Link>
						<Link to="components-complex-list" viewTransition="show-from-right" className="list-item is-tappable">Complex List</Link>
						<Link to="components-header-list" viewTransition="show-from-right" className="list-item is-tappable">Header List</Link>
					</div>
					<div className="page-header text-caps">UI Elements</div>
					<div className="panel ios-list">
						<div className="list-item">Buttons</div>
						<div className="list-item">Keypad</div>
						<div className="list-item">Passcode</div>
					</div>
					<div className="page-header text-caps">Scaffolding</div>
					<div className="panel ios-list">
						<Link to="transitions" viewTransition="show-from-right" className="list-item is-tappable">View Transitions</Link>
						<Link to="components-feedback" viewTransition="show-from-right" className="list-item is-tappable">View Feedback</Link>
					</div>
					<div className="page-header text-caps">Modals</div>
					<div className="panel ios-list">
						<Link to="components-modal-message" viewTransition="show-from-right" className="list-item is-tappable">Modal Message</Link>
						<Link to="components-modal-loading" viewTransition="show-from-right" className="list-item is-tappable">Modal Loading</Link>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});

