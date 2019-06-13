import React, { Component } from 'react';
import { Formik } from 'formik';
import {
  Icon, Button, Spin, message,
} from 'antd';
import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, SelectField, DatePickerField,
} from '../../../utils/forms';
import { withFetch } from '../../../utils/fetch';

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      temples: [],
      loading: false,
      typeOptions: [{ key: 'sales', label: 'GMV' }, { key: 'invitation', label: '用户数' }],
      templeName: undefined,
    };
  }

  componentDidMount() {
    this.fetchTempleOptions();
  }

  onTempleSelect = ({ label }) => {
    this.setState({ templeName: label });
  };

  onSubmit({
    type, start, end, temple: { key: temple } = {},
  }, { setSubmitting }) {
    const { fetch, authorize, history } = this.props;
    const { templeName } = this.state;
    return fetch(`/data/${type}`, {
      method: 'get',
      json: {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        ...(temple && temple !== '0' ? { temple } : null),
      },
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) throw response;
        return response;
      })
      .then((response) => {
        if (typeof response.blob === 'function') {
          response.blob().then((data) => {
            const downloadUrl = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${type === 'sales' ? 'GMV' : '用户数'}报表（${
              temple ? templeName : ''
            }） ${start.format('YYYY-MM-DD')}至${end.format('YYYY-MM-DD')}.xlsx`;
            a.click();
          });
        }
      })
      .catch((err) => {
        if (err.status === 401) {
          authorize(null);
          history.replace('/');
          return;
        }
        message.error(`报表获取失败${err.status}`);
      });
  }

  fetchTempleOptions = () => {
    const { fetch, authorize, history } = this.props;
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
            temples: [{ id: 0, name: '所有寺庙' }, ...(response || [])],
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
    const { temples, loading, typeOptions } = this.state;

    const templeOptions = temples.map(({ id, name }) => ({
      label: name,
      value: id,
    }));
    return (
      <Spin spinning={loading} style={{ width: '100%' }}>
        <Formik
          onSubmit={this.onSubmit}
          validate={(values) => {
            const errors = {};
            if (!values.type) {
              errors.type = '报表类型不能为空';
            }
            if (values.type === 'sales' && !values.temple) {
              errors.temple = '寺庙不能为空';
            }
            if (!values.start) {
              errors.start = '开始时间不能为空';
            }
            if (!values.end) {
              errors.end = '结束时间不能为空';
            }
            if (values.start && values.end && values.start.valueOf() > values.end.valueOf()) {
              errors.start = '开始时间不能大于结束时间';
              errors.end = '开始时间不能大于结束时间';
            }
            return errors;
          }}
        >
          {({ values: { type } }) => (
            <Form>
              <FormItem name="type" style={{ display: 'inline-block', width: '200px' }}>
                <SelectField
                  name="type"
                  options={typeOptions}
                  placeholder="报表类型"
                  defaultValue="sales"
                />
              </FormItem>
              {type === 'sales' && (
                <FormItem name="temple" style={{ display: 'inline-block', width: '200px' }}>
                  <SelectField
                    name="temple"
                    options={templeOptions}
                    prefix={<Icon type="home" />}
                    placeholder="选择寺庙"
                    labelInValue
                    onChange={this.onTempleSelect}
                    defaultValue={{ key: 0 }}
                  />
                </FormItem>
              )}
              <FormItem name="start" style={{ display: 'inline-block' }}>
                <DatePickerField name="start" placeholder="开始时间" />
              </FormItem>
              <FormItem name="end" style={{ display: 'inline-block' }}>
                <DatePickerField name="end" placeholder="结束时间" />
              </FormItem>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }} icon="download">
                获取统计报表
              </Button>
            </Form>
          )}
        </Formik>
      </Spin>
    );
  }
}

export default withFetch(withRouter(Statistics));
