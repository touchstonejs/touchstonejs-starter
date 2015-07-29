import Container from 'react-container';
import React from 'react';
import Sentry from 'react-sentry';
import Tappable from 'react-tappable';
import { Link, UI } from 'touchstonejs';

var scrollable = Container.initScrollable({ left: 0, top: 44 });

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
		this.watch(this.context.peopleStore, 'people-updated', people => {
			this.setState({ people })
		});
	},

	getInitialState () {
		return {
			searchString: '',
			people: this.context.peopleStore.getPeople()
		}
	},

	clearSearch () {
		this.setState({ searchString: '' });
	},

	updateSearch (str) {
		this.setState({ searchString: str });
	},
	
	submitSearch (str) {
		console.log(str);
	},

	render () {
		let { people, searchString } = this.state
		let searchRegex = new RegExp(searchString)

		function searchFilter (person) { return searchRegex.test(person.name.full.toLowerCase()) };
		function sortByName (a, b) { return a.name.full.localeCompare(b.name.full) };
		
		let filteredPeople = people.filter(searchFilter).sort(sortByName);

		let results

		if (searchString && !filteredPeople.length) {
			results = (
				<Container direction="column" align="center" justify="center" className="no-results">
					<div className="no-results__icon ion-ios-search-strong" />
					<div className="no-results__text">{'No results for "' + searchString + '"'}</div>
				</Container>
			);

		} else {
			results = (
				<UI.GroupBody>
					{filteredPeople.map((person, i) => {
						return <SimpleLinkItem key={'person' + i} person={person} />
					})}
				</UI.GroupBody>
			);
		}

		return (
			<Container ref="scrollContainer" scrollable={scrollable}>
				<UI.SearchField type="dark" value={this.state.searchString} onSubmit={this.submitSearch} onChange={this.updateSearch} onCancel={this.clearSearch} onClear={this.clearSearch} placeholder="Search..." />
				{results}
			</Container>
		);
	}
});
