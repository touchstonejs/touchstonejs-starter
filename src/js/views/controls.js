var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var Tappable = require('react-tappable');
var Timers = require('react-timers');
var UI = require('touchstonejs').UI;

module.exports = React.createClass({
	mixins: [Timers()],
	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'Controls'
			}
		}
	},
	getInitialState () {
		return {
			alertbar: {
				visible: false,
				type: '',
				text: ''
			},
			popup: {
				visible: false
			}
		}
	},
	showLoadingPopup () {
		this.setState({
			popup: {
				visible: true,
				loading: true,
				header: 'Loading',
				iconName: 'ion-load-c',
				iconType: 'default'
			}
		});

		var self = this;

		this.setTimeout(function () {
			self.setState({
				popup: {
					visible: true,
					loading: false,
					header: 'Done!',
					iconName: 'ion-ios-checkmark',
					iconType: 'success'
				}
			});
		}, 2000);

		this.setTimeout(function () {
			self.setState({
				popup: {
					visible: false
				}
			});
		}, 3000);
	},
	showAlertbar (type, text) {
		var self = this;

		this.setState({
			alertbar: {
				visible: true,
				type: type,
				text: text
			}
		});

		this.setTimeout(function () {
			self.setState({
				alertbar: {
					visible: false
				}
			});
		}, 2000);
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
		var { alertbar } = this.state;
		return (
			<Container scrollable>
				<UI.Alertbar type={alertbar.type} visible={alertbar.visible}>{alertbar.text}</UI.Alertbar>
				<div className="panel-header text-caps">Segmented Control</div>
				<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter options={[
					{ label: 'One', value: 'one' },
					{ label: 'Two', value: 'two' },
					{ label: 'Three', value: 'three' },
					{ label: 'Four', value: 'four' }
				]} />

				<div className="panel-header text-caps">Alert Bar</div>
				<UI.ButtonGroup>
					<UI.Button type="primary" onTap={this.showAlertbar.bind(this, 'danger', 'No Internet Connection')} disabled={this.state.alertbar.visible}>
						Danger
					</UI.Button>
					<UI.Button type="primary" onTap={this.showAlertbar.bind(this, 'warning', 'We cannot confirm your connection')} disabled={this.state.alertbar.visible}>
						Warning
					</UI.Button>
					<UI.Button type="primary" onTap={this.showAlertbar.bind(this, 'success', 'Back online!')} disabled={this.state.alertbar.visible}>
						Success
					</UI.Button>
				</UI.ButtonGroup>
				<div className="panel-header text-caps">Popup</div>
				<UI.Button type="primary" onTap={this.showLoadingPopup}>
					Show Popup
				</UI.Button>
				<div className="panel-header text-caps">Application State</div>
				<div className="panel">
					<Link component="div" to="tabs:non-existent" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Invalid View</div>
					</Link>
				</div>

				<UI.Popup visible={this.state.popup.visible}>
					<UI.PopupIcon name={this.state.popup.iconName} type={this.state.popup.iconType} spinning={this.state.popup.loading} />		
					<div><strong>{this.state.popup.header}</strong></div>
				</UI.Popup>
			</Container>
		);
	}
});
