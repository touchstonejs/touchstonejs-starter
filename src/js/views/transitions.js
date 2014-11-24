/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	Link = require('../touchstone/link'),
	UI = require('../touchstone/ui');

module.exports = React.createClass({
	mixins: [Navigation],

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Back</div>
					</Link>
					<div className="headerbar-label">Transitions</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="panel is-first">
						<div className="list gutter-list">
							<Link to="transitions-target" className="list-item list-item-has-chevron">None</Link>
							<Link to="transitions-target" viewTransition="fade" className="list-item list-item-has-chevron">Fade</Link>
						</div>
					</div>
					<div className="page-header text-caps">Show</div>
					<div className="panel">
						<div className="list gutter-list">
							<Link to="transitions-target" viewTransition="show-from-left" className="list-item list-item-has-chevron">Show from Left</Link>
							<Link to="transitions-target" viewTransition="show-from-right" className="list-item list-item-has-chevron">Show from Right</Link>
							<Link to="transitions-target" viewTransition="show-from-top" className="list-item list-item-has-chevron">Show from Top</Link>
							<Link to="transitions-target" viewTransition="show-from-bottom" className="list-item list-item-has-chevron">Show from Bottom</Link>
						</div>
					</div>
					<div className="page-header text-caps">Reveal</div>
					<div className="panel">
						<div className="list gutter-list">
							<Link to="transitions-target" viewTransition="reveal-from-left" className="list-item list-item-has-chevron">Reveal from Left</Link>
							<Link to="transitions-target" viewTransition="reveal-from-right" className="list-item list-item-has-chevron">Reveal from Right</Link>
							<Link to="transitions-target" viewTransition="reveal-from-top" className="list-item list-item-has-chevron">Reveal from Top</Link>
							<Link to="transitions-target" viewTransition="reveal-from-bottom" className="list-item list-item-has-chevron">Reveal from Bottom</Link>
						</div>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
