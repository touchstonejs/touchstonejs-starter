var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

var Months = require('../../../data/months');

var MonthList = React.createClass({
	render: function () {

		var months = [];
		var	lastSeason = '';
		var filterState = this.props.filterState;
		
		this.props.months.forEach(function (month, i) {
			
			if (filterState !== 'all' && filterState !== month.season.toLowerCase()) {
				return;
			}

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

	getInitialState: function () {
		return {
			activeToggleItemKey: 'all',
			typeKey: 'primary',
			months: Months
		}
	},

	handleToggleActiveChange: function (newItem) {

		var selectedItem = newItem;

		if (this.state.activeToggleItemKey === newItem) {
			selectedItem = 'all';
		}

		this.setState({
			activeToggleItemKey: selectedItem
		});

	},

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type="default" label="Toggle">
					<UI.HeaderbarButton showView="home" transition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.Headerbar type="default" height="36px" className="Subheader">
					<UI.Toggle value={this.state.activeToggleItemKey} onChange={this.handleToggleActiveChange} options={[
						{ label: 'Summer', value: 'summer' },
						{ label: 'Autumn', value: 'autumn' },
						{ label: 'Winter', value: 'winter' },
						{ label: 'Spring', value: 'spring' }
					]} />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
					<MonthList months={this.state.months} filterState={this.state.activeToggleItemKey} />
				</UI.ViewContent>
			</UI.View>
		);
	}
});
