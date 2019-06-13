import React from 'react';
import moment from 'moment';
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
  InputNumberField,
  DatePickerField,
  SelectField,
  // TextAreaField,
} from '../../../../utils/forms';
import './Form.css';
import { withFetch } from '../../../../utils/fetch';
// const { RangePicker } = DatePicker;

class Activities extends React.Component {
  constructor(props) {
    super(props);
    const { record } = props;
    const initialValues = {
      title: record.title,
      temple: record.temple_id,
      price: record.price && record.price / 100,
      amount: record.stock,
      image: record.image === 'loading' ? undefined : record.image,
      startTime: record.start_time && moment(record.start_time, 'YYYY-MM-DD HH:mm:ss'),
      endTime: record.end_time && moment(record.end_time, 'YYYY-MM-DD HH:mm:ss'),
      introduction: record.introduce,
      conclusion: record.report,
    };

    this.state = {
      ...props,
      initialValues,
      templeOptions: [],
    };
  }

  componentDidMount() {
    this.fetchTempleOptions();
  }

  onSubmit = (values) => {
    const requestParams = {
      title: values.title,
      temple_id: values.temple,
      price: Math.floor(values.price * 100),
      stock: Math.floor(values.amount),
      image: values.image,
      start_time: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
      end_time: values.endTime.format('YYYY-MM-DD HH:mm:ss'),
      introduce: values.introduction,
      report: values.conclusion,
    };
    const { fetch, id, history } = this.props;
    const isModifying = !!id || id === 0;
    const closeSubmitting = message.loading('正在提交', 0);
    return fetch(`/crowdfund/crowd_fund${isModifying ? `/${id}` : 's'}`, {
      method: isModifying ? 'PUT' : 'POST',
      json: requestParams,
    })
      .then((response) => {
        if (!response.ok) {
          throw response;
        } else {
          return response.json();
        }
      })
      .then(
        () => {
          closeSubmitting();
          message.success(`活动${id ? '修改' : '新建'}成功`, 1).then(() => {
            history.push('/activities');
          });
        },
        (err) => {
          closeSubmitting();
          message.error(`活动新建失败${err.status}`);
        },
      );
  };

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
            templeOptions: response.map(temple => ({ label: temple.name, value: temple.id })) || [],
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`寺庙列表获取失败${err.status}`);
        },
      );
  };

  render() {
    const {
      id,
      record: { status },
    } = this.props;
    const { templeOptions, initialValues } = this.state;
    const isModifying = !!id || id === 0;
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
          if (!values.title) {
            errors.title = '标题不能为空';
          }
          if (!values.temple) {
            errors.temple = '寺庙不能为空';
          }
          if (!values.price && values.price !== 0) {
            errors.price = '单价不能为空';
          }
          if (!values.amount && values.amount !== 0) {
            errors.amount = '份数不能为空';
          }
          if (!values.startTime) {
            errors.startTime = '开始时间不能为空';
          }
          if (!values.endTime) {
            errors.endTime = '结束时间不能为空';
          }
          if (!values.image || values.image === 'loading') {
            errors.image = '预览图不能为空';
          }
          if (!values.introduction) {
            errors.introduction = '介绍不能为空';
          }
          if (
            values.startTime
            && values.endTime
            && values.startTime.valueOf() > values.endTime.valueOf()
          ) {
            errors.startTime = '开始时间不能大于结束时间';
            errors.endTime = '开始时间不能大于结束时间';
          }
          return errors;
        }}
      >
        <Form>
          <Row>
            <Col span={8}>
              <FormItem name="title" label="标题" {...formItemLayout}>
                <InputField name="title" placeholder="限制20个字" maxLength={20} />
              </FormItem>
              <FormItem name="price" label="单价" {...formItemLayout}>
                <InputNumberField
                  name="price"
                  min={0}
                  max={100000000}
                  placeholder="最小单位0.01元"
                  precision={2}
                  disabled={isModifying}
                />
              </FormItem>
              <FormItem name="amount" label="份数" {...formItemLayout}>
                <InputNumberField
                  name="amount"
                  min={0}
                  max={100000000}
                  placeholder="整数"
                  precision={0}
                  disabled={isModifying}
                />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem name="temple" label="所属寺庙" {...formItemLayout}>
                <SelectField
                  name="temple"
                  placeholder="请选择寺庙"
                  options={templeOptions}
                  disabled={isModifying}
                />
              </FormItem>
              <FormItem name="startTime" label="开始时间" {...formItemLayout}>
                <DatePickerField name="startTime" disabled={isModifying} />
              </FormItem>
              <FormItem name="endTime" label="结束时间" {...formItemLayout}>
                <DatePickerField name="endTime" disabled={isModifying} />
              </FormItem>
            </Col>
            <Col id="img-uploader" span={8} className="preview">
              <FormItem name="image" label="预览图设置" {...formItemLayout}>
                <ImageUploadField name="image" aspect={89 / 192} />
              </FormItem>
            </Col>
          </Row>
          <FormItem name="introduction" label="众筹介绍">
            <RichEditorField name="introduction" />
          </FormItem>
          {isModifying
            && /2|3/.exec(String(status)) && (
              <FormItem name="conclusion" label="结果汇报">
                <RichEditorField name="conclusion" />
              </FormItem>
          )}
          <Row>
            <Col span={4} offset={16}>
              <Link to="/activities">
                <Button type="primary" icon="close">
                  取消
                </Button>
              </Link>
            </Col>
            <Col span={4}>
              <Button type="primary" htmlType="submit" icon="save">
                保存
              </Button>
            </Col>
          </Row>
        </Form>
      </Formik>
    );
  }
}

export default withFetch(withRouter(Activities));
