import React, { Component } from 'react';
import { Button, message } from 'antd';

import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';

class SendCodeButton extends Component {
  constructor(props) {
    super(props);
    this.countdownTimeout = null;

    this.state = { countdown: 0 };

    this.onCountdown = this.onCountdown.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate = ({ mobile: newMobile }, { countdown: newCountdown }) => {
    const { mobile } = this.props;
    const { countdown } = this.state;
    return !(mobile === newMobile && countdown === newCountdown);
  };

  componentDidUpdate() {
    const { countdown } = this.state;
    if (countdown <= 0) return;
    if (this.countdownTimeout !== null) {
      // eslint-disable-next-line no-console
      console.warn('countdownTimeout should be null');
      clearTimeout(this.countdownTimeout);
    }
    this.countdownTimeout = setTimeout(this.onCountdown, 1000);
  }

  onCountdown() {
    this.countdownTimeout = null;
    this.setState(({ countdown }) => ({ countdown: countdown - 1 }));
  }

  onClick() {
    const { mobile, fetch, onError } = this.props;
    return fetch('/staff/code', {
      method: 'POST',
      json: {
        phone: mobile,
      },
    })
      .then((response) => {
        if (!response.ok) throw Error(response);
        this.setState({ countdown: 60 });
        return response.json();
      })
      .then((data) => {
        if (data && data.code) {
          message.warning(`验证码：${data.code}`);
        }
      }, onError);
  }

  render() {
    const { countdown } = this.state;
    const disabled = countdown > 0;
    const text = countdown === 0 ? '发送验证码' : `${countdown}秒后重发`;

    return (
      <Button onClick={this.onClick} disabled={disabled}>
        {text}
      </Button>
    );
  }
}

export default withFetch(withRouter(SendCodeButton));
