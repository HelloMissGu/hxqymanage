import React from 'react';
import { Table, Switch } from 'antd';
import { Link } from 'react-router-dom';

function TableNews({
  data, pagination, loading, onChange, onSwitch,
}) {
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '点击量',
      dataIndex: 'visits',
      key: 'visits',
    },
    {
      title: '是否发布',
      dataIndex: 'is_show',
      render: (status, record, index) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          checked={status > 0}
          onChange={(checked) => {
            onSwitch(checked, record.id, index);
          }}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (text, record) => (
        <Link
          to={{
            pathname: `/news/edit/${record.id}`,
            state: {
              record,
            },
          }}
        >
          编辑
        </Link>
      ),
    },
  ];
  return (
    <Table
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
