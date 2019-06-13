import React, { Component } from 'react';
import { Card, message, DatePicker } from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import TableDetail from './components/TableDetail';
import TitleBar from './components/TitleBar';

const { RangePicker } = DatePicker;

class Index extends Component {
  state = {
    data: [],
    pager: {},
    loading: false,
    startTime: undefined,
    endTime: undefined,
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

  handleDatePick = ([startTime, endTime] = []) => {
    this.fetchData({ startTime: startTime.unix(), endTime: endTime.unix() });
  };

  fetchData = ({ startTime, endTime } = {}) => {
    const {
      fetch,
      location: {
        state: {
          record: { phone },
        },
      },
      authorize,
      history,
    } = this.props;
    this.setState({ loading: true });
    return fetch(`/invitation/agent/${phone}/store`, {
      method: 'get',
      json: {
        ...(startTime ? { invitations_from: startTime } : null),
        ...(endTime ? { invitations_to: endTime } : null),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          // Read total count from server
          this.setState({
            data: response.map(item => ({
              ...item,
              temple: item.name || item.id,
              underlings: item.count,
              firstConsumption: item.first_consumption,
              totalConsumption: item.total_consumption,
            })),
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error('明细获取失败：网络故障');
        },
      );
  };

  render() {
    const {
      location: {
        state: {
          record: { name, phone },
        },
      },
    } = this.props;
    return (
      <Card
        title={(
          <TitleBar
            left={`${name}(${String(phone).slice(-4)})`}
            middle={(
              <RangePicker
                locale={locale}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder={['起始时间', '结束时间']}
                onOk={this.handleDatePick}
                onChange={(dates) => {
                  if (dates.length === 0) this.fetchData();
                }}
              />
)}
          />
)}
      >
        <TableDetail
          {...this.state}
          onChange={this.handleTableChange}
        />
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
