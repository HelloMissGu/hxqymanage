import React, { Component } from 'react';
import update from 'immutability-helper';
import {
  Card, Input, Button, message,
} from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import Table from './components/Table';
import TitleBar from './components/TitleBar';

class Index extends Component {
  state = {
    data: [],
    pagination: { current: 1, pageSize: 10 },
    loading: false,
    filters: {},
    keyword: undefined,
  };

  componentDidMount() {
    this.fetchData();
  }    

  handleTableChange = (pagination, filters) => {
    this.setState(
      {
        pagination,
        filters,
      },
      this.fetchData,
    );
  };

  handleSearch = (keyword) => {
    const { pagination } = this.state;
    this.setState(
      {
        pagination: { ...pagination, current: 1 },
        keyword,
      },
      this.fetchData,
    );
  };

  fetchData = () => {
    const { fetch, authorize, history } = this.props;
    const {
      pagination: { current: page, pageSize },
      keyword,
      filters: { product_type: typeFilter } = {},
    } = this.state;
    this.setState({ loading: true });
    return fetch('/ecommerce/products', {
      method: 'get',
      json: {
        page,
        per_page: pageSize,
        ...(typeFilter && typeFilter.length ? { product_type__in: typeFilter } : null),
        ...(keyword ? { search: keyword } : null),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        (response) => {
          const { results: products, count: total } = response;
          const { pagination } = this.state;
          // Read total count from server
          this.setState({
            loading: false,
            data: products.map(({
              templates, price, temple_price: templePrice, ...item
            }) => ({
              ...item,
              price: price / 100,
              temple_price: templePrice / 100,
              templates: JSON.parse(templates),
            })),
            pagination: {
              ...pagination,
              total,
            },
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`商品获取失败${err.status}`);
        },
      );
  };

  handleSwitch = (checked, record, index) => {
    const { fetch, authorize, history } = this.props;
    const { data } = this.state;
    this.setState({ loading: true });
    return fetch(`/ecommerce/product/${record.id}`, {
      method: 'PUT',
      json: {
        ...record,
        status: checked ? 1 : 0,
        price: record.price * 100,
        temple_price: record.temple_price * 100,
        templates: JSON.stringify(record.templates),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) {
          throw response;
        } else {
          return response.json();
        }
      })
      .then(
        () => {
          this.setState(
            () => ({
              data: update(data, { [index]: { status: val => !val } }),
            }),
            () => {
              message.success(`修改成功，现已${checked ? '发布' : '下架'}`);
            },
          );
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`修改失败${err.status}`);
        },
      );
  };

  render() {
    return (
      <Card
        title={(
          <TitleBar
            left="商品管理"
            middle={(
              <Input.Search
                placeholder="搜索商品名称"
                onSearch={this.handleSearch}
                enterButton
                style={{ width: 200 }}
              />
)}
            right={(
              <Link to="/products/edit">
                <Button type="primary" shape="circle" icon="plus" />
              </Link>
)}
          />
)}
      >
        <Table {...this.state} onChange={this.handleTableChange} onSwitch={this.handleSwitch} />
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
