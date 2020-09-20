import createHocContext from './createHocContext';

const {
  DirectionProvider,
  DirectionConsumer,
  withDirectionConsumer,
} = createHocContext('direction');
export { DirectionProvider, DirectionConsumer, withDirectionConsumer };
