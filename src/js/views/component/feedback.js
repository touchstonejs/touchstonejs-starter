/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation],

	flashAlert: function(alertContent) {
		alert(alertContent);
	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar type="default" label="Feedback">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.FlexBlock>
					<UI.Feedback iconKey="ion-compass" iconType="primary" header="Optional Header" subheader="Subheader, also optional" text="Feedback message copy goes here. It can be of any length." actionText="Optional Action" actionFn={this.flashAlert.bind(this, 'You clicked the action.')} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
