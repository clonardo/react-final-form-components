import arrayMutators from 'final-form-arrays';
import PropTypes from 'prop-types';
import React from 'react';
import {Form as FinalForm, FormSpy} from 'react-final-form';
import _omit from 'lodash/omit'
import _isFunction from 'lodash/isFunction'

const onSubmit = async (values) => {
  console.warn('Implement onSubmit handler');
  console.warn(values);
};

class ContextWrapper extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.checkCondition = this.checkCondition.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.values = {};
  }

  static childContextTypes = {
    checkCondition: PropTypes.func.isRequired,
    isStatic: PropTypes.bool.isRequired,
    debug: PropTypes.bool.isRequired,
    status: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      checkCondition: this.checkCondition,
      isStatic: this.props.static,
      debug: this.props.debug,
      status: this.getStatus()
    };
  }

  getStatus() {
    const {dirty, dirtySinceLastSubmit, error, errors, invalid, pristine, submitError, submitErrors, submitFailed, submitSucceeded, submitting, valid, validating} = this.props;
    return {
      dirty, dirtySinceLastSubmit, error, errors, invalid, pristine, submitError, submitErrors, submitFailed, submitSucceeded, submitting, valid, validating
    };
  }

  checkCondition(args) {
    return args(this.props.values);
  }

  render() {
    if (this.props.debug) {
      return (
        <div>
          {this.props.children}
          <FormSpy subscription={{values: true}}>
            {({values}) => {
              if (this.props.listen && _isFunction(this.props.listen)) {
                this.props.listen(values);
              }

              return (
                <pre>
                  {JSON.stringify(values, 0, 2)}
                </pre>
              );
            }}
          </FormSpy>
        </div>)
    }

    return (
      <React.Fragment>
        {this.props.children}
        <FormSpy subscription={{values: true}} onChange={(props) => {
          if (this.props.listen && _isFunction(this.props.listen)) {
            this.props.listen(props.values);
          }
        }}/>
      </React.Fragment>
    );
  }
}

ContextWrapper.propTypes = {
  children: PropTypes.object,
  'static': PropTypes.bool,
  values: PropTypes.object,
  initialValues: PropTypes.object,
  debug: PropTypes.bool,
  listen: PropTypes.func
};

ContextWrapper.defaultProps = {
  'static': false,
  debug: false
};

class FormObj extends React.Component {
  render() {

    return (<FinalForm
      onSubmit={this.props.onSubmit || onSubmit}
      subscription={this.props.subscription}
      validate={this.props.validate || (() => ({
      }))}
      initialValues={this.props.initialValues || {}}
      mutators={{
        ...arrayMutators
      }}
      render={({handleSubmit, ...rest}) => {
        return (
          <ContextWrapper {..._omit(this.props, ['onSubmit', 'validate', 'initialValues', 'subscription'])} {...rest} >
            <form onSubmit={handleSubmit} className={this.props.className}>
              {this.props.children}
            </form>
          </ContextWrapper>);
      }}/>);
  }
}

FormObj.propTypes = {
  initialValues: PropTypes.object,
  subscription: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onSubmit: PropTypes.func,
  validate: PropTypes.func,
  className: PropTypes.string,
  listen: PropTypes.func,
  debug: PropTypes.bool
};
FormObj.defaultProps = {
  debug: false
};

export default FormObj;
