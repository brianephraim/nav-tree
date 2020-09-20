export const listeners = {
  onChange: [],
  onCompleteEnter: [],
};
const registerListener = (type,listener) => {
  const listenerGroup = listeners[type];
  listenerGroup && listenerGroup.push(listener);
};

export default registerListener;
