var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation],

	flashAlert: function (alertContent) {
		alert(alertContent);
	},

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type="default" label="Action Bar">
					<UI.HeaderbarButton showView="home" transition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
					<div className="panel-header text-caps">Label Only</div>
					<div className="panel">
						<UI.ActionButtons>
							<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')}  label="Primary Action" />
							<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')} label="Secondary Action" />
						</UI.ActionButtons>
					</div>
					<div className="panel-header text-caps">Icon Only</div>
					<div className="panel">
						<UI.ActionButtons>
							<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')}  icon="ion-arrow-up-c" />
							<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')} icon="ion-arrow-down-c" />
						</UI.ActionButtons>
					</div>
					<div className="panel-header text-caps">Icon &amp; Label</div>
					<div className="panel">
						<UI.ActionButtons>
							<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')}  label="Primary Action"    icon="ion-arrow-up-c" />
							<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')} label="Secondary Action" icon="ion-arrow-down-c" />
						</UI.ActionButtons>
					</div>
					<div className="panel-header text-caps">Easily Customisable</div>
					<UI.ActionButtons className="special">
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')}  label="Primary"   icon="ion-android-contact" />
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')}  label="Secondary" icon="ion-android-contacts" />
						<UI.ActionButton onTap={this.flashAlert.bind(this, 'You tapped an action button.')}  label="Tertiary"  icon="ion-android-friends" />
					</UI.ActionButtons>
				</UI.ViewContent>
			</UI.View>
		);
	}
});
