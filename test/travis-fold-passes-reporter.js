/**
 * External dependencies
 */
const { DefaultReporter } = require( '@jest/reporters' );

class TravisFoldPassesReporter extends DefaultReporter {
	startFold() {
		this.log( 'travis_fold:start:TravisFoldPassesReporter' );
	}

	endFold() {
		this.log( 'travis_fold:end:TravisFoldPassesReporter' );
	}

	onRunStart( ...args ) {
		super.onRunStart( ...args );
		this.startFold();
	}

	printTestFileFailureMessage( ...args ) {
		if ( args[ 2 ].failureMessage ) {
			this.endFold();
			super.printTestFileFailureMessage( ...args );
			this.startFold();
		} else {
			super.printTestFileFailureMessage( ...args );
		}
	}

	onRunComplete( ...args ) {
		this.endFold();
		super.onRunComplete( ...args );
	}
}

module.exports =
	'TRAVIS' in process.env && 'CI' in process.env ?
		TravisFoldPassesReporter :
		DefaultReporter;
