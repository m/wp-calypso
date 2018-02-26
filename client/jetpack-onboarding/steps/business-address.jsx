/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { get, map, omit, reduce, some } from 'lodash';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingBusinessAddressStep extends React.PureComponent {
	static emptyFields = {
		city: '',
		name: '',
		state: '',
		street: '',
		zip: '',
		country: '',
	};

	state = {
		fields: get( this.props.settings, 'businessAddress' ) || this.constructor.emptyFields,
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequestingSettings && ! nextProps.isRequestingSettings ) {
			this.setState( {
				fields: get( nextProps.settings, 'businessAddress' ) || this.constructor.emptyFields,
			} );
		}
	}

	getChangeHandler = field => event => {
		this.setState( {
			fields: {
				...this.state.fields,
				[ field ]: event.target.value,
			},
		} );
	};

	fields = this.getFields();

	getFields() {
		const { translate } = this.props;

		return {
			name: translate( 'Business name' ),
			street: translate( 'Street address' ),
			city: translate( 'City' ),
			state: translate( 'State / Region / Province' ),
			zip: translate( 'ZIP code' ),
			country: translate( 'Country' ),
		};
	}

	handleSubmit = event => {
		event.preventDefault();
		if ( this.props.isRequestingSettings ) {
			return;
		}

		const { settings, siteId } = this.props;

		this.props.recordJpoEvent(
			'calypso_jpo_business_address_submitted',
			reduce(
				this.fields,
				( eventProps, value, field ) => {
					const changed =
						get( settings, [ 'businessAddress', field ] ) !== this.state.fields[ field ];
					eventProps[ `${ field }_changed` ] = changed;
					return eventProps;
				},
				{}
			)
		);

		this.props.saveJpoSettings( siteId, { businessAddress: this.state.fields } );

		page( this.props.getForwardUrl() );
	};

	hasEmptyFields = () => {
		return some( omit( this.state.fields, 'state' ), val => val === '' );
	};

	renderForm() {
		const { isRequestingSettings, translate } = this.props;
		const headerText = translate( 'Add a business address.' );
		const subHeaderText = (
			<Fragment>
				{ translate(
					'Enter your business address to add a widget containing your address to your website.'
				) }
				<br />
				{ translate(
					'You can add a map based on this information and change where this widget is located later on.'
				) }
			</Fragment>
		);
		return (
			<Fragment>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form onSubmit={ this.handleSubmit }>
						{ map( this.fields, ( fieldLabel, fieldName ) => {
							const isValidatingField = ! isRequestingSettings && fieldName !== 'state';
							const isValidField = this.state.fields[ fieldName ] !== '';

							return (
								<FormFieldset key={ fieldName }>
									<FormLabel htmlFor={ fieldName }>{ fieldLabel }</FormLabel>
									<FormTextInput
										autoFocus={ fieldName === 'name' }
										disabled={ isRequestingSettings }
										id={ fieldName }
										isError={ isValidatingField && ! isValidField }
										isValid={ isValidatingField && isValidField }
										onChange={ this.getChangeHandler( fieldName ) }
										value={ this.state.fields[ fieldName ] || '' }
									/>
									{ isValidatingField &&
										! isValidField && (
											<FormInputValidation
												isError
												text={ translate( 'Please enter a %(fieldLabel)s', {
													args: { fieldLabel },
												} ) }
											/>
										) }
								</FormFieldset>
							);
						} ) }
						<Button
							disabled={ isRequestingSettings || this.hasEmptyFields() }
							primary
							type="submit"
						>
							{ translate( 'Next Step' ) }
						</Button>
					</form>
				</Card>
			</Fragment>
		);
	}

	render() {
		const { basePath, translate } = this.props;

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Business Address ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.BUSINESS_ADDRESS, ':site' ].join( '/' ) }
					title="Business Address ‹ Jetpack Start"
				/>

				{ this.renderForm() }
			</div>
		);
	}
}

export default localize( JetpackOnboardingBusinessAddressStep );
