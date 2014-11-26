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

	showDetailsView: function() {
		this.showView('details', 'show-from-right', { user: this.props.user })
	},

	render: function() {

		return (
			<Tappable onTap={this.showDetailsView} className="list-item user-item list-item-icon-left is-tappable" component="div">
				<span className="list-icon list-avatar left">
					<img src={this.props.user.img} />
				</span>
				<div className="list-inner">
					<div className="list-title">{this.props.user.name}</div>
					<div className="list-subtitle">{this.props.user.location}</div>
				</div>
			</Tappable>
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
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Components</div>
					</Link>
					<div className="headerbar-label">Complex List</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<ComplexList users={People} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
