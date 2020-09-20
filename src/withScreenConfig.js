import React, {PureComponent} from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withPathConsumer } from './pathContext';
import getScreenSummary from './getScreenSummary';
import destroyAfterTransition from './destroyAfterTransition';
import updateNavTree from './updateNavTree';
import { makeRichKey } from './richKey';
import getPathFromNavTree from './getPathFromNavTree';

const withScreenConfigProps = compose(
  withPathConsumer,
  connect(
    ({ navTree }, props) => {
      if (props.isRoot) {
        // console.log('navTree.screenCollection',navTree);
        return {
          isCurrent: true,
          currentChildScreenType:
            navTree.screenCollection &&
            navTree.screenCollection.find(item => item.isCurrent),
          screenCollectionList: navTree.screenCollection
            .reduce((accum, item) => {
              accum.push(makeRichKey(item));
              return accum;
            }, [])
            .join(','),
        };
      }
      const { path } = props;
      let foundScreenConfig;
      let screenSummary = {};
      let screenTypeToGoBackTo = null;
      if (path) {
        screenSummary = getScreenSummary(path, navTree);
        const {config,parentScreenCollection} = screenSummary;
        foundScreenConfig = config;
        if (parentScreenCollection){
          const screenConfigToGoBackTo =
            parentScreenCollection[parentScreenCollection.length - 2] || {};
          screenTypeToGoBackTo = screenConfigToGoBackTo.screenType;
        }
      }
      const { screenCollection, ...remainingFoundScreenConfig } =
        foundScreenConfig || {};
      const currentScreen =
        screenCollection && screenCollection.find(item => item.isCurrent);
      const currentChildScreenType = currentScreen && currentScreen.screenType;
      const currentChildScreenParamProps = currentScreen && currentScreen.paramProps
      const focusPath = getPathFromNavTree(navTree);
      return {
        ...remainingFoundScreenConfig,
        focusPath,
        isFocusPath: focusPath === path,
        currentSiblingScreenType: screenSummary.currentSiblingScreenType,
        currentChildScreenType,
        currentChildScreenParamProps,
        screenTypeToGoBackTo,
        screenCollectionList:
          screenCollection &&
          screenCollection
            .reduce((accum, item) => {
              accum.push(makeRichKey(item));
              return accum;
            }, [])
            .join(','),
      };
    },
    {
      destroyAfterTransition,
      updateNavTree,
      setHardwareBackButton: settings => dispatch =>
        dispatch({
          type: 'SET_HARDWARE_BACK_BUTTON_DETAILS',
          ...settings,
        }),
    }
  )
);

function withScreenConfig(Comp){
  class ScreenConfig extends PureComponent {
    constructor(){
      super();
      this.state = {
        hardwareBackButtonSettings: null,
      };
    }
    static propTypes = {
      setHardwareBackButton: PropTypes.func.isRequired,
      focusPath: PropTypes.string,
      path: PropTypes.string,
    };
    static defaultProps = {
      focusPath: '',
      path: '',
    };
    bindHardwareBackButton = (hardwareBackButtonSettings) => {
      this.setState({hardwareBackButtonSettings});
      if (hardwareBackButtonSettings){
        this.props.setHardwareBackButton(hardwareBackButtonSettings);
      }
    };
    componentDidUpdate(prevProps){
      const {hardwareBackButtonSettings} = this.state;
      if (
        hardwareBackButtonSettings
        && (this.props.focusPath === this.props.path)
        && (this.props.focusPath !== prevProps.focusPath)
      ){
        this.props.setHardwareBackButton(hardwareBackButtonSettings);
      }
    }
    render(){
      return (
        <Comp {...this.props} bindHardwareBackButton={this.bindHardwareBackButton} />
      );
    }
  }

  return withScreenConfigProps(ScreenConfig)
}


export default withScreenConfig;
