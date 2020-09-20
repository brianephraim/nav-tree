export const screens = {};
export const screenDefaultProps = {};
export const parentScreenTypeWhiteLists = {};
export function registerScreen(
  screenType,
  Comp,
  parentScreenTypeWhiteList = ['empty parentScreenTypeWhiteList'],
  defaultProps = {}
) {
  screens[screenType] = Comp;
  screenDefaultProps[screenType] = defaultProps;
  parentScreenTypeWhiteLists[screenType] = parentScreenTypeWhiteList;
}

export function validateNavTreePath(pathCacheToValidate){
  const isValid = pathCacheToValidate.split('/').map(item => item.split('__')[0]).reduce((accum, parent, index, array) => {
    if(!accum){
      return accum;
    }
    const child = array[index +1];
    if (child){
      accum = parentScreenTypeWhiteLists[child] && parentScreenTypeWhiteLists[child].includes(parent);
    }
    return accum;
  },true);
  return !!isValid;
}
