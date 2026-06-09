
import pool from '../config/db.js';

const maskMobile = (phone) => {
  if (!phone) return "";
  return phone.replace(/^(\d{2})(\d{6})(\d{2})$/, "$1XXXXXX$3"); // Displays as 98XXXXXX52 [cite: 655]
};

const maskEmail = (email) => {
  if (!email) return "";
  const [account, host] = email.split('@');
  if (account.length <= 2) return `*${host}`;
  return `${account.substring(0, 2)}******@${host}`;
};


const enforceDataMasking = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }

  const originalJson = res.json;

  res.json = function (data) {
    if (Array.isArray(data)) {
      const maskedArray = data.map(item => ({
        ...item,
        mobile_raw: maskMobile(item.mobile_raw),
        email_raw: maskEmail(item.email_raw),
        is_masked: true
      }));
      return originalJson.call(this, maskedArray);
    } else if (data && data.id) {
      const maskedObject = {
        ...data,
        mobile_raw: maskMobile(data.mobile_raw),
        email_raw: maskEmail(data.email_raw),
        is_masked: true
      };
      return originalJson.call(this, maskedObject);
    }
    return originalJson.call(this, data);
  };

  next();
};

export default enforceDataMasking;