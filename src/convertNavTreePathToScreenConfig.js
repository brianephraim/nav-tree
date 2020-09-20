import {parseRichKey} from './richKey';

function convertNavTreePathToScreenConfig(navTreePath, isInit = true) {
  let screens = navTreePath.split('/');
  screens = screens.map(richKey => {
    const parsedRichKey = parseRichKey(richKey);
    return {
      isCurrent: true,
      screenType:parsedRichKey.screenType,
      paramProps: parsedRichKey.paramProps,
    };
  });
  if (isInit) {
    screens = screens.reduce(
      (accum, item, i) => {
        if (isInit && i === 0) {
          accum = {
            isCurrent: true,
            screenType: 'Foundation',
            screenCollection: [item],
          };
        }
        const next = screens[i + 1];
        if (next) {
          item.screenCollection = [next];
        }
        return accum;
      },
      isInit ? screens[0] : {}
    );
  } else {
    screens = screens.reduce((accum, item, i) => {
      const next = screens[i + 1];
      if (next) {
        item.screenCollection = [next];
      }
      return accum;
    }, screens[0]);
  }
  return screens;
}

export default convertNavTreePathToScreenConfig;
