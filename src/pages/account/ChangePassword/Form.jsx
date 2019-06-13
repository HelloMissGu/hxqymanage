import React, { Component } from 'react';
import { Formik } from 'formik';
import {
  Icon, Button, Row, Col, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import { Form, FormItem, InputField } from '../../../utils/forms';
import { validateMobile, validatePassword } from '../../../utils/validators';

import SendCodeButton from './SendCodeButton';

const validateCode = (value) => {
  if (value === '') return '请输入收到验证码';
  if (!/^\d{6}$/.test(value)) return '验证码为6位数字';
  return undefined;
};

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit({ mobile, code, password }, { setSubmitting, setFieldError }) {
    const { fetch, authorize, history } = this.props;
    return fetch('/staff/password', {
      method: 'PUT',
      json: {
        phone: mobile,
        code,
        password,
      },
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) throw response;
        return response;
      })
      .then(
        () => {
          authorize(null);
          message.success('修改成功，即将跳转登录页面', 3).then(() => {
            history.push('/login');
          });
        },
        () => {
          setFieldError('password', '修改密码失败');
        },
      );
  }

  render() {
    return (
      <Formik
        onSubmit={this.onSubmit}
        initialValues={{ mobile: '', code: '', password: '' }}
        validateOnChange={false}
      >
        {({ values: { mobile }, errors: { mobile: mobileError }, setFieldError }) => (
          <Form autoComplete="off">
            <FormItem name="mobile">
              <InputField
                validate={validateMobile}
                type="tel"
                name="mobile"
                prefix={<Icon type="mobile" />}
                placeholder="手机号码"
              />
            </FormItem>
            <FormItem name="code">
              <Row>
                <Col span={10}>
                  <SendCodeButton
                    mobile={mobile}
                    disabled={Boolean(mobileError)}
                    onError={() => setFieldError('mobile', '发送验证码失败')}
                  />
                </Col>
                <Col span={14}>
                  <InputField validate={validateCode} type="tel" name="code" placeholder="验证码" />
                </Col>
              </Row>
            </FormItem>
            <FormItem name="password">
              <InputField
                validate={validatePassword}
                type="password"
                name="password"
                prefix={<Icon type="key" />}
                placeholder="新密码"
              />
            </FormItem>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              提交
            </Button>
          </Form>
        )}
      </Formik>
    );
  }
}

export default withFetch(withRouter(ChangePassword));
