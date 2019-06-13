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
        left={`${id || id === 0 ? '编辑' : '新建'}寺庙`}
        right={(
          <Link to="/temples">
            <Button type="primary" shape="circle" icon="close" />
          </Link>
)}
      />
)}
  >
    <Form id={id} initialValues={record} />
  </Card>
);
export default Index;
