import createHocContext from './createHocContext';

const { PathProvider, PathConsumer, withPathConsumer } = createHocContext(
  'path'
);
export { PathProvider, PathConsumer, withPathConsumer };
