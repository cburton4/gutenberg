/**
 * External dependencies
 */
import TestRenderer, { act } from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { createRegistry } from '../../../registry';
import { RegistryProvider } from '../../registry-provider';
import useSelect from '../index';

describe( 'useSelect', () => {
	let registry;
	beforeEach( () => {
		registry = createRegistry();
	} );

	const getTestComponent = ( mapSelectSpy, dependencyKey ) => ( props ) => {
		const dependencies = props[ dependencyKey ];
		mapSelectSpy.mockImplementation(
			( select ) => ( {
				results: select( 'testStore' ).testSelector( props.keyName ),
			} )
		);
		const data = useSelect( mapSelectSpy, [ dependencies ] );
		return <div>{ data.results }</div>;
	};

	it( 'passes the relevant data to the component', () => {
		registry.registerStore( 'testStore', {
			reducer: () => ( { foo: 'bar' } ),
			selectors: {
				testSelector: ( state, key ) => state[ key ],
			},
		} );
		const selectSpy = jest.fn();
		const TestComponent = jest.fn().mockImplementation(
			getTestComponent( selectSpy, 'keyName' )
		);
		let renderer;
		act( () => {
			renderer = TestRenderer.create(
				<RegistryProvider value={ registry }>
					<TestComponent keyName="foo" />
				</RegistryProvider>
			);
		} );
		const testInstance = renderer.root;
		// 2 times expected
		// - 1 for initial mount
		// - 1 for after mount before subscription set.
		expect( selectSpy ).toHaveBeenCalledTimes( 2 );
		expect( TestComponent ).toHaveBeenCalledTimes( 1 );

		// ensure expected state was rendered
		expect( testInstance.findByType( 'div' ).props ).toEqual( {
			children: 'bar',
		} );
	} );

	it( 'uses memoized selector if dependencies do not change', () => {
		registry.registerStore( 'testStore', {
			reducer: () => ( { foo: 'bar' } ),
			selectors: {
				testSelector: ( state, key ) => state[ key ],
			},
		} );

		const selectSpyFoo = jest.fn().mockImplementation( () => 'foo' );
		const selectSpyBar = jest.fn().mockImplementation( () => 'bar' );
		const TestComponent = jest.fn().mockImplementation(
			( props ) => {
				const mapSelect = props.change ? selectSpyFoo : selectSpyBar;
				const data = useSelect( mapSelect, [ props.keyName ] );
				return <div>{ data }</div>;
			}
		);
		let renderer;
		act( () => {
			renderer = TestRenderer.create(
				<RegistryProvider value={ registry }>
					<TestComponent keyName="foo" change={ true } />
				</RegistryProvider>
			);
		} );
		const testInstance = renderer.root;

		expect( selectSpyFoo ).toHaveBeenCalledTimes( 2 );
		expect( selectSpyBar ).toHaveBeenCalledTimes( 0 );
		expect( TestComponent ).toHaveBeenCalledTimes( 1 );

		// ensure expected state was rendered
		expect( testInstance.findByType( 'div' ).props ).toEqual( {
			children: 'foo',
		} );

		//rerender with non dependency changed
		act( () => {
			renderer.update(
				<RegistryProvider value={ registry }>
					<TestComponent keyName="foo" change={ false } />
				</RegistryProvider>
			);
		} );

		expect( selectSpyFoo ).toHaveBeenCalledTimes( 2 );
		expect( selectSpyBar ).toHaveBeenCalledTimes( 0 );
		expect( TestComponent ).toHaveBeenCalledTimes( 2 );

		// ensure expected state was rendered
		expect( testInstance.findByType( 'div' ).props ).toEqual( {
			children: 'foo',
		} );

		// rerender with dependency changed
		// rerender with non dependency changed
		act( () => {
			renderer.update(
				<RegistryProvider value={ registry }>
					<TestComponent keyName="bar" change={ false } />
				</RegistryProvider>
			);
		} );

		expect( selectSpyFoo ).toHaveBeenCalledTimes( 2 );
		expect( selectSpyBar ).toHaveBeenCalledTimes( 1 );
		expect( TestComponent ).toHaveBeenCalledTimes( 3 );

		// ensure expected state was rendered
		expect( testInstance.findByType( 'div' ).props ).toEqual( {
			children: 'bar',
		} );
	} );
	describe( 'rerenders as expected with various mapSelect return ' +
		'types', () => {
		const getComponent = ( mapSelectSpy, dependencyKey ) => ( props ) => {
			const dependencies = props[ dependencyKey ];
			mapSelectSpy.mockImplementation(
				( select ) => select( 'testStore' ).testSelector( props.keyName )
			);
			const data = useSelect( mapSelectSpy, [ dependencies ] );
			return <div>{ data }</div>;
		};
		let selectorSpy,
			subscribedSpy,
			subscriberSpy,
			selectSpy,
			TestComponent;
		beforeEach( () => {
			selectorSpy = jest.fn();
			subscriberSpy = jest.fn().mockImplementation(
				( subscription ) => {
					subscribedSpy = subscription;
				}
			);
			registry.registerStore( 'testStore', {
				reducer: () => null,
				selectors: {
					testSelector: selectorSpy,
				},
			} );
			registry.subscribe = subscriberSpy;
			selectSpy = jest.fn();
			TestComponent = jest.fn().mockImplementation(
				getComponent( selectSpy, 'keyName' )
			);
		} );
		[
			[
				'boolean',
				[ false, true ],
			],
			[
				'number',
				[ 10, 20 ],
			],
			[
				'string',
				[ 'bar', 'cheese' ],
			],
			[
				'array',
				[ [ 10, 20 ], [ 10, 30 ] ],
			],
		].forEach(
			( [ type, testValues ] ) => {
				const [ valueA, valueB ] = testValues;
				it( `renders as expected with ${ type } return values`, () => {
					selectorSpy.mockReturnValue( valueA );
					let renderer;
					act( () => {
						renderer = TestRenderer.create(
							<RegistryProvider value={ registry }>
								<TestComponent keyName="foo" />
							</RegistryProvider>
						);
					} );
					const testInstance = renderer.root;
					// ensure expected state was rendered.
					expect( testInstance.findByType( 'div' ).props ).toEqual( {
						children: valueA,
					} );

					// update the reducer and trigger the subscription
					// which should trigger a re-render.
					act( () => {
						selectorSpy.mockReturnValue( valueB );
						subscribedSpy();
					} );
					expect( testInstance.findByType( 'div' ).props ).toEqual( {
						children: valueB,
					} );
					expect( selectSpy ).toHaveBeenCalledTimes( 3 );
				} );
			}
		);
	} );
} );

