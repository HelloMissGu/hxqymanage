import React, { Component } from 'react';
import { Card } from 'antd';

import BannerForm from './BannerForm';
import BonusForm from './BonusForm';
import MusicForm from './MusicForm';
import AnnouncementForm from './AnnouncementForm';

class Index extends Component {
  onSubmit() {
    return this;
  }

  render() {
    return (
      <div>
        <Card title="轮播配置">
          <BannerForm />
        </Card>
        <Card title="公告设置" style={{ marginTop: 50 }}>
          <AnnouncementForm />
        </Card>
        <Card title="音乐设置" style={{ marginTop: 50 }}>
          <MusicForm />
        </Card>
        <Card title="功德值比例配置" style={{ marginTop: 50 }}>
          <BonusForm />
        </Card>
      </div>
    );
  }
}

export default Index;
