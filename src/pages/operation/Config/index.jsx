import React, { Component } from 'react';
import { Card } from 'antd';
import ProcessForm from './ProcessForm';
import TemplateForm from './TemplateForm';

class Index extends Component {
  onSubmit() {
    return this;
  }

  render() {
    const {
      match: {
        params: { type },
      },
    } = this.props;
    return (
      <div>
        <Card title={`${type === 'PW' ? '供奉' : ''}流程编辑`}>
          <ProcessForm type={type} />
        </Card>
        {type === 'GD' && (
          <Card title="祈福语模板" style={{ marginTop: 50 }}>
            <TemplateForm type={type} />
          </Card>
        )}
      </div>
    );
  }
}

export default Index;
