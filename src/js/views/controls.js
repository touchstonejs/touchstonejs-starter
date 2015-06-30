var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');
var Tappable = require('react-tappable');
var UI = require('touchstonejs').UI;

module.exports = React.createClass({
	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'Controls'
			}
		}
	},
	render () {
		return (
			<Container scrollable>
				<div className="panel-header text-caps">UI Elements</div>
				<div className="panel">
					<Link component="div" to="component-toggle"   transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Toggle</div>
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
					<Link component="div" to="component-alertbar" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Alert Bar</div>
					</Link>
					<Link component="div" to="transitions" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">View Transitions</div>
					</Link>
					<Link component="div" to="invalid-view" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Invalid View</div>
					</Link>
				</div>
			</Container>
		);
	}
});
