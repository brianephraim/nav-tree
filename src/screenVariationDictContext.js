import createHocContext from './createHocContext';

const {
  ScreenVariationDictProvider,
  ScreenVariationDictConsumer,
  withScreenVariationDictConsumer,
} = createHocContext('screenVariationDict', {});
export {
  ScreenVariationDictProvider,
  ScreenVariationDictConsumer,
  withScreenVariationDictConsumer,
};
