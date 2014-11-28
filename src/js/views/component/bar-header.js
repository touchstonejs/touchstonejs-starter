/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../../touchstone/tappable'),
	Navigation = require('../../touchstone/navigation'),
	Link = require('../../touchstone/link'),
	UI = require('../../touchstone/ui');

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
				<UI.FlexBlock height="44px" className={headerbarClass}>
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button ion-chevron-left" component="button">Back</Link>
					<div className="Headerbar-label">{this.state.typeKey.substr(0,1).toUpperCase()}{this.state.typeKey.substr(1)} Header</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="panel panel--first ios-list">
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