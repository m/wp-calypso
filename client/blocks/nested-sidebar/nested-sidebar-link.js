/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get } from 'lodash';

/**
 * internal dependencies
 */
import {
	setSidebarRoute,
	startSidebarTransition,
	endSidebarTransition,
} from 'state/sidebar/actions';

// NestedSidebarLink's main responsibility is to act like an anchor tag
// but for navigating through sidebar routes, it should be able to render any child
// as an anchor tag would (It may be that an a tag makes sense in place of the p tag).
export class NestedSidebarLink extends Component {
	static defaultProps = {
		direction: 'right',
	};

	changeRoute = () => {
		if ( get( this.props, 'transition.route' ) ) {
			// Disable during transition
			return;
		}

		this.props.startSidebarTransition( this.props.route, this.props.direction );

		setTimeout( () => {
			// @TODO: We need to reliably capture the transitionend event.
			// So far this hasn't proved to be as straight forward as we'd like.
			this.props.endSidebarTransition();
			this.props.setSidebarRoute( this.props.route );
		}, 800 );
	};

	render() {
		// This can be anything of course, p was just used for the example.jsx demo.
		return <p onClick={ this.changeRoute }>{ this.props.children }</p>;
	}
}

export default connect(
	state => ( {
		parentRoute: get( state, 'sidebar.parentRoute' ),
		currentRoute: get( state, 'sidebar.route' ),
		transition: get( state, 'sidebar.transition', {} ),
	} ),
	dispatch =>
		bindActionCreators(
			{
				setSidebarRoute,
				startSidebarTransition,
				endSidebarTransition,
			},
			dispatch
		)
)( NestedSidebarLink );