import { makeRichKey } from './richKey';

function joinOrPassThrough(val,joinStr = '/'){
  if(Array.isArray(val)){
    return val.join(joinStr);
  }
  return val;
}

const getPathFromNavTree = (tree, path = []) => {
  let recurseResult;
  if (tree.screenCollection) {
    !!tree.screenCollection.find(item => {
      const { isCurrent } = item;
      if (isCurrent) {
        recurseResult = getPathFromNavTree(item, [...path, makeRichKey(item)]);
        return true;
      }
      return false;
    });
  }
  return joinOrPassThrough(recurseResult || path)
};

export default getPathFromNavTree;
