import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, Easing, Platform, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { compose } from 'redux';
import shallowEqual from 'shallowequal';
import debounce from 'lodash.debounce';
import withScreenConfig from './withScreenConfig';
import { PathProvider } from './pathContext';
import { ProgressProvider } from './progressContext';
import { DirectionProvider } from './directionContext';
import { makeRichKey } from './richKey';
import { animations } from './animations';
import {
  screens,
  screenDefaultProps,
  parentScreenTypeWhiteLists,
} from './screens';
import {
  ParamsDictProvider,
  withParamsDictConsumer,
} from './paramsDictContext';
import {
  ScreenVariationDictProvider,
  withScreenVariationDictConsumer,
} from './screenVariationDictContext';
import panicActionCreator from './panic';
import {callbacks} from './registerCallback';
import registerListener, {listeners} from './registerListener';

const emptyObject = {};

let animatingIdIncrementer = 0;
const animatingIdRegistry = {};
function registerAnimatingId(animatingId,duration){
  animatingIdRegistry[animatingId] = true;
  // safety incase the animation handler fails
  // we don't want the app navigation locked up
  setTimeout(() => {
    delete animatingIdRegistry[animatingId];
  },duration * 1.5)
}
export function getIsAnimating(){
  return Object.keys(animatingIdRegistry).length;
}

let latestNavTreePath;
registerListener('onChange',({navTreePath}) => {
  latestNavTreePath = navTreePath
});


class Screen_notConnected extends Component {
  static propTypes = {
    transitionState: PropTypes.string,
    screenType: PropTypes.string.isRequired,
    parentScreenType: PropTypes.string,
    screenCollection: PropTypes.arrayOf(PropTypes.object),
    updateNavTree: PropTypes.func.isRequired,
    duration: PropTypes.number,
    transitionDone: PropTypes.func,
    shouldDestroyAfterTransition: PropTypes.bool,
    destroyAfterTransition: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    isCurrent: PropTypes.bool,
    index: PropTypes.number,
    panic: PropTypes.func.isRequired,
    screenVariationDict: PropTypes.object,
    makeAnimation: PropTypes.string,
    direction: PropTypes.number,
    paramProps: PropTypes.object,
    paramsDict: PropTypes.object,
  };
  static defaultProps = {
    transitionState: '',
    screenCollection: [],
    duration: 0,
    transitionDone: null,
    shouldDestroyAfterTransition: false,
    isCurrent: false,
    index: 0,
    parentScreenType: '',
    screenVariationDict: emptyObject,
    makeAnimation: null,
    direction: null,
    paramProps: null,
    paramsDict: null,
  };
  constructor(props) {
    super();

    const defaultProps = screenDefaultProps[props.screenType] || {};
    this.windowSizeListenerDebounced = debounce(this.windowSizeListener, 500);
    this.renderCount = 0;
    this.state = {
      resizeCount: 0,
      resizeCountRendered: 0,
      makeAnimation: null,
      x: 1,
      index: 0,
      paramProps: null,
      paramsDict: null,
      progress: new Animated.Value(0),
      animatedViewStyle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
      },
      screenVariation: defaultProps.screenVariation,
      screenVariationDict: {
        ...props.screenVariationDict,
        ...(defaultProps.screenVariation || {}),
      },
    };
    this.doAnim(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    // if (this.state.resizeCount !== nextState.resizeCount){
    //   return true;
    // }
    if (!shallowEqual(this.state, nextState)) {
      return true;
    }

    const {
      screenCollection: thisPropsScreenCollection,
      ...remainingThisProps
    } = this.props;
    const {
      screenCollection: nextScreenCollection,
      ...remainingNextProps
    } = nextProps;
    if (!shallowEqual(remainingThisProps, remainingNextProps)) {
      return true;
    }
    return false;
  }

  doAnim(props) {
    // console.log('Easing',{Easing});
    // this.animation && this.animation.stop;
    const animatingId = ++animatingIdIncrementer;
    registerAnimatingId(animatingId,props.duration);
    this.animation = Animated.timing(this.state.progress, {
      useNativeDriver: true,
      toValue: props.isCurrent ? 1 : 0,
      duration: props.duration,
      easing: Easing.quad,
      // easing: Easing.bezier(0, 0.55, 0.45, 1),
      // delay: 1,
      // easing: Easing.bezier(),

      // timing: Animated.spring,
      // stiffness: 1000,
      // damping: 500,
      // mass: 3,
    }).start(({ finished }) => {
      if (props.inOnComplete && props.isCurrent) {
        props.inOnComplete.forEach(item => {
          const callback = callbacks[item];
          callback && callback();
        })

      }
      listeners.onCompleteEnter.forEach(listener => {
        listener(latestNavTreePath);
      })
      props.transitionDone && props.transitionDone();
      if (props.shouldDestroyAfterTransition && finished) {
        props.destroyAfterTransition(props.path);
      }
      if (finished) {
        delete animatingIdRegistry[animatingId];
      }
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.isCurrent !== prevProps.isCurrent) {
      this.doAnim(this.props);
    }
  }
  static getDerivedStateFromProps(props, state) {

    const { makeAnimation, direction, index = 0 } = props;
    let nextState = null;
    if (
      makeAnimation !== state.makeAnimation ||
      direction !== state.direction ||
      index !== state.index ||
      state.resizeCountRendered !== state.resizeCount
    ) {
      nextState = {
        resizeCountRendered: state.resizeCount,
        makeAnimation,
        direction,
        index,
        animatedViewStyle: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          ...(Platform.OS === 'android' ? { zIndex: index + 1 } : {}),
          ...(makeAnimation
            ? animations[makeAnimation](state.progress, direction)
            : { opacity: state.progress }),
        },
      };
    }
    if (
      (props.paramProps !== state.paramProps)
      || (props.paramsDict !== state.paramsDict)
    ) {
      nextState = {
        ...(nextState || {}),
        paramProps: props.paramProps,
        paramsDict: {
          ...(props.paramsDict || {}),
          ...(props.paramProps || {}),
        },
      };
    }
    return nextState;
  }
  windowSizeListener = (x) => {
    this.setState({
      resizeCount: this.state.resizeCount + 1,
    });
  }
  componentWillUnmount(){
    this.windowSizeListenerDebounced.cancel();
    Dimensions.removeEventListener('change',this.windowSizeListenerDebounced)
  }
  componentDidMount() {
    Dimensions.addEventListener('change',this.windowSizeListenerDebounced)

    const { screenType, parentScreenType } = this.props;
    if (screenType !== 'Foundation') {
      if (
        !(parentScreenTypeWhiteLists[screenType] || []).includes(
          parentScreenType
        )
      ) {
        console.warn(
          `navTree/Screen.js error.  parent screenType ${parentScreenType} is not whitelisted for child ${screenType}`
        );
        setImmediate(this.props.panic);
      }
      if (!screens[screenType]) {
        console.warn(
          `navTree/Screen.js error.  screenType ${screenType} is not registered to screens dictionary.`
        );
        setImmediate(this.props.panic);
      }
    }
  }
  render() {
    const defaultProps = screenDefaultProps[this.props.screenType];
    const combinedProps = {
      ...defaultProps,
      ...this.props,
    };
    const {
      screenType,
      screenCollection,
      path,
      // currentChildScreenType,
      paramProps = emptyObject,
      screenComponentAboveScreenCollection,
      screenCollectionIsEmbeddedAsChild,
      screenVariation = emptyObject,
    } = combinedProps;

    const Comp = screens[screenType];
    if (!Comp) {
      return null;
    }

    const screenCollectionJsx = (
      <>
        {screenCollection.map((screenSettings, index) => {
          const nextPath = `${path}${path && '/'}${makeRichKey(
            screenSettings
          )}`;
          return (
            <PathProvider
              value={nextPath}
              key={makeRichKey(screenSettings)}
              screenType={screenSettings.screenType}
            >
              <Screen
                {...screenSettings}
                path={nextPath}
                index={Platform.OS === 'android' ? index : 0}
                parentScreenType={screenType}
              />
            </PathProvider>
          );
        })}
      </>
    );
    const compPrepared = (
      <Comp {...paramProps} {...screenVariation}>
        {screenCollectionIsEmbeddedAsChild && screenCollectionJsx}
      </Comp>
    );
    return (
      <ScreenVariationDictProvider value={this.state.screenVariationDict}>
        <ParamsDictProvider value={this.state.paramsDict}>
          <DirectionProvider value={this.state.direction}>
            <ProgressProvider value={this.state.progress}>
              <Animated.View style={this.state.animatedViewStyle}>
                {!screenComponentAboveScreenCollection && compPrepared}
                {!screenCollectionIsEmbeddedAsChild && screenCollectionJsx}
                {!!screenComponentAboveScreenCollection && compPrepared}
              </Animated.View>
            </ProgressProvider>
          </DirectionProvider>
        </ParamsDictProvider>
      </ScreenVariationDictProvider>
    );
  }
}
const Screen = compose(
  withScreenVariationDictConsumer,
  withParamsDictConsumer,
  withScreenConfig,
  connect(
    null,
    {
      panic: panicActionCreator,
    }
  )
)(Screen_notConnected);

export default Screen;
