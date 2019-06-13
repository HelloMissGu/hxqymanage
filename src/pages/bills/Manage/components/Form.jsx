import React from 'react';
import { Formik } from 'formik';
import {
  Button, Row, Col, Spin, message,
} from 'antd';
import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, InputField, ImageUploadField,
} from '../../../../utils/forms';
import { withFetch } from '../../../../utils/fetch';

class News extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values, { setSubmitting }) {
    const {
      fetch,
      onClose,
      initialValues: { images: initialImages },
    } = this.props;
    const { id, images } = values;
    let imageModified = false;
    if (images instanceof Array) {
      images.forEach((item, index) => {
        if (item !== initialImages[index]) {
          imageModified = true;
        }
      });
    }
    if (imageModified) {
      return fetch(`/ecommerce/bill/${id}/images`, {
        method: 'POST',
        json: { images },
      })
        .then((response) => {
          setSubmitting(false);
          if (!response.ok) {
            throw response;
          }
          return response.json();
        })
        .then(
          () => {
            message.success('订单图片更新成功', 1).then(() => {
              onClose(null, true);
            });
          },
          (err) => {
            message.error(`订单图片更新失败：${err.status}`);
          },
        );
    }
    setSubmitting(false);
    onClose(null, true);
    return true;
  }

  render() {
    const {
      initialValues: {
        initialType = '',
        patron_info: { beneficiary_name: target },
      },
      initialValues,
      id,
      onClose,
    } = this.props;
    let formItems = [];
    if (initialType === 'CS') {
      formItems = [
        { name: 'type', label: '供奉类型' },
        {
          name: 'product_info.name',
          label: '供奉商品',
        },
        {
          name: 'patron_info.purchaser_name',
          label: '祈福人姓名',
        },
        {
          name: 'patron_info.purchaser_address',
          label: '祈福人省市',
        },
        {
          name: 'start_time',
          label: '祈福日期',
        },
        {
          name: 'end_time',
          label: '结束日期',
        },
        {
          name: 'patron_info.content',
          label: '祈福语',
        },
      ];
    } else if (initialType === 'WS') {
      formItems = [
        { name: 'type', label: '供奉类型' },
        {
          name: 'product_info.name',
          label: '供奉商品',
        },
        {
          name: 'patron_info.beneficiary_name',
          label: '超度人姓名',
        },
        {
          name: 'patron_info.beneficiary_address',
          label: '超度人省市',
        },
        {
          name: 'patron_info.purchaser_name',
          label: '阳上人姓名',
        },
        {
          name: 'patron_info.purchaser_address',
          label: '阳上人省市',
        },
        {
          name: 'start_time',
          label: '祈福日期',
        },
        {
          name: 'end_time',
          label: '结束日期',
        },
        {
          name: 'patron_info.content',
          label: '祈福语',
        },
      ];
    } else if (target) {
      formItems = [
        { name: 'type', label: '祈福类型' },
        {
          name: 'product_info.name',
          label: '祈福商品',
        },
        {
          name: 'patron_info.purchaser_name',
          label: '祈福人姓名',
        },
        {
          name: 'patron_info.purchaser_address',
          label: '祈福人省市',
        },
        {
          name: 'patron_info.beneficiary_name',
          label: '送福人姓名',
        },
        {
          name: 'patron_info.beneficiary_address',
          label: '送福人省市',
        },
        {
          name: 'start_time',
          label: '祈福日期',
        },
        {
          name: 'end_time',
          label: '结束日期',
        },
        {
          name: 'patron_info.content',
          label: '祈福语',
        },
      ];
    } else {
      formItems = [
        { name: 'type', label: '祈福类型' },
        {
          name: 'product_info.name',
          label: '祈福商品',
        },
        {
          name: 'patron_info.purchaser_name',
          label: '祈福人姓名',
        },
        {
          name: 'patron_info.purchaser_address',
          label: '祈福人省市',
        },
        {
          name: 'start_time',
          label: '祈福日期',
        },
        {
          name: 'end_time',
          label: '结束日期',
        },
        {
          name: 'patron_info.content',
          label: '祈福语',
        },
      ];
    }

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    if (initialValues == null && (id && id !== 0)) {
      return <Spin style={{ width: '100%' }} />;
    }
    return (
      <Formik
        {...this.props}
        onSubmit={this.onSubmit}
        isInitialValid
        validate={(currentValues) => {
          // same as above, but feel free to move this into a class method now.
          const errors = {};
          if (!currentValues.type) {
            errors.type = '类型不能为空';
          }
          return errors;
        }}
      >
        <Form>
          {formItems.map(({ name, label }, index) => (
            <FormItem {...formItemLayout} label={label} name={name} key={-index}>
              <InputField name={name} readOnly />
            </FormItem>
          ))}
          {initialValues.images.map((item, index) => (
            <ImageUploadField name={`images.${index}`} key={`image${-index}`} />
          ))}
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
