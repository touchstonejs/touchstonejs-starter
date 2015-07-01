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
			alertBarVisible: false,
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
	toggleAlertbar () {
		this.setState({
			alertBarVisible: !this.state.alertBarVisible
		});
	},
	render () {
		return (
			<Container scrollable>
				<UI.Alertbar type="danger" visible={this.state.alertBarVisible}>No Internet Connection</UI.Alertbar>
				<div className="panel-header text-caps">UI Elements</div>
				<div className="panel">
					<Link component="div" to="component-toggle"   transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Toggle</div>
					</Link>
				</div>
				<div className="panel-header text-caps">Alert Bar</div>
				<Tappable onTap={this.toggleAlertbar} className="panel-button primary">
					Toggle Alert Bar
				</Tappable>
				<div className="panel-header text-caps">Popup</div>
				<Tappable component="div" onTap={this.showLoadingPopup} className="panel-button primary">
					Show Popup
				</Tappable>
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
