/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

var Months = require('../../../data/months');

var HeaderList = React.createClass({
	render: function() {

		var months = [];
		var	lastSeason = '';
		
		this.props.months.forEach(function(month, i) {

			var season = month.season;

			if (lastSeason !== season) {
				lastSeason = season;

				months.push(
					<div className="list-header" key={"list-header-" + i}>{season}</div>
				);
			}

			month.key = 'month-' + i;
			months.push(<div className="list-item">{month.name}</div>);
		});
		
		return (
			<div className="panel mb-0 ios-list">
				{months}
			</div>
		);
	}
});

module.exports = React.createClass({
	mixins: [Navigation],

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Categorised List">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.FlexBlock scrollable>
					<HeaderList months={Months} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
