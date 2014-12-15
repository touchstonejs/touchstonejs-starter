/** @jsx React.DOM */

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
			typeKey: 'default'
		}
	},

	handleHeaderChange: function(newType) {

		this.setState({
			typeKey: newType
		});

	},

	render: function() {

		var headerbarClass = SetClass(this.state.typeKey, {
			'Headerbar': true
		});

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Header Bar" className={headerbarClass}>
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.FlexBlock scrollable>
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
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});