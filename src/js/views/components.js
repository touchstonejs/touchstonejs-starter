/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	Link = require('../touchstone/link'),
	UI = require('../touchstone/ui');

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
					<div className="panel is-first">	
						<div className="list gutter-list">
							<div className="list-item list-item-has-chevron">Alerts</div>
							<div className="list-item list-item-has-chevron">Bars</div>
							<div className="list-item list-item-has-chevron">Buttons</div>
							<div className="list-item list-item-has-chevron">Keypad</div>
							<div className="list-item list-item-has-chevron">Passcode</div>
							<div className="list-item list-item-has-chevron">Lists</div>
						</div>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
