import React, { Component } from 'react';
import {
  Card, Button, message, Steps,
} from 'antd';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import Table from './components/Table';
import TitleBar from './components/TitleBar';

class Index extends Component {
  constructor(props) {
    super(props);
    const {
      location: {
        state: {
          record,
          record: { status },
        },
      },
      match: {
        params: { id },
      },
    } = props;
    this.state = {
      data: [],
      pager: {},
      loading: false,
      templeOptions: [],
      id,
      record,
      status,
    };
  }

  componentDidMount() {
    this.fetchData();
    this.fetchTempleOptions();
  }

  nextStage = () => {
    const { fetch, authorize, history } = this.props;
    const { id, status } = this.state;
    let nextStatusString;
    let nextStatusValue;
    if (String(status) === '1') {
      nextStatusString = 'end';
      nextStatusValue = 2;
    } else if (String(status) === '2') {
      nextStatusString = 'finish';
      nextStatusValue = 3;
    } else {
      return null;
    }
    return fetch(`/crowdfund/crowd_fund/${id}/status`, {
      method: 'post',
      json: {
        id,
        status: nextStatusString,
      },
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        () => {
          message.success('众筹状态修改成功');
          this.setState({
            status: nextStatusValue,
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
          } else {
            message.error(`众筹状态修改失败${err.status}`);
          }
        },
      );
  };

  handleTableChange = (pagination, filters) => {
    const { pager } = { ...this.state };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.fetchData({
      pageSize: pagination.pageSize,
      page: pagination.current,
      filters,
    });
  };

  handleSearch = (keyword) => {
    const { pager } = this.state;
    pager.current = 1;
    this.setState({
      pager: { ...pager, ...{ current: 1 } },
    });
    this.fetchData({
      pageSize: pager.pageSize,
      page: pager.current,
      keyword,
    });
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
            templeOptions: response.map(temple => ({ text: temple.name, value: temple.id })) || [],
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

  fetchData = ({ page = 1, pageSize = 10 } = {}) => {
    const {
      fetch,
      match: {
        params: { id },
      },
      authorize,
      history,
    } = this.props;
    this.setState({ loading: true });
    return fetch(`/crowdfund/api/crowd_fund/${id}/orders`, {
      method: 'get',
      json: {
        page,
        page_size: pageSize,
      },
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const { orders, count: total } = response;
          const { pagination } = this.state;
          // Read total count from server
          this.setState({
            loading: false,
            data: orders,
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
    let rightObj = null;
    let middleObj = null;
    const { status } = this.state;
    if (String(status) === '1') {
      rightObj = (
        <Button type="primary" onClick={this.nextStage}>
          {'提前结束'}
        </Button>
      );
    } else if (String(status) === '2') {
      rightObj = (
        <Button type="primary" onClick={this.nextStage}>
          {'完成众筹'}
        </Button>
      );
    } else {
      rightObj = null;
    }
    middleObj = (
      <Steps current={status} size="small">
        <Steps.Step title="待上线" />
        <Steps.Step title="众筹中" />
        <Steps.Step title="已结束" />
        <Steps.Step title="已完成" />
      </Steps>
    );
    return (
      <Card title={<TitleBar left="标题-活动众筹明细" middle={middleObj} right={rightObj} />}>
        <Table {...this.state} onChange={this.handleTableChange} />
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
