var Container = require('react-container');
var dialogs = require('cordova-dialogs');
var React = require('react');
var Tappable = require('react-tappable');
var { UI } = require('touchstonejs');

const scrollable = Container.initScrollable();

module.exports = React.createClass({
	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'Forms'
			}
		}
	},
	getInitialState () {
		return {
			flavour: 'chocolate',
			switchValue: true
		}
	},
	handleFlavourChange (newFlavour) {
		this.setState({
			flavour: newFlavour
		});
	},
	handleSwitch (key, event) {
		var newState = {};
		newState[key] = !this.state[key];

		this.setState(newState);
	},
	alert (message) {
		dialogs.alert(message, function() {}, null)
	},
	render () {

		return (
			<Container scrollable={scrollable}>
				<UI.GroupHeader>Checkbox</UI.GroupHeader>
				<UI.Group>
					<UI.Item>
						<UI.ItemInner>
							<UI.FieldLabel>Switch</UI.FieldLabel>
							<UI.Switch onTap={this.handleSwitch.bind(this, 'switchValue')} on={this.state.switchValue} />
						</UI.ItemInner>
					</UI.Item>
					<UI.Item>
						<UI.ItemInner>
							<UI.FieldLabel>Disabled</UI.FieldLabel>
							<UI.Switch disabled />
						</UI.ItemInner>
					</UI.Item>
				</UI.Group>
				<UI.GroupHeader>Radio</UI.GroupHeader>
				<UI.Group>
					<UI.RadioList value={this.state.flavour} onChange={this.handleFlavourChange} options={[
						{ label: 'Vanilla',    value: 'vanilla' },
						{ label: 'Chocolate',  value: 'chocolate' },
						{ label: 'Caramel',    value: 'caramel' },
						{ label: 'Strawberry', value: 'strawberry' }
					]} />
				</UI.Group>
				<UI.GroupHeader>Inputs</UI.GroupHeader>
				<UI.Group>
					<UI.Input placeholder="Default" />
					<UI.Input defaultValue="With Value" placeholder="Placeholder" />
					<UI.Textarea defaultValue="Longtext is good for bios etc." placeholder="Longtext" />
				</UI.Group>
				<UI.GroupHeader>Labelled Inputs</UI.GroupHeader>
				<UI.Group>
					<UI.LabelInput type="email" label="Email"   placeholder="your.name@example.com" />
					<UI.LabelInput type="url"   label="URL"     placeholder="http://www.yourwebsite.com" />
					<UI.LabelInput noedit       label="No Edit" defaultValue="Un-editable, scrollable, selectable content" />
					<UI.LabelSelect label="Flavour" value={this.state.flavour} onChange={this.handleFlavourChange} options={[
						{ label: 'Vanilla',    value: 'vanilla' },
						{ label: 'Chocolate',  value: 'chocolate' },
						{ label: 'Caramel',    value: 'caramel' },
						{ label: 'Strawberry', value: 'strawberry' },
						{ label: 'Banana',     value: 'banana' },
						{ label: 'Lemon',      value: 'lemon' },
						{ label: 'Pastaccio',  value: 'pastaccio' }
					]} />
				</UI.Group>
				<UI.Button type="primary" onTap={this.alert.bind(this, 'You clicked the Primary Button')}>
					Primary Button
				</UI.Button>
				<UI.Button onTap={this.alert.bind(this, 'You clicked the Default Button')}>
					Default Button
				</UI.Button>
				<UI.Button type="danger" onTap={this.alert.bind(this, 'You clicked the Danger Button')}>
					Danger Button
				</UI.Button>
				<UI.Button type="danger" onTap={this.alert.bind(this, 'You clicked the Danger Button')} disabled>
					Disabled Button
				</UI.Button>
			</Container>
		);
	}
});
