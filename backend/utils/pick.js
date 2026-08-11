module.exports = (source, fields) => fields.reduce((result, field) => {
  if (source && Object.prototype.hasOwnProperty.call(source, field)) result[field] = source[field];
  return result;
}, {});
