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
			typeKey: 'icon'
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
		var renderFooterbar;

		if (this.state.typeKey === 'icon') {
			renderFooterbar = (<UI.Footerbar type="default">
				<UI.FooterbarButton icon="ion-ios7-arrow-left" />
				<UI.FooterbarButton icon="ion-ios7-arrow-right" disabled />
				<UI.FooterbarButton icon="ion-ios7-download" />
				<UI.FooterbarButton icon="ion-ios7-bookmarks-outline" />
				<UI.FooterbarButton icon="ion-ios7-browsers" />
			</UI.Footerbar>)
		} else if (this.state.typeKey === 'label') {
			renderFooterbar = (<UI.Footerbar type="default">
				<UI.FooterbarButton label="Back" />
				<UI.FooterbarButton label="Forward" disabled />
				<UI.FooterbarButton label="Download" />
				<UI.FooterbarButton label="Bookmarks" />
				<UI.FooterbarButton label="Tabs" />
			</UI.Footerbar>)
		} else if (this.state.typeKey === 'both') {
			renderFooterbar = (<UI.Footerbar type="default">
				<UI.FooterbarButton label="Back" icon="ion-ios7-arrow-left" />
				<UI.FooterbarButton label="Forward" icon="ion-ios7-arrow-right" disabled />
				<UI.FooterbarButton label="Download" icon="ion-ios7-download" />
				<UI.FooterbarButton label="Bookmarks" icon="ion-ios7-bookmarks-outline" />
				<UI.FooterbarButton label="Tabs" icon="ion-ios7-browsers" />
			</UI.Footerbar>)
		}

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar>
					<Link to="home" viewTransition="reveal-from-right" className="Headerbar-button ion-chevron-left" component="button">Back</Link>
					<div className="Headerbar-label">Footer Bar</div>
				</UI.Headerbar>
				<UI.FlexBlock grow scrollable>
					{/*<div className="view-inner">
						<UI.Toggle value={this.state.typeKey} onChange={this.handleFooterChange} options={[
							{ label: 'Icon', value: 'icon' },
							{ label: 'Label', value: 'label' },
							{ label: 'Both', value: 'both' }
						]} />
					</div>*/}
					<div className="view-feedback">
						Your app's amazing content here.
					</div>
				</UI.FlexBlock>
				{renderFooterbar}
			</UI.FlexLayout>
		);
	}
});
