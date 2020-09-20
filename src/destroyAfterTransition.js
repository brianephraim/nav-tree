import produce from 'immer';
import shallowEqual from 'shallowequal';
import getScreenSummary from './getScreenSummary';
import { parseRichKey } from './richKey';

const destroyAfterTransition = path => (dispatch, getState) => {
  const { navTree } = getState();
  const nextNavTree = produce(navTree, draftState => {
    const pathSplit = path.split('/');
    const richKey = pathSplit.pop();
    const parsedRichKey = parseRichKey(richKey);
    const parentScreenConfig = getScreenSummary(pathSplit, draftState).config;
    const indexToSplice = parentScreenConfig.screenCollection.findIndex(
      screenConfig => {
        return (
          screenConfig.screenType === parsedRichKey.screenType &&
          shallowEqual(screenConfig.paramProps, parsedRichKey.paramProps)
        );
      }
    );
    if (indexToSplice === -1) {
      console.warn(
        `screen ${path} was supposed to be destroyed after transition but it wasn't found`
      );
    } else {
      parentScreenConfig.screenCollection.splice(indexToSplice, 1);
    }
  });
  dispatch({
    type: 'UDATE_REDUX_NAV',
    tree: nextNavTree,
  });
};

export default destroyAfterTransition;
