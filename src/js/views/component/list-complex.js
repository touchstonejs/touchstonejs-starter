/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

var People = require('../../../data/people');

var ComplexListItem = React.createClass({
	mixins: [Navigation],

	render: function() {

		return (
			<Link to="details" viewTransition="show-from-right" params={{ user: this.props.user, prevView: 'component-complex-list' }} className="list-item user-item list-item-icon-left is-tappable" component="div">
				<span className="list-icon list-avatar left">
					<img src={this.props.user.img} />
				</span>
				<div className="list-inner">
					<div className="list-title">{this.props.user.name}</div>
					<div className="list-subtitle">{this.props.user.location}</div>
				</div>
			</Link>
		);
	}
});

var ComplexList = React.createClass({
	render: function() {

		var users = [];
		
		this.props.users.forEach(function(user, i) {
			user.key = 'user-' + i;
			users.push(React.createElement(ComplexListItem, { user: user }));
		});
		
		return (
			<div>
				<div className="panel panel--first icon-list">
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
				<UI.Headerbar label="Complex List">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.FlexBlock scrollable>
					<ComplexList users={People} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
