const validatePhoneNumber = (number) => {
  return number.match(/^[0]\d{10}$/) !== null ? number : undefined;
};

const appendCountryCode = (number) => {
  return { msidn: `${number}`, msgid: "1111" };
};

module.exports = {
  validatePhoneNumber,
  appendCountryCode,
};
