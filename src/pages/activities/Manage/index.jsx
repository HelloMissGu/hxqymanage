import React, { Component } from 'react';
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
    filters: {},
    keyword: undefined,
    loading: false,
    templeOptions: [],
    templeDic: {},
  };

  componentDidMount() {
    this.fetchTempleOptions().then(this.fetchData);
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

  fetchTempleOptions = () => new Promise((resolve) => {
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
          this.setState(
            {
              templeOptions:
                  response.map(temple => ({ text: temple.name, value: temple.id })) || [],
              templeDic: response.reduce((acc, cur) => {
                const { id, name } = cur;
                acc[id] = name;
                return acc;
              }, {}),
            },
            resolve,
          );
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
  });

  fetchData = () => {
    const { fetch, authorize, history } = this.props;
    const {
      pagination: { current: page, pageSize },
      filters: { temple, status },
      keyword,
    } = this.state;
    this.setState({ loading: true });
    return fetch('/crowdfund/crowd_funds', {
      method: 'get',
      json: {
        page,
        page_size: pageSize,
        ...(temple && temple.length ? { temple_id__in: temple } : null),
        ...(status && status.length ? { status__in: status } : null),
        ...(keyword ? { search: keyword } : null),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const { results, count: total } = response;
          const { pagination, templeDic } = this.state;
          // Read total count from server
          this.setState({
            data: results.map(item => ({
              ...item,
              progress: `${(item.release_stock * item.price) / 100} / ${(item.stock * item.price)
                / 100}`,
              startTime: item.start_time,
              endTime: item.end_time,
              createdTime: item.created,
              temple: templeDic[item.temple_id],
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
          }
        },
      );
  };

  render() {
    return (
      <Card
        title={(
          <TitleBar
            left="活动管理"
            middle={(
              <Input.Search
                placeholder="搜索标题"
                onSearch={this.handleSearch}
                enterButton
                style={{ width: 200 }}
              />
)}
            right={(
              <Link to="/activities/edit">
                <Button type="primary" shape="circle" icon="plus" />
              </Link>
)}
          />
)}
      >
        <Table {...this.state} onChange={this.handleTableChange} />
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
