import type { DocumentList, DocumentItem } from '@shop/shared';
import api, { apiGet, apiPost } from '../../config/api';
export interface DocumentTarget {
  customerId?: string;
  contractId?: string;
}
export const fetchDocuments = (target: DocumentTarget, cursor?: string | null) =>
  apiGet<DocumentList>('/documents', { params: { ...target, ...(cursor ? { cursor } : {}) } });
export async function uploadDocument(
  target: DocumentTarget,
  file: File,
  category: DocumentItem['category'],
  guarantorId: string,
  key: string,
  progress: (value: number) => void,
  signal: AbortSignal,
  replacesId?: string,
) {
  const item = await apiPost<DocumentItem>(
    '/documents',
    {
      ...target,
      category,
      ...(guarantorId ? { guarantorId } : {}),
      ...(replacesId ? { replacesId } : {}),
      idempotencyKey: key,
      consent: true,
    },
    { signal },
  );
  if (item.processing !== 'uploading') return item;
  const response = await api.put<{ data: DocumentItem }>(`/documents/${item._id}/content`, file, {
    signal,
    headers: { 'Content-Type': 'application/octet-stream' },
    onUploadProgress: (event) =>
      progress(event.total ? Math.min(99, Math.round((event.loaded / event.total) * 100)) : 0),
  });
  return response.data.data;
}
export async function documentBlob(item: DocumentItem, preview: boolean) {
  return (
    await api.get<Blob>(`/documents/${item._id}/content`, {
      responseType: 'blob',
      params: preview ? { preview: '1' } : undefined,
    })
  ).data;
}
