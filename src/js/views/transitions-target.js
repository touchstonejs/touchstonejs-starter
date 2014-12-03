/** @jsx React.DOM */

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
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Target View" />
				<UI.FlexBlock>
					<UI.Feedback iconKey="ion-ios7-photos" iconType="muted" text="Hold on a sec..." />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
