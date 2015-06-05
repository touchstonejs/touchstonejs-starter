var fs = require('fs');
var React = require('react');

var svg = fs.readFileSync('./src/img/icon-qr.svg', 'utf-8');

module.exports = React.createClass({
	render: function () {
		return React.createElement('span', {
			className: this.props.className ? this.props.className : 'svg-icon',
			dangerouslySetInnerHTML: { __html: svg }
		});
	}
});
