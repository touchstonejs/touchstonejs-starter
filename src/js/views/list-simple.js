var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var { Link, UI } = require('touchstonejs');

const PEOPLE = require('../../data/people');

var Search = React.createClass({
	displayName: 'Search',
	propTypes: {
		searchString: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},

	getDefaultProps () {
		return {
			searchString: ''
		}
	},

	handleChange (event) {
		this.props.onChange(event.target.value);
	},
	reset () {
		this.props.onChange('');
	},
	render () {
		var clearIcon;

		if (this.props.searchString.length > 0) {
			clearIcon = <Tappable className="Headerbar-form-clear ion-close-circled" onTap={this.reset} />;
		}

		return (
			<div className="SearchField">
				<span className="SearchField__icon SearchField__icon--search" />
				<input ref="input" value={this.props.searchString} onChange={this.handleChange} className="SearchField__input" placeholder='Search...' />
				{clearIcon}
			</div>
		);
	}
});

var SimpleLinkItem = React.createClass({
	propTypes: {
		person: React.PropTypes.object.isRequired
	},

	render () {
		return (
			<UI.LinkItem linkTo="tabs:list-details" transition="show-from-right" viewProps={{ person: this.props.person, prevView: 'list-simple' }} showDisclosureArrow>
				<UI.ItemInner>
					<UI.ItemTitle>{this.props.person.name}</UI.ItemTitle>
				</UI.ItemInner>
			</UI.LinkItem>
		);
	}
});

module.exports = React.createClass({
	statics: {
		navigationBar: 'main',
		getNavigation (props, app) {
			return {
				leftArrow: true,
				leftLabel: 'Lists',
				leftAction: () => { app.transitionTo('tabs:lists', { transition: 'reveal-from-right' }) },
				title: 'Simple'
			}
		}
	},

	getInitialState () {
		return {
			searchString: ''
		}
	},

	updateSearch (str) {
		this.setState({ searchString: str });
	},

	render () {
		var { searchString } = this.state
		var searchRegex = new RegExp(searchString)
		var starredOnly = false;

		function searchFilter (person) { return searchRegex.test(person.name.toLowerCase()) }
		function starFilter (person) { return !starredOnly || person.isStarred }
		function sortByName (a, b) { return a.name.localeCompare(b.name) }

		var organizers = PEOPLE.filter(person => person.isOrganiser)
			.filter(searchFilter)
			.filter(starFilter)
			.sort(sortByName)
			.map((person, i) => {
				return <SimpleLinkItem key={'organizer' + i} person={person} />
			})

		var speakers = PEOPLE.filter(person => person.isSpeaker)
			.filter(searchFilter)
			.filter(starFilter)
			.sort(sortByName)
			.map((person, i) => {
				return <SimpleLinkItem key={'speaker' + i} person={person} />
			})

		var results

		if (searchString && !organizers.length && !speakers.length) {
			results = (
				<Container direction="column" align="center" justify="center" className="no-results">
					<div className="no-results__icon ion-ios-search-strong" />
					<div className="no-results__text">{'No results for "' + searchString + '"'}</div>
				</Container>
			);

		} else {
			results = (
				<div>
					{organizers.length > 0 ? <UI.ListHeader sticky>Organisers</UI.ListHeader> : ''}
					{organizers}
					{speakers.length > 0 ? <UI.ListHeader sticky>Speakers</UI.ListHeader> : ''}
					{speakers}
				</div>
			)
		}

		return (
			<Container scrollable>
				<Search searchString={this.state.searchString} onChange={this.updateSearch} />
				<UI.Group>
					{results}
				</UI.Group>
			</Container>
		);
	}
});
