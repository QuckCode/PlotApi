function omitPrivate(obj) {
  delete obj.__v;
  return obj;
}

// schema options
const options = {
  toJSON: {
    transform: omitPrivate,
  },
};

module.exports = {
  options,
};
