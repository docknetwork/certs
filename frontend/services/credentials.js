import { apiPost, apiGet } from './api';

export async function saveReceiver(receiver) {
  const result = await apiPost('receiver', {
    receiverRef: receiver.receiverRef,
    receiverName: receiver.receiverName,
    receiverEmail: receiver.receiverEmail,
    receiverDID: receiver.receiverDID,
  });
  return result;
}

export async function saveCredential(template, receiver, credential, sendEmail = true) {
  const result = await apiPost('credential', {
    template,
    receiver,
    credential,
    sendEmail,
  });
  return result;
}

export async function getCredential(id) {
  const result = await apiGet(`credential/${id}`);
  return result;
}
