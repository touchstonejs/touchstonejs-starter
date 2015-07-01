var React = require('react/addons');
var {
	Container,
	createApp,
	UI,
	View,
	ViewManager
} = require('touchstonejs');

var device = require('./lib/device')

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
		if (selectedTab === 'lists' || selectedTab === 'list-simple' || selectedTab === 'list-complex' || selectedTab === 'list-details') {
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
					<View name="list-details" component={require('./views/list-details')} />
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
	if (window.StatusBar) {
		window.StatusBar.styleDefault();
	}

	React.render(<App />, document.getElementById('app'));
}

if (!window.cordova) {
	startApp();

} else {
	document.addEventListener('deviceready', startApp, false);
}
