import React from 'react';
import { Drawer } from 'antd';
import backgroundImage from './news-background.png';
import './previewStyles.css';

const PreviewDrawer = ({ visible, news: { content, image, title }, onClose }) => (
  <Drawer
    visible={visible}
    onClose={onClose}
    title="法讯预览"
    width={375}
    destroyOnClose
    style={{
      padding: 0,
      backgroundImage: `url(${backgroundImage})`,
    }}
  >
    {!!image && <img src={image} alt="法讯封面" style={{ width: '100%' }} />}
    <div
      style={{
        padding: 16,
        textAlign: 'justify',
        fontFamily: 'PingFangSC,"Helvetica Neue","Helvetica","Arial",sans-serif',
      }}
    >
      <h1 style={{ fontSize: 16, color: '#3c160f' }}>
        {title}
      </h1>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ fontSize: 14, color: '#382f30' }}
        className="previewContent"
      />
    </div>
  </Drawer>
);
export default PreviewDrawer;
