import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from 'antd';

import Header from './layouts/Header';
import Sider from './layouts/Sider';
import Content from './layouts/Content';
import { FetchProvider } from './utils/fetch';
import { TokenProvider } from './utils/token';
import './utils/forms';

const App = () => (
  <TokenProvider>
    <FetchProvider>
      <Router>
        <Layout style={{ position: 'fixed', height: '100%', width: '100%' }}>
          <Header />
          <Layout>
            <Sider />
            <Content />
          </Layout>
        </Layout>
      </Router>
    </FetchProvider>
  </TokenProvider>
);

export default App;
