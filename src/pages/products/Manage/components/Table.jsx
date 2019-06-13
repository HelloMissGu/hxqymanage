import React from 'react';
import { Table, Switch } from 'antd';
import { Link } from 'react-router-dom';

function TableProducts({
  data, pagination, loading, onChange, onSwitch,
}) {
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '销售价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '当天库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '商品种类',
      dataIndex: 'product_type',
      key: 'product_type',
      filters: [
        { text: '供灯', value: 'GD' },
        { text: '牌位', value: ['CS', 'WS'] },
        { text: '福带', value: 'FD' },
      ],
      render: (text) => {
        switch (text) {
          case 'GD':
            return '供灯';
          case 'CS':
          case 'WS':
            return '牌位';
          case 'FD':
            return '福带';
          default:
            return '';
        }
      },
    },
    {
      title: '是否上架',
      dataIndex: 'status',
      render: (status, record, index) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          checked={status > 0}
          onChange={(checked) => {
            onSwitch(checked, record, index);
          }}
        />
      ),
    },
    {
      title: '所属寺庙',
      dataIndex: 'temples',
      key: 'temples',
      render: text => (
        <div>
          {text.map(({ name }, index) => (
            <div key={-index}>
              {name}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (text, record) => (
        <Link
          to={{
            pathname: `/products/edit/${record.id}`,
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

export default TableProducts;
