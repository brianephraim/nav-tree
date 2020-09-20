import shallowEqual from 'shallowequal';

const emptyObject = {};
function doScreenConfigsMatch(configA, configB) {
  if (!configA || !configB || configA.screenType !== configB.screenType) {
    return false;
  }
  const toReturn = shallowEqual(
    configA.paramProps || emptyObject,
    configB.paramProps || emptyObject
  );
  return toReturn;
}
export default doScreenConfigsMatch;
