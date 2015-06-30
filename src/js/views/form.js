var Container = require('react-container');
var React = require('react');
var UI = require('touchstonejs').UI;

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
			flavour: 'strawberry'
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
	render () {

		return (
			<Container scrollable={scrollable}>
				<div className="panel-header text-caps">Checkbox</div>
				<div className="panel">
					<div className="list-item">
						<div className="item-inner">
							<div className="field-label">Switch</div>
							<UI.Switch onTap={this.handleSwitch.bind(this, 'switchValue')} on={this.state.switchValue} />
						</div>
					</div>
					<div className="list-item">
						<div className="item-inner">
							<div className="field-label">Disabled</div>
							<UI.Switch disabled />
						</div>
					</div>
				</div>
				<div className="panel-header text-caps">Radio</div>
				<div className="panel">
					<UI.RadioList value={this.state.flavour} onChange={this.handleFlavourChange} options={[
						{ label: 'Vanilla',    value: 'vanilla' },
						{ label: 'Chocolate',  value: 'chocolate' },
						{ label: 'Caramel',    value: 'caramel' },
						{ label: 'Strawberry', value: 'strawberry' },
						{ label: 'Banana',     value: 'banana' },
						{ label: 'Lemon',      value: 'lemon' },
						{ label: 'Pastaccio',  value: 'pastaccio' }
					]} />
				</div>
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
			</Container>
		);
	}
});
