import React, { Component } from 'react';
import update from 'immutability-helper';
import {
  Card, Input, Button, message,
} from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import TableNews from './components/TableNews';
import TitleBar from './components/TitleBar';

class Index extends Component {
  state = {
    data: [],
    pager: {},
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  handleTableChange = (pagination) => {
    const { pager } = { ...this.state };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.fetchData({
      pageSize: pagination.pageSize,
      page: pagination.current,
    });
  };

  handleSearch = (keyword) => {
    const { pager } = this.state;
    pager.current = 1;
    this.setState({
      pager: { ...pager, ...{ current: 1 } },
    });
    this.fetchData({
      per_page: pager.pageSize,
      page: pager.current,
      keyword,
    });
  };

  fetchData = ({ page = 1, pageSize = 10, keyword = null } = {}) => {
    const { fetch, authorize, history } = this.props;
    this.setState({ loading: true });
    return fetch('/news', {
      method: 'get',
      json: {
        page,
        per_page: pageSize,
        ...(keyword || keyword === 0 ? { search: keyword } : {}),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const {
            data: { data: news, total },
          } = response;
          const { pagination } = this.state;
          // Read total count from server
          this.setState({
            data: news,
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
          message.error(`法讯加载失败${err.status}`);
        },
      );
  };

  handleSwitch = (checked, id, index) => {
    const { fetch, authorize, history } = this.props;
    const { data } = this.state;
    this.setState({ loading: true });
    return fetch(`/news/${checked ? 'enable' : 'disable'}/${id}`, {
      method: 'PUT',
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
              data: update(data, { [index]: { is_show: val => !val } }),
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
            left="法讯管理"
            middle={(
              <Input.Search
                placeholder="搜索标题"
                onSearch={this.handleSearch}
                enterButton
                style={{ width: 200 }}
              />
            )}
            right={(
              <Link to="/news/edit">
                <Button type="primary" shape="circle" icon="plus" />
              </Link>
            )}
          />
        )}
      >
        <TableNews {...this.state} onChange={this.handleTableChange} onSwitch={this.handleSwitch} />
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
