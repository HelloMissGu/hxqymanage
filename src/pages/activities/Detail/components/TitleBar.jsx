import React from 'react';
import { Row, Col } from 'antd';

function TitleBar({ left, middle, right }) {
  return (
    <Row>
      <Col span={6}>
        {left}
      </Col>
      <Col span={14} style={{ textAlign: 'center' }}>
        {middle}
      </Col>
      <Col span={4} style={{ textAlign: 'right' }}>
        {right}
      </Col>
    </Row>
  );
}
export default TitleBar;
