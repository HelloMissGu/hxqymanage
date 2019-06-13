import React from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';

function TableNews({
  data, pagination, loading, onChange, templeOptions = [],
}) {
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '完成情况/众筹目标（元）',
      dataIndex: 'progress',
      key: 'progress',
    },
    {
      title: '上线时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
    {
      title: '所属寺庙',
      dataIndex: 'temple',
      key: 'temple',
      filters: templeOptions,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        {
          text: '待上线',
          value: '0',
        },
        {
          text: '众筹中',
          value: '1',
        },
        {
          text: '已结束',
          value: '2',
        },
        {
          text: '已完成',
          value: '3',
        },
      ],
      render: text => ({
        0: '待上线',
        1: '众筹中',
        2: '已结束',
        3: '已完成',
      }[text] || ''),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (text, record) => (
        <div>
          <Link
            to={{
              pathname: `/activities/edit/${record.id}`,
              state: {
                record,
              },
            }}
            style={{ marginRight: '5px', display: 'inline-block' }}
          >
            编辑
          </Link>
          <Link
            to={{
              pathname: `/activities/detail/${record.id}`,
              state: {
                record,
              },
            }}
            style={{ display: 'inline-block' }}
          >
            明细
          </Link>
        </div>
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
