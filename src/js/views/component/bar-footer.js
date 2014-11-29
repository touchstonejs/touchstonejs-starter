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

	handleFooterChange: function(newType) {

		this.setState({
			typeKey: newType
		});

	},

	render: function() {

		var footerbarClass = SetClass(this.state.typeKey, {
			'footerbar': true
		});

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar>
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button ion-chevron-left" component="button">Back</Link>
					<div className="Headerbar-label">Footer Bar</div>
				</UI.Headerbar>
				<UI.FlexBlock scrollable>
					<div className="panel panel--first ios-list">
						<UI.RadioList value={this.state.typeKey} onChange={this.handleFooterChange} options={[
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
				<UI.Footerbar className={footerbarClass}>
					<UI.FooterbarButton icon="ion-ios7-arrow-left" />
					<UI.FooterbarButton icon="ion-ios7-arrow-right" disabled />
					<UI.FooterbarButton icon="ion-ios7-download" />
					<UI.FooterbarButton icon="ion-ios7-bookmarks-outline" />
					<UI.FooterbarButton icon="ion-ios7-browsers" />
				</UI.Footerbar>
			</UI.FlexLayout>
		);
	}
});
