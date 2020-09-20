const callbacks = {};
const registerCallback = (name,cb) => {
  callbacks[name] = cb;
};

export {callbacks};

export default registerCallback;
