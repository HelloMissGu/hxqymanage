import React, { Component } from 'react';
import { Card, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import Table from './components/Table';

class Index extends Component {
  state = {
    data: [],
    pagination: { current: 1, pageSize: 10 },
    loading: false,
  };

  componentWillMount() {
    this.fetchData();
  }

  componentDidMount() {
    this.handleDel();
  }

  handleTableChange = (pagination) => {
    this.setState(
      {
        pagination,
      },
      this.fetchData,
    );
  };

  fetchData = () => {
    const {
      fetch,
      authorize,
      history,
    } = this.props;
    const {
      pagination: { current: page, pageSize },
    } = this.state;

    this.setState({ loading: true });
    return fetch('/news/suggest', {
      method: 'get',
      json: {
        page,
        per_page: pageSize,
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const { data: { data: news, total } } = response;
          const { pagination } = this.state;
          this.setState({
            loading: false,
            data: news,
            pagination: {
              ...pagination,
              total,
            },
          });
        },
        (err) => {
          if (err.status === 400) {
            authorize(null);
            history.replace('/');
          }
        },
      );
  }

  handleDel() {
    const {
      fetch,
      match: {
        params: { id },
      },
    } = this.props;
    return fetch(`/news/delete/${id}`, {
      method: 'PUT',
      json: {
        id,
      },
    })
      .then(
        (response) => {
          if (response.status === 200) {
            const list = [...this.state];
            list.splice(id, 1);
            this.setState(list);
            message.success('删除成功');
            this.fetchData();
          }
        },
        (err) => {
          if (err.status === 400) {
            message.error('删除失败');
          }
        },
      );
  }

  render() {
    return (
      <Card
        title="反馈中心"
      >
        <Table {...this.state} onChange={this.handleTableChange} onClick={this.handleDel} />
      </Card>
    );
  }
}

export default withFetch(withRouter(Index));
