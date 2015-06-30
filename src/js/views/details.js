var React = require('react'),
	Tappable = require('react-tappable'),
	Dialogs = require('touchstonejs').Dialogs,
	Navigation = require('touchstonejs').Navigation,
	UI = require('touchstonejs').UI;

var Timers = require('react-timers')

module.exports = React.createClass({
	mixins: [Navigation, Dialogs, Timers()],

	getDefaultProps: function () {
		return {
			prevView: 'home'
		}
	},

	getInitialState: function () {
		return {
			processing: false,
			formIsValid: false,
			bioValue: this.props.user.bio || ''
		}
	},

	showFlavourList: function () {
		this.showView('radio-list', 'show-from-right', { user: this.props.user, flavour: this.state.flavour });
	},

	handleBioInput: function (event) {
		this.setState({
			bioValue: event.target.value,
			formIsValid: event.target.value.length ? true : false
		});
	},

	processForm: function () {
		var self = this;

		this.setState({ processing: true });

		this.setTimeout(function () {
			self.showView('home', 'fade', {});
		}, 750);
	},

	flashAlert: function (alertContent, callback) {
		return callback(this.showAlertDialog({ message: alertContent }));
	},

	render: function () {

		// fields
		return (
			<UI.View>
				<UI.Headerbar type="default" label={[this.props.user.name.first, this.props.user.name.last].join(' ')}>
					<UI.HeaderbarButton showView={this.props.prevView} transition="reveal-from-right" label="Back" icon="ion-chevron-left" />
					<UI.LoadingButton loading={this.state.processing} disabled={!this.state.formIsValid} onTap={this.processForm} label="Save" className="Headerbar-button right is-primary" />
				</UI.Headerbar>
				<UI.ViewContent grow scrollable>
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
				</UI.ViewContent>
			</UI.View>
		);
	}
});
