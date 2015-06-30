var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

var Months = require('../../../data/months');

var HeaderList = React.createClass({
	render: function () {

		var months = [];
		var	lastSeason = '';
		
		this.props.months.forEach(function (month, i) {

			var season = month.season;

			if (lastSeason !== season) {
				lastSeason = season;

				months.push(
					<div className="list-header" key={"list-header-" + i}>{season}</div>
				);
			}

			month.key = 'month-' + i;
			months.push(<div className="list-item"><div className="item-inner">{month.name}</div></div>);
		});
		
		return (
			<div className="panel mb-0">
				{months}
			</div>
		);
	}
});

module.exports = React.createClass({
	mixins: [Navigation],

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type="default" label="Categorised List">
					<UI.HeaderbarButton showView="home" transition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
					<HeaderList months={Months} />
				</UI.ViewContent>
			</UI.View>
		);
	}
});
