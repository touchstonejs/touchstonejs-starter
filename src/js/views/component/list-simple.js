/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

var People = require('../../../data/people');

var moment = require('moment')

var SimpleListItem = React.createClass({
	mixins: [Navigation],

	showDetailsView: function() {
		this.showView('details', 'show-from-right', { user: this.props.user })
	},

	render: function() {

		return (
			<Tappable onTap={this.showDetailsView} className="list-item is-tappable" component="div">
				<div className="list-title">{this.props.user.name}</div>
			</Tappable>
		);
	}
});

var SimpleList = React.createClass({
	render: function() {

		var users = [];
		
		this.props.users.forEach(function(user, i) {
			user.key = 'user-' + i;
			users.push(React.createElement(SimpleListItem, { user: user }));
		});
		
		return (
			<div>
				<div className="panel panel--first ios-list">
					{users}
				</div>
			</div>
		);
	}
});

module.exports = React.createClass({
	mixins: [Navigation],

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="Headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button ion-chevron-left" component="button">Back</Link>
					<div className="Headerbar-label">Simple List</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<SimpleList users={People} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
