import React, { Component } from 'react';
import { Formik, FieldArray } from 'formik';
import {
  Row, Col, Button, Icon, Spin, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, InputField, TextAreaField,
} from '../../../utils/forms';
import { withFetch } from '../../../utils/fetch';

class AnnouncementForm extends Component {
  constructor(props) {
    super(props);

    this.state = { initialValues: null };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const {
      fetch, type, authorize, history,
    } = this.props;
    return fetch(`/operation/${type}_template`)
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
              templates: data.map(item => (item instanceof Array ? {} : item)),
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
            message.error('获取模板列表失败');
          }
          this.setState({ initialValues: { templates: [{ title: '', content: '' }] } });
        },
      );
  }

  onSubmit(values, { setSubmitting }) {
    const {
      fetch, type, authorize, history,
    } = this.props;
    return fetch(`/operation/${type}_template`, {
      method: 'PUT',
      json: values.templates,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success('保存模板列表成功');
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`保存模板列表失败${err.status}`);
        },
      );
  }

  render() {
    const { initialValues } = this.state;
    if (initialValues == null) {
      return <Spin style={{ width: '100%' }} />;
    }
    const validate = (values) => {
      const errors = {};
      if (values.templates instanceof Array) {
        values.templates.forEach((template, index) => {
          if (!template.title) {
            errors[`templates.${index}.title`] = '标题不能为空';
          }
          if (!template.content) {
            errors[`templates.${index}.content`] = '内容不能为空';
          }
        });
      }
      return errors;
    };
    return (
      <Formik onSubmit={this.onSubmit} initialValues={initialValues} validate={validate}>
        {({ values }) => (
          <Form>
            <FieldArray name="templates">
              {({ push, remove }) => (
                <Row gutter={12} type="flex">
                  {values.templates.map((template, index) => (
                    <Col span={8} key={-index} style={{ padding: 10 }}>
                      <FormItem name={`templates.${index}.title`}>
                        <InputField
                          name={`templates.${index}.title`}
                          placeholder="标题(12字以内)"
                          size="large"
                          prefix={<Icon type="notification" />}
                          maxLength={12}
                        />
                      </FormItem>
                      <FormItem name={`templates.${index}.content`}>
                        <TextAreaField
                          name={`templates.${index}.content`}
                          placeholder="内容(30字以内)"
                          rows={3}
                          maxLength={30}
                        />
                      </FormItem>
                      <Button
                        icon="delete"
                        type="danger"
                        size="small"
                        onClick={() => remove(index)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                  ))}
                  <Col span={8} style={{ padding: 10 }}>
                    <Button
                      icon="plus"
                      size="large"
                      type="dashed"
                      onClick={() => push({ title: '', content: '' })}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Col>
                  <Col span={24}>
                    <Button
                      icon="save"
                      size="large"
                      type="primary"
                      htmlType="submit"
                      style={{ width: '100%' }}
                    >
                      保存
                    </Button>
                  </Col>
                </Row>
              )}
            </FieldArray>
          </Form>
        )}
      </Formik>
    );
  }
}

export default withFetch(withRouter(AnnouncementForm));
