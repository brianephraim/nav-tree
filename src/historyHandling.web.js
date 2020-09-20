import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { createBrowserHistory as createHistory } from 'history';
import updateNavTree from './updateNavTree';
import convertNavTreePathToScreenConfig from './convertNavTreePathToScreenConfig';

export const history = createHistory({
  basename: `${window.location.pathname}#`
});

function removeLeadingSlash(str) {
  return str.replace(/^\/+/, '');
}

class HistoryHandling extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    navigateHistory: PropTypes.func.isRequired,
  };
  static defaultProps = {
    children: null,
  };
  componentDidMount(){
    this.unlisten = history.listen((location, action) => {
      // if (action === 'PUSH'){
      //   //
      // }
      if (action === 'POP') {
        this.props.navigateHistory(location.pathname);
      }
    });
  }
  componentWillUnmount(){
    this.unlisten && this.unlisten();
  }
  render(){
    return (
      <>
        {this.props.children}
      </>
    );
  }
}

export default connect(null,{
  navigateHistory: (navTreePath) => dispatch => {
    navTreePath = removeLeadingSlash(navTreePath)
    const config = convertNavTreePathToScreenConfig(
      navTreePath
    );
    dispatch(
      updateNavTree({
        toScreenConfig: config,
        isInit: true,
      })
    );
  },
})(HistoryHandling);
