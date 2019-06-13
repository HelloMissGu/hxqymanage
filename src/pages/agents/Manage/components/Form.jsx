import React from 'react';
import { Formik } from 'formik';
import {
  Button, Row, Col, Spin, message,
} from 'antd';
import { withRouter } from 'react-router-dom';
import { Form, FormItem, InputField } from '../../../../utils/forms';
import { withFetch } from '../../../../utils/fetch';

class News extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values, { setSubmitting }) {
    const {
      fetch, onClose, authorize, history,
    } = this.props;
    return fetch('/staff/agent', {
      method: 'POST',
      json: values,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success('代理新建成功', 1).then(() => {
            onClose(null, true);
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`代理新建失败：${err.message || err.status}`);
        },
      );
  }

  render() {
    const { initialValues, id, onClose } = this.props;
    if (initialValues == null && (id && id !== 0)) {
      return <Spin style={{ width: '100%' }} />;
    }
    return (
      <Formik
        {...this.props}
        onSubmit={this.onSubmit}
        initialValues={initialValues}
        isInitialValid
        validate={(values) => {
          // same as above, but feel free to move this into a class method now.
          const errors = {};
          if (!values.name) {
            errors.name = '姓名不能为空';
          }
          if (!values.phone) {
            errors.phone = '账号不能为空';
          }
          if (!values.password) {
            errors.password = '密码不能为空';
          }
          return errors;
        }}
      >
        <Form>
          <FormItem name="name">
            <InputField name="name" placeholder="请输入用户姓名" />
          </FormItem>
          <FormItem name="phone">
            <InputField name="phone" placeholder="请输入用户账号" />
          </FormItem>
          <FormItem name="password">
            <InputField name="password" type="password" placeholder="请输入账号初始密码" />
          </FormItem>
          <Row>
            <Col span={8} offset={6}>
              <Button type="primary" icon="close" style={{ width: '100%' }} onClick={onClose}>
                取消
              </Button>
            </Col>
            <Col span={8} offset={2}>
              <Button type="primary" htmlType="submit" icon="save" style={{ width: '100%' }}>
                完成
              </Button>
            </Col>
          </Row>
        </Form>
      </Formik>
    );
  }
}

export default withFetch(withRouter(News));
