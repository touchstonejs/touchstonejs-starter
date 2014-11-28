var React = require('react'),
	SetClass = require('classnames'),
	Navigation = require('../../touchstone/navigation'),
	Tappable = require('../../touchstone/tappable'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

var Months = require('../../../data/months');

var Search = React.createClass({
	
	propTypes: {
		searchString: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},
	
	handleChange: function(event) {
		this.props.onChange(event.target.value);
	},
	
	reset: function() {
		this.props.onChange('');
		this.refs.input.getDOMNode().focus();
	},
	
	render: function() {
		
		var iconClass = 'search-field-icon ' + (this.props.searchString ? 'ion-close-circled' : 'ion-search');
		var clearIcon = Boolean(this.props.searchString.length) ? <Tappable onTap={this.reset} className="Headerbar-form-clear ion-close-circled" /> : '';
		
		return (
			<UI.FlexBlock height="36px" className="Headerbar Headerbar-form">
				<div className="Headerbar-form-field Headerbar-form-icon ion-ios7-search-strong">
					<input ref="input" value={this.props.searchString} onChange={this.handleChange} className="Headerbar-form-input" placeholder='Search...' />
					{clearIcon}
				</div>
			</UI.FlexBlock>
		);
	}
	
});

var Item = React.createClass({
	mixins: [Navigation],
	render: function() {
		return (
			<div className="list-item">
				<div className="list-item-title">{this.props.month.name}</div>
			</div>
		);
	}
});

var List = React.createClass({
	
	getDefaultProps: function() {
		searchString: ''
	},

	render: function() {

		var searchString = this.props.searchString;
		var months = [];
		var	lastSeason = '';
		var renderList = <div className="view-feedback-text">No match found...</div>;
		
		this.props.months.forEach(function(month, i) {

			// filter months
			if (searchString && month.name.toLowerCase().indexOf(searchString.toLowerCase()) === -1) {
				return;
			}	

			// insert categories

			var season = month.season;

			if (lastSeason !== season) {
				lastSeason = season;

				months.push(
					<div className="list-header" key={"list-header-" + i}>{season}</div>
				);
			}

			// create list

			month.key = 'month-' + i;
			months.push(React.createElement(Item, { month: month }));
		});

		var wrapperClassName = SetClass(months.length ? 'panel mb-0 ios-list' : 'view-feedback');

		if (months.length) {
			renderList = months;
		}
		
		return (
			<div className={wrapperClassName}>
				{renderList}
			</div>
		);
	}
});

module.exports = React.createClass({
	
	mixins: [Navigation],
	
	getInitialState: function() {
		return {
			searchString: '',
			months: Months
		}
	},
	
	updateSearch: function(str) {
		this.setState({ searchString: str });
	},
	
	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Select a Month">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<Search searchString={this.state.searchString} onChange={this.updateSearch} />
				<UI.FlexBlock scrollable>
					<List months={this.state.months} searchString={this.state.searchString} />
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});

