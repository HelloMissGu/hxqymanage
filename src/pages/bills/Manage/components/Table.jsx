import React from 'react';
import { Table, Button, DatePicker } from 'antd';
import timeLocale from 'antd/lib/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;
function TableBills({
  data,
  pagination,
  loading,
  onChange,
  type,
  viewDetail,
  templeOptions = [],
  templateOptions = [],
  onSelect,
}) {
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '用户名',
      dataIndex: 'nick_name',
      key: 'nick_name',
    },
    {
      title: `${{ GD: '祈福', PW: '供奉', FD: '祈福' }[type]}日期`,
      dataIndex: 'date',
      key: 'date',
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div
          style={{
            padding: '8px',
            borderRadius: '6px',
            background: '#fff',
            boxShadow: '0 1px 6px rgba(0, 0, 0, .2)',
          }}
        >
          <RangePicker
            locale={timeLocale}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            onChange={e => setSelectedKeys(e.map(time => time.format('YYYY-MM-DD')))}
            onOk={confirm}
          />
          <Button onClick={clearFilters} type="primary">
            {'重置'}
          </Button>
        </div>
      ),
    },
    ...(/PW|CS|WS|FD/.exec(type)
      ? [
        {
          title: `${
            {
              PW: '供奉',
              CS: '供奉',
              WS: '供奉',
              FD: '祈福',
            }[type]
          }天数`,
          dataIndex: 'days',
          key: 'days',
        },
      ]
      : []),
    {
      title: '所属寺庙',
      dataIndex: 'temple',
      key: 'temple',
      filters: templeOptions,
    },
    {
      title: `支付金额${type === 'light' ? '（拆单）' : ''}`,
      dataIndex: 'paymentValue',
      key: 'paymentValue',
    },
    {
      title: '支付时间',
      dataIndex: 'pay_time',
      key: 'pay_time',
    },
    ...(type === 'GD'
      ? [
        {
          title: '导出模板',
          dataIndex: 'template',
          key: 'template',
          filters: templateOptions,
          render: (value) => {
            const matchedTemplate = templateOptions.filter(({ key }) => Number(value) === key)[0];
            return (matchedTemplate || {}).label;
          },
        },
      ]
      : []),
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '待导出', value: 0 },
        { text: '待上传', value: 1 },
        { text: '已完成', value: 2 },
      ],
      render: value => ({ 0: '待导出', 1: '待上传', 2: '已完成' }[value] || ''),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <Button style={{ border: 'none' }} onClick={() => viewDetail(record)}>
          {'查看'}
        </Button>
      ),
    },
  ];
  const locale = {
    filterConfirm: '确定',
    filterReset: '重置',
    emptyText: '暂无数据',
  };
  const rowSelection = {
    onChange: onSelect,
    getCheckboxProps: record => ({
      name: record.id,
    }),
  };
  return (
    <Table
      rowSelection={rowSelection}
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
