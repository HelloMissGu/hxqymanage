import React from 'react';
import { Select, Spin, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../../utils/fetch';

const { Option } = Select;

class QRForm extends React.Component {
  state = {
    temples: [],
    qrImage: undefined,
    imageLoading: false,
  };

  componentDidMount() {
    this.fetchTempleOptions();
  }

  fetchTempleOptions = () => {
    const { fetch, authorize, history } = this.props;
    return fetch('/ecommerce/temples', {
      method: 'get',
    })
      .then((response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          this.setState({
            temples: response || [],
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
          }
        },
      );
  };

  fetchQRCode = (templeId) => {
    const {
      agent: { phone } = {}, fetch, authorize, history,
    } = this.props;
    this.setState({ imageLoading: true, qrImage: undefined });
    return fetch(`/invitation/agent/${phone}/store/${templeId}/code`, {
      method: 'get',
    })
      .then((response) => {
        this.setState({ imageLoading: false });
        if (!response.ok) throw response;
        return response;
      })
      .then(
        (response) => {
          response.blob().then((blob) => {
            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(blob);
            this.setState({
              qrImage: imageUrl,
            });
          });
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`二维码获取失败${err.status}`);
        },
      );
  };

  render() {
    const { temples, qrImage, imageLoading } = this.state;
    if (!temples || !temples.length) return <Spin style={{ width: '100%' }} />;
    return (
      <div>
        <Select
          onChange={this.fetchQRCode}
          placeholder="选择引导寺庙"
          style={{ width: '100%' }}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          {temples.map(({ name, id }) => (
            <Option key={id}>
              {name}
            </Option>
          ))}
        </Select>
        {imageLoading ? (
          <Spin style={{ width: '100%' }} />
        ) : (
          qrImage && <img src={qrImage} alt="QR Code" style={{ width: '100%' }} />
        )}
      </div>
    );
  }
}

export default withFetch(withRouter(QRForm));
