import React from 'react';
import { Formik } from 'formik';
import {
  Button, Row, Col, Spin, message,
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
import { withFetch } from '../../../../utils/fetch';
import PreviewDrawer from './PreviewDrawer';

class News extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { previewVisible: false };
  }

  onSubmit(values, { setSubmitting }) {
    const requestParams = {
      ...values,
      content: values.content,
      previews: [{ image_url: values.image }],
    };
    const { fetch, id, history } = this.props;
    const isEditing = id || id === 0;
    return fetch(`/news${isEditing ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      json: requestParams,
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success(`法讯${isEditing ? '修改' : '新建'}成功`, 1).then(() => {
            history.push('/news');
          });
        },
        (err) => {
          if (typeof err.json === 'function') {
            err.json().then(({ msg }) => {
              message.error(`${isEditing ? '修改' : '新建'}失败：${msg}`);
            });
          } else {
            message.error(`${isEditing ? '修改' : '新建'}失败：${err.status}`);
          }
        },
      );
  }

  hidePreview = () => {
    this.setState({
      previewVisible: false,
    });
  };

  showPreview = () => {
    this.setState({
      previewVisible: true,
    });
  };

  render() {
    const { initialValues, id } = this.props;
    const { previews } = initialValues;
    let image;
    try {
      image = previews[0].image_url;
    } catch (e) {
      image = null;
    }
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const { previewVisible } = this.state;
    if (initialValues == null && (id && id !== 0)) {
      return <Spin style={{ width: '100%' }} />;
    }
    return (
      <Formik
        {...this.props}
        onSubmit={this.onSubmit}
        initialValues={{ ...initialValues, image }}
        isInitialValid
        validate={(values) => {
          // same as above, but feel free to move this into a class method now.
          const errors = {};
          if (!values.title) {
            errors.title = '标题不能为空';
          }
          if (!values.image) {
            errors.image = '预览图不能为空';
          }
          if (!values.content) {
            errors.content = '正文不能为空';
          }
          return errors;
        }}
      >
        {({ values }) => (
          <Form>
            <Row>
              <Col span={8}>
                <FormItem name="title" label="标题" {...formItemLayout}>
                  <InputField type="text" name="title" />
                </FormItem>
                <FormItem name="creator" label="署名" {...formItemLayout}>
                  <InputField
                    type="text"
                    name="creator"
                    placeholder="限制12个字，可为空"
                    maxLength={12}
                  />
                </FormItem>
              </Col>
              <Col id="img-uploader" span={16} className="preview">
                <FormItem name="image" label="预览图设置" {...formItemLayout}>
                  <ImageUploadField name="image" />
                </FormItem>
              </Col>
            </Row>
            <FormItem name="content" label="正文编辑">
              <RichEditorField name="content" />
            </FormItem>
            <Row>
              <Col span={3} offset={12}>
                <Link to="/news">
                  <Button type="primary" icon="close" style={{ width: '100%' }}>
                    取消
                  </Button>
                </Link>
              </Col>
              <Col span={3} offset={1}>
                <Button
                  type="primary"
                  icon="file-ppt"
                  style={{ width: '100%' }}
                  onClick={this.showPreview}
                >
                  预览
                </Button>
              </Col>
              <Col span={3} offset={1}>
                <Button type="primary" htmlType="submit" icon="save" style={{ width: '100%' }}>
                  保存
                </Button>
              </Col>
            </Row>
            <PreviewDrawer onClose={this.hidePreview} visible={previewVisible} news={values} />
          </Form>
        )}
      </Formik>
    );
  }
}

export default withFetch(withRouter(News));
