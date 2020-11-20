import { apiPost, apiPut } from './api';

export const testTemplate = {
  name: '',
  type: 'UniversityDegreeCredential',
  fields: [{
    type: 'h4',
    gutter: true,
    default: 'University of Basel',
    label: 'Title',
    jsonField: 'alumniOf',
  }, {
    type: 'body2',
    gutter: true,
    default: 'The faculty of the University of Basel with all the Approbation of the Board of Trustees Hereby Admit',
    label: 'Subtitle',
  }, {
    type: 'h5',
    gutter: true,
    dynamic: true,
    default: '{name}',
    label: 'Display Name',
  }, {
    type: 'body2',
    gutter: true,
    default: 'Who has satisfactorily completed the Studies prescribed therefor the Degree of',
    label: 'Text',
  }, {
    type: 'h5',
    gutter: true,
    dynamic: true,
    default: 'Bachelor of Science',
    label: 'Degree name',
    jsonField: 'degree',
  }, {
    type: 'body2',
    gutter: true,
    dynamic: true,
    default: 'With all the Rights, Privileges and Honors thereunto appertaining In Witness whereof the Seal of the University is hereto affixed',
    label: 'Degree Info',
  }, {
    type: 'body2',
    default: 'On this date',
    label: 'Text',
  }, {
    type: 'body2',
    default: '{date}',
    label: 'Date',
  }],
};

export async function getTemplate() {
  return testTemplate;
}

export async function saveTemplate(data) {
  let result;
  if (data._id) {
    result = await apiPut('template/' + data._id, data);
  } else {
    result = await apiPost('template', data);
  }
  return result;
}
