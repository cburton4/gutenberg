/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { NavigableMenu, KeyboardShortcuts } from '@wordpress/components';
import { Component, createRef } from '@wordpress/element';
import { focus } from '@wordpress/dom';

class NavigableToolbar extends Component {
	constructor() {
		super( ...arguments );

		this.focusToolbar = this.focusToolbar.bind( this );

		this.toolbar = createRef();
	}

	focusToolbar() {
		const tabbables = focus.tabbable.find( this.toolbar.current );
		if ( tabbables.length ) {
			tabbables[ 0 ].focus();
		}
	}

	componentDidMount() {
		if ( this.props.focusOnMount ) {
			this.focusToolbar();
		}
	}

	render() {
		const { children, ...props } = this.props;
		return (
			<NavigableMenu
				orientation="horizontal"
				role="toolbar"
				ref={ this.toolbar }
				onKeyDown={ this.switchOnKeyDown }
				{ ...omit( props, [
					'focusOnMount',
				] ) }
			>
				<KeyboardShortcuts
					bindGlobal
					// Use the same event that TinyMCE uses in the Classic block for its own `alt+f10` shortcut.
					eventName="keydown"
					shortcuts={ {
						'alt+f10': this.focusToolbar,
					} }
				/>
				{ children }
			</NavigableMenu>
		);
	}
}

export default NavigableToolbar;
