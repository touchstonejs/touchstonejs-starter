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
			flavour: 'strawberry'
		}
	},

	handleFlavourChange: function(newFlavour) {

		this.setState({
			flavour: newFlavour
		});

	},

	render: function() {

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Form">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" label="Back" icon="ion-chevron-left" />
				</UI.Headerbar>
				<UI.FlexBlock grow scrollable>
					<div className="panel-header text-caps">Inputs</div>
					<div className="panel">
						<UI.Input placeholder="Default" />
						<UI.Input defaultValue="With Value" placeholder="Placeholder" />
						<UI.Textarea defaultValue="Longtext is good for bios etc." placeholder="Longtext" />
					</div>
					<div className="panel-header text-caps">Labelled Inputs</div>
					<div className="panel">
						<UI.LabelInput type="email" label="Email"   placeholder="your.name@example.com" />
						<UI.LabelInput type="url"   label="URL"     placeholder="http://www.yourwebsite.com" />
						<UI.LabelInput noedit       label="No Edit" value="Un-editable, scrollable, selectable content" />
						<UI.LabelSelect label="Flavour" value={this.state.flavour} onChange={this.handleFlavourChange} options={[
							{ label: 'Vanilla',    value: 'vanilla' },
							{ label: 'Chocolate',  value: 'chocolate' },
							{ label: 'Caramel',    value: 'caramel' },
							{ label: 'Strawberry', value: 'strawberry' },
							{ label: 'Banana',     value: 'banana' },
							{ label: 'Lemon',      value: 'lemon' },
							{ label: 'Pastaccio',  value: 'pastaccio' }
						]} />
					</div>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
