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
			modal: {
				visible: false
			}
		};
	},

	componentDidMount: function() {
		console.log('UI', UI);
		console.log('UI.View', UI.View);
	},

	showLoadingModal: function() {
		this.setState({
			modal: {
				visible: true,
				loading: true,
				header: 'Loading',
				iconKey: 'ion-load-c',
				iconType: 'default'
			}
		});

		setTimeout(function() {
			this.setState({
				modal: {
					visible: true,
					loading: false,
					header: 'Done!',
					iconKey: 'ion-ios7-checkmark',
					iconType: 'success'
				}
			});
		}.bind(this), 2000);

		setTimeout(function() {
			this.setState({
				modal: {
					visible: false
				}
			});
		}.bind(this), 3000);
	},

	render: function() {

		return (
			<UI.View className={this.props.viewClassName}>
				<UI.Headerbar type="default" label="TouchstoneJS" />
				<UI.ViewContent grow scrollable>
					<div className="panel-header text-caps">Bars</div>
					<div className="panel">
						<Link component="div" to="component-headerbar" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Header Bar</div>
						</Link>
						<Link component="div" to="component-headerbar-search" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Header Bar Search</div>
						</Link>
						<Link component="div" to="component-alertbar" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Alert Bar</div>
						</Link>
						<Link component="div" to="component-footerbar" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Footer Bar</div>
						</Link>
					</div>
					<div className="panel-header text-caps">Lists</div>
					<div className="panel">
						<Link component="div" to="component-simple-list" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Simple List</div>
						</Link>
						<Link component="div" to="component-complex-list" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Complex List</div>
						</Link>
						{/* This is covered in other components
						<Link component="div" to="component-categorised-list" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Categorised List</div>
						</Link>*/}
					</div>
					<div className="panel-header text-caps">UI Elements</div>
					<div className="panel">
						<Link component="div" to="component-toggle"   viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Toggle</div>
						</Link>
						<Link component="div" to="component-form"     viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Form Fields</div>
						</Link>
						<Link component="div" to="component-passcode" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">Passcode / Keypad</div>
						</Link>
						<Tappable component="div" onTap={this.showLoadingModal} className="list-item is-tappable">
							<div className="item-inner">Loading Spinner</div>
						</Tappable>
					</div>
					<div className="panel-header text-caps">Application State</div>
					<div className="panel">
						<Link component="div" to="transitions" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">View Transitions</div>
						</Link>
						<Link component="div" to="component-feedback" viewTransition="show-from-right" className="list-item is-tappable">
							<div className="item-inner">View Feedback</div>
						</Link>
					</div>
				</UI.ViewContent>
				{this.state.modal.visible && <UI.Modal header={this.state.modal.header} iconKey={this.state.modal.iconKey} iconType={this.state.modal.iconType} mini loading={this.state.modal.loading} />}
			</UI.View>
		);
	}
});

