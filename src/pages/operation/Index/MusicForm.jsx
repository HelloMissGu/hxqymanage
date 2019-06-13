import React, { Component } from 'react';
import {
  Button, Upload, Spin, message,
} from 'antd';

import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';

class MusicForm extends Component {
  constructor(props) {
    super(props);

    this.state = { url: null };

    this.onUpload = this.onUpload.bind(this);
  }

  componentDidMount() {
    const { fetch, authorize, history } = this.props;
    return fetch('/operation/music')
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(
        ({ url }) => {
          this.setState({ url });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          if (err.status !== 404) {
            message.error('获取音乐配置失败');
          }
          this.setState({ url: '' });
        },
      );
  }

  onUpload({ file, onError, onSuccess }) {
    const { upload, fetch } = this.props;
    if (file.type !== 'audio/mp3') {
      onError(Error('只支持 mp3 音乐'));
    }
    return upload(file)
      .then(media => fetch('/operation/music', {
        method: 'PUT',
        json: { url: media },
      }).then((response) => {
        if (!response.ok) {
          throw Error(response);
        }
        this.setState({ url: media });
      }))
      .then(onSuccess, onError);
  }

  beforeUpload = (file) => {
    if (file.size / 1024 / 1024 > 5) {
      message.error('文件大小限制 5MB 以内');
      return false;
    }
    return true;
  };

  render() {
    const { url } = this.state;
    if (url == null) return <Spin style={{ width: '100%' }} />;

    const fileList = [];
    if (url !== '') {
      fileList.push({
        uid: -1,
        name: url,
        status: 'success',
      });
    }

    return (
      <Upload
        customRequest={this.onUpload}
        fileList={fileList}
        beforeUpload={this.beforeUpload}
        showUploadList={{ showRemoveIcon: false }}
        accept="audio/*"
      >
        <Button icon="upload">
          {'文件大小限制 5MB 以内'}
        </Button>
      </Upload>
    );
  }
}

export default withFetch(withRouter(MusicForm));
