const validateNumber = ({ min = -Infinity, max = Infinity, integer = false } = {}) => (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return '请输入数字';
  if (integer && number % 1 !== 0) return '请输入整数';
  if (number < min) return `数字不能小于${min}`;
  if (number > max) return `数字不能大于${max}`;
  return undefined;
};

const validateMobile = (value) => {
  if (value === '') return '请输入手机号';
  if (!/^1\d{10}$/.test(value)) return '请输入中国大陆手机号';
  return undefined;
};

const validatePassword = (value) => {
  if (value === '') return '请输入密码';
  if (value.length < 4) return '请输入至少4位密码';
  return undefined;
};

const validateLiveTitle = (value) => {
  if (value === '') return '请输入直播标题';
  if (value.length > 12) return '直播标题不能超过12字';
  return undefined;
};
export {
  validateNumber, validateMobile, validatePassword, validateLiveTitle,
};
