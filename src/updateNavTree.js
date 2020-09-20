import produce from 'immer';
import {listeners} from './registerListener';
import getScreenSummary from './getScreenSummary';

import doScreenConfigsMatch from './doScreenConfigsMatch';
import getPathFromNavTree from './getPathFromNavTree';
import {validateNavTreePath} from './screens';
import {getIsAnimating} from './Screen';
import {history} from './historyHandling';

// const logger = console.log;
const logger = () => {};

const emptyObject = {};

export const checkIsUpdateNavTreeObject = ({toScreenType,toScreenConfig}) => {
  return !!(toScreenType || toScreenConfig);
};

const instructReduxNavUpdate = props => (dispatch, getState) => {
  if (getIsAnimating()){
    // return null;
  }
  logger('--', props);
  let {
    path = '',
    inDuration = 0,
    outDuration = 0,
  } = props;
  const standardTime = 300;
  if (inDuration === 501) {
    inDuration = standardTime;
  }
  if (outDuration === 501) {
    outDuration = standardTime;
  }
  const {

    toScreenType,
    outMakeAnimation = 'noop',
    inMakeAnimation = 'noop',
    toScreenConfig,
    targetChildScreenCollection,
    screenCollectionToTarget,
    toParamProps = emptyObject,
    isDestructive = false,
    asOverlay = false,
    isUnshift = false,
    reverseDirection = false,
    prevScreenType = false,
    prevParamProps = emptyObject,
    isInit = false,
    screenOrder = null,
    destroyScreensBetween = false,
    preservePrev = false,
    shouldCache = true,
    trackPrev = true,
    inOnComplete = null,
    ensureWebUrl = false,
  } = props;
  if (asOverlay && path.includes('/')) {
    /* eslint-disable prefer-destructuring */
    path = path.split('/')[0];
    /* eslint-enable prefer-destructuring */
  }
  logger('a');
  if (isInit) {
    return dispatch({
      type: 'UDATE_REDUX_NAV',
      tree: toScreenConfig,
    });
  }
  logger('b');
  const { navTree } = getState();
  let pathSplit = path.split('/');
  const nextNavTree = produce(navTree, draftState => {
    let nextCurrent = null;
    let nextIndex = null;
    let prevIndex = null;
    let oldScreenConfig;

    let oldDirection = -1;
    const findOldScreenConfig = (item, index) => {
      if (item.isCurrent) {
        prevIndex = index;
        return true;
      }
      return false;
    };
    // asOverlay screenCollectionToTarget draftState pathSplit
    // oldScreenConfig pathSplit screenConfigWithTargetedScreenCollection prevIndex

    let screenConfigWithTargetedScreenCollection;
    if (asOverlay || screenCollectionToTarget === 'Foundation') {
      logger('z');
      oldScreenConfig = draftState.screenCollection.find(findOldScreenConfig);
      screenConfigWithTargetedScreenCollection = draftState;
    } else if (screenCollectionToTarget) {
      logger('y');
      const targetedScreenPathIndexOfScreenConfigOfScreenCollectionToTarget = pathSplit
        .map(screenType => screenType === screenCollectionToTarget)
        .lastIndexOf(true);
      const index = targetedScreenPathIndexOfScreenConfigOfScreenCollectionToTarget;
      pathSplit = pathSplit.slice(0, index + 1);
      const screenSummaryWithTargetedScreenCollection = getScreenSummary(
        pathSplit,
        draftState
      );
      screenConfigWithTargetedScreenCollection =
        screenSummaryWithTargetedScreenCollection.config;
      oldScreenConfig = screenConfigWithTargetedScreenCollection.screenCollection.find(
        findOldScreenConfig
      );
    } else {

      logger('x');
      oldScreenConfig = getScreenSummary(path, draftState).config;
      pathSplit.pop();
      if (targetChildScreenCollection) {
        logger('w');
        screenConfigWithTargetedScreenCollection = oldScreenConfig;
        oldScreenConfig = oldScreenConfig.screenCollection.find(
          findOldScreenConfig
        );
      } else {
        logger('v');
        screenConfigWithTargetedScreenCollection = getScreenSummary(
          pathSplit,
          draftState
        ).config;
        prevIndex = screenConfigWithTargetedScreenCollection.screenCollection.indexOf(
          oldScreenConfig
        );
      }
    }
    logger('c');
    let currentScreenConfigIndex = null;
    screenConfigWithTargetedScreenCollection.screenCollection.forEach(
      (item, index) => {
        if (doScreenConfigsMatch(item, oldScreenConfig)) {
          prevIndex = index;
        }
        let toCompare = {
          screenType: toScreenType,
          paramProps: toParamProps,
        };
        if (!toScreenType) {
          currentScreenConfigIndex === null &&
            screenConfigWithTargetedScreenCollection.screenCollection.find(
              (item, index) => {
                if (item.isCurrent) {
                  currentScreenConfigIndex = index;
                  return true;
                }
                return false;
              }
            );
          if (currentScreenConfigIndex) {
            toCompare = {
              screenType:
                screenConfigWithTargetedScreenCollection.screenCollection[
                  currentScreenConfigIndex - 1
                ].screenType,
              paramProps:
                screenConfigWithTargetedScreenCollection.screenCollection[
                  currentScreenConfigIndex - 1
                ].paramProps,
            };
          }
        }
        logger('toCompare1', toCompare);
        if (toScreenConfig) {
          toCompare = {
            screenType: toScreenConfig.screenType,
            paramProps: toScreenConfig.paramProps,
          };
        }
        logger('toCompare2', toCompare);
        if (!toCompare.screenType) {
          logger('prevScreenType', prevScreenType);
          toCompare = {
            screenType: prevScreenType,
            paramProps: prevParamProps,
          };
        }
        logger('toCompare3', toCompare);
        if (doScreenConfigsMatch(item, toCompare, true)) {
          nextIndex = index;
          nextCurrent = item;
        }
      }
    );

    logger('d');
    if (screenOrder) {
      screenOrder.forEach((item, index) => {
        if (doScreenConfigsMatch(item, oldScreenConfig)) {
          // console.log('item.screenType',item.screenType);
          // console.log('item.paramProps',item.paramProps.tab);
          // console.log('oldScreenConfig.screenType',oldScreenConfig.screenType);
          // console.log('oldScreenConfig.paramProps',oldScreenConfig.paramProps.tab);
          prevIndex = index;
        }
        if (
          doScreenConfigsMatch(item, {
            screenType: prevScreenType,
            paramProps: prevParamProps,
          })
        ) {
          // console.log('item.screenType',item.screenType);
          // console.log('item.paramProps',item.paramProps.tab);
          // console.log('prevScreenType',prevScreenType);
          // console.log('prevParamProps',prevParamProps.tab);
          nextIndex = index;
        }
      });
    }
    logger('e');
    const directionModifier = reverseDirection && !nextCurrent ? -1 : 1;
    const durationMultiplier = 1;
    if (nextCurrent) {
      logger('e1');
      if (doScreenConfigsMatch(oldScreenConfig, nextCurrent)) {
        return draftState;
      }
      nextCurrent.isCurrent = true;
      nextCurrent.duration = inDuration * durationMultiplier;
      nextCurrent.makeAnimation = inMakeAnimation;
      logger('e2');
      const direction = Math.sign(nextIndex - prevIndex);
      nextCurrent.direction = direction * directionModifier;
      if (toScreenConfig && toScreenConfig.screenCollection) {
        nextCurrent.screenCollection = toScreenConfig.screenCollection;
      }
      oldDirection = -direction;
      logger('e3');
    } else {
      logger('e4');
      const direction = screenOrder ? Math.sign(nextIndex - prevIndex) : 1;
      if (screenOrder) {
        oldDirection = -direction;
      }
      logger('e5', oldScreenConfig);
      let paramPropsToUse = toParamProps;
      if (!toScreenType && !toScreenConfig) {
        paramPropsToUse = prevParamProps;
      }
      nextCurrent = {
        isCurrent: true,
        screenType: toScreenType || prevScreenType,
        duration: inDuration * durationMultiplier,
        makeAnimation: inMakeAnimation,
        direction: direction * directionModifier,
        paramProps: paramPropsToUse,
        prevScreenType: trackPrev && oldScreenConfig && oldScreenConfig.screenType,
        prevParamProps: trackPrev && oldScreenConfig && oldScreenConfig.paramProps,
        inOnComplete,
        ...(toScreenConfig || {}),
      };
      logger('e6', nextCurrent);
      const methodToUse = isUnshift ? 'unshift' : 'push';
      screenConfigWithTargetedScreenCollection.screenCollection[methodToUse](
        nextCurrent
      );
    }
    if (destroyScreensBetween) {
      logger('e7');
      if (nextIndex === null) {
        nextIndex = isUnshift
          ? 0
          : screenConfigWithTargetedScreenCollection.screenCollection.length;
        prevIndex = isUnshift ? prevIndex + 1 : prevIndex;
      }
      logger('e8');
      screenConfigWithTargetedScreenCollection.screenCollection = screenConfigWithTargetedScreenCollection.screenCollection.filter(
        (item, index) => {
          const allow =
            index <= Math.min(nextIndex, prevIndex) ||
            index >= Math.max(nextIndex, prevIndex);
          return allow;
        }
      );
    }
    logger('e9');
    logger('f');
    if (!preservePrev) {
      nextCurrent.prevScreenType =
        trackPrev && oldScreenConfig && oldScreenConfig.screenType;
      nextCurrent.prevParamProps =
        trackPrev && oldScreenConfig && oldScreenConfig.paramProps;
    }
    if (oldScreenConfig) {
      oldScreenConfig.isCurrent = false;
      oldScreenConfig.duration = outDuration * durationMultiplier;
      oldScreenConfig.makeAnimation = outMakeAnimation;
      oldScreenConfig.direction = oldDirection * directionModifier;
      oldScreenConfig.shouldDestroyAfterTransition = isDestructive;
    }
    pathSplit.push(nextCurrent.screenType);

    nextCurrent.shouldDestroyAfterTransition = false;
    return undefined;
  });
  logger('g');
  const navTreePath = getPathFromNavTree(nextNavTree);
  if (shouldCache || ensureWebUrl) {
    history.push(`/${navTreePath}`);
  }
  logger('h', nextNavTree);
  if (logger === console.log) {
    console.log(JSON.stringify(nextNavTree,null,2));
    console.log('------ NAV TREE NAVIGATED TO ------');
    console.log(navTreePath);
  }

  const isValid = validateNavTreePath(navTreePath);
  if (!isValid){
    console.log('invalid navTreePath avoided!',navTreePath);
    return null;
  }
  console.log('navTreePath',navTreePath);

  listeners.onChange.forEach(listener => {
    listener({
      navTree: nextNavTree,
      navTreePath,
    });
  })
  return dispatch({
    type: 'UDATE_REDUX_NAV',
    tree: nextNavTree,
    navTreePathToCache: shouldCache ? navTreePath : '',
    navTreePath,
  });
};

export default instructReduxNavUpdate;
