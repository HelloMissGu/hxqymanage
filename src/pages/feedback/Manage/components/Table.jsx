import React from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';

function TableFeedback({
  data, pagination, loading, onClick, onChange,
}) {
  const columns = [
    {
      title: '留言ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      width: '500px',
    },
    {
      title: '用户昵称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '留言时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (text, record) => (
        <span>
          <Link
            to={{
              pathname: `/feedback/del/${record.id}`,
              state: {
                record,
              },
              onClick,
            }}
          >
          删除
          </Link>
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={pagination}
      loading={loading}
      onClick={onClick}
      rowKey={record => record.id}
      onChange={onChange}
    />
  );
}

export default TableFeedback;
