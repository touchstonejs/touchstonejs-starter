/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

module.exports = React.createClass({
	mixins: [Navigation],

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Back</div>
					</Link>
					<div className="headerbar-label">Components</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="page-header text-caps">Bars</div>
					<div className="panel gutter-list">
						<Link to="components-headerbar" viewTransition="show-from-right" className="list-item list-item-has-chevron">Header Bar</Link>
						<Link to="components-statusbar" viewTransition="show-from-right" className="list-item list-item-has-chevron">Status Bar</Link>
						<Link to="components-footerbar" viewTransition="show-from-right" className="list-item list-item-has-chevron">Footer Bar</Link>
						<Link to="components-actionbar" viewTransition="show-from-right" className="list-item list-item-has-chevron">Action Bar</Link>
					</div>
					<div className="page-header text-caps">Lists</div>
					<div className="panel gutter-list">
						<div className="list-item">Simple List</div>
						<div className="list-item">Complex List</div>
					</div>
					<div className="page-header text-caps">UI Elements</div>
					<div className="panel gutter-list">
						<div className="list-item">Buttons</div>
						<div className="list-item">Keypad</div>
						<div className="list-item">Passcode</div>
					</div>
					<div className="page-header text-caps">Misc.</div>
					<div className="panel gutter-list">
						<Link to="components-feedback" viewTransition="show-from-right" className="list-item list-item-has-chevron">View Feedback</Link>
						<Link to="components-modal-message" viewTransition="show-from-right" className="list-item list-item-has-chevron">Modal Message</Link>
						<Link to="components-modal-loading" viewTransition="show-from-right" className="list-item list-item-has-chevron">Modal Loading</Link>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
