import React, { Component } from 'react';
import update from 'immutability-helper';
import {
  Card, Input, Button, message, Drawer,
} from 'antd';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import TableAgents from './components/TableAgents';
import TitleBar from './components/TitleBar';
import Form from './components/Form';
import QRForm from './components/QRForm';

class Index extends Component {
  state = {
    data: [],
    pager: {},
    loading: false,
    drawerVisible: false,
    temples: [],
    currentAgent: null,
    qrcodeVisible: false,
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
      pageSize: pager.pageSize,
      page: pager.current,
      keyword,
    });
  };

  showDrawer = () => {
    this.setState({
      drawerVisible: true,
    });
  };

  showQRCode = (agent) => {
    this.setState({
      qrcodeVisible: true,
      currentAgent: agent,
    });
  };

  closeQRCode = () => {
    this.setState({
      qrcodeVisible: false,
      currentAgent: null,
    });
  };

  handleDrawerClose = (e, success = false) => {
    this.setState(
      {
        drawerVisible: false,
      },
      success ? this.fetchData : null,
    );
  };

  fetchData = ({ page = 1, pageSize = 10, keyword = null } = {}) => {
    const { fetch, authorize, history } = this.props;
    this.setState({ loading: true });
    return fetch('/staff/agent', {
      method: 'get',
      json: {
        page,
        per_page: pageSize,
        ...(keyword || keyword === 0 ? { search: keyword } : null),
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
            data: { data },
            total,
          } = response;
          const { pagination } = this.state;
          // Read total count from server
          this.setState({
            loading: false,
            data,
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

  fetchTempleOptions = () => {
    const { fetch, authorize, history } = this.props;
    this.setState({ loading: true });
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
            temples: response || [],
            loading: false,
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

  handleSwitch = (checked, { name, id }, index) => {
    const { fetch, authorize, history } = this.props;
    const { data, pager } = this.state;
    const { current = 1, pageSize = 10 } = pager || {};
    this.setState({ loading: true });
    return fetch(`/staff/agent/${checked ? 'enable' : 'disable'}/${id}`, {
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
          const indexInArray = (current - 1) * pageSize + index;
          this.setState(
            () => ({
              data: update(data, { [indexInArray]: { is_available: val => !val } }),
            }),
            () => {
              message.success(`修改成功，${name} 现已${checked ? '在职' : '停职'}`);
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
    const { drawerVisible, qrcodeVisible, currentAgent } = this.state;
    return (
      <Card
        title={(
          <TitleBar
            left="推广管理"
            middle={(
              <Input.Search
                placeholder="搜索用户名、手机号"
                onSearch={this.handleSearch}
                enterButton
              />
)}
            right={<Button type="primary" shape="circle" icon="plus" onClick={this.showDrawer} />}
          />
)}
      >
        <TableAgents
          {...this.state}
          onChange={this.handleTableChange}
          onSwitch={this.handleSwitch}
          showQRCode={this.showQRCode}
        />
        <Drawer
          title="新建用户"
          width={300}
          placement="right"
          onClose={this.handleDrawerClose}
          visible={drawerVisible}
          style={{
            overflow: 'auto',
          }}
        >
          <Form onClose={this.handleDrawerClose} />
        </Drawer>
        <Drawer
          title="导出二维码"
          width={300}
          placement="right"
          onClose={this.closeQRCode}
          visible={qrcodeVisible}
          destroyOnClose
        >
          <QRForm agent={currentAgent} />
        </Drawer>
      </Card>
    );
  }
}
export default withFetch(withRouter(Index));
