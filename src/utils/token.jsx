import React, { Component } from 'react';

const { Provider, Consumer } = React.createContext();

class TokenProvider extends Component {
  state = { token: {} };

  setToken = (newToken) => {
    if (!newToken) {
      this.setState({ token: null });
      return;
    }
    try {
      const base64Url = newToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const { permissions, ...rest } = JSON.parse(window.atob(base64));
      this.setState({ token: { ...rest, permissions: Number(permissions) || 0 } });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Unrecogonizable Token');
    }
  };

  getPermissions = () => {
    const { token } = this.state;
    if (!token) return {};
    const { permissions, is_admin: authorizations } = token || {};
    if (!permissions) return { authorizations };

    const [operation, publication, products, temples, agents, bills, statistics] = permissions
      .toString(2)
      .split('')
      .reverse()
      .map(Number);
    return {
      operation,
      publication,
      products,
      temples,
      agents,
      bills,
      statistics,
      authorizations,
    };
  };

  getTempleId = () => {
    const { token } = this.state;
    if (!token || typeof token !== 'object') return undefined;
    return token.temple_id;
  };

  render() {
    const { token } = this.state;
    const { children } = this.props;
    const { setToken, getPermissions, getTempleId } = this;

    return (
      <Provider
        value={{
          token,
          setToken,
          getPermissions,
          getTempleId,
        }}
      >
        {children}
      </Provider>
    );
  }
}

const withToken = InnerComponent => props => (
  <Consumer>
    {innerProps => <InnerComponent {...props} {...innerProps} />}
  </Consumer>
);

export { TokenProvider, withToken };
