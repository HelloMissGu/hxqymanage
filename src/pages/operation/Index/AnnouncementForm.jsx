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
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/announcements')
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        (data) => {
          this.setState({ initialValues: { announcements: data } });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          if (err.status !== 404) {
            message.error('获取公告设置失败');
          }
          this.setState({ initialValues: { announcements: [] } });
        },
      );
  }

  onSubmit(values, { setSubmitting }) {
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/announcements', {
      method: 'PUT',
      json: values.announcements,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success('保存公告设置成功');
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`保存公告设置失败${err.status}`);
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
      if (values.announcements instanceof Array) {
        values.announcements.forEach((item, index) => {
          if (!item.title) {
            errors[`announcements.${index}.title`] = '标题不能为空';
          }
          if (!item.content) {
            errors[`announcements.${index}.content`] = '内容不能为空';
          }
        });
      }
      return errors;
    };
    return (
      <Formik onSubmit={this.onSubmit} initialValues={initialValues} validate={validate}>
        {({ values }) => (
          <Form>
            <FieldArray name="announcements">
              {({ push, remove }) => (
                <Row gutter={12} type="flex">
                  {values.announcements.map((announcement, index) => (
                    <Col span={8} key={-index} style={{ padding: 10 }}>
                      <FormItem name={`announcements.${index}.title`}>
                        <InputField
                          name={`announcements.${index}.title`}
                          placeholder="公告标题为20字以内"
                          size="large"
                          prefix={<Icon type="notification" />}
                          maxLength={20}
                        />
                      </FormItem>
                      <FormItem name={`announcements.${index}.content`}>
                        <TextAreaField
                          name={`announcements.${index}.content`}
                          placeholder="公告正文200字以内"
                          rows={6}
                          maxLength={200}
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
