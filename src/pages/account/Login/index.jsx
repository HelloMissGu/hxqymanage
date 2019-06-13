import React from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { Card } from 'antd';

import { withFetch } from '../../../utils/fetch';
import Form from './Form';

const Login = ({ location: { state: { from } = { from: { pathname: '/' } } }, isAuthorized }) => (isAuthorized() && from ? (
  <Redirect to={from} />
) : (
  <Card
    title="登录"
    extra={(
      <Link to="/change-password">
        {'忘记密码'}
      </Link>
    )}
    style={{ width: 300, margin: 'auto' }}
  >
    <Form isAuthorized={isAuthorized} />
  </Card>
));

export default withFetch(withRouter(Login));
