import { apiPost, apiPut } from './api';
import diplomaTemplate from './default-templates/diploma';

export async function getTemplate() {
  return diplomaTemplate;
}

export async function saveTemplate(data) {
  let result;
  if (data._id) {
    result = await apiPut(`template?id=${data._id}`, data);
  } else {
    result = await apiPost('template', data);
  }
  return result;
}
