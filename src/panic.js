import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

let panic = () => {};
export function registerPanic(func) {
  panic = func;
}

const panicActionCreator = (...args) => {
  return dispatch => {
    dispatch(panic(...args));
  };
};

export default panicActionCreator;

const withPanic = connect(null,{
  panic: panicActionCreator,
})
export function withPanicOnError(Comp){
  class PanicOnError extends PureComponent {
    static propTypes = {
      panic: PropTypes.func.isRequired,
    };
    state = {};
    static getDerivedStateFromError(/* error */) {
      return {
        panicTimestamp: Date.now(),
      };
    }
    componentDidCatch(/* error, errorInfo */){
      this.props.panic();
    }
    render(){
      if (this.state.panicTimestamp){
        return null;
      }
      return <Comp {...this.props} />;
    }
  }
  return withPanic(PanicOnError);
}
export function withShouldPanic(Comp){
  class ShouldPanic extends PureComponent {
    static propTypes = {
      shouldPanic: PropTypes.bool,
      panic: PropTypes.func.isRequired,
    };
    static defaultProps = {
      shouldPanic: false,
    };
    state = {};
    static getDerivedStateFromProps(props){
      if(props.shouldPanic){
        console.log('PANIC')
        props.panic();
      }
      return null;
    }
    render(){
      if (this.props.shouldPanic){
        return null;
      }
      return (
        <Comp {...this.props} />
      );
    }
  }
  return withPanic(ShouldPanic);
}
