import React from 'react';
import { Table, Switch } from 'antd';
import { Link } from 'react-router-dom';

function TableNews({
  data, loading, onChange, onSwitch,
}) {
  const columns = [
    {
      title: '寺庙名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: '历史营业额',
      dataIndex: 'amountHistory',
      key: 'amountHistory',
    },
    {
      title: '本月营业额',
      dataIndex: 'amountCurrent',
      key: 'amountCurrent',
    },
    {
      title: '是否营业',
      dataIndex: 'status',
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
      render: (text, record) => (
        <Link
          to={{
            pathname: `/temples/edit/${record.id}`,
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
      loading={loading}
      onChange={onChange}
    />
  );
}
export default TableNews;
