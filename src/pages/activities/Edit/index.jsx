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
        left="活动编辑"
        right={(
          <Link to="/activities">
            <Button type="primary" shape="circle" icon="close" />
          </Link>
)}
      />
)}
  >
    <Form id={id} record={record} />
  </Card>
);
export default Index;
