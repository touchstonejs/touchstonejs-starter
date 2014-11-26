/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

module.exports = React.createClass({
	mixins: [Navigation],

	flashAlert: function(alertContent) {
		alert(alertContent);
	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="Headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button ion-chevron-left" component="button">Back</Link>
					<div className="Headerbar-label">Footer Bar</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="view-inner text-center">Your amazing app content and components go here!</div>
				</UI.FlexBlock>
				<UI.FlexBlock height="44px" className="footerbar primary">
					<UI.ActionButtons>
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped a footer button.')}  label="Timeline"      icon="ion-ios7-home" />
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped a footer button.')}  label="Notifications" icon="ion-ios7-bell" />
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped a footer button.')}  label="Messages"      icon="ion-ios7-email" />
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped a footer button.')}  label="Account"       icon="ion-ios7-person" />
					</UI.ActionButtons>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
