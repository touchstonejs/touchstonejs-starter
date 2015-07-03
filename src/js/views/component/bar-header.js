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
			typeKey: 'default'
		}
	},

	handleHeaderChange: function (newType) {

		this.setState({
			typeKey: newType
		});

	},

	render: function () {

		return (
			<UI.View>
				<UI.Headerbar type={this.state.typeKey} label="Header Bar">
					<UI.HeaderbarButton showView="home" transition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
					<div className="panel panel--first">
						<UI.RadioList value={this.state.typeKey} onChange={this.handleHeaderChange} options={[
							{ label: 'Default',  value: 'default' },
							{ label: 'Green', value: 'green' },
							{ label: 'Blue', value: 'blue' },
							{ label: 'Light Blue', value: 'light-blue' },
							{ label: 'Yellow', value: 'yellow' },
							{ label: 'Orange', value: 'orange' },
							{ label: 'Red', value: 'red' },
							{ label: 'Pink', value: 'pink' },
							{ label: 'Purple', value: 'purple' }
						]} />
					</div>
				</UI.ViewContent>
			</UI.View>
		);
	}
});
