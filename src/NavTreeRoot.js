import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Screen from './Screen';
import { registerScreen } from './screens';

const emptyArray = [];

class Root_notConnected extends PureComponent {
  static propTypes = {
    screenType: PropTypes.string.isRequired,
    screenCollection: PropTypes.arrayOf(PropTypes.object),
  };
  static defaultProps = {
    screenCollection: emptyArray,
  };
  render() {
    return (
      <Screen
        screenType={this.props.screenType}
        screenCollection={this.props.screenCollection}
        isCurrent
        isRoot
      />
    );
  }
}
const NavTreeRoot = connect(({ navTree }) => {
  return navTree;
})(Root_notConnected);
export default NavTreeRoot;

class Foundation extends PureComponent {
  render() {
    return null;
  }
}
registerScreen('Foundation', Foundation);

export const navTreeReducer = (
  state = {
    screenType: 'Foundation',
    isCurrent: true,
    screenCollection: emptyArray,
  },
  action
) => {
  if (action.type === 'UDATE_REDUX_NAV') {
    return action.tree;
  }
  return state;
};
