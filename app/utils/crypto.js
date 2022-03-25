const CryptoJS = require("crypto-js");

const secret = "becehdbedbejkdjdwdnwjkdnwdjxkwndwd";

const encrypt = (password) => {
  return CryptoJS.AES.encrypt(password, secret).toString();
};

const decrypt = (hash) => {
  const bytes = CryptoJS.AES.decrypt(hash.toString(), secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encrypt,
  decrypt,
};
