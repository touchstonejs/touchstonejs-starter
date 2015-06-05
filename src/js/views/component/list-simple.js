var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

var People = require('../../../data/people');

var SimpleListItem = React.createClass({
	mixins: [Navigation],

	render: function () {

		return (
			<Link to="details" viewTransition="show-from-right" params={{ user: this.props.user, prevView: 'component-simple-list' }} className="list-item is-tappable" component="div">
				<div className="item-inner">
					<div className="item-title">{[this.props.user.name.first, this.props.user.name.last].join(' ')}</div>
				</div>
			</Link>
		);
	}
});

var SimpleList = React.createClass({
	render: function () {

		var users = [];
		
		this.props.users.forEach(function (user, i) {
			user.key = 'user-' + i;
			users.push(React.createElement(SimpleListItem, { user: user }));
		});
		
		return (
			<div>
				<div className="panel panel--first">
					{users}
				</div>
			</div>
		);
	}
});

module.exports = React.createClass({
	mixins: [Navigation],

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type="default" label="Simple List">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
					<SimpleList users={People} />
				</UI.ViewContent>
			</UI.View>
		);
	}
});
