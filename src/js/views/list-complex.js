var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var UI = require('touchstonejs').UI;

const PEOPLE = require('../../data/people');
const scrollable = Container.initScrollable();

var ComplexListItem = React.createClass({
	render () {
		var person = this.props.user;

		var firstName = person.name.split(' ').slice(0, -1).join(' ');
		var lastName = person.name.split(' ').slice(-1).join(' ');
		
		var initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();

		return (
			<Link to="tabs:list-details" transition="show-from-right" viewProps={{ person: person, prevView: 'list-complex' }} className="list-item" component="div">
				<UI.ItemMedia avatar={person.picture} avatarInitials={initials} />
				<div className="item-inner">
					<div className="item-content">
						<div className="item-title">{person.name}</div>
						<div className="item-subtitle">{person.bio}</div>
					</div>
					<UI.ItemNote type="default" label="More" icon="ion-chevron-right" />
				</div>
			</Link>
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
		var list = PEOPLE.map((user, i) => {
			return <ComplexListItem key={'user_'+i} user={user} />
		});

		return (
			<Container scrollable={scrollable}>
				<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter options={[
					{ label: 'Speakers', value: 'speakers' },
					{ label: 'Organisers', value: 'organisers' },
					{ label: 'Starred', value: 'starred' }
				]} />
				<div className="panel mb-0">
					{list}
				</div>
			</Container>
		);
	}
});
