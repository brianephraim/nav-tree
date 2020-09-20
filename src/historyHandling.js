import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

const noop = () => null;
export const history = {
  push: noop,
};

class HistoryHandling extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };
  static defaultProps = {
    children: null,
  };
  render(){
    return (
      <>
        {this.props.children}
      </>
    );
  }
}

export default HistoryHandling
