const emptyObject = {};
export function makeRichKey(screenSettings) {
  const { paramProps = emptyObject } = screenSettings;
  const paramPropsKeys = Object.keys(paramProps);
  const paramPropsFilteredKeys = paramPropsKeys
    .sort();
  let propsPartAsString = paramPropsFilteredKeys
    .map(propName => {
      /* warn if value contains { or [ */
      if ((/[{[]/).test(paramProps[propName]) ) {
        console.warn(`paramProps should be flat, but found an object like  string, ${propName}: ${paramProps[propName]}`,paramProps)
      }
      return `${propName}$$${paramProps[propName]}`;
    });
  propsPartAsString = propsPartAsString && propsPartAsString.join(',');
  propsPartAsString = `${propsPartAsString ? '__' : ''}${propsPartAsString}`;
  return `${screenSettings.screenType}${propsPartAsString || ''}`;
}

export function assumeValueType(propValue){
  if(propValue === 'NaN'){
    propValue = NaN;
  } else if(propValue === 'true'){
    propValue = true;
  } else if(propValue === 'false'){
    propValue = false;
  } else if(propValue === 'null'){
    propValue = null;
  } else if(propValue === 'undefined'){
    propValue = undefined;
  } else if(`${+propValue}` === propValue){
    // is number
    propValue = +propValue;
  }
  return propValue;
}

export function parseRichKey(richKey) {
  const pathItemSplit = richKey.split('__');
  const screenType = pathItemSplit[0];
  let propsToPass = pathItemSplit[1];
  propsToPass = !propsToPass ? [] : propsToPass.split(',');
  propsToPass = propsToPass.reduce((accum, item) => {
    const itemSplit = item.split('$$');
    const propValue = assumeValueType(itemSplit[1]);
    accum[itemSplit[0]] = propValue;
    return accum;
  }, {});
  return {
    // ...propsToPass,
    screenType,
    paramProps: propsToPass,
  };
}
