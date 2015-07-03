var Container = require('react-container');
var Link = require('touchstonejs').Link;
var Navigation = require('touchstonejs').Navigation;
var React = require('react');
var Tappable = require('react-tappable');
var UI = require('touchstonejs').UI;

var Timers = require('react-timers');

module.exports = React.createClass({
	mixins: [Navigation, Timers()],

	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'TouchstoneJS'
			}
		}
	},

	getInitialState: function () {
		return {
			popup: {
				visible: false
			}
		};
	},
	showLoadingPopup: function () {
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

	render: function () {
		return (
			<Container scrollable>
				<div className="panel-header text-caps">Bars</div>
				<div className="panel">
					<Link component="div" to="component-headerbar" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Header Bar</div>
					</Link>
					<Link component="div" to="component-headerbar-search" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Header Bar Search</div>
					</Link>
					<Link component="div" to="component-alertbar" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Alert Bar</div>
					</Link>
					<Link component="div" to="component-footerbar" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Footer Bar</div>
					</Link>
				</div>
				<div className="panel-header text-caps">Lists</div>
				<div className="panel">
					<Link component="div" to="component-simple-list" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Simple List</div>
					</Link>
					<Link component="div" to="component-complex-list" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Complex List</div>
					</Link>
					{/* This is covered in other components
					<Link component="div" to="component-categorised-list" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Categorised List</div>
					</Link>*/}
				</div>
				<div className="panel-header text-caps">UI Elements</div>
				<div className="panel">
					<Link component="div" to="component-toggle"   transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Toggle</div>
					</Link>
					<Link component="div" to="component-form"     transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Form Fields</div>
					</Link>
					<Link component="div" to="component-passcode" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Passcode / Keypad</div>
					</Link>
					<Tappable component="div" onTap={this.showLoadingPopup} className="list-item is-tappable">
						<div className="item-inner">Loading Spinner</div>
					</Tappable>
				</div>
				<div className="panel-header text-caps">Application State</div>
				<div className="panel">
					<Link component="div" to="transitions" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">View Transitions</div>
					</Link>
					<Link component="div" to="component-feedback" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">View Feedback</div>
					</Link>
				</div>
			</Container>
		);
	}
});
