import Container from 'react-container';
import React from 'react';
import { Link, UI } from 'touchstonejs';

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
				<UI.Group>
					<UI.GroupHeader>Lists</UI.GroupHeader>
					<UI.GroupBody>
						<Link to="tabs:list-simple" transition="show-from-right">
							<UI.Item showDisclosureArrow>
								<UI.ItemInner>
									Simple List
								</UI.ItemInner>
							</UI.Item>
						</Link>
						<Link to="tabs:list-complex" transition="show-from-right">
							<UI.Item showDisclosureArrow>
								<UI.ItemInner>
									Complex List
								</UI.ItemInner>
							</UI.Item>
						</Link>
					</UI.GroupBody>
				</UI.Group>
				<UI.Group>
					<UI.GroupHeader>GroupHeader</UI.GroupHeader>
					<UI.GroupBody>
						<UI.GroupInner>
							<p>Use groups to contain content or lists. Where appropriate a Group should be accompanied by a GroupHeading and optionally a GroupFooter.</p>
							GroupBody will apply the background for content inside groups.
						</UI.GroupInner>
					</UI.GroupBody>
					<UI.GroupFooter>GroupFooter: useful for a detailed explaination to express the intentions of the Group. Try to be concise - remember that users are likely to read the text in your UI many times.</UI.GroupFooter>
				</UI.Group>
			</Container>
		);
	}
});
