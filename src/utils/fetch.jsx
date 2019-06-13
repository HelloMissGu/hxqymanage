import React, { Component } from 'react';

const { REACT_APP_API } = process.env;

const { Provider, Consumer } = React.createContext();

class FetchProvider extends Component {
  constructor(props) {
    super(props);

    const token = window.localStorage.getItem('token') || '';
    this.state = { token };

    this.isAuthorized = this.isAuthorized.bind(this);
    this.authorize = this.authorize.bind(this);
    this.fetch = this.fetch.bind(this);
    this.upload = this.upload.bind(this);
  }

  refreshToken = () => new Promise(resolve => this.fetch('/staff/refresh', {
    method: 'POST',
  })
    .then((response) => {
      if (!response.ok) throw response;
      return response;
    })
    .then(resolve, () => {
      this.authorize(null);
    }));

  isAuthorized() {
    const { token } = this.state;
    return Boolean(token);
  }

  authorize(token) {
    if (typeof token === 'string' && token) {
      window.localStorage.setItem('token', token);
      this.setState({ token });
    } else {
      window.localStorage.removeItem('token');
      this.setState({ token: '' });
    }
  }

  fetch(endpoint, options = {}) {
    const { token } = this.state;

    let input = `${REACT_APP_API}${endpoint}`;
    const init = {
      headers: {},
      mode: 'cors',
      ...options,
    };

    if (typeof token === 'string' && token) {
      // Add authorization infomation to header.
      init.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof init.json === 'object' && init.json) {
      // Compile JSON request body.
      init.headers['Content-Type'] = 'application/json';
      if (init.method === 'get') {
        const esc = encodeURIComponent;
        input += `?${Object.keys(init.json)
          .map(key => `${esc(key)}=${esc(init.json[key])}`)
          .join('&')}`;
      } else {
        init.body = JSON.stringify(init.json);
      }
      delete init.json;
    }
    return fetch(input, init);
  }

  upload(file) {
    const { fetch, authorize } = this;
    return fetch(`/media?content-type=${file.type}`)
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        data => window
          .fetch(data.api, {
            method: 'PUT',
            headers: {
              Authorization: data.authorization,
            },
            body: file,
          })
          .then((response) => {
            if (!response.ok) {
              throw response;
            }
            return data.media;
          }),
        (err) => {
          if (err.status === 401) {
            authorize(null);
          } else {
            throw err;
          }
        },
      );
  }

  render() {
    const { token } = this.state;
    const { children } = this.props;
    const {
      isAuthorized, authorize, fetch, upload, refreshToken,
    } = this;

    return (
      <Provider
        value={{
          token,
          isAuthorized,
          authorize,
          fetch,
          upload,
          refreshToken,
        }}
      >
        {children}
      </Provider>
    );
  }
}

const withFetch = InnerComponent => props => (
  <Consumer>
    {({ token, ...innerProps }) => <InnerComponent {...props} {...innerProps} />}
  </Consumer>
);

export { FetchProvider, withFetch };
