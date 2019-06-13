import React from 'react';
import { Layout } from 'antd';

import Routes from '../utils/Routes';

const Content = () => (
  <Layout.Content style={{ padding: 50 }}>
    <Routes />
  </Layout.Content>
);

export default Content;
