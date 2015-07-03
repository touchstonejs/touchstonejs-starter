var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Sentry = require('react-sentry');

var { Link, UI } = require('touchstonejs');

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
			clearIcon = <Tappable className="SearchField__icon SearchField__icon--clear" onTap={this.reset} />;
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
			<Link to="tabs:list-details" transition="show-from-right" viewProps={{ person: this.props.person, prevView: 'list-simple' }}>
				<UI.Item showDisclosureArrow>
					<UI.ItemInner>
						<UI.ItemTitle>{this.props.person.name.full}</UI.ItemTitle>
					</UI.ItemInner>
				</UI.Item>
			</Link>
		);
	}
});

module.exports = React.createClass({
	mixins: [Sentry()],
	contextTypes: { peopleStore: React.PropTypes.object.isRequired },

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

	componentDidMount () {
		var self = this

		this.watch(this.context.peopleStore, 'people-updated', people => {
			self.setState({ people })
		})
	},

	getInitialState () {
		return {
			searchString: '',
			people: this.context.peopleStore.getPeople()
		}
	},

	updateSearch (str) {
		this.setState({ searchString: str });
	},

	render () {
		var { searchString } = this.state
		var searchRegex = new RegExp(searchString)

		function searchFilter (person) { return searchRegex.test(person.name.full) }
		function sortByName (a, b) { return a.name.full.localeCompare(b.name.full) }

		var { people } = this.state
		var filteredPeople = people.filter(searchFilter)
			.sort(sortByName)

		var results

		if (searchString && !filteredPeople.length) {
			results = (
				<Container direction="column" align="center" justify="center" className="no-results">
					<div className="no-results__icon ion-ios-search-strong" />
					<div className="no-results__text">{'No results for "' + searchString + '"'}</div>
				</Container>
			);

		} else {
			var aPeople = filteredPeople
				.filter(person => person.category === 'A')
				.map((person, i) => {
					return <SimpleLinkItem key={'persona' + i} person={person} />
				})

			var bPeople = filteredPeople
				.filter(person => person.category === 'B')
				.map((person, i) => {
					return <SimpleLinkItem key={'personb' + i} person={person} />
				})

			results = (
				<UI.Group>
					{aPeople.length > 0 ? <UI.ListHeader sticky>Category A</UI.ListHeader> : ''}
					{aPeople}
					{bPeople.length > 0 ? <UI.ListHeader sticky>Category B</UI.ListHeader> : ''}
					{bPeople}
				</UI.Group>
			)
		}

		return (
			<Container scrollable>
				<Search searchString={this.state.searchString} onChange={this.updateSearch} />
				{results}
			</Container>
		);
	}
});
