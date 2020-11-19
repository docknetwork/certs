import { apiGet, apiDelete } from './api';

export async function getCredentials(params) {
  const result = await apiGet('credential', params);
  return result;
}

export async function getReceivers(params) {
  const result = await apiGet('receiver', params);
  return result;
}

export async function getTemplates(params) {
  const result = await apiGet('template', params);
  return result;
}

export async function getTotals() {
  const totals = await apiGet('totals');
  return totals;
}

export async function deleteReceivers(receivers) {
  const totals = await apiDelete('receiver/delete', { receivers });
  return totals;
}
