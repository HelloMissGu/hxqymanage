import React from 'react';
import { Card } from 'antd';

import Form from './Form';

const ChangePassword = () => (
  <Card
    title="修改密码"
    style={{ width: 300, margin: 'auto' }}
  >
    <Form />
  </Card>
);

export default ChangePassword;
