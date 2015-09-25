import Container from 'react-container';
import React from 'react';
import Tappable from 'react-tappable';
import Timers from 'react-timers';
import { Link, UI } from 'touchstonejs';

module.exports = React.createClass({
	mixins: [Timers],
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

		this.setTimeout(() => {
			this.setState({
				popup: {
					visible: true,
					loading: false,
					header: 'Done!',
					iconName: 'ion-ios-checkmark',
					iconType: 'success'
				}
			});
		}, 2000);

		this.setTimeout(() => {
			this.setState({
				popup: {
					visible: false
				}
			});
		}, 3000);
	},
	
	showAlertbar (type, text) {
		this.setState({
			alertbar: {
				visible: true,
				type: type,
				text: text
			}
		});

		this.setTimeout(() => {
			this.setState({
				alertbar: {
					visible: false
				}
			});
		}, 2000);
	},
	
	handleModeChange (newMode) {
		let selectedItem = newMode;

		if (this.state.selectedMode === newMode) {
			selectedItem = null;
		}

		this.setState({
			selectedMode: selectedItem
		});

	},
	
	render () {
		let { alertbar } = this.state;
		return (
			<Container scrollable>
				<UI.Alertbar type={alertbar.type || 'default'} visible={alertbar.visible} animated>{alertbar.text || ''}</UI.Alertbar>
				<UI.Group hasTopGutter>
					<UI.GroupHeader>Segmented Control</UI.GroupHeader>
					<UI.SegmentedControl value={this.state.selectedMode} onChange={this.handleModeChange} hasGutter options={[
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' },
						{ label: 'Four', value: 'four' }
					]} />
				</UI.Group>

				<UI.Group>
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
				</UI.Group>
				<UI.Group>
					<UI.GroupHeader>Popup</UI.GroupHeader>
					<UI.Button type="primary" onTap={this.showLoadingPopup} disabled={this.state.popup.visible}>
						Show Popup
					</UI.Button>
				</UI.Group>
				<UI.Group>
					<UI.GroupHeader>Application State</UI.GroupHeader>
					<UI.GroupBody>
						<Link to="tabs:non-existent" transition="show-from-right">
							<UI.Item showDisclosureArrow>
								<UI.ItemInner>Invalid View</UI.ItemInner>
							</UI.Item>
						</Link>
					</UI.GroupBody>
				</UI.Group>

				<UI.Popup visible={this.state.popup.visible}>
					<UI.PopupIcon name={this.state.popup.iconName} type={this.state.popup.iconType} spinning={this.state.popup.loading} />		
					<div><strong>{this.state.popup.header}</strong></div>
				</UI.Popup>
			</Container>
		);
	}
});
