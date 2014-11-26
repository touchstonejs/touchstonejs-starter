/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function() {
		return {
			alertKey: 'muted'
		}
	},

	handleAlertChange: function(newAlert) {

		this.setState({
			alertKey: newAlert
		});

	},

	render: function() {

		var alertbarClass = SetClass({
			'alertbar': true,
			'primary': this.state.alertKey === 'primary',
			'success': this.state.alertKey === 'success',
			'warning': this.state.alertKey === 'warning',
			'danger': this.state.alertKey === 'danger'
		});

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="Headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button ion-chevron-left" component="button">Back</Link>
					<div className="Headerbar-label">Alert Bar</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className={alertbarClass}>
						<div className="alertbar-text">When the state is "{this.state.alertKey}"</div>
					</div>
					<div className="panel ios-list">
						<UI.RadioList value={this.state.alertKey} onChange={this.handleAlertChange} options={[
							{ label: 'Muted',  value: 'muted' },
							{ label: 'Primary',  value: 'primary' },
							{ label: 'Success',  value: 'success' },
							{ label: 'Warning',  value: 'warning' },
							{ label: 'Danger',   value: 'danger' }
						]} />
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});