var Container = require('react-container');
var React = require('react');
var { Link, UI } = require('touchstonejs');

const scrollable = Container.initScrollable();

module.exports = React.createClass({
	statics: {
		navigationBar: 'main',
		getNavigation () {
			return {
				title: 'Transitions'
			}
		}
	},
	render () {
		return (
			<Container scrollable={scrollable}>
				<UI.GroupHeader>Default</UI.GroupHeader>
				<UI.Group>
					<UI.LinkItem linkTo="tabs:transitions-target" showDisclosureArrow viewProps={{ navbarTitle: 'Instant' }}>
						<UI.ItemInner>Instant</UI.ItemInner>
					</UI.LinkItem>
				</UI.Group>
				<UI.GroupHeader>Fade</UI.GroupHeader>
				<UI.Group>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="fade" showDisclosureArrow viewProps={{ navbarTitle: 'Fade' }}>
						<UI.ItemInner>Fade</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="fade-expand" showDisclosureArrow viewProps={{ navbarTitle: 'Fade Expand' }}>
						<UI.ItemInner>Fade Expand</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="fade-contract" showDisclosureArrow viewProps={{ navbarTitle: 'Fade Contract' }}>
						<UI.ItemInner>Fade Contract</UI.ItemInner>
					</UI.LinkItem>
				</UI.Group>
				<UI.GroupHeader>Show</UI.GroupHeader>
				<UI.Group>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="show-from-left" showDisclosureArrow viewProps={{ navbarTitle: 'Show from Left' }}>
						<UI.ItemInner>Show from Left</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="show-from-right" showDisclosureArrow viewProps={{ navbarTitle: 'Show from Right' }}>
						<UI.ItemInner>Show from Right</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="show-from-top" showDisclosureArrow viewProps={{ navbarTitle: 'Show from Top' }}>
						<UI.ItemInner>Show from Top</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="show-from-bottom" showDisclosureArrow viewProps={{ navbarTitle: 'Show from Bottom' }}>
						<UI.ItemInner>Show from Bottom</UI.ItemInner>
					</UI.LinkItem>
				</UI.Group>
				<UI.GroupHeader>Reveal</UI.GroupHeader>
				<UI.Group>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="reveal-from-left" showDisclosureArrow viewProps={{ navbarTitle: 'Reveal from Left' }}>
						<UI.ItemInner>Reveal from Left</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="reveal-from-right" showDisclosureArrow viewProps={{ navbarTitle: 'Reveal from Right' }}>
						<UI.ItemInner>Reveal from Right</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="reveal-from-top" showDisclosureArrow viewProps={{ navbarTitle: 'Reveal from Top' }}>
						<UI.ItemInner>Reveal from Top</UI.ItemInner>
					</UI.LinkItem>
					<UI.LinkItem linkTo="tabs:transitions-target" transition="reveal-from-bottom" showDisclosureArrow viewProps={{ navbarTitle: 'Reveal from Bottom' }}>
						<UI.ItemInner>Reveal from Bottom</UI.ItemInner>
					</UI.LinkItem>
				</UI.Group>
			</Container>
		);
	}
});
