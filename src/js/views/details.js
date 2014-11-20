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
		this.showView('radio-list', 'show-from-right', { session: this.props.session, flavour: this.state.flavour });
	},

	render: function() {

		// fields

		var dateStr = <div className="date">{moment(this.props.session.date).format('h:mma D MMM YYYY')}</div>

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Back</div>
					</Link>
					<div className="headerbar-label">Details</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					{/*<div className="page-header text-caps">Basic details</div>*/}
					<div className="panel gap-top">
						<div className="form-items">
							<div className="form-row form-item is-first">
								<label className="form-label">Customer</label>
								<div className="form-control">
									John Smith
								</div>
							</div>
							<div className="form-row form-item">
								<label className="form-label">Car</label>
								<div className="form-control">
									{this.props.session.licensePlate}
								</div>
							</div>
							<div className="form-row form-item">
								<label className="form-label">Entered</label>
								<div className="form-control">
									{this.props.session.timeStamp}
								</div>
							</div>
							<div className="form-row form-item">
								<label className="form-label">Exited</label>
								<div className="form-control">
									--
								</div>
							</div>
							<div className="form-row form-item">
								<label className="form-label">Revenue</label>
								<div className="form-control">
									$6.00
								</div>
							</div>
						</div>
					</div>
					<div className="panel">
						<div className="form-items">
							<Tappable onTap={this.icecreamSessionDuration} className="form-item is-first" component="div">
								<div className="form-tap">
									Favourite Icecream
									<div className="form-tap-button is-muted">
										<div className="form-tap-button-label">{this.state.flavour}</div>
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
