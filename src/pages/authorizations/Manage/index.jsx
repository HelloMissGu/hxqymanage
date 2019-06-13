import React, { Component } from 'react';
import {
  Card, Input, Drawer, message, Button,
} from 'antd';
import update from 'immutability-helper';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import { withToken } from '../../../utils/token';
import Table from './components/Table';
import TitleBar from './components/TitleBar';
import Form from './components/Form';

class Index extends Component {
  state = {
    data: [],
    pager: {},
    filters: {},
    loading: false,
    formData: {},
    // templeOptions: [],
    // templeDic: {},
    selectedRows: [],
    drawerVisible: false,
    drawerUserId: undefined,
  };

  componentDidMount() {
    this.fetchData();
    /*
    this.fetchTempleOptions().then(() => {
      this.fetchData();
    });
    */
  }

  handleDrawerClose = (e, success = false) => {
    this.setState(
      {
        drawerVisible: false,
      },
      success ? this.fetchData : null,
    );
  };

  handleSwitch = (checked, { name, temple_id: templeId, id }, index) => {
    const { fetch, authorize, history } = this.props;
    const { data } = this.state;
    this.setState({ loading: true });
    return fetch(`/staff/${templeId}/${checked ? 'enable' : 'disable'}/${id}`, {
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
              data: update(data, { [index]: { is_available: val => !val } }),
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

  handleTableChange = (pager, filters) => {
    this.setState(
      {
        pager,
        filters,
      },
      () => {
        this.fetchData();
      },
    );
  };

  handleSearch = (keyword) => {
    const { pager } = this.state;
    pager.current = 1;
    this.setState(
      {
        pager: { ...pager, ...{ current: 1 } },
        keyword,
      },
      this.fetchData,
    );
  };

  showDrawer = ({ temple_id: templeId, id } = {}) => {
    this.setState({
      drawerVisible: true,
      drawerUserId: id,
      drawerTempleId: templeId,
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

  fetchData = () => {
    const { fetch, getTempleId } = this.props;
    const {
      pager: { current: page, pageSize },
      pager,
      // templeDic,
      keyword,
      filters,
    } = this.state;
    const { group: groupFilter } = filters;
    console.log(groupFilter);
    const templeId = getTempleId();
    if (!templeId) {
      message.error('用户列表获取失败：无权限');
      return null;
    }
    this.setState({ loading: true });
    return fetch(`/staff${templeId === '0' ? '' : `/${templeId}`}`, {
      method: 'get',
      json: {
        page: page || 1,
        per_page: pageSize || 10,
        ...(keyword ? { search: keyword } : null),
        ...(groupFilter && groupFilter.length
          ? {
            is_admin: !!Number(groupFilter[0][1]),
            temple_id: { 0: '0', 2: 'agent' }[groupFilter[0][0]] || 'other',
          }
          : null),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const data = response.data.data.map(
            ({ temple_id: temple, is_admin: isAdmin, ...item }) => ({
              ...item,
              temple_id: temple,
              is_admin: isAdmin,
              group:
                ({ agent: '推广代理', 0: '运营后台' }[temple] || '寺庙后台')
                + (isAdmin ? '（管理员）' : ''),
            }),
          );
          this.setState({
            pager: { ...pager, total: response.data.total },
            data,
          });
        },
        (err) => {
          message.error(`用户列表获取失败${err.status}`);
        },
      );
  };

  render() {
    const {
      drawerVisible,
      drawerUserId,
      drawerTempleId,
      pager,
      filters,
      loading,
      data,
    } = this.state;
    return (
      <Card
        title={(
          <TitleBar
            left="权限管理"
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
        <Table
          {...this.state}
          pagination={pager}
          filters={filters}
          onChange={this.handleTableChange}
          onSwitch={this.handleSwitch}
          viewDetail={this.showDrawer}
          loading={loading}
          data={data}
        />
        <Drawer
          title={drawerUserId || drawerUserId === 0 ? '修改用户' : '新建用户'}
          width={300}
          placement="right"
          onClose={this.handleDrawerClose}
          visible={drawerVisible}
          style={{
            overflow: 'auto',
          }}
          destroyOnClose
        >
          <Form onClose={this.handleDrawerClose} id={drawerUserId} templeId={drawerTempleId} />
        </Drawer>
      </Card>
    );
  }
}
export default withToken(withFetch(withRouter(Index)));
