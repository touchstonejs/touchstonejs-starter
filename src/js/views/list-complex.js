var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Sentry = require('react-sentry');

var { UI } = require('touchstonejs');

const scrollable = Container.initScrollable();

var ComplexLinkItem = React.createClass({
	contextTypes: { peopleStore: React.PropTypes.object.isRequired },

	toggleStar () {
		var person = this.props.person

		this.context.peopleStore.star(person, !person.isStarred)
	},

	render () {
		var person = this.props.person;

		var starIcon, starTap
		if (person.isStarred) {
			starTap = 'item-note text-warning';
			starIcon = 'item-note-icon ion-lg ion-ios-star';

		} else {
			starTap = 'item-note default';
			starIcon = 'item-note-icon ion-lg ion-ios-star-outline';
		}

		return (
			<UI.LinkItem linkTo="tabs:list-details" transition="show-from-right" viewProps={{ person: person, prevView: 'list-complex' }}>
				<UI.ItemMedia avatar={person.picture} avatarInitials={person.initials} />
				<UI.ItemInner>
					<UI.ItemContent>
						<UI.ItemTitle>{person.name.full}</UI.ItemTitle>
						<UI.ItemSubTitle>{person.bio}</UI.ItemSubTitle>
					</UI.ItemContent>
					<Tappable onTap={this.toggleStar} stopPropagation className={starTap}>
						<div className={starIcon} />
					</Tappable>
				</UI.ItemInner>
			</UI.LinkItem>
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
				title: 'Complex'
			}
		}
	},

	getInitialState () {
		return {
			people: this.context.peopleStore.getPeople()
		}
	},

	componentDidMount () {
		var self = this

		this.watch(this.context.peopleStore, 'people-updated', people => {
			self.setState({ people })
		})
	},

	handleModeChange (newMode) {
		var selectedMode = newMode;

		if (this.state.selectedMode === newMode) {
			selectedMode = null;
		}

		this.setState({
			selectedMode: selectedMode
		});
	},

	render () {
		var selectedMode = this.state.selectedMode
		var { people } = this.state

		if (selectedMode === 'A' || selectedMode === 'B') {
			people = people.filter(person => person.category === selectedMode)

		} else if (selectedMode === 'starred') {
			people = people.filter(person => person.isStarred)
		}

		var list = people.sort((a, b) => a.name.full.localeCompare(b.name.full)).map((person, i) => {
			return <ComplexLinkItem key={'person' + i} person={person} />
		});

		return (
			<Container scrollable={scrollable}>
				<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter options={[
					{ label: 'A', value: 'A' },
					{ label: 'B', value: 'B' },
					{ label: 'Starred', value: 'starred' }
				]} />
				<UI.Group>
					{list}
				</UI.Group>
			</Container>
		);
	}
});
