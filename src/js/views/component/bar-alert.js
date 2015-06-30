var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('react-tappable'),
	Navigation = require('touchstonejs').Navigation,
	Link = require('touchstonejs').Link,
	UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function () {
		return {
			alertType: 'default'
		}
	},

	handleAlertChange: function (newAlertType) {

		this.setState({
			alertType: newAlertType
		});

	},

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type="default" label="Alert Bar">
					<UI.HeaderbarButton showView="home" transition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.Alertbar type={this.state.alertType}>When the state is "{this.state.alertType}"</UI.Alertbar>
				<UI.ViewContent grow scrollable>
					<div className="panel panel--first">
						<UI.RadioList value={this.state.alertType} onChange={this.handleAlertChange} options={[
							{ label: 'Default',  value: 'default' },
							{ label: 'Primary',  value: 'primary' },
							{ label: 'Success',  value: 'success' },
							{ label: 'Warning',  value: 'warning' },
							{ label: 'Danger',   value: 'danger' }
						]} />
					</div>
				</UI.ViewContent>
			</UI.View>
		);
	}
});
