var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var { Link, UI } = require('touchstonejs');

const PEOPLE = require('../../data/people');
const scrollable = Container.initScrollable();

var ComplexLinkItem = React.createClass({
	doThing () {
		console.log('star this user')
	},
	render () {
		var person = this.props.person;
		var firstName = person.name.split(' ').slice(0, -1).join(' ');
		var lastName = person.name.split(' ').slice(-1).join(' ');
		var initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
		// unstarred
		// var starTap = 'item-note default';
		// var starIcon = 'item-note-icon ion-lg ion-ios-star-outline';
		// starred
		var starTap = 'item-note text-' + ['warning', 'primary', 'error', 'success'][(Math.random() * 4) | 0];
		var starIcon = 'item-note-icon ion-lg ion-ios-star';

		return (
			<UI.LinkItem linkTo="tabs:list-details" transition="show-from-right" viewProps={{ person: person, prevView: 'list-complex' }}>
				<UI.ItemMedia avatar={person.picture} avatarInitials={initials} />
				<UI.ItemInner>
					<UI.ItemContent>
						<UI.ItemTitle>{person.name}</UI.ItemTitle>
						<UI.ItemSubTitle>{person.bio}</UI.ItemSubTitle>
					</UI.ItemContent>
					<Tappable onTap={this.doThing} stopPropagation className={starTap}>
						<div className={starIcon} />
					</Tappable>
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
				title: 'Complex'
			}
		}
	},
	getInitialState () {
		return {}
	},

	handleModeChange (newMode) {
		var selectedItem = newMode;

		if (this.state.selectedMode === newMode) {
			selectedItem = null;
		}

		this.setState({
			selectedMode: selectedItem
		});

	},

	render () {
		var selectedMode = this.state.selectedMode
		var persons

		if (selectedMode === 'speakers') {
			persons = PEOPLE.filter(person => person.isSpeaker)

		} else if (selectedMode === 'organisers') {
			persons = PEOPLE.filter(person => person.isOrganiser)

		} else if (selectedMode === 'starred') {
			persons = PEOPLE.filter(person => person.isStarred)

		} else {
			persons = PEOPLE
		}

		var list = persons.sort((a, b) => a.name.localeCompare(b.name)).map((person, i) => {
			return <ComplexLinkItem key={'person' + i} person={person} />
		});

		return (
			<Container scrollable={scrollable}>
				<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter options={[
					{ label: 'Speakers', value: 'speakers' },
					{ label: 'Organisers', value: 'organisers' },
					{ label: 'Starred', value: 'starred' }
				]} />
				<UI.Group>
					{list}
				</UI.Group>
			</Container>
		);
	}
});
