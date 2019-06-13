import React from 'react';
import { Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import TitleBar from './TitleBar';
import Form from './Form';

const Index = () => (
  <Card title={<TitleBar left="数据报表" />}>
    <Form />
  </Card>
);
export default withFetch(withRouter(Index));
