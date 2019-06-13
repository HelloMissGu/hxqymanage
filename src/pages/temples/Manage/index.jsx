import React, { Component } from 'react';
import update from 'immutability-helper';
import {
  Card, Input, Button, message,
} from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import TableTemples from './components/TableTemples';
import TitleBar from './components/TitleBar';

class Index extends Component {
  state = {
    data: [],
    loading: false,
    pager: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  handleSearch = (keyword) => {
    this.fetchData({ keyword });
  };

  fetchData = ({ keyword = null } = {}) => {
    const { fetch, authorize, history } = this.props;
    this.setState({ loading: true });
    return fetch('/ecommerce/temples', {
      method: 'get',
      json: {
        ...(keyword || keyword === 0 ? { search: keyword } : {}),
      },
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (temples) => {
          const filteredTemples = keyword
            ? temples.filter(item => item.name.indexOf(keyword) > -1)
            : temples;
          this.setState({
            loading: false,
            data: (filteredTemples || []).map(
              ({ all_turnover: amountHistory, month_turnover: amountCurrent, ...temple }) => ({
                ...temple,
                amountCurrent: amountCurrent / 100,
                amountHistory: amountHistory / 100,
              }),
            ),
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

  handleSwitch = (checked, record, index) => {
    const { fetch, authorize, history } = this.props;
    const { data, pager } = this.state;
    const { current = 1, pageSize = 10 } = pager || {};
    this.setState({ loading: true });
    return fetch(`/ecommerce/temple/${record.id}`, {
      method: 'PUT',
      json: { ...record, status: checked },
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
          const indexInArray = (current - 1) * pageSize + index;
          this.setState(
            () => ({
              data: update(data, { [indexInArray]: { status: val => !val } }),
            }),
            () => {
              message.success(`修改成功，现已${checked ? '营业' : '停业'}`);
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

  handlePageChange = (pagination) => {
    this.setState({
      pager: pagination,
    });
  };

  render() {
    return (
      <Card
        title={(
          <TitleBar
            left="寺庙管理"
            middle={(
              <Input.Search
                placeholder="搜索寺庙名称"
                onSearch={this.handleSearch}
                enterButton
                style={{ width: 200 }}
              />
            )}
            right={(
              <Link to="/temples/edit">
                <Button type="primary" shape="circle" icon="plus" />
              </Link>
            )}
          />
        )}
      >
        <TableTemples
          {...this.state}
          onSwitch={this.handleSwitch}
          onChange={this.handlePageChange}
        />
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
