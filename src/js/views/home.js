/** @jsx React.DOM */

var React = require('react'),
	SetClass = require('classnames'),
	Tappable = require('../touchstone/tappable'),
	Navigation = require('../touchstone/navigation'),
	Link = require('../touchstone/link'),
	UI = require('../touchstone/ui');

var Icons = {
	QR: require('../components/svg/icon-qr'),
	Logo: require('../components/svg/icon-logo')
};

var moment = require('moment')

var Transaction = React.createClass({
	mixins: [Navigation],

	viewTransaction: function() {
		this.showView('details', 'show-from-right', { user: this.props.user })
	},

	render: function() {

		// Classes
		var iconClassName = SetClass({
			'list-icon user-icon left': true,
			'entry ion-arrow-down-c': this.props.user.type === 'entry',
			'exit ion-arrow-up-c': this.props.user.type === 'exit'
		});

		return (
			<Tappable onTap={this.viewTransaction} className="list-item user-item list-item-icon-left list-item-icon-right" component="div">
				<span className="list-icon user-photo left">
					<img src={this.props.user.img} />
				</span>
				<span className="list-arrow" />
				<span className={'user-amount user-type-' + this.props.user.type}>
					{this.props.user.name}
				</span>
				<div className="date">{this.props.user.timeStamp}</div>
			</Tappable>
		);
	}
});

var SessionList = React.createClass({
	render: function() {

		var users = [];
		
		this.props.users.forEach(function(user, i) {
			user.key = 'user-' + i;
			user.timeStamp = moment().subtract(i, 'minutes').format('h:mma MMM DD');
			users.push(React.createElement(Transaction, { user: user }));
		});
		
		return (
			<div>
				<div className="list-header">Staff</div>
				<div className="list icon-list user-list">
					{users}
				</div>
			</div>
		);
	}
});

module.exports = React.createClass({
	mixins: [Navigation],

	getInitialState: function() {
		return {
			centre: '',
			gate: '',
			scanButtonActiveState: undefined
		}
	},
	
	scannerIsAvailable: function() {
		return !(typeof cordova === 'undefined');
	},

	loadScanner: function(driverAction) {

		console.log('driverAction', driverAction);
		
		if (this.state.scannerIsLoading) {
			return;
		}
		
		this.setState({
			scannerIsLoading: true,
			scanButtonActiveState: driverAction
		});
		
		// cordova.plugins.barcodeScanner.scan(
		// 	// success
		// 	function (result) {
				
		// 		var newState = {
		// 			scannerIsLoading: false
		// 		};
				
		// 		if (!result.cancelled) {
		// 			var decode = this.props.api.decodePaymentURI(result.text);
				
		// 			_.extend(newState, {
		// 				targetAddress: decode.address,
		// 				targetDescription: decode.description,
		// 				targetValue: decode.amount
		// 			});
		// 		}
				
		// 		this.setState(newState);
				
		// 	}.bind(this),
		// 	// error
		// 	function (error) {
				
		// 		this.setState({
		// 			scannerIsLoading: false
		// 		});
				
		// 		navigator.notification.alert(
		// 			error,               // message
		// 			function() {},       // callback
		// 			'Scanning Failed',   // title
		// 			'OK'                 // buttonName
		// 		);
				
		// 	}.bind(this)
		// );
		
		// var scanResult;
		
	},

	render: function() {
		var viewClassName = this.props.viewClassName + ' home-view';

		var scanButtonClassName = SetClass({
			'scan-button': true,
			'enter-active': this.state.scanButtonActiveState === 'enter',
			'leave-active': this.state.scanButtonActiveState === 'leave'

		});

		var makeLicensePlate = function() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";

			for( var i=0; i < 6; i++ ) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			text = [text.slice(0,3), text.slice(3,6)].join(' ');

			return text;
		}

		// Stub users
		var users = [
			{ name: 'Boris Bozic',   position: '', img: 'https://avatars1.githubusercontent.com/u/3838716?v=3&s=460' },
			{ name: 'Jed Watson',    position: '', img: 'https://avatars1.githubusercontent.com/u/872310?v=3&s=460' },
			{ name: 'Joss Mackison', position: '', img: 'https://avatars2.githubusercontent.com/u/2730833?v=3&s=460' },
			{ name: 'Rob Morris',    position: '', img: 'https://avatars3.githubusercontent.com/u/2587163?v=3&s=460' },
			{ name: 'Simon Taylor',  position: '', img: 'https://avatars1.githubusercontent.com/u/5457267?v=3&s=460' },
			{ name: 'Tom Walker',    position: '', img: 'https://avatars2.githubusercontent.com/u/737821?v=3&s=460' },
			{ name: 'Tuan Hoang',    position: '', img: 'https://avatars0.githubusercontent.com/u/3906505?v=3&s=460' }
		];
		
		// Conditional UI
		var scanButton = !this.scannerIsAvailable() ? (
				<UI.FlexBlock height="60px" className="scan-button-wrapper">
					<div className={scanButtonClassName} component="button">
						<span className="ion-model-s scan-button-icon" />
						<div className="scan-button-labels">
							<Tappable onTap={this.loadScanner.bind(this, 'enter')} className="scan-button-label scan-button-label-left" component="span">
								Primary
							</Tappable>
							<span className="scan-button-label scan-button-label-icon" />
							<Tappable onTap={this.loadScanner.bind(this, 'leave')} className="scan-button-label scan-button-label-right" component="span">
								Secondary
							</Tappable>
						</div>
					</div>
				</UI.FlexBlock>
			) : null;

		return (
			<UI.FlexLayout className={viewClassName}>
				<UI.FlexBlock height={this.context.app.state.isNativeApp ? '150px' : '130px'} className="home-hero">
					<Icons.Logo className="home-hero-logo" />
					<UI.StripButtons className="home-buttons">
						<UI.StripButton showView="primary"    viewTransition="show-from-right"  label="Primary"    icon="ion-arrow-up-c" />
						<UI.StripButton showView="secondary" viewTransition="show-from-bottom" label="Secondary" icon="ion-arrow-down-c" />
					</UI.StripButtons>
				</UI.FlexBlock>
				<UI.FlexBlock scrollable>
					<SessionList users={users} />
				</UI.FlexBlock>
				{scanButton}
			</UI.FlexLayout>
		);
	}
});
