/** @jsx React.DOM */

var React = require('react'),
  Link = require('touchstonejs').Link,
	Tappable = require('react-tappable'),
	Dialogs = require('touchstonejs').Dialogs,
	Navigation = require('touchstonejs').Navigation,
	UI = require('touchstonejs').UI;

var moment = require('moment')

module.exports = React.createClass({
	mixins: [Navigation, Dialogs],

	getDefaultProps: function() {
		return {
			prevView: 'home'
		}
	},

	getInitialState: function() {
		return {
			processing: false,
			formIsValid: false,
			bioValue: this.props.user.bio || ''
		}
	},

	showFlavourList: function() {
		this.showView('radio-list', 'show-from-right', { user: this.props.user, flavour: this.state.flavour });
	},

	handleBioInput: function(event) {
		this.setState({
			bioValue: event.target.value,
			formIsValid: event.target.value.length ? true : false
		});
	},

	processForm: function() {
		this.setState({
			processing: true
		});

		setTimeout(function() {
			this.showView('home', 'fade', {});
		}.bind(this), 750);
	},

	flashAlert: function(alertContent, callback) {
		return callback(this.showAlertDialog({ message: alertContent }));
	},

	render: function() {

		// fields
		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label={[this.props.user.name.first, this.props.user.name.last].join(' ')}>
					<UI.HeaderbarButton showView={this.props.prevView} viewTransition="reveal-from-right" label="Back" icon="ion-chevron-left" />
					<UI.LoadingButton loading={this.state.processing} disabled={!this.state.formIsValid} onTap={this.processForm} label="Save" className="Headerbar-button right is-primary" />
				</UI.Headerbar>
				<UI.FlexBlock grow scrollable>
					{/*<div className="panel-header text-caps">Basic details</div>*/}
					<div className="panel panel--first">
						<UI.LabelInput label="Name"     value={[this.props.user.name.first, this.props.user.name.last].join(' ')}       placeholder="Full name" first />
						<UI.LabelInput label="Location" value={this.props.user.location}   placeholder="Suburb, Country" />
						<UI.LabelInput label="Joined"   value={this.props.user.joinedDate} placeholder="Date" />
						<UI.LabelTextarea label="Bio"   value={this.state.bioValue}        placeholder="(required)" onChange={this.handleBioInput} />
					</div>
					<div className="panel">
						<Tappable onTap={this.showFlavourList} className="list-item is-first" component="div">
							<div className="item-inner">
								Favourite Icecream
								<div className="item-note default">
									<div className="item-note-label">{this.props.user.flavour}</div>
									<div className="item-note-icon ion-chevron-right" />
								</div>
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
