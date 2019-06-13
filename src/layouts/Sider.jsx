import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';
import { withToken } from '../utils/token';
import { withFetch } from '../utils/fetch';

const { SubMenu, ItemGroup, Item } = Menu;

const MenuTitle = ({ icon, children }) => (
  <span>
    <Icon type={icon} />
    {children}
  </span>
);

const Sider = ({ isAuthorized, getPermissions }) => {
  const {
    operation,
    publication,
    products,
    temples,
    agents,
    bills,
    statistics,
    authorizations,
    // feedback,
  } = getPermissions();
  return (
    <Layout.Sider>
      {isAuthorized() && (
        <Menu mode="inline" theme="dark" style={{ lineHeight: '64px' }}>
          {operation && (
            <SubMenu
              key="operation"
              title={(
                <MenuTitle icon="pay-circle">
                  运营
                </MenuTitle>
              )}
            >
              <Item key="operation">
                <NavLink to="/operation">
                  参数配置
                </NavLink>
              </Item>
              <ItemGroup title="品类编辑">
                <Item key="GD">
                  <NavLink to="/operation/GD">
                    供灯配置
                  </NavLink>
                </Item>
                <Item key="PW">
                  <NavLink to="/operation/PW">
                    牌位配置
                  </NavLink>
                </Item>
                <Item key="FD">
                  <NavLink to="/operation/FD">
                    福带配置
                  </NavLink>
                </Item>
              </ItemGroup>
            </SubMenu>
          )}
          {publication && (
            <SubMenu
              key="publication"
              title={(
                <MenuTitle icon="notification">
                  发布
                </MenuTitle>
              )}
            >
              <Item key="activities">
                <NavLink to="/activities">
                  活动管理
                </NavLink>
              </Item>
              <Item key="news">
                <NavLink to="/news">
                  法讯管理
                </NavLink>
              </Item>
              <Item key="feedback">
                <NavLink to="/feedback">
                  反馈管理
                </NavLink>
              </Item>
            </SubMenu>
          )}
          {products && (
            <SubMenu
              key="products-menu"
              title={(
                <MenuTitle icon="gift">
                  {'商品'}
                </MenuTitle>
              )}
            >
              <Item key="products">
                <NavLink to="/products">
                  商品管理
                </NavLink>
              </Item>
            </SubMenu>
          )}
          {temples && (
            <SubMenu
              key="temple-menu"
              title={(
                <MenuTitle icon="home">
                  {'寺庙'}
                </MenuTitle>
              )}
            >
              <Item key="temples">
                <NavLink to="/temples">
                  {'寺庙管理'}
                </NavLink>
              </Item>
            </SubMenu>
          )}
          {agents && (
            <SubMenu
              key="agents-menu"
              title={(
                <MenuTitle icon="team">
                  {'推广'}
                </MenuTitle>
              )}
            >
              <Item key="agents">
                <NavLink to="/agents">
                  {'推广管理'}
                </NavLink>
              </Item>
            </SubMenu>
          )}
          {bills && (
            <SubMenu
              key="bills-menu"
              title={(
                <MenuTitle icon="pay-circle-o">
                  {'订单'}
                </MenuTitle>
              )}
            >
              <Item key="bills-GD">
                <NavLink to="/bills/GD">
                  {'供灯订单'}
                </NavLink>
              </Item>
              <Item key="bills-PW">
                <NavLink to="/bills/PW">
                  {'牌位订单'}
                </NavLink>
              </Item>
              <Item key="bills-FD">
                <NavLink to="/bills/FD">
                  {'福带订单'}
                </NavLink>
              </Item>
            </SubMenu>
          )}
          {authorizations && (
            <SubMenu
              key="authorizations-menu"
              title={(
                <MenuTitle icon="gift">
                  {'权限'}
                </MenuTitle>
              )}
            >
              <Item key="authorizations">
                <NavLink to="/authorizations">
                  {'权限管理'}
                </NavLink>
              </Item>
            </SubMenu>
          )}
          {statistics && (
            <SubMenu
              key="statistics-menu"
              title={(
                <MenuTitle icon="table">
                  {'报表'}
                </MenuTitle>
              )}
            >
              <Item key="statistics">
                <NavLink to="/statistics">
                  {'数据报表'}
                </NavLink>
              </Item>
            </SubMenu>
          )}
        </Menu>
      )}
    </Layout.Sider>
  );
};

export default withToken(withFetch(withRouter(Sider)));
