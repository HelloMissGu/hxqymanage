import React from 'react';
import { Row, Col } from 'antd';

function TitleBar({ left, middle, right }) {
  return (
    <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Col span={8}>
        {left}
      </Col>
      <Col span={4} offset={4}>
        {middle}
      </Col>
      <Col span={2} offset={6}>
        {right}
      </Col>
    </Row>
  );
}
export default TitleBar;
