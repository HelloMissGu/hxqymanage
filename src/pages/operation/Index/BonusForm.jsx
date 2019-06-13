import React, { Component } from 'react';
import { Formik } from 'formik';
import {
  message, Button, Spin, Row, Col,
} from 'antd';

import { withRouter } from 'react-router-dom';
import { Form, FormItem, InputNumberField } from '../../../utils/forms';
import { withFetch } from '../../../utils/fetch';

class BonusForm extends Component {
  constructor(props) {
    super(props);

    this.state = { initialValues: null };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/bonus')
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        (data) => {
          this.setState({
            initialValues: {
              consume: data.consume / 10 || 0,
              checkIn: data.checkIn / 10 || 0,
            },
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          if (err.status !== 404) {
            message.error('加载功德值奖励失败');
          }
          this.setState({
            initialValues: {
              consume: 0,
              checkIn: 0,
            },
          });
        },
      );
  }

  onSubmit({ consume, checkIn }, { setSubmitting }) {
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/bonus', {
      method: 'PUT',
      json: { consume: Math.floor(consume * 10), checkIn: Math.floor(checkIn * 10) },
    })
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          setSubmitting(false);
          message.success('保存功德值奖励成功');
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`保存功德值奖励失败${err.status}`);
        },
      );
  }

  render() {
    const { initialValues } = this.state;
    if (initialValues === null) return <Spin style={{ width: '100%' }} />;
    return (
      <Formik onSubmit={this.onSubmit} initialValues={initialValues}>
        <Form>
          <Row gutter={10}>
            <Col span={10}>
              <FormItem name="consume">
                {'每消费 1 元奖励 '}
                <InputNumberField name="consume" min={0} precision={1} max={100000000} />
                {' 分'}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem name="checkIn">
                {'每签到 1 天奖励 '}
                <InputNumberField name="checkIn" min={0} precision={1} max={100000000} />
                {' 分'}
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Button type="primary" htmlType="submit" icon="save" style={{ width: '100%' }}>
                  保存
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Formik>
    );
  }
}

export default withFetch(withRouter(BonusForm));
