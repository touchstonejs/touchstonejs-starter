/** @jsx React.DOM */

var React = require('react'),
    Link = require('../touchstone/link'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	UI = require('../touchstone/ui');

var moment = require('moment')

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function() {
		return {
            flavour: 'Chocolate'
		}
	},
	
	icecreamSessionDuration: function() {
		this.showView('radio-list', 'show-from-right', { user: this.props.user, flavour: this.state.flavour });
	},

	render: function() {

		// fields
		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Back</div>
					</Link>
					<div className="headerbar-label">{this.props.user.name}</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					{/*<div className="page-header text-caps">Basic details</div>*/}
					<div className="panel is-first">
						<div className="form-items">
							<div className="form-row form-item is-first">
								<label className="form-label">Name</label>
								<div className="form-control">
									{this.props.user.name}
								</div>
							</div>
							<div className="form-row form-item">
								<label className="form-label">Location</label>
								<div className="form-control">
									{this.props.user.location}
								</div>
							</div>
							<div className="form-row form-item">
								<label className="form-label">Joined</label>
								<div className="form-control">
									{this.props.user.joinedDate}
								</div>
							</div>
						</div>
					</div>
					<div className="panel">
						<div className="form-items">
							<Tappable onTap={this.icecreamSessionDuration} className="form-item is-first" component="div">
								<div className="form-tap">
									Favourite Flavour
									<div className="form-tap-button is-muted">
										<div className="form-tap-button-label">{this.props.user.flavour}</div>
										<div className="form-tap-button-icon ion-chevron-right" />
									</div>
								</div>
							</Tappable>
						</div>
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
