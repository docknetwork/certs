import { apiGet, apiDelete } from './api';

export async function getCredentials(params) {
  try {
    const result = await apiGet('credential', params);
    return result;
  } catch (e) {
    return [];
  }
}

export async function getReceivers(params) {
  try {
    const result = await apiGet('receiver', params);
    return result;
  } catch (e) {
    return [];
  }
}

export async function getTemplates(params) {
  try {
    const result = await apiGet('template', params);
    return result;
  } catch (e) {
    return [];
  }
}

export async function getTotals() {
  try {
    const totals = await apiGet('totals');
    return totals;
  } catch (e) {
    return {};
  }
}

export async function deleteTemplates(templates) {
  const totals = await apiDelete('template', { templates });
  return totals;
}

export async function deleteReceivers(receivers) {
  const totals = await apiDelete('receiver', { receivers });
  return totals;
}
