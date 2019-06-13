import React, { Component } from 'react';
import {
  Card, Input, Drawer, Button, Upload, message,
} from 'antd';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { withFetch } from '../../../utils/fetch';
import { withToken } from '../../../utils/token';
import Table from './components/Table';
import TitleBar from './components/TitleBar';
import Form from './components/Form';

class Index extends Component {
  state = {
    data: [],
    pager: {},
    filters: {},
    keyword: undefined,
    loading: false,
    formData: {},
    templeOptions: [],
    templeDic: {},
    templateOptions: [],
    selectedRows: [],
    downloading: false,
  };

  componentDidMount() {
    this.fetchTempleOptions()
      .then(this.fetchTemplateOptions)
      .then(this.fetchData);
  }

  handleTableChange = (pager, filters) => {
    this.setState(
      {
        pager,
        filters,
      },
      this.fetchData,
    );
  };

  handleSearch = (keyword) => {
    const { pager } = this.state;
    pager.current = 1;
    this.setState(
      {
        pager: { ...pager, ...{ current: 1 } },
        keyword,
      },
      () => {
        this.fetchData();
      },
    );
  };

  handleSelect = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRows });
  };

  handleUploadSuccess = ({
    file, onSuccess, onError, index,
  }) => {
    const { upload, fetch } = this.props;
    const { selectedRows } = this.state;
    let uploaded = 0;
    const total = selectedRows.length;
    upload(file).then(
      (imageUrl) => {
        selectedRows.forEach(({ id, images }) => {
          const uploadImages = (images instanceof Array && [...images]) || ['', '', ''];
          uploadImages[index] = imageUrl;
          return fetch(`/ecommerce/bill/${id}/images`, {
            method: 'POST',
            json: { images: uploadImages },
          })
            .then((response) => {
              if (!response.ok) {
                throw response;
              }
              return response.json();
            })
            .then(
              () => {
                uploaded += 1;
                if (uploaded === total) {
                  message.success('订单图片更新成功');
                  this.fetchData();
                }
              },
              (err) => {
                message.error(`订单图片更新失败：${err.status}`);
              },
            );
        });
        onSuccess(imageUrl);
      },
      (error) => {
        onError(error);
      },
    );
  };

  showDrawer = (data) => {
    const {
      product_info: { type: productType },
      patron_info: { beneficiary_name: target } = {},
      images,
    } = data;
    const formData = {
      ...data,
      type: `${{ WS: '往生', CS: '长生' }[productType] || (target ? '送福' : '祈福')}`,
      images: (images || ['', '', '']).slice(0, /WS|CS|PW/.exec(productType) ? 2 : 3),
    };
    this.setState({
      drawerVisible: true,
      formData,
    });
  };

  handleDrawerClose = (e, success = false) => {
    this.setState(
      {
        drawerVisible: false,
      },
      success ? this.fetchData : null,
    );
  };

  exportPDF = () => {
    const { selectedRows } = this.state;
    const { fetch, authorize, history } = this.props;
    this.setState({ downloading: true });
    let sameTemplate = true;
    selectedRows.forEach((row, index, array) => {
      if (
        row.product_info.type === 'GD'
        && array[index - 1]
        && array[index - 1].template !== row.template
      ) {
        sameTemplate = false;
      }
    });
    if (!sameTemplate) {
      this.setState({ downloading: false });
      return message.error('导出失败：请选择模板相同的订单');
    }
    return fetch('/ecommerce/api/order/export', {
      method: 'post',
      json: {
        orders: selectedRows.map(({ id }) => id),
      },
    })
      .then((response) => {
        this.setState({ downloading: false });
        if (!response.ok) throw response;
        return response.blob();
      })
      .then(
        (response) => {
          if (response instanceof Blob) {
            let fileExtension = '';
            if (response.type === 'application/octet-stream') {
              fileExtension = '.pdf';
            }
            const downloadLink = URL.createObjectURL(response);
            const downloadElement = document.createElement('a');
            downloadElement.href = downloadLink;
            downloadElement.download = `订单导出${moment().format(
              'YYYY-MM-DD HH-mm-ss',
            )}${fileExtension}`;
            downloadElement.click();
            this.fetchData();
          } else {
            message.error('导出失败，文件错误');
          }
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          if (err.status === 400 && typeof err.json === 'function') {
            err.json().then(({ msg }) => {
              message.error(`导出失败：${msg || err.status}`);
            });
          } else {
            message.error(`导出失败:${err.status}`);
          }
        },
      );
  };

  fetchTempleOptions = () => new Promise((resolve) => {
    const { fetch, authorize, history } = this.props;
    this.setState({ downloading: true });
    return fetch('/ecommerce/temples', {
      method: 'get',
    })
      .then((response) => {
        this.setState({ downloading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          this.setState(
            {
              templeOptions:
                  response.map(temple => ({ text: temple.name, value: temple.id })) || [],
              templeDic: response.reduce((acc, cur) => {
                const { id, name } = cur;
                acc[id] = name;
                return acc;
              }, {}),
            },
            resolve,
          );
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
            return;
          }
          message.error(`寺庙列表获取失败${err.status}`);
        },
      );
  });

  fetchTemplateOptions = () => new Promise((resolve) => {
    const { fetch, authorize, history } = this.props;
    this.setState({ downloading: true });
    return fetch('/ecommerce/api/order/templates', {
      method: 'get',
    })
      .then((response) => {
        this.setState({ downloading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          this.setState(
            {
              templateOptions: (response || []).map(({ title, content, ...item }) => ({
                ...item,
                label: title,
                text: title,
                value: content,
                key: content,
              })),
            },
            resolve,
          );
        },
        (err) => {
          if (err.status === 401) {
            authorize(null);
            history.replace('/');
          }
        },
      );
  });

  fetchData = () => {
    const {
      fetch,
      match: {
        params: { type },
      },
      getTempleId,
    } = this.props;
    const {
      pager: { current: page, pageSize },
      pager,
      filters: {
        date: dateFilters,
        date: [dateMin, dateMax] = [],
        temple: templeFilters,
        template: templateFilters,
        status: statusFilters,
      },
      templeDic,
      keyword,
    } = this.state;
    const templeId = getTempleId();
    if (!templeId) {
      message.error('用户列表获取失败：无权限');
      return null;
    }
    this.setState({ loading: true });
    return fetch('/ecommerce/bills', {
      method: 'get',
      json: {
        page: page || 1,
        per_page: pageSize || 10,
        ...(type === 'PW' ? { order__order_type__in: 'WS,CS' } : { order__order_type: type }),
        ...(keyword ? { search: keyword } : null),
        ...(dateFilters && dateFilters.length ? { date__gte: dateMin, date__lte: dateMax } : null),
        ...(templeId === '0' ? null : { order__temple_id: templeId }),
        ...(templeFilters && templeFilters.length ? { order__temple_id__in: templeFilters } : null),
        ...(templateFilters && templateFilters.length
          ? { order__template__in: templateFilters }
          : null),
        ...(statusFilters && statusFilters.length ? { status__in: statusFilters } : null),
      },
    })
      .then((response) => {
        this.setState({ loading: false });
        if (!response.ok) throw response;
        return response.json();
      })
      .then(
        (response) => {
          const data = response.results.map(item => ({
            ...item,
            temple: templeDic[item.temple_id],
            paymentValue: item.price / 100 * item.days,
            paymentTime: item.date,
          }));
          this.setState({
            pager: { ...pager, total: response.count },
            data,
          });
        },
        (err) => {
          message.error(`订单获取失败${err.status}`);
        },
      );
  };

  render() {
    const {
      match: {
        params: { type = 'GD' },
      },
    } = this.props;
    const {
      data,
      drawerVisible,
      pager,
      filters,
      loading,
      formData,
      selectedRows,
      downloading,
      templeOptions,
      templateOptions,
    } = this.state;
    const tableTitle = `${
      {
        GD: '供灯',
        CS: '牌位',
        WS: '牌位',
        PW: '牌位',
        FD: '福带',
      }[type]
    }订单管理`;
    const bottomButtons = [0, 1, ...(type.search(/CS|WS|PW/) > -1 ? [] : [2])];
    return (
      <Card
        title={(
          <TitleBar
            left={tableTitle}
            right={(
              <Input.Search
                placeholder="搜索订单编号、用户名"
                onSearch={this.handleSearch}
                enterButton
              />
)}
          />
)}
      >
        <Table
          pagination={pager}
          filters={filters}
          onChange={this.handleTableChange}
          onSelect={this.handleSelect}
          viewDetail={this.showDrawer}
          type={type}
          loading={loading}
          data={data}
          templeOptions={templeOptions}
          templateOptions={templateOptions}
        />
        <Button
          disabled={!selectedRows || !selectedRows.length}
          onClick={this.exportPDF}
          loading={downloading}
        >
          {'批量导出'}
        </Button>
        {bottomButtons.map((item, index) => (
          <Upload
            customRequest={params => this.handleUploadSuccess({ ...params, index })}
            showUploadList={false}
            key={`button${-index}`}
          >
            <Button icon="upload" disabled={!selectedRows || !selectedRows.length}>
              {`批量上传图${index + 1}`}
            </Button>
          </Upload>
        ))}
        <Drawer
          title="订单信息（状态）"
          width={500}
          placement="right"
          onClose={this.handleDrawerClose}
          visible={drawerVisible}
          style={{
            overflow: 'auto',
          }}
        >
          <Form
            onClose={this.handleDrawerClose}
            type={type}
            initialValues={formData}
            enableReinitialize
          />
        </Drawer>
      </Card>
    );
  }
}
export default withToken(withFetch(withRouter(Index)));
