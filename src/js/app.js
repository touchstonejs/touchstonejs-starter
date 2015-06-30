var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var classnames = require('classnames');
var {
	Container,
	createApp,
	UI,
	View,
	ViewManager
} = require('touchstonejs');

var config = require('./config');
var device = require('./lib/device')

/*
var views = {

	// app
	'home': require('./views/home'),

	// components
	'component-feedback': require('./views/component/feedback'),

	'component-headerbar': require('./views/component/bar-header'),
	'component-headerbar-search': require('./views/component/bar-header-search'),
	'component-alertbar': require('./views/component/bar-alert'),
	'component-actionbar': require('./views/component/bar-action'),
	'component-footerbar': require('./views/component/bar-footer'),

	'component-passcode': require('./views/component/passcode'),
	'component-toggle': require('./views/component/toggle'),
	'component-form': require('./views/component/form'),

	'component-simple-list': require('./views/component/list-simple'),
	'component-complex-list': require('./views/component/list-complex'),
	'component-categorised-list': require('./views/component/list-categorised'),

	// transitions
	'transitions': require('./views/transitions'),
	'transitions-target': require('./views/transitions-target'),

	// details view
	'details': require('./views/details'),
	'radio-list': require('./views/radio-list')
};
*/




// App Config
// ------------------------------

var App = React.createClass({
	mixins: [createApp()],

	render () {
		var appWrapperClassName = 'app-wrapper device--' + device.platform;

		return (
			<div className={appWrapperClassName}>
				<ViewManager name="app" defaultView="main">
					<View name="main" component={MainViewController} />
				</ViewManager>
			</div>
		);
	}
});




// Main Controller
// ------------------------------

var MainViewController = React.createClass({
	render () {
		return (
			<Container>
				<UI.NavigationBar name="main" />
				<ViewManager name="main" defaultView="tabs">
					<View name="tabs" component={TabViewController} />
				</ViewManager>
			</Container>
		);
	}
});




// Tab Controller
// ------------------------------

var lastSelectedTab = 'lists'
var TabViewController = React.createClass({
	getInitialState () {
		return {
			selectedTab: lastSelectedTab
		};
	},
	onViewChange (nextView) {
		lastSelectedTab = nextView

		this.setState({
			selectedTab: nextView
		});
	},
	selectTab (tab) {
		var viewProps;
		this.refs.vm.transitionTo(tab.value, {
			transition: 'instant',
			viewProps: viewProps
		});
	},
	render () {
		var selectedTab = this.state.selectedTab;
		
		if (selectedTab === 'lists' || selectedTab === 'list-simple' || selectedTab === 'list-complex') {
			selectedTab = 'lists';
		}
		if (selectedTab === 'transitions' || selectedTab === 'transitions-target') {
			selectedTab = 'transitions';
		}

		return (
			<Container>
				<ViewManager ref="vm" name="tabs" defaultView={this.state.selectedTab} onViewChange={this.onViewChange}>
					<View name="lists" component={require('./views/lists')} />
					<View name="list-simple" component={require('./views/list-simple')} />
					<View name="list-complex" component={require('./views/list-complex')} />
					<View name="details" component={require('./views/details')} />
					<View name="form" component={require('./views/form')} />
					<View name="controls" component={require('./views/controls')} />
					<View name="transitions" component={require('./views/transitions')} />
					<View name="transitions-target" component={require('./views/transitions-target')} />
				</ViewManager>
				<UI.Tabs.Navigator value={selectedTab} onChange={this.selectTab}>
					<UI.Tabs.Tab value="lists">
						<span className="Tabs-Icon Tabs-Icon--lists" />
						<UI.Tabs.Label>Lists</UI.Tabs.Label>
					</UI.Tabs.Tab>
					<UI.Tabs.Tab value="form">
						<span className="Tabs-Icon Tabs-Icon--forms" />
						<UI.Tabs.Label>Forms</UI.Tabs.Label>
					</UI.Tabs.Tab>
					<UI.Tabs.Tab value="controls">
						<span className="Tabs-Icon Tabs-Icon--controls" />
						<UI.Tabs.Label>Controls</UI.Tabs.Label>
					</UI.Tabs.Tab>
					<UI.Tabs.Tab value="transitions">
						<span className="Tabs-Icon Tabs-Icon--transitions" />
						<UI.Tabs.Label>Transitions</UI.Tabs.Label>
					</UI.Tabs.Tab>
				</UI.Tabs.Navigator>
			</Container>
		);
	}
});

function startApp () {
	React.render(<App />, document.getElementById('app'));
}

function onDeviceReady () {
	StatusBar.styleDefault();
	startApp();
}

if (typeof cordova === 'undefined') {
	startApp();
} else {
	document.addEventListener('deviceready', onDeviceReady, false);
}
