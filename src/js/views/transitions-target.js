var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation],
	
	componentDidMount: function() {
		setTimeout(function() {
			this.showView('transitions', 'fade');
		}.bind(this), 1000);
	},

	render: function() {

		return (
			<UI.View className={this.props.viewClassName}>
				<UI.Headerbar type="default" label="Target View" />
				<UI.ViewContent>
					<UI.Feedback iconKey="ion-ios7-photos" iconType="muted" text="Hold on a sec..." />
				</UI.ViewContent>
			</UI.View>
		);
	}
});
