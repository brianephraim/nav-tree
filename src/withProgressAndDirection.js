import { compose } from 'redux';
import { withDirectionConsumer } from './directionContext';
import { withProgressConsumer } from './progressContext';

export default compose(
  withDirectionConsumer,
  withProgressConsumer
);
