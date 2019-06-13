import React from 'react';
import { Formik, FieldArray } from 'formik';
import {
  Button, Row, Col, Spin, message, Card,
} from 'antd';
import { Link, withRouter } from 'react-router-dom';
import {
  Form,
  FormItem,
  InputField,
  InputNumberField,
  ImageUploadField,
  TextAreaField,
  SelectField,
  CheckboxGroupField,
} from '../../../../utils/forms';
import './Form.css';
import { withFetch } from '../../../../utils/fetch';

class products extends React.Component {
  constructor(props) {
    super(props);
    const { initialValues } = props;
    const productType = initialValues.product_type || 'GD';
    this.state = {
      ...props,
      initialValues: {
        ...initialValues,
        productType,
        salePrice: initialValues.price,
        templePrice: initialValues.temple_price,
        amount: initialValues.stock,
        description: initialValues.describe,
        templates:
          initialValues.templates instanceof Array
            ? initialValues.templates.map(({ title: label, content: key }) => ({
              key,
              label,
            }))
            : initialValues.templates && String(initialValues.templates),
      },
      templeOptions: [],
      blessingOptions: [],
      productType,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  onSubmit = (values, { setSubmitting }) => {
    const {
      fetch,
      initialValues: { id, status },
      history,
    } = this.props;
    const isModifying = !!(id || id === 0);

    const templates = values[`${values.productType}_templates`];
    const requestParams = {
      name: values.name,
      product_type: values.productType,
      price: Math.floor(values.salePrice * 100) || 0,
      temple_price: Math.floor(values.templePrice * 100) || 0,
      stock: values.amount,
      image: values.image,
      temples: values.temples,
      describe: values.description,
      templates: JSON.stringify(
        templates instanceof Array
          ? templates.map(({ label: title, key: content, ...item }) => ({
            ...item,
            title,
            content: content || title,
          }))
          : Number(templates),
      ),
      ...(isModifying ? { id, status } : null),
    };
    return fetch(`/ecommerce/product${isModifying ? `/${id}` : 's'}`, {
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
          message.success(`商品${id ? '修改' : '新建'}成功`, 1).then(() => {
            history.push('/products');
          });
        },
        (err) => {
          message.error(`商品${id ? '修改' : '新建'}失败:${err.status}`);
        },
      );
  };

  fetchData = () => {
    this.fetchTempleOptions();
    this.fetchBlessingOptions();
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
            templeOptions: response || [],
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

  fetchBlessingOptions = () => {
    const { fetch, authorize, history } = this.props;
    return fetch('/ecommerce/api/order/templates', {
      method: 'get',
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          this.setState({
            blessingOptions: (response || []).map(({ title: label, content: key, ...item }) => ({
              ...item,
              label,
              key,
            })),
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

  handleTypeChange = (val) => {
    this.setState({
      productType: val,
    });
  };

  validate = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = '商品名称不能为空';
    }
    if (!values.salePrice) {
      errors.salePrice = '销售价格不能为0';
    }
    if (!values.templePrice) {
      errors.templePrice = '寺庙价格不能为0';
    }
    if (values.name && values.name.length > 20) {
      errors.name = '商品名称不能超过20个字';
    }
    if (!values.productType) {
      errors.productType = '商品类型不能为空';
    }
    if (!values.image) {
      errors.image = '商品图片不能为空';
    }
    if (!values.temples || values.temples.length < 1) {
      errors.temples = '所属寺庙至少1所';
    }
    if (!values.description) {
      errors.description = '商品描述不能为空';
    }
    if (values.productType === 'CS' || values.productType === 'FD') {
      const templates = values[`${values.productType}_templates`];
      if (templates instanceof Array) {
        templates.forEach((item, index) => {
          if (!item.label) {
            errors[`${values.productType}_templates.${index}.label`] = '标题不能为空';
          }
          if (!item.key) {
            errors[`${values.productType}_templates.${index}.key`] = '祈福语不能为空';
          }
        });
      }
    }
    return errors;
  };

  render() {
    const {
      productType, initialValues, templeOptions, blessingOptions,
    } = this.state;
    const { id } = this.props;
    const isModifying = !!(id || id === 0);
    if (initialValues == null && (id || id === 0)) {
      return <Spin style={{ width: '100%' }} />;
    }
    switch (productType) {
      case 'GD':
        if (Number.isNaN(Number(initialValues.templates))) {
          initialValues.GD_templates = '1';
        } else {
          initialValues.GD_templates = initialValues.templates;
        }
        break;
      case 'FD':
        initialValues.FD_templates = initialValues.templates || [{ label: '', key: '' }];
        break;
      case 'CS':
        initialValues.CS_templates = initialValues.templates || [{ label: '', key: '' }];
        break;
      case 'WS':
      default:
        break;
    }
    if (typeof initialValues.templates === 'number') {
      initialValues.templates = String(initialValues.templates);
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
    const formColumns = [
      {
        span: 8,
        offset: 0,
        items: [
          {
            name: 'name',
            label: '商品名称',
            layout: formItemLayout,
            type: 'text',
            placeholder: '限制20个字',
            maxLength: 20,
          },
          {
            name: 'salePrice',
            label: '销售价格',
            layout: formItemLayout,
            type: 'number',
            min: 0,
            max: 100000000,
            precision: 2,
          },
          {
            name: 'templePrice',
            label: '寺庙价格',
            layout: formItemLayout,
            type: 'number',
            min: 0,
            max: 100000000,
            precision: 2,
          },
          {
            name: 'amount',
            label: '当天库存',
            layout: formItemLayout,
            type: 'number',
            min: 0,
            max: 100000000,
            precision: 0,
          },
          {
            name: 'image',
            label: '商品图片',
            layout: formItemLayout,
            type: 'image',
          },
          {
            name: 'productType',
            label: '商品种类',
            layout: formItemLayout,
            type: 'select',
            options: [
              { value: 'GD', label: '供灯' },
              { value: 'FD', label: '福带' },
              { value: 'CS', label: '牌位-长生' },
              { value: 'WS', label: '牌位-往生' },
            ],
            defaultValue: 'GD',
            onChange: this.handleTypeChange,
            disabled: isModifying,
          },
          {
            name: 'description',
            label: '商品描述',
            layout: formItemLayout,
            type: 'textarea',
            placeholder: '60个字以内',
            maxLength: 60,
          },
        ],
      },
      {
        span: 8,
        offset: 3,
        items: [
          {
            name: 'temples',
            label: '所属寺庙',
            layout: formItemLayout,
            type: 'checkboxGroup',
            options: templeOptions.map(temple => ({ label: temple.name, value: temple.id })),
          },
          {
            name: 'templates',
            hide: productType === 'WS',
            label: productType === 'GD' ? '福单模板' : '祈福语模板',
            layout: productType === 'GD' ? formItemLayout : null,
            render: ({ CS_templates: cs }) => {
              switch (productType) {
                case 'GD':
                  return (
                    <SelectField
                      name="GD_templates"
                      options={blessingOptions instanceof Array ? blessingOptions : []}
                    />
                  );
                case 'FD':
                  return (
                    <div>
                      <FormItem name={`FD_templates.${0}.label`}>
                        <InputField
                          name={`FD_templates.${0}.label`}
                          placeholder="模板标题12个字以内"
                          maxLength={12}
                        />
                      </FormItem>
                      <FormItem name={`FD_templates.${0}.key`}>
                        <TextAreaField
                          name={`FD_templates.${0}.key`}
                          placeholder="祈福语 30个字以内"
                          maxLength={30}
                        />
                      </FormItem>
                    </div>
                  );
                case 'CS':
                  return (
                    <FieldArray name="CS_templates">
                      {({ push, remove }) => (
                        <Row>
                          {(cs instanceof Array ? cs : []).map((item, index) => (
                            <Card
                              className="templateCard"
                              key={`template${-index}`}
                              title={(
                                <FormItem name={`CS_templates.${index}.label`}>
                                  <InputField
                                    name={`CS_templates.${index}.label`}
                                    placeholder="模板标题12个字以内"
                                    maxLength={12}
                                  />
                                </FormItem>
)}
                              extra={(
                                <Button icon="close" type="primary" onClick={() => remove(index)}>
                                  删除
                                </Button>
)}
                            >
                              <FormItem name={`CS_templates.${index}.key`}>
                                <TextAreaField
                                  name={`CS_templates.${index}.key`}
                                  placeholder="祈福语 30个字以内"
                                  maxLength={30}
                                />
                              </FormItem>
                            </Card>
                          ))}

                          <Button
                            size="large"
                            type="dashed"
                            shape="circle"
                            icon="plus"
                            onClick={() => push({ label: '', key: '' })}
                            style={{ position: 'absolute', bottom: '100%', right: 0 }}
                          />
                        </Row>
                      )}
                    </FieldArray>
                  );
                default:
                  return null;
              }
            },
          },
        ],
      },
    ];
    return (
      <Formik
        {...this.props}
        onSubmit={this.onSubmit}
        initialValues={initialValues}
        isInitialValid
        validate={this.validate}
      >
        {({ values }) => (
          <Form>
            <Row>
              {formColumns.map(({ span, offset, items }, colIndex) => (
                <Col span={span} offset={offset} key={-colIndex}>
                  {items.map(
                    (
                      {
                        name,
                        label,
                        layout,
                        type: fieldType,
                        placeholder,
                        onChange,
                        options,
                        hide,
                        render,
                        min,
                        max,
                        precision,
                        disabled,
                        maxLength,
                      },
                      itemIndex,
                    ) => !hide && (
                    <FormItem
                      name={name}
                      label={label}
                      {...layout}
                      key={`${-colIndex}+${-itemIndex}`}
                    >
                      {(() => {
                        if (render) {
                          return render(values);
                        }
                        switch (fieldType) {
                          case 'number':
                            return (
                              <InputNumberField
                                {...{
                                  name,
                                  min,
                                  max,
                                  precision,
                                }}
                              />
                            );
                          case 'image':
                            return <ImageUploadField name={name} />;
                          case 'textarea':
                            return (
                              <TextAreaField
                                {...{ name, placeholder }}
                                rows={6}
                                maxLength={maxLength}
                              />
                            );
                          case 'select':
                            return (
                              <SelectField
                                {...{ name, options }}
                                onChange={onChange}
                                disabled={disabled}
                              />
                            );
                          case 'checkboxGroup':
                            return (
                              <CheckboxGroupField
                                {...{ name, options }}
                                className="ant-input"
                                style={{ height: 'unset' }}
                              />
                            );
                          case 'text':
                          default:
                            return (
                              <InputField {...{ name, placeholder }} maxLength={maxLength} />
                            );
                        }
                      })()}
                    </FormItem>
                    ),
                  )}
                </Col>
              ))}
            </Row>
            <Row>
              <Col span={4} offset={16}>
                <Link to="/products">
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
        )}
      </Formik>
    );
  }
}

export default withFetch(withRouter(products));
