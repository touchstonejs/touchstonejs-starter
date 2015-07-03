var Container = require('react-container');
var React = require('react');
var Tappable = require('react-tappable');
var Timers = require('react-timers');
var { Link, UI } = require('touchstonejs');

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
				<UI.GroupHeader>Segmented Control</UI.GroupHeader>
				<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter options={[
					{ label: 'One', value: 'one' },
					{ label: 'Two', value: 'two' },
					{ label: 'Three', value: 'three' },
					{ label: 'Four', value: 'four' }
				]} />

				<UI.GroupHeader>Alert Bar</UI.GroupHeader>
				<UI.ButtonGroup>
					<UI.Button type="primary" onTap={this.showAlertbar.bind(this, 'danger', 'No Internet Connection')} disabled={this.state.alertbar.visible}>
						Danger
					</UI.Button>
					<UI.Button type="primary" onTap={this.showAlertbar.bind(this, 'warning', 'Connecting...')} disabled={this.state.alertbar.visible}>
						Warning
					</UI.Button>
					<UI.Button type="primary" onTap={this.showAlertbar.bind(this, 'success', 'Connected')} disabled={this.state.alertbar.visible}>
						Success
					</UI.Button>
				</UI.ButtonGroup>
				<UI.GroupHeader>Popup</UI.GroupHeader>
				<UI.Button type="primary" onTap={this.showLoadingPopup} disabled={this.state.popup.visible}>
					Show Popup
				</UI.Button>
				<UI.GroupHeader>Application State</UI.GroupHeader>
				<UI.Group>
					<Link linkTo="tabs:non-existent" transition="show-from-right">
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Invalid View</UI.ItemInner>
						</UI.Item>
					</Link>
				</UI.Group>

				<UI.Popup visible={this.state.popup.visible}>
					<UI.PopupIcon name={this.state.popup.iconName} type={this.state.popup.iconType} spinning={this.state.popup.loading} />		
					<div><strong>{this.state.popup.header}</strong></div>
				</UI.Popup>
			</Container>
		);
	}
});
