export default {
  name: '',
  type: 'ExampleCredential',
  fields: [{
    type: 'h4',
    gutter: true,
    default: 'My Credential',
    label: 'Title',
  }, {
    type: 'h5',
    gutter: true,
    default: '{name}',
    label: 'Display Name',
    jsonField: 'name',
  }, {
    type: 'body2',
    default: 'Issued at: {date}',
    label: 'Date',
  }],
};
