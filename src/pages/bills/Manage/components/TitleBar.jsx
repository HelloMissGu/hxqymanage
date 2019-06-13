import React from 'react';
import { Row, Col } from 'antd';

function TitleBar({ left, middle, right }) {
  return (
    <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Col span={8}>
        {left}
      </Col>
      <Col span={8}>
        {middle}
      </Col>
      <Col span={8}>
        {right}
      </Col>
    </Row>
  );
}
export default TitleBar;
