var Container = require('react-container');
var Link = require('touchstonejs').Link;
var React = require('react');

module.exports = React.createClass({
	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'Lists'
			}
		}
	},

	render: function () {
		return (
			<Container scrollable>
				<div className="panel-header text-caps">Lists</div>
				<div className="panel">
					<Link to="tabs:list-simple" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Simple List</div>
					</Link>
					<Link to="tabs:list-complex" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Complex List</div>
					</Link>
					{/* This is covered in other components
					<Link component="div" to="component-categorised-list" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Categorised List</div>
					</Link>*/}
				</div>
			</Container>
		);
	}
});
