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
					<Link to="tabs:transitions-target" viewProps={{ navbarTitle: 'Instant' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Instant</UI.ItemInner>
						</UI.Item>
					</Link>
				</UI.Group>
				<UI.GroupHeader>Fade</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" transition="fade" viewProps={{ navbarTitle: 'Fade' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Fade</UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="tabs:transitions-target" transition="fade-expand" viewProps={{ navbarTitle: 'Fade Expand' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner><span>Fade Expand <span className="text-muted">(non-standard)</span></span></UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="tabs:transitions-target" transition="fade-contract" viewProps={{ navbarTitle: 'Fade Contract' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner><span>Fade Contract <span className="text-muted">(non-standard)</span></span></UI.ItemInner>
						</UI.Item>
					</Link>
				</UI.Group>
				<UI.GroupHeader>Show</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" transition="show-from-left" viewProps={{ navbarTitle: 'Show from Left' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner><span>Show from Left <span className="text-muted">(non-standard)</span></span></UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="tabs:transitions-target" transition="show-from-right" viewProps={{ navbarTitle: 'Show from Right' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Show from Right</UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="app:transitions-target-over" transition="show-from-top" viewProps={{ navbarTitle: 'Show from Top' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner><span>Show from Top <span className="text-muted">(non-standard)</span></span></UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="app:transitions-target-over" transition="show-from-bottom" viewProps={{ navbarTitle: 'Show from Bottom' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Show from Bottom</UI.ItemInner>
						</UI.Item>
					</Link>
				</UI.Group>
				<UI.GroupHeader>Reveal</UI.GroupHeader>
				<UI.Group>
					<Link to="tabs:transitions-target" transition="reveal-from-left" viewProps={{ navbarTitle: 'Reveal from Left' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner><span>Reveal from Left <span className="text-muted">(non-standard)</span></span></UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="tabs:transitions-target" transition="reveal-from-right" viewProps={{ navbarTitle: 'Reveal from Right' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Reveal from Right</UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="app:transitions-target-over" transition="reveal-from-top" viewProps={{ navbarTitle: 'Reveal from Top' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner><span>Reveal from Top <span className="text-muted">(non-standard)</span></span></UI.ItemInner>
						</UI.Item>
					</Link>
					<Link to="app:transitions-target-over" transition="reveal-from-bottom" viewProps={{ navbarTitle: 'Reveal from Bottom' }}>
						<UI.Item showDisclosureArrow>
							<UI.ItemInner>Reveal from Bottom</UI.ItemInner>
						</UI.Item>
					</Link>
				</UI.Group>
			</Container>
		);
	}
});
