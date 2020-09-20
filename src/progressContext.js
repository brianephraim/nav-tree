import createHocContext from './createHocContext';

const {
  ProgressProvider,
  ProgressConsumer,
  withProgressConsumer,
} = createHocContext('progress');
export { ProgressProvider, ProgressConsumer, withProgressConsumer };
