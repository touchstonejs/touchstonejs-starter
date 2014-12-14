/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

var People = require('../../../data/people');

var ComplexListItem = React.createClass({
	mixins: [Navigation],

	render: function() {
		
		var initials = this.props.user.name.first.charAt(0).toUpperCase() +
			this.props.user.name.last.charAt(0).toUpperCase();

		var renderAvatar = this.props.user.img ? <img src={this.props.user.img} /> : initials;

		return (
			<Link to="details" viewTransition="show-from-right" params={{ user: this.props.user, prevView: 'component-complex-list' }} className="list-item" component="div">
				<span className="item-media">
					<span className="list-avatar">
						{renderAvatar}
					</span>
				</span>
				<div className="item-inner">
					<div className="item-content">
						<div className="item-title">{[this.props.user.name.first, this.props.user.name.last].join(' ')}</div>
						<div className="item-subtitle">{this.props.user.location}</div>
					</div>
					<div className="item-note default">
						<div className="item-note-label">{this.props.user.joinedDate}</div>
						<div className="item-note-icon ion-chevron-right" />
					</div>
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
				<div className="panel panel--first avatar-list">
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
