import createHocContext from './createHocContext';

const {
  ParamsDictProvider,
  ParamsDictConsumer,
  withParamsDictConsumer,
} = createHocContext('paramsDict', null);
export { ParamsDictProvider, ParamsDictConsumer, withParamsDictConsumer };
