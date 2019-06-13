import React from 'react';
import { Table } from 'antd';

function TableNews({
  data, pagination, loading, onChange,
}) {
  const columns = [
    {
      title: '所属寺庙',
      dataIndex: 'temple',
      key: 'temple',
      align: 'center',
    },
    {
      title: '拉新用户数',
      dataIndex: 'underlings',
      key: 'underlings',
      align: 'center',
    },
    {
      title: '首次消费额',
      dataIndex: 'firstConsumption',
      key: 'firstConsumption',
      align: 'center',
    },
    {
      title: '累计消费额',
      dataIndex: 'totalConsumption',
      key: 'totalConsumption',
      align: 'center',
    },
  ];
  return (
    <Table
      columns={columns}
      rowKey="id"
      dataSource={data}
      pagination={pagination}
      loading={loading}
      onChange={onChange}
    />
  );
}
export default TableNews;
