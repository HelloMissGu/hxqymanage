// react core
import React from 'react';
// formik
import { connect, Form as FormikForm, FastField as FormikField } from 'formik';
// ant design modules
import {
  Form as AntdForm,
  Input,
  Spin,
  InputNumber,
  Upload,
  Icon,
  Select,
  Checkbox,
  DatePicker,
  message,
} from 'antd';
// quill editor
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // quill style
import timeLocale from 'antd/lib/date-picker/locale/zh_CN';
// image croper
// import ReactCrop from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
// fetch wrapper
import { withFetch } from './fetch';
// Use inline style attributor instead of the default class attributor for quill
const AlignStyle = Quill.import('attributors/style/align');
const ColorStyle = Quill.import('attributors/style/color');
Quill.register(AlignStyle, true);
Quill.register(ColorStyle, true);

const Form = connect(({ formik: { isSubmitting }, ...props }) => (
  <Spin spinning={isSubmitting}>
    <FormikForm {...props} />
  </Spin>
));

const FormItem = connect(({ formik: { errors, touched }, name, ...props }) => (
  <AntdForm.Item
    help={errors[name]}
    validateStatus={touched[name] && errors[name] ? 'error' : 'success'}
    {...props}
  />
)); 

const FormikInput = ({ form, field, ...props }) => <Input {...field} {...props} />;

const InputField = props => <FormikField {...props} component={FormikInput} />;

const FormikTextArea = ({ form, field, ...props }) => <Input.TextArea {...field} {...props} />;

const TextAreaField = props => <FormikField {...props} component={FormikTextArea} />;

const FormikSelect = ({ 
  form: { setFieldTouched, setFieldValue },
  field: { name, ...field },
  options = [],
  ...props
}) => (
  <Select
    {...field}
    {...props}
    onBlur={() => setFieldTouched(name, true)}
    onChange={(newValue) => {
      if (typeof props.onChange === 'function') {
        props.onChange(newValue);
      }
      setFieldValue(name, newValue);
    }}
  >
    {options.map(({ key, value, label }) => (
      <Select.Option key={key || value}>
        {label}
      </Select.Option>
    ))}
  </Select>
);

const SelectField = props => <FormikField {...props} component={FormikSelect} />;

const FormikInputNumber = ({
  form: { setFieldValue, setFieldTouched },
  field: { name, value },
  ...props
}) => (
  <InputNumber
    name={name}
    value={value || 0}
    onChange={(newValue) => {
      setFieldValue(name, newValue);
    }}
    onBlur={() => setFieldTouched(name, true)}
    {...props}
    style={{ width: 'auto' }}
  />
);

const InputNumberField = props => <FormikField {...props} component={FormikInputNumber} />;

const FormikImageUpload = withFetch(
  ({
    upload,
    form: { setFieldValue, setFieldTouched, setFieldError },
    field: { name, value },
    aspect,
    ...props
  }) => {
    const customRequest = ({ onSuccess, file }) => {
      setFieldTouched(name, true);
      setFieldValue(name, 'loading');
      upload(file).then(
        (media) => {
          setFieldValue(name, media);
          onSuccess(media);
        },
        (error) => {
          if (typeof error.json === 'function') {
            error.json().then(({ message: errorMessage }) => {
              setFieldError(name, `上传失败:${errorMessage}`);
            });
          } else {
            setFieldError(name, '上传失败');
          }
          setFieldValue(name, null);
        },
      );
    };

    const getUploadButton = () => <Icon type="upload" style={{ fontSize: 24 }} />;

    const getUploadedImage = () => <img src={value} alt={value} style={{ width: '100%' }} />;

    return value === 'loading' ? (
      <Spin style={{ width: '100%' }} tip="上传中" />
    ) : (
      <Upload.Dragger
        {...props}
        className="ant-upload-btn"
        accept="image/*"
        listType="picture-card"
        customRequest={customRequest}
        showUploadList={false}
      >
        {value ? getUploadedImage() : getUploadButton()}
      </Upload.Dragger>
    );
  },
);

const ImageUploadField = props => <FormikField {...props} component={FormikImageUpload} />;
const editorModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  },
};
const editorFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'size',
  'color',
  'background',
  'align',
];

const FormiRichEditor = withFetch(
  ({
    upload,
    form: { setFieldValue, setFieldError, setFieldTouched },
    field: { name, value },
    ...props
  }) => (
    <ReactQuill
      style={{ lineHeight: '1.5' }}
      theme="snow"
      defaultValue={value}
      modules={editorModules}
      formats={editorFormats}
      onBlur={() => setFieldTouched(name, true)}
      ref={(el) => {
        try {
          if (!(el && typeof el.getEditor === 'function')) return;
          const editor = el.getEditor();
          editor.getModule('toolbar').addHandler('image', () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.click();

            // Listen upload local image and save to server
            input.onchange = () => {
              const file = input.files[0];
              upload(file).then(
                (url) => {
                  const range = editor.getSelection();
                  editor.insertEmbed(range.index, 'image', url);
                },
                (err) => {
                  message.error(`上传失败${err.status}`);
                  setFieldError(name, '上传失败');
                },
              );
            };
          });
        } catch (err) {
          message.error(`未知错误${err.status}`);
        }
      }}
      onChange={(newValue) => {
        setFieldValue(name, newValue);
      }}
      {...props}
    />
  ),
);

const RichEditorField = props => <FormikField {...props} component={FormiRichEditor} />;

const FormikCheckboxGroup = ({
  form: { setFieldValue, setFieldTouched },
  field: { name, value, ...field },
  options,
  ...props
}) => (
  <Checkbox.Group
    {...field}
    {...props}
    options={options}
    value={(value instanceof Array ? value : []).map(item => item.id)}
    onBlur={() => setFieldTouched(name, true)}
    onChange={(newValue) => {
      setFieldValue(
        name,
        options
          .filter(item => newValue.indexOf(item.value) > -1)
          .map(item => ({ id: item.value, name: item.label })),
      );
    }}
  />
);

const CheckboxGroupField = props => <FormikField {...props} component={FormikCheckboxGroup} />;

const FormikDatePicker = ({
  form: { setFieldValue, setFieldTouched },
  field: { name, ...field },
  ...props
}) => (
  <DatePicker
    {...field}
    {...props}
    locale={timeLocale}
    showTime
    format="YYYY-MM-DD HH:mm:ss"
    onChange={(value) => {
      setFieldValue(name, value);
    }}
    onBlur={() => setFieldTouched(name, true)}
  />
);

const DatePickerField = props => <FormikField {...props} component={FormikDatePicker} />;

export {
  Form,
  FormItem,
  InputField,
  TextAreaField,
  InputNumberField,
  ImageUploadField,
  RichEditorField,
  SelectField,
  CheckboxGroupField,
  DatePickerField,
};
