var Container = require('react-container');
var React = require('react');
var { Link, UI } = require('touchstonejs');

const scrollable = Container.initScrollable();

module.exports = React.createClass({
	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'Transitions'
			}
		}
	},
	render () {

		return (
			<Container scrollable={scrollable}>
				<UI.GroupHeader>Default</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" className="list-item is-tappable" component="div"><div className="item-inner">Instant</div></Link>
				</UI.Group>
				<UI.GroupHeader>Fade</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" transition="fade" className="list-item is-tappable" component="div"><div className="item-inner">Fade</div></Link>
					<Link to="tabs:transitions-target" transition="fade-expand" className="list-item is-tappable" component="div"><div className="item-inner">Fade Expand</div></Link>
					<Link to="tabs:transitions-target" transition="fade-contract" className="list-item is-tappable" component="div"><div className="item-inner">Fade Contract</div></Link>
				</UI.Group>
				<UI.GroupHeader>Show</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" transition="show-from-left" className="list-item is-tappable" component="div"><div className="item-inner">Show from Left</div></Link>
					<Link to="tabs:transitions-target" transition="show-from-right" className="list-item is-tappable" component="div"><div className="item-inner">Show from Right</div></Link>
					<Link to="tabs:transitions-target" transition="show-from-top" className="list-item is-tappable" component="div"><div className="item-inner">Show from Top</div></Link>
					<Link to="tabs:transitions-target" transition="show-from-bottom" className="list-item is-tappable" component="div"><div className="item-inner">Show from Bottom</div></Link>
				</UI.Group>
				<UI.GroupHeader>Reveal</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" transition="reveal-from-left" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Left</div></Link>
					<Link to="tabs:transitions-target" transition="reveal-from-right" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Right</div></Link>
					<Link to="tabs:transitions-target" transition="reveal-from-top" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Top</div></Link>
					<Link to="tabs:transitions-target" transition="reveal-from-bottom" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Bottom</div></Link>
				</UI.Group>
			</Container>
		);
	}
});
