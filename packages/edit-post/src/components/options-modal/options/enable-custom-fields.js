/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BaseOption from './base';

export function CustomFieldsConfirmation( { nextState } ) {
	const [ isReloading, setIsReloading ] = useState( false );

	return (
		<>
			<p className="edit-post-options-modal__custom-fields-confirmation-message">
				{ __( 'A page reload is required for this change.' ) }
			</p>
			<Button
				className="edit-post-options-modal__custom-fields-confirmation-button"
				isDefault
				isBusy={ isReloading }
				disabled={ isReloading }
				onClick={ () => {
					setIsReloading( true );
					document.getElementById( 'toggle-custom-fields-form' ).submit();
				} }
			>
				{ nextState === true ? __( 'Enable & Reload' ) : __( 'Disable & Reload' ) }
			</Button>
		</>
	);
}

export function EnableCustomFieldsOption( { label, areCustomFieldsEnabled } ) {
	const [ isChecked, setIsChecked ] = useState( areCustomFieldsEnabled );

	return (
		<BaseOption
			label={ label }
			isChecked={ isChecked }
			onChange={ setIsChecked }
		>
			{ isChecked !== areCustomFieldsEnabled && <CustomFieldsConfirmation nextState={ isChecked } /> }
		</BaseOption>
	);
}

export default withSelect( ( select ) => ( {
	areCustomFieldsEnabled: !! select( 'core/editor' ).getEditorSettings().enableCustomFields,
} ) )( EnableCustomFieldsOption );
