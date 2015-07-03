var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Sentry = require('react-sentry');

var { Link, UI } = require('touchstonejs');

const scrollable = Container.initScrollable();

var ComplexLinkItem = React.createClass({
	contextTypes: { peopleStore: React.PropTypes.object.isRequired },

	toggleStar () {
		var person = this.props.person

		this.context.peopleStore.star(person, !person.isStarred)
	},

	render () {
		var person = this.props.person;

		return (
			<Link to="tabs:list-details" transition="show-from-right" viewProps={{ person: person, prevView: 'list-complex' }}>
				<UI.Item>
					<UI.ItemMedia avatar={person.picture} avatarInitials={person.initials} />
					<UI.ItemInner>
						<UI.ItemContent>
							<UI.ItemTitle>{person.name.full}</UI.ItemTitle>
							<UI.ItemSubTitle>{person.bio}</UI.ItemSubTitle>
						</UI.ItemContent>
						<Tappable onTap={this.toggleStar} stopPropagation>
							<UI.ItemNote icon={person.isStarred ? 'ion-ios-star' : 'ion-ios-star-outline'} type={person.isStarred ? 'warning' : 'default'} className="ion-lg" />
						</Tappable>
					</UI.ItemInner>
				</UI.Item>
			</Link>
		);
	}
});

// FIXME: this bit is global and hacky, expect it to change
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

function getNavigation (props, app, filterStarred) {
	return {
		leftLabel: 'Lists',
		leftArrow: true,
		leftAction: () => { app.transitionTo('tabs:lists', { transition: 'reveal-from-right' }) },
		rightLabel: filterStarred ? 'All' : 'Starred',
		rightAction: emitter.emit.bind(emitter, 'navigationBarRightAction'),
		title: 'Complex'
	};
}

module.exports = React.createClass({
	contextTypes: {
		app: React.PropTypes.object,
		peopleStore: React.PropTypes.object.isRequired
	},
	mixins: [Sentry()],

	statics: {
		navigationBar: 'main',
		getNavigation: getNavigation
	},

	getInitialState () {
		return {
			filterStarred: false,
			people: this.context.peopleStore.getPeople()
		}
	},

	componentDidMount () {
		var self = this

		this.watch(this.context.peopleStore, 'people-updated', people => {
			self.setState({ people })
		})

		this.watch(emitter, 'navigationBarRightAction', this.toggleStarred);
	},

	toggleStarred () {
		var filterStarred = !this.state.filterStarred;
		this.setState({ filterStarred });
		this.context.app.navigationBars.main.update(getNavigation({}, this.context.app, filterStarred));
	},

	handleModeChange (newMode) {
		var selectedMode = newMode;

		if (this.state.selectedMode === newMode) {
			selectedMode = null;
		}

		this.setState({ selectedMode })
	},

	render () {
		var { people, filterStarred, selectedMode } = this.state

		if (filterStarred) {
			people = people.filter(person => person.isStarred)
		}

		if (selectedMode === 'A' || selectedMode === 'B') {
			people = people.filter(person => person.category === selectedMode)
		}

		function sortByName (a, b) { return a.name.full.localeCompare(b.name.full) }

		var sortedPeople = people.sort(sortByName)
		var results

		if (sortedPeople.length) {
			var aPeople = sortedPeople
				.filter(person => person.category === 'A')
				.map((person, i) => {
					return <ComplexLinkItem key={'persona' + i} person={person} />
				})

			var bPeople = sortedPeople
				.filter(person => person.category === 'B')
				.map((person, i) => {
					return <ComplexLinkItem key={'personb' + i} person={person} />
				})

			results = (
				<UI.Group>
					{aPeople.length > 0 ? <UI.ListHeader sticky>Category A</UI.ListHeader> : ''}
					{aPeople}
					{bPeople.length > 0 ? <UI.ListHeader sticky>Category B</UI.ListHeader> : ''}
					{bPeople}
				</UI.Group>
			)

		} else {
			results = (
				<Container direction="column" align="center" justify="center" className="no-results">
					<div className="no-results__icon ion-ios-star" />
					<div className="no-results__text">Go star some people!</div>
				</Container>
			)
		}

		return (
			<Container scrollable={scrollable}>
				<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter equalWidthSegments options={[
					{ label: 'A', value: 'A' },
					{ label: 'B', value: 'B' }
				]} />
				{results}
			</Container>
		);
	}
});
