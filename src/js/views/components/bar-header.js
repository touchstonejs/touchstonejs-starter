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

		var headerbarClass = SetClass({
			'headerbar': true,
			'primary': this.state.typeKey === 'blue',
			'success': this.state.typeKey === 'green',
			'warning': this.state.typeKey === 'yellow',
			'danger': this.state.typeKey === 'red',
			'inverted': this.state.typeKey === 'black'
		});

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className={headerbarClass}>
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Back</div>
					</Link>
					<div className="headerbar-label">{this.state.typeKey.substr(0,1).toUpperCase()}{this.state.typeKey.substr(1)} Header</div>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<div className="panel panel--first ios-list">
						<UI.RadioList value={this.state.typeKey} onChange={this.handleHeaderChange} options={[
							{ label: 'Default',  value: 'default' },
							{ label: 'Blue',  value: 'blue' },
							{ label: 'Green',  value: 'green' },
							{ label: 'Yellow',  value: 'yellow' },
							{ label: 'Red',   value: 'red' },
							{ label: 'Black', value: 'black' }
						]} />
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});