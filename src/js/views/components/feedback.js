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
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button">
						<div className="Headerbar-button-icon ion-chevron-left" />
						<div className="Headerbar-button-label">Back</div>
					</Link>
					<div className="Headerbar-label">Feedback</div>
				</UI.FlexBlock>
				<UI.FlexBlock>
					<UI.Feedback iconKey="ion-compass" iconType="primary" header="Optional Header" subheader="Subheader, also optional" text="Feedback message copy goes here. It can be of any length." actionText="Optional Action" actionFn={this.flashAlert.bind(this, 'You clicked the action.')} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
