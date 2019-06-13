import React from 'react';
import { Table } from 'antd';

function TableNews({
  data, pagination, loading, onChange,
}) {
  const columns = [
    {
      title: '用户昵称',
      dataIndex: 'nick_name',
      key: 'nick_name',
    },
    {
      title: '捐赠总额（元）',
      dataIndex: 'amount',
      key: 'amount',
      render: value => Number(value) / 100,
    },
    {
      title: '首次捐赠时间',
      dataIndex: 'first_created',
      key: 'first_created',
    },
  ];
  const locale = {
    filterConfirm: '确定',
    filterReset: '重置',
    emptyText: '暂无数据',
  };
  return (
    <Table
      locale={locale}
      columns={columns}
      rowKey={record => record.id}
      dataSource={data}
      pagination={pagination}
      loading={loading}
      onChange={onChange}
    />
  );
}
export default TableNews;
