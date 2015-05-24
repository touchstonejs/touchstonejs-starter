var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

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
				<UI.Headerbar type="default" label="Alert Bar">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.FlexBlock height="30px" className={alertbarClass}>
					<div className="alertbar-text">When the state is "{this.state.alertKey}"</div>
				</UI.FlexBlock>
				<UI.FlexBlock grow scrollable>
					<div className="panel panel--first">
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
