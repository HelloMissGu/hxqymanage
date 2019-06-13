import React from 'react';
import { Formik } from 'formik';
import {
  Button, Row, Col, Spin, message,
} from 'antd';
import { withRouter } from 'react-router-dom';
import {
  Form, FormItem, InputField, CheckboxGroupField,
} from '../../../../utils/forms';
import { withFetch } from '../../../../utils/fetch';
import { withToken } from '../../../../utils/token';

class News extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      userData: null,
      permissionOptions: [
        { value: 0, label: '运营配置' },
        { value: 1, label: '发布配置' },
        { value: 2, label: '商品配置' },
        { value: 3, label: '寺庙配置' },
        { value: 4, label: '推广配置' },
        { value: 5, label: '订单配置' },
        { value: 6, label: '数据配置' },
      ],
    };
  }

  componentDidMount() {
    const { id } = this.props;
    if (id) {
      this.fetchData();
      // this.fetchGroupOptions();
    }
  }

  onSubmit({ permissions, ...values }, { setSubmitting, setErrors }) {
    const {
      fetch, onClose, authorize, history, id, templeId, getTempleId,
    } = this.props;
    // eslint-disable-next-line no-mixed-operators
    const isEditing = id || id === 0;
    const methodName = isEditing ? '修改' : '新建';
    const temple = templeId || getTempleId();
    return fetch(`/staff/${temple}${isEditing ? `/${id}` : ''}`, {
      method: isEditing ? 'PUT' : 'POST',
      json: {
        ...values,
        // eslint-disable-next-line no-mixed-operators
        permissions: (permissions || []).reduce((acc, cur) => acc + 2 ** cur.id, 0),
      },
    })
      .then((response) => {
        setSubmitting(false);
        if (!response.ok) {
          throw response;
        }
      })
      .then(
        () => {
          message.success(`用户${methodName}成功`, 1).then(() => {
            onClose(null, true);
          });
        },
        (err) => {
          switch (err.status) {
            case 409:
              setErrors('phone', '账号已注册');
              break;
            case 401:
              authorize(null);
              history.replace('/');
              return;
            default:
              break;
          }
          message.error(`用户${methodName}失败：${(err && err.message) || err.status}`);
        },
      );
  }

  fetchData = () => {
    const {
      fetch, authorize, history, id, templeId,
    } = this.props;
    return fetch(`/staff/${templeId}/${id}`, {
      method: 'get',
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const { staff: { permissions, ...staff } = {} } = response;
          this.setState({
            userData: {
              ...staff,
              permissions: Number(permissions)
                .toString(2)
                .split('')
                .reverse()
                .map((val, index) => val * (index + 1))
                .filter(val => val)
                .map(val => ({ id: val - 1 })),
            },
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
    const { onClose, id } = this.props;
    const { userData, permissionOptions } = this.state;
    const isEditing = id || id === 0;
    const validate = (values) => {
      // same as above, but feel free to move this into a class method now.
      const errors = {};
      if (!values.name) {
        errors.name = '姓名不能为空';
      }
      if (!values.phone) {
        errors.phone = '账号不能为空';
      }
      if (values.phone && !/^[0-9]{11}$/.exec(values.phone)) {
        errors.phone = '用户账号：不符合手机号码格式';
      }
      if (!values.password && !isEditing) {
        errors.password = '密码不能为空';
      }
      return errors;
    };
    if (!userData && id) {
      return <Spin style={{ width: '100%' }} />;
    }

    return (
      <Formik
        {...this.props}
        onSubmit={this.onSubmit}
        initialValues={userData}
        isInitialValid
        validate={validate}
      >
        <Form>
          <FormItem name="name">
            <InputField name="name" placeholder="请输入用户姓名" />
          </FormItem>
          <FormItem name="phone">
            <InputField name="phone" placeholder="请输入用户账号" />
          </FormItem>
          <FormItem name="password">
            <InputField name="password" type="password" placeholder="请输入账号初始密码" />
          </FormItem>
          <FormItem name="permissions" label="用户组">
            {permissionOptions ? (
              <CheckboxGroupField
                name="permissions"
                options={permissionOptions}
                className="ant-input"
                style={{ height: 'unset', minHeight: '200px' }}
              />
            ) : (
              <Spin style={{ width: '100%' }} />
            )}
          </FormItem>
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

export default withToken(withFetch(withRouter(News)));
