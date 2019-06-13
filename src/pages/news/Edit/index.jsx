import React from 'react';
import { Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import Form from './components/Form';

class Index extends React.Component {
  constructor(props) {
    super(props);
    const { location: { state: { record = {} } = {} } = {} } = props;
    this.state = {
      record,
    };
  }

  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { record } = this.state;
    return (
      <Card
        title={(
          <TitleBar
            left="法讯编辑"
            right={(
              <Link to="/news">
                <Button type="primary" shape="circle" icon="close" />
              </Link>
            )}
          />
        )}
      >
        <Form
          id={id}
          initialValues={{ ...record }}
          showPreview={this.showPreview}
          hidePreview={this.hidePreview}
          visible={this.previewVisible}
        />
      </Card>
    );
  }
}

export default Index;
