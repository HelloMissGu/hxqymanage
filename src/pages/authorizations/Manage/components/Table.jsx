import React from 'react';
import { Table, Button, Switch } from 'antd';

function TableBills({
  data, pagination, loading, onChange, viewDetail, onSwitch,
}) {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '用户组',
      dataIndex: 'group',
      key: 'group',
      filters: [
        { text: '运营后台（管理员）', value: '01' },
        { text: '运营后台', value: '00' },
        { text: '寺庙后台（管理员）', value: '11' },
        { text: '寺庙后台', value: '10' },
        { text: '推广代理', value: '20' },
      ],
      filterMultiple: false,
    },
    {
      title: '是否在职',
      dataIndex: 'is_available',
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
        <Button style={{ border: 'none' }} onClick={() => viewDetail(record)}>
          {'编辑'}
        </Button>
      ),
    },
  ];
  const locale = {
    filterConfirm: '确定',
    filterReset: '重置',
    emptyText: '暂无数据',
  };
  return (
    <Table
      columns={columns}
      rowKey={record => record.id}
      dataSource={data}
      pagination={pagination}
      loading={loading}
      onChange={onChange}
      locale={locale}
    />
  );
}
export default TableBills;
