var Container = require('react-container');
var React = require('react');
var { Link, UI } = require('touchstonejs');

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
				<UI.GroupHeader>Lists</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:list-simple" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Simple List</div>
					</Link>
					<Link to="tabs:list-complex" transition="show-from-right" className="list-item is-tappable">
						<div className="item-inner">Complex List</div>
					</Link>
				</UI.Group>
				<UI.GroupHeader>Group Header</UI.GroupHeader>
				<UI.Group>
					<UI.GroupBody>A grouped table view always contains at least one group of list items—one list item per row—and each group always contains at least one item</UI.GroupBody>
					<UI.GroupBody>A grouped table view always contains at least one group of list items—one list item per row—and each group always contains at least one item</UI.GroupBody>
				</UI.Group>
				<UI.GroupFooter>A grouped table view always contains at least one group of list items—one list item per row—and each group always contains at least one item</UI.GroupFooter>
			</Container>
		);
	}
});
