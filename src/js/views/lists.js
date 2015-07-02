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
					<UI.LinkItem linkTo="tabs:list-simple" transition="show-from-right" showDisclosureArrow>
						<UI.ItemInner>
							Simple List
						</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:list-complex" transition="show-from-right" showDisclosureArrow>
						<UI.ItemInner>
							Complex List
						</UI.ItemInner>
					</UI.LinkItem>
				</UI.Group>
				<UI.GroupHeader>GroupHeader</UI.GroupHeader>
				<UI.Group>
					<UI.GroupBody>Use groups to contain content or lists. Where appropriate a Group should be accompanied by a GroupHeading and optionally a GroupFooter.</UI.GroupBody>
					<UI.GroupBody>You can use GroupBody for content inside groups. Subsequent GroupBody components will be separated.</UI.GroupBody>
				</UI.Group>
				<UI.GroupFooter>GroupFooter: useful for a detailed explaination to express the intentions of the Group. Try to be concise - remember that users are likely to read the text in your UI many times.</UI.GroupFooter>
			</Container>
		);
	}
});
