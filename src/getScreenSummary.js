import { parseRichKey } from './richKey';
import doScreenConfigsMatch from './doScreenConfigsMatch';

function getScreenSummary(pathArray, config) {
  const navTree = config && (config.config || config);
  if (typeof pathArray === 'string') {
    pathArray = pathArray.split('/');
  }
  if (!navTree) {
    return {
      config: null,
    };
  }
  if (!navTree.screenCollection || pathArray.length === 0) {
    return {
      config: navTree,
    };
  }
  const firstPathItem = pathArray[0];
  let foundScreenConfig;
  let currentSiblingScreenType;
  let currentScreenConfig;
  navTree.screenCollection.forEach(item => {
    const { screenType, isCurrent } = item;

    const parsedRichKey = parseRichKey(firstPathItem);

    if (doScreenConfigsMatch(item, parsedRichKey)) {
      foundScreenConfig = item;
    }

    if (isCurrent) {
      currentSiblingScreenType = screenType;
      currentScreenConfig = item;
    }
  });
  if (!foundScreenConfig) {
    return {
      config: null,
    };
  }
  const remainingPathArray = pathArray.splice(1);
  if (!remainingPathArray.length) {
    return {
      config: foundScreenConfig,
      currentSiblingScreenType,
      currentScreenConfig,
      parentScreenCollection: navTree.screenCollection,
    };
  }
  return getScreenSummary(remainingPathArray, foundScreenConfig);
}

export default getScreenSummary;
