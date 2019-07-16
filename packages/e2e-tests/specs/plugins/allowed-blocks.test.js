/**
 * WordPress dependencies
 */
import {
	activatePlugin,
	createNewPost,
	deactivatePlugin,
	searchForBlock,
} from '@wordpress/e2e-test-utils';

describe( 'Allowed Blocks Filter', () => {
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-allowed-blocks' );
	} );

	beforeEach( async () => {
		await createNewPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-allowed-blocks' );
	} );

	it( 'should restrict the allowed blocks in the inserter', async () => {
		// The paragraph block is available.
		await searchForBlock( 'Paragraph' );
		const paragraphBlockButton = ( await page.$x(
			`//button//span[contains(text(), 'Paragraph')]`
		) )[ 0 ];
		expect( paragraphBlockButton ).not.toBeNull();
		await paragraphBlockButton.click();

		// The gallery block is not available.
		await searchForBlock( 'Gallery' );

		const galleryBlockButton = ( await page.$x(
			`//button//span[contains(text(), 'Gallery')]`
		) )[ 0 ];
		expect( galleryBlockButton ).toBeUndefined();
	} );

	it( 'should remove not allowed blocks from the block manager', async () => {
		const BLOCK_LABEL_SELECTOR = '.edit-post-manage-blocks-modal__checklist-item .components-checkbox-control__label';
		await page.click(
			'.edit-post-more-menu [aria-label="More tools & options"]'
		);
		const [ button ] = await page.$x(
			`//button[contains(text(), 'Block Manager')]`
		);
		await button.click( 'button' );

		await page.waitForSelector( BLOCK_LABEL_SELECTOR );
		const blocks = await page.evaluate(
			( selector ) => {
				return Array.from( document.querySelectorAll( selector ) ).map(
					( element ) => ( element.innerText )
				).sort();
			},
			BLOCK_LABEL_SELECTOR
		);
		expect( blocks ).toEqual( [
			'Image',
			'Paragraph',
		] );
	} );
} );
