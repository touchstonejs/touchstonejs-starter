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
			helpText: 'Enter your passcode',
			keyboardIsStowed: true,
			passcode: '',
			working: false
		}
	},

	componentDidMount: function() {
		// slide the keyboard up after the view is shown
		setTimeout(function() {
			this.setState({
				keyboardIsStowed: false
			});
		}.bind(this), 300);
	},

	handlePasscode: function(keyCode) {
		if (this.state.working) return

		var passcode = this.state.passcode

		if (keyCode === 'delete') {
			passcode = passcode.slice(0, -1)

		} else {
			passcode = passcode.concat(keyCode)
		}

		if (passcode.length !== 4) {
			return this.setState({
				passcode: passcode
			})
		}

		setTimeout(function() {
			alert('Your passcode is ' + passcode);
			this.showView('home', 'fade');
		}.bind(this), 200); // the transition that stows the keyboard takes 150ms, it freezes if interrupted by the ReactCSSTransitionGroup

		return this.setState({
			passcode: passcode,
			working: true
		})
	},

	render: function() {

		var passcodeStyle = { paddingTop: 100 };

		return (
			<UI.FlexLayout className={this.props.viewClassName}>
				<UI.Headerbar label="Enter Passcode">
					<UI.HeaderbarButton showView="home" viewTransition="reveal-from-right" icon="ion-chevron-left" label="Back" />
				</UI.Headerbar>
				<UI.FlexBlock>
					<div className="Passcode" style={passcodeStyle}>
						<input type="hidden" name="pinEntry" />
						<div className="Passcode-label">{this.state.helpText}</div>
						<div className="Passcode-fields">
							<div className="Passcode-field">
								<div className={"Passcode-input " + ((this.state.passcode.length > 0) ? "has-value" : "")} />
							</div>
							<div className="Passcode-field">
								<div className={"Passcode-input " + ((this.state.passcode.length > 1) ? "has-value" : "")} />
							</div>
							<div className="Passcode-field">
								<div className={"Passcode-input " + ((this.state.passcode.length > 2) ? "has-value" : "")} />
							</div>
							<div className="Passcode-field">
								<div className={"Passcode-input " + ((this.state.passcode.length > 3) ? "has-value" : "")} />
							</div>
						</div>
					</div>
				</UI.FlexBlock>
				<UI.Keypad action={this.handlePasscode} enableDel={Boolean(this.state.passcode.length)} stowed={this.state.working || this.state.keyboardIsStowed} />
			</UI.FlexLayout>
		);
	}
});
