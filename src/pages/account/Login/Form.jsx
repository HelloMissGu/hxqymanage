import React, { Component } from 'react';
import { Formik } from 'formik';
import {
  Icon, Button, Spin, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, InputField, SelectField,
} from '../../../utils/forms';
import { withFetch } from '../../../utils/fetch';
import { withToken } from '../../../utils/token';

class Login extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { temples: [{ id: '0', name: '运营后台' }], loading: false };
  }

  componentDidMount() {
    this.fetchTempleOptions();
  }

  onSubmit({ mobile, password, temple }, { setSubmitting }) {
    const { fetch, authorize, history } = this.props;
    const { setToken } = this.props;
    return fetch(`/staff/${temple}/login`, {
      method: 'POST',
      json: {
        phone: mobile,
        password,
        temple_id: temple,
      },
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (data) => {
          if (data.need_modify) {
            history.replace('/change-password');
          } else {
            authorize(data.token);
            setToken(data.token);
          }
        },
        (err) => {
          if (typeof err.json === 'function') {
            err.json().then(({ msg }) => {
              message.error(`${msg || '登录失败'}`);
            });
          } else {
            message.error('网络错误，稍后重试');
          }
        },
      );
  }

  onValidate = (values) => {
    const errors = {};
    if (!values.temple && values.temple !== 0) {
      errors.temple = '请选择寺庙';
    }
    if (!values.mobile) {
      errors.mobile = '请输入账号';
    }
    if (!values.password) {
      errors.password = '请输入密码';
    }
    return errors;
  };

  fetchTempleOptions = () => {
    const { fetch, authorize, history } = this.props;
    const { temples } = this.state;
    this.setState({ loading: true });
    return fetch('/ecommerce/temples', {
      method: 'get',
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          this.setState({
            temples: [...temples, ...(response || [])],
            loading: false,
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
          }
        },
      );
  };

  render() {
    const { temples, loading } = this.state;
    if (loading) return <Spin style={{ width: '100%' }} />;

    const templeOptions = temples.map(({ id, name }) => ({
      label: name,
      value: id,
    }));

    return (
      <Formik onSubmit={this.onSubmit} validate={this.onValidate}>
        <Form>
          <FormItem name="temple">
            <SelectField
              name="temple"
              options={templeOptions}
              prefix={<Icon type="home" />}
              placeholder="选择寺庙"
            />
          </FormItem>
          <FormItem name="mobile">
            <InputField
              type="tel"
              name="mobile"
              prefix={<Icon type="mobile" />}
              placeholder="手机号码"
            />
          </FormItem>
          <FormItem name="password">
            <InputField
              type="password"
              name="password"
              prefix={<Icon type="key" />}
              placeholder="密码"
            />
          </FormItem>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            登录
          </Button>
        </Form>
      </Formik>
    );
  }
}

export default withToken(withFetch(withRouter(Login)));
