import React from 'react';
import { Formik, FieldArray } from 'formik';
import {
  Button, Row, Col, Spin, message, Icon,
} from 'antd';
// import { convertToRaw } from 'draft-js';
import { Link, withRouter } from 'react-router-dom';
import {
  Form,
  FormItem,
  InputField,
  ImageUploadField,
  RichEditorField,
  // TextAreaField,
} from '../../../../utils/forms';

import './Form.css';
import { withFetch } from '../../../../utils/fetch';

class Temples extends React.Component {
  constructor(props) {
    super(props);
    const { initialValues, id } = props;
    this.state = {
      initialValues: {
        ...initialValues,
        images: initialValues.images,
        lives: initialValues.online_video,
        content: initialValues.introduce,
      },
      editing: id || id === 0,
      hasManager: false,
    };
  }

  componentDidMount() {
    const { editing } = this.state;
    if (editing) this.fetchData();
  }

  onSubmit = (values, { setSubmitting }) => {
    const {
      fetch, authorize, history, id,
    } = this.props;
    const { editing, hasManager } = this.state;
    const requestParams = {
      ...(editing ? { id } : null),
      name: values.name,
      address: values.address || '',
      images: values.images,
      online_video: values.lives || [],
      introduce: values.content || '',
      ...(editing ? null : { status: true }),
    };
    return fetch(`/ecommerce/temple${editing ? `/${id}` : 's'}`, {
      method: editing ? 'PUT' : 'POST',
      json: requestParams,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        ({ id: templeId }) => {
          const requestAction = hasManager ? '修改' : '新建';
          const requestMethod = hasManager ? 'PUT' : 'POST';
          message.success(`寺庙${requestAction}成功`);
          const hide = message.loading(`正在${requestAction}寺庙管理账户`, 0);
          setSubmitting(true);
          return fetch(`/staff/${templeId}${hasManager ? `/${values.userId}` : ''}`, {
            method: requestMethod,
            json: {
              name: values.name,
              phone: values.account,
              ...(values.password !== '******' && values.password
                ? { password: values.password }
                : null),
              is_admin: 1,
            },
          })
            .then((response) => {
              setSubmitting(false);
              hide();
              if (!response.ok) {
                throw response;
              }
              return response.json();
            })
            .then(
              () => {
                message.success(`寺庙管理账户${requestAction}成功，即将返回`, 1).then(() => {
                  history.push('/temples');
                });
              },
              (err) => {
                if (err.status === 401) {
                  authorize(null);
                  history.replace('/');
                  return;
                }
                const messageDic = {
                  500: '服务器故障',
                  502: '服务器故障',
                  400: '参数错误',
                };
                message
                  .error(
                    `账户${requestAction}失败：${messageDic[err.status]
                      || '网络故障'}，请尝试重新配置`,
                    2,
                  )
                  .then(() => {
                    message.info('即将返回');
                  });
              },
            );
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`寺庙新建失败${err.status}`);
        },
      );
  };

  fetchData() {
    const {
      fetch, authorize, history, id,
    } = this.props;
    const hideLoading = message.loading('正在获取账户信息', 0);
    return fetch(`/staff/${id}`, {
      method: 'GET',
    })
      .then((response) => {
        hideLoading();
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        (response) => {
          try {
            const { initialValues } = this.state;
            const {
              data: {
                data: [{ phone: account = '', id: userId } = {}],
              },
            } = response;
            this.setState({
              initialValues: {
                ...initialValues,
                account,
                userId,
                password: account && '******',
              },
              hasManager: !!account,
            });
          } catch (err) {
            message.error(`接口数据错误${err.status}`);
          }
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`账户信息获取失败：${err.status || '网络故障'}`);
        },
      );
  }

  render() {
    const {
      initialValues, initialValues: { account } = {}, editing, hasManager,
    } = this.state;
    if (editing && (!initialValues || account === undefined)) {
      return <Spin style={{ width: '100%' }} />;
    }
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const validate = (values) => {
      // same as above, but feel free to move this into a class method now.
      const errors = {};
      if (!values.name) {
        errors.name = '名称不能为空';
      }
      if (!values.address) {
        errors.address = '地址不能为空';
      }
      if (!values.account) {
        errors.account = '账号不能为空';
      }
      if (!/^[0-9]{11}$/.exec(values.account)) {
        errors.account = '手机号不符合格式要求：11位数字';
      }
      if (!values.password && !hasManager) {
        errors.password = '密码不能为空';
      }
      if (!values.images || !values.images[0]) {
        errors.images = '图片至少一张';
      }
      if (values.lives instanceof Array) {
        for (let index = 0; index < values.lives.length; index += 1) {
          const live = values.lives[index];
          if (!live.title) {
            errors[`lives.${index}.title`] = '直播标题不能为空';
          }
          if (!live.url) {
            errors[`lives.${index}.url`] = '直播地址不能为空';
          }
          if (!live.image) {
            errors[`lives.${index}.image`] = '直播图片不能为空';
          }
        }
      }
      if (!values.content) {
        errors.content = '寺庙介绍不能为空';
      }
      return errors;
    };
    return (
      <Formik onSubmit={this.onSubmit} initialValues={initialValues} validate={validate}>
        {({ values: { images, lives } }) => (
          <Form>
            <Col span={12}>
              <FormItem name="name" label="寺庙名称" {...formItemLayout}>
                <InputField name="name" />
              </FormItem>
              <FormItem name="account" label="寺庙账号" {...formItemLayout}>
                <InputField type="tel" name="account" placeholder="填写手机号" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="address" label="寺庙地址" {...formItemLayout}>
                <InputField name="address" />
              </FormItem>
              <FormItem name="password" label="寺庙密码" {...formItemLayout}>
                <InputField
                  type="password"
                  name="password"
                  // placeholder="创建后再编辑为初始化密码"
                />
              </FormItem>
            </Col>

            {'寺庙图片'}
            <FieldArray name="images">
              {({ push, remove }) => (
                <FormItem name="images">
                  <Row gutter={12} type="flex" style={{ marginBottom: '30px' }}>
                    {images
                      && images.map((banner, index) => (
                        <Col
                          span={8}
                          key={-index}
                          style={{ padding: 10, display: 'flex', flexDirection: 'column' }}
                        >
                          <ImageUploadField name={`images.${index}`} />
                          <Button
                            icon="delete"
                            type="danger"
                            size="small"
                            onClick={() => {
                              remove(index);
                            }}
                            style={{ width: '100%' }}
                          />
                        </Col>
                      ))}
                    <Col span={8} style={{ padding: 10 }}>
                      <Button
                        icon="plus"
                        size="large"
                        type="dashed"
                        onClick={() => push('')}
                        style={{ width: '100%', height: '100px' }}
                      />
                    </Col>
                  </Row>
                </FormItem>
              )}
            </FieldArray>
            {'直播配置'}
            <FieldArray name="lives">
              {({ push, remove }) => (
                <FormItem name="lives">
                  <Row gutter={12} type="flex">
                    {lives
                      && lives.map((banner, index) => (
                        <Col span={8} key={-index} style={{ padding: 10 }}>
                          <FormItem name={`lives.${index}.title`}>
                            <InputField
                              name={`lives.${index}.title`}
                              placeholder="标题12字以内"
                              maxLength={12}
                            />
                          </FormItem>
                          <FormItem name={`lives.${index}.url`}>
                            <InputField
                              name={`lives.${index}.url`}
                              placeholder="直播网络地址"
                              prefix={<Icon type="link" />}
                            />
                          </FormItem>
                          <ImageUploadField name={`lives.${index}.image`} />
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
                        onClick={() => push({ url: '', image: '' })}
                        style={{ width: '100%', height: '100px' }}
                      />
                    </Col>
                  </Row>
                </FormItem>
              )}
            </FieldArray>
            {'寺庙介绍'}
            <FormItem name="content">
              {<RichEditorField name="content" />}
            </FormItem>
            <Row>
              <Col span={4} offset={16}>
                <Link to="/temples">
                  <Button type="primary" icon="close">
                    取消
                  </Button>
                </Link>
              </Col>
              <Col span={4}>
                <Button type="primary" htmlType="submit" icon="save">
                  完成
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    );
  }
}

export default withFetch(withRouter(Temples));
