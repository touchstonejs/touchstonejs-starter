/** @jsx React.DOM */

var React = require('react'),
    Link = require('../touchstone/link'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	UI = require('../touchstone/ui');

var moment = require('moment')

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function() {
		return {
			processing: false,
			formIsValid: false,
			bioValue: this.props.user.bio
		}
	},
	
	showFlavourList: function() {
		this.showView('radio-list', 'show-from-right', { user: this.props.user, flavour: this.state.flavour });
	},
	
	handleBioInput: function(event) {
		console.log('bio length', this.state.bioValue);
		this.setState({
			bioValue: event.target.value
		});
		if (this.state.bioValue && this.state.bioValue.length > 0) {
			this.setState({
				formIsValid: true
			});
		}
	},
	
	processForm: function() {
		this.setState({
			processing: true
		});

		setTimeout(function() {
			this.showView('home', 'fade', {});
		}.bind(this), 750);
	},

	flashAlert: function(alertContent) {
		alert(alertContent);
	},

	render: function() {

		// fields
		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.FlexBlock height="44px" className="headerbar">
					<Link to="home" viewTransition="reveal-from-right" className="headerbar-button">
						<div className="headerbar-button-icon ion-chevron-left" />
						<div className="headerbar-button-label">Back</div>
					</Link>
					<div className="headerbar-label">{this.props.user.name}</div>
					<UI.LoadingButton loading={this.state.processing} disabled={!this.state.formIsValid} onTap={this.processForm} label="Save" className="headerbar-button headerbar-button-label right is-primary" />
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					{/*<div className="page-header text-caps">Basic details</div>*/}
					<div className="panel is-first gutter-list">
						<UI.LabelInput label="Name"     value={this.props.user.name}       placeholder="Full name" first />
						<UI.LabelInput label="Location" value={this.props.user.location}   placeholder="Suburb, Country" />
						<UI.LabelInput label="Joined"   value={this.props.user.joinedDate} noedit />
						<UI.LabelTextarea label="Bio"   value={this.state.bioValue}        placeholder="Bio" onChange={this.handleBioInput} />
					</div>
					<div className="panel gutter-list">
						<Tappable onTap={this.showFlavourList} className="list-item is-first" component="div">
							Favourite Icecream
							<div className="item-note is-muted">
								<div className="item-note-label">{this.props.user.flavour}</div>
								<div className="item-note-icon ion-chevron-right" />
							</div>
						</Tappable>
					</div>
					<Tappable onTap={this.flashAlert.bind(this, 'You clicked the Primary Button.')} className="panel-button primary" component="button">
						Primary Button
					</Tappable>
					<Tappable onTap={this.flashAlert.bind(this, 'You clicked the Default Button.')} className="panel-button" component="button">
						Default Button
					</Tappable>
					<Tappable onTap={this.flashAlert.bind(this, 'You clicked the Danger Button.')} className="panel-button danger" component="button">
						Danger Button
					</Tappable>
				</UI.FlexBlock>
			</UI.FlexLayout>
		);
	}
});
