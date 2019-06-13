import React, { Component } from 'react';
import {
  Layout, Row, Col, Button, Icon, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import { withFetch } from '../utils/fetch';
import { withToken } from '../utils/token';

class Header extends Component {
  constructor(props) {
    super(props);

    this.onChangePassword = this.onChangePassword.bind(this);
    this.onLogout = this.onLogout.bind(this);
  }

  componentDidMount() {
    const {
      refreshToken, isAuthorized, setToken, authorize,
    } = this.props;
    if (isAuthorized()) {
      refreshToken()
        .then((response) => {
          if (response.json) {
            return response.json();
          }
          throw response;
        })
        .then(
          (data) => {
            authorize(data.token);
            setToken(data.token);
          },
          (err) => {
            message.error(`权限获取失败${err.status}`);
          },
        );
    }
  }

  onChangePassword() {
    const { history } = this.props;
    history.push('/change-password');
  }

  onLogout() {
    const { authorize, history, setToken } = this.props;
    authorize(null);
    setToken(null);
    history.push('/');
  }

  render() {
    const { isAuthorized } = this.props;
    return (
      <Layout.Header>
        <Row align="middle" justify="space-between" type="flex" style={{ color: 'white' }}>
          <Col>
            <h1 style={{ color: 'white' }}>
              <Icon type="tool" />
              {'华夏祈福 后台管理系统'}
            </h1>
          </Col>
          {isAuthorized() ? (
            <Col>
              <Button
                ghost
                type="dashed"
                shape="circle"
                icon="key"
                onClick={this.onChangePassword}
              />
              {' '}
              <Button ghost type="dashed" shape="circle" icon="logout" onClick={this.onLogout} />
            </Col>
          ) : null}
        </Row>
      </Layout.Header>
    );
  }
}

export default withToken(withFetch(withRouter(Header)));
