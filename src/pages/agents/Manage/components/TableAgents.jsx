import React from 'react';
import { Table, Switch, Button } from 'antd';
import { Link } from 'react-router-dom';

function TableNews({
  data, pagination, loading, onChange, onSwitch, showQRCode,
}) {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '拉新用户数',
      dataIndex: 'underlings',
      key: 'underlings',
    },
    {
      title: '首次消费额',
      dataIndex: 'firstConsumption',
      key: 'firstConsumption',
    },
    {
      title: '累计消费额',
      dataIndex: 'totalConsumption',
      key: 'totalConsumption',
    },
    {
      title: '是否合作',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (status, record, index) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          checked={status}
          onChange={(checked) => {
            onSwitch(checked, record, index);
          }}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <div>
          <Link
            to={{
              pathname: `/agents/detail/${record.phone}`,
              state: {
                record,
              },
            }}
          >
            明细
          </Link>
          <Button
            style={{ border: 'none', background: 'none', padding: 'none' }}
            onClick={() => {
              showQRCode(record);
            }}
          >
            {'二维码'}
          </Button>
        </div>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      rowKey={record => record.phone}
      dataSource={data}
      pagination={pagination}
      loading={loading}
      onChange={onChange}
    />
  );
}
export default TableNews;
