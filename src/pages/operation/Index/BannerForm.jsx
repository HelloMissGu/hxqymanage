import React, { Component } from 'react';
import { Formik, FieldArray } from 'formik';
import {
  Row, Col, Button, Icon, Spin, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, InputField, ImageUploadField,
} from '../../../utils/forms';
import { withFetch } from '../../../utils/fetch';

class BannerForm extends Component {
  constructor(props) {
    super(props);

    this.state = { initialValues: null };

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/banners')
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        (data) => {
          this.setState({ initialValues: { banners: data } });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          if (err.status !== 404) {
            message.error('获取轮播配置失败');
          }
          this.setState({ initialValues: { banners: [] } });
        },
      );
  }

  onSubmit(values, { setSubmitting }) {
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/banners', {
      method: 'PUT',
      json: values.banners,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success('保存轮播配置成功');
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`保存轮播配置失败${err.status}`);
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
      if (values.banners instanceof Array) {
        values.banners.forEach((banner, index) => {
          if (!banner.image) {
            errors[`banners.${index}.image`] = '图片不能为空';
          }
        });
      }
      return errors;
    };
    return (
      <Formik onSubmit={this.onSubmit} initialValues={initialValues} validate={validate}>
        {({ values }) => (
          <Form>
            <FieldArray name="banners">
              {({ push, remove }) => (
                <Row gutter={12} type="flex">
                  {values.banners.map((banner, index) => (
                    <Col span={8} key={-index} style={{ padding: 10 }}>
                      <FormItem name={`banners.${index}.link`}>
                        <InputField
                          name={`banners.${index}.link`}
                          placeholder="链接"
                          size="large"
                          prefix={<Icon type="link" />}
                        />
                      </FormItem>
                      <FormItem name={`banners.${index}.image`}>
                        <ImageUploadField name={`banners.${index}.image`} />
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
                      onClick={() => push({ link: '', image: '' })}
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

export default withFetch(withRouter(BannerForm));
