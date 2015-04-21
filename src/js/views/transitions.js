/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation],

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Transitions">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.FlexBlock grow scrollable>
					<div className="panel-header text-caps">Default</div>
					<div className="panel">
						<Link to="transitions-target" className="list-item is-tappable" component="div"><div className="item-inner">None</div></Link>
					</div>
					<div className="panel-header text-caps">Fade</div>
					<div className="panel">
						<Link to="transitions-target" viewTransition="fade" className="list-item is-tappable" component="div"><div className="item-inner">Fade</div></Link>
						<Link to="transitions-target" viewTransition="fade-expand" className="list-item is-tappable" component="div"><div className="item-inner">Fade Expand</div></Link>
						<Link to="transitions-target" viewTransition="fade-contract" className="list-item is-tappable" component="div"><div className="item-inner">Fade Contract</div></Link>
					</div>
					<div className="panel-header text-caps">Show</div>
					<div className="panel">
						<Link to="transitions-target" viewTransition="show-from-left" className="list-item is-tappable" component="div"><div className="item-inner">Show from Left</div></Link>
						<Link to="transitions-target" viewTransition="show-from-right" className="list-item is-tappable" component="div"><div className="item-inner">Show from Right</div></Link>
						<Link to="transitions-target" viewTransition="show-from-top" className="list-item is-tappable" component="div"><div className="item-inner">Show from Top</div></Link>
						<Link to="transitions-target" viewTransition="show-from-bottom" className="list-item is-tappable" component="div"><div className="item-inner">Show from Bottom</div></Link>
					</div>
					<div className="panel-header text-caps">Reveal</div>
					<div className="panel">
						<Link to="transitions-target" viewTransition="reveal-from-left" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Left</div></Link>
						<Link to="transitions-target" viewTransition="reveal-from-right" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Right</div></Link>
						<Link to="transitions-target" viewTransition="reveal-from-top" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Top</div></Link>
						<Link to="transitions-target" viewTransition="reveal-from-bottom" className="list-item is-tappable" component="div"><div className="item-inner">Reveal from Bottom</div></Link>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
