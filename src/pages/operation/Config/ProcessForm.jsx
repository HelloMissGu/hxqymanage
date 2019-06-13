import React, { Component } from 'react';
import { Formik, FieldArray } from 'formik';
import {
  Row, Col, Button, Spin, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, InputField, ImageUploadField, TextAreaField,
} from '../../../utils/forms';
import { withFetch } from '../../../utils/fetch';

class ProcessForm extends Component {
  constructor(props) {
    super(props);

    this.state = { initialValues: null };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const {
      fetch, type, history, authorize,
    } = this.props;
    return fetch(`/operation/${type}_process`)
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          initialValues: { steps: data.map(item => (item instanceof Array ? {} : item)) },
        });
      })
      .catch((err) => {
        if (err.status === 401) {
          authorize(null);
          history.replace('/');
          return;
        }
        if (err.status !== 404) {
          message.error('获取流程失败');
        }
        this.setState({ initialValues: { steps: [{ title: '', content: '', image: '' }] } });
      });
  }

  onSubmit(values, { setSubmitting }) {
    const { fetch, type } = this.props;
    return fetch(`/operation/${type}_process`, {
      method: 'PUT',
      json: values.steps,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success('保存流程成功');
        },
        (err) => {
          message.error(`保存流程失败${err.status}`);
        },
      );
  }

  render() {
    const { initialValues } = this.state;
    if (initialValues == null) {
      return <Spin style={{ width: '100%' }} />;
    }
    const validate = (values) => {
      // same as above, but feel free to move this into a class method now.
      const errors = {};
      if (values.steps instanceof Array) {
        values.steps.forEach((step, index) => {
          if (!step.title) {
            errors[`steps.${index}.title`] = '标题不能为空';
          }
          if (!step.content) {
            errors[`steps.${index}.content`] = '内容不能为空';
          }
          if (!step.image) {
            errors[`steps.${index}.image`] = '图片不能为空';
          }
        });
      }
      return errors;
    };
    return (
      <Formik onSubmit={this.onSubmit} initialValues={initialValues} validate={validate}>
        {({ values }) => (
          <Form>
            <FieldArray name="steps">
              {({ push, remove }) => (
                <Row gutter={12} type="flex">
                  {values.steps.map((step, index) => (
                    <Col span={8} key={-index} style={{ padding: 10 }}>
                      <FormItem name={`steps.${index}.title`}>
                        <InputField
                          name={`steps.${index}.title`}
                          placeholder="标题(12字以内)"
                          size="large"
                          maxLength={12}
                        />
                      </FormItem>
                      <FormItem name={`steps.${index}.content`}>
                        <TextAreaField
                          name={`steps.${index}.content`}
                          placeholder="内容(60字以内)"
                          rows={6}
                          maxLength={60}
                        />
                      </FormItem>
                      <FormItem name={`steps.${index}.image`}>
                        <ImageUploadField name={`steps.${index}.image`} />
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
                      onClick={() => push({ title: '', content: '', image: '' })}
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

export default withFetch(withRouter(ProcessForm));
