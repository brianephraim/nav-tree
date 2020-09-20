import React, { PureComponent } from 'react';

function capitalizeFirstLetter(string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}
function createHocContext(key, defaultVal) {
  const { Provider, Consumer } = React.createContext('');
  const capitalizedKey = capitalizeFirstLetter(key);
  return {
    [`${capitalizedKey}Provider`]: Provider,
    [`${capitalizedKey}Consumer`]: Consumer,
    [`with${capitalizedKey}Consumer`]: Comp => {
      class HocContext extends PureComponent {
        inner = value => {
          if (typeof defaultVal !== 'undefined' && !value) {
            value = defaultVal;
          }
          const propsToUse = { [key]: value };
          return <Comp {...this.props} {...propsToUse} />;
        };
        render() {
          return <Consumer>{this.inner}</Consumer>;
        }
      }
      return HocContext;
    },
  };
}

export default createHocContext;
