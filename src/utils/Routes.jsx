import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import { Spin } from 'antd';
import { withFetch } from './fetch';
import { withToken } from './token';

const lazy = loader => Loadable({
  loader,
  loading: () => <Spin delay={200} size="large" style={{ width: '100%', height: '100%' }} />,
});
const PrivateRoute = withToken(
  withFetch(
    ({
      getPermissions, permissionRequired, path, isAuthorized, component: Component, ...rest
    }) => (
      <Route
        path={path}
        {...rest}
        render={({ location, ...props }) => {
          if (!isAuthorized()) {
            return (
              <Redirect
                to={{
                  pathname: '/login',
                  state: { from: location },
                }}
              />
            );
          }
          const permissions = getPermissions();
          const firstWord = path.split('/')[1] || '';
          const permissionNeeded = permissionRequired || firstWord;
          if (!permissionNeeded || permissions[permissionNeeded]) {
            return <Component location={location} {...props} />;
          }
          return (
            <Redirect
              to={{
                pathname: '/',
                state: { from: location },
              }}
            />
          );
        }}
      />
    ),
  ),
);

const Routes = () => (
  <Switch>
    <PrivateRoute exact strict path="/" component={lazy(() => import('../pages/Dashboard'))} />
    <Route exact strict path="/login" component={lazy(() => import('../pages/account/Login'))} />
    <Route
      exact
      strict
      path="/change-password"
      component={lazy(() => import('../pages/account/ChangePassword'))}
    />
    <PrivateRoute
      exact
      strict
      path="/operation/:type"
      component={lazy(() => import('../pages/operation/Config'))}
    />
    <PrivateRoute
      exact
      strict
      path="/operation"
      component={lazy(() => import('../pages/operation/Index'))}
    />
    <PrivateRoute
      exact
      strict
      path="/feedback"
      permissionRequired="publication"
      component={lazy(() => import('../pages/feedback/Manage'))}
    />
    <PrivateRoute
      exact
      strict
      path="/feedback/del/:id?"
      permissionRequired="publication"
      component={lazy(() => import('../pages/feedback/Manage'))}
    />
    <PrivateRoute
      exact
      strict
      path="/news"
      permissionRequired="publication"
      component={lazy(() => import('../pages/news/Manage')) /* 法讯管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/news/edit/:id?"
      permissionRequired="publication"
      component={lazy(() => import('../pages/news/Edit')) /* 法讯编辑 */}
    />
    <PrivateRoute
      exact
      strict
      path="/activities"
      permissionRequired="publication"
      component={lazy(() => import('../pages/activities/Manage')) /* 活动管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/activities/edit/:id?"
      permissionRequired="publication"
      component={lazy(() => import('../pages/activities/Edit')) /* 活动编辑 */}
    />
    <PrivateRoute
      exact
      strict
      path="/activities/detail/:id?"
      permissionRequired="publication"
      component={lazy(() => import('../pages/activities/Detail')) /* 活动明细 */}
    />
    <PrivateRoute
      exact
      strict
      path="/products"
      component={lazy(() => import('../pages/products/Manage')) /* 商品管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/products/edit/:id?"
      component={lazy(() => import('../pages/products/Edit')) /* 商品编辑 */}
    />
    <PrivateRoute
      exact
      strict
      path="/temples"
      component={lazy(() => import('../pages/temples/Manage')) /* 寺庙管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/temples/edit/:id?"
      component={lazy(() => import('../pages/temples/Edit')) /* 寺庙编辑 */}
    />
    <PrivateRoute
      exact
      strict
      path="/agents"
      component={lazy(() => import('../pages/agents/Manage')) /* 推广管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/agents/detail/:id?"
      component={lazy(() => import('../pages/agents/Detail')) /* 推广编辑 */}
    />
    <PrivateRoute
      exact
      strict
      path="/bills/:type?"
      component={lazy(() => import('../pages/bills/Manage')) /* 订单管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/authorizations"
      component={lazy(() => import('../pages/authorizations//Manage')) /* 权限管理 */}
    />
    <PrivateRoute
      exact
      strict
      path="/statistics"
      component={lazy(() => import('../pages/statistics//Manage')) /* 数据报表 */}
    />
    <Redirect to="/" />
  </Switch>
);

export default Routes;
