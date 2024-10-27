import request from '@/utils/request';
import { HOST } from './host';


// TODO: 以下为新增内容

// 确权/初审/复审/转让签收/放款签收
export async function fetchTicketAudit(params = {}, options) {
  return request(`${HOST}/v1/ticket/audit`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 金票详情
export async function fetchTicketDetails(params = {}, options) {
  return request(`${HOST}/v1/ticket/details`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 融资申请
export async function fetchTicketFinancing(params = {}, options) {
  return request(`${HOST}/v1/ticket/financing`, {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 开票列表
export async function fetchTicketPage(params = {}, options) {
  return request(`${HOST}/v1/ticket/page`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 放款
export async function fetchTicketPay(params = {}, options) {
  return request(`${HOST}/v1/ticket/pay`, {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 开票
export async function fetchTicketSave(params = {}, options) {
  return request(`${HOST}/v1/ticket/save`, {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 转让
export async function fetchTicketTransfer(params = {}, options) {
  return request(`${HOST}/v1/ticket/transfer`, {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}
