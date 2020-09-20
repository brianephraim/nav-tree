import React, { PureComponent } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import withScreenConfig from './withScreenConfig';

const noop = () => null;
class NavTreeButton_notConnected extends PureComponent {
  static propTypes = {
    onPress: PropTypes.func,
    updateNavTree: PropTypes.func.isRequired,
    comp: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  };
  static defaultProps = {
    onPress: noop,
    comp: null,
  };
  updateNavTree = () => {
    this.props.onPress(this.props);
    this.props.updateNavTree(this.props);
  };
  render() {
    const Comp = this.props.comp || TouchableOpacity;
    return <Comp {...this.props} onPress={this.updateNavTree} />;
  }
}

const NavTreeButton = withScreenConfig(NavTreeButton_notConnected);

export default NavTreeButton;
