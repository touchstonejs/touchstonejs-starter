/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	Link = require('../touchstone/link'),
	UI = require('../touchstone/ui');

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
				<UI.FlexBlock height="44px" className="headerbar">
					<div className="headerbar-label">Target View</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="feedback-message">
						<div className="feedback-message-icon ion-ios7-photos text-muted" />
						<div className="feedback-message-text">Hold on a sec...</div>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
