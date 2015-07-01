var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var Tappable = require('react-tappable');
var Timers = require('react-timers');

const PEOPLE = require('../../data/people');

var SimpleListItem = React.createClass({
	render () {
		return (
			<Link to="tabs:list-details" transition="show-from-right" viewProps={{ person: this.props.person, prevView: 'list-simple' }} className="list-item is-tappable" component="div">
				<div className="item-inner">
					<div className="item-title">{this.props.person.name}</div>
				</div>
			</Link>
		);
	}
});

var Search = React.createClass({
	mixins: [Timers()],
	propTypes: {
		searchString: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},
	handleChange (event) {
		this.props.onChange(event.target.value);
	},
	reset () {
		this.props.onChange('');
		this.refs.input.getDOMNode().focus();
	},
	render () {

		var clearIcon = Boolean(this.props.searchString.length) ? <Tappable onTap={this.reset} className="SearchField__icon SearchField__icon--clear" /> : '';

		return (
			<div className="SearchField">
				<span className="SearchField__icon SearchField__icon--search" />
				<input ref="input" value={this.props.searchString} onChange={this.handleChange} className="SearchField__input" placeholder='Search...' />
				{clearIcon}
			</div>
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
		var list = PEOPLE.map((person, i) => {
			return <SimpleListItem key={'person_'+i} person={person} />
		});

		return (
			<Container scrollable>
				<Search searchString={this.state.searchString} onChange={this.updateSearch} />
				<div className="panel mb-0">
					{list}
				</div>
			</Container>
		);
	}
});
