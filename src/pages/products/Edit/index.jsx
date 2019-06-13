import React from 'react';
import { Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import Form from './components/Form';

const Index = ({
  match: {
    params: { id },
  },
  location: { state: { record = {} } = {} } = {},
}) => (
  <Card
    title={(
      <TitleBar
        left={id ? '商品信息' : '新建商品'}
        right={(
          <Link to="/products">
            <Button type="primary" shape="circle" icon="close" />
          </Link>
)}
      />
)}
  >
    <Form id={id} initialValues={{ ...record }} />
  </Card>
);
export default Index;
