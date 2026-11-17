import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_LABELS,
  type DocumentCategory,
  type DocumentItem,
  type DocumentList,
  type DocumentRequestItem,
} from '@shop/shared';
import { Alert, Button, Card, Input, Select, Skeleton } from '../../ui';
import { apiPost } from '../../config/api';
import { useCan } from '../../auth';
import getAxiosMessage from '../../utils/get_axios_message';
import { fetchDocuments, type DocumentTarget } from './queries';
import DocumentUploader from './document_uploader';
import DocumentRow from './document_row';

export default function DocumentsPanel({ target }: { target: DocumentTarget }) {
  const [open, setOpen] = useState(false);
  return (
    <Card padding="none">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Documents</h2>
          <p className="mt-1 text-sm text-muted">
            Customer, warranty and agreement records, with staff review.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Hide documents' : 'Open documents'}
        </Button>
      </header>
      {open && <DocumentRecords target={target} />}
    </Card>
  );
}
function DocumentRecords({ target }: { target: DocumentTarget }) {
  const cache = useQueryClient();
  const can = useCan();
  const [upload, setUpload] = useState(false);
  const [replaces, setReplaces] = useState<DocumentItem>();
  const baseKey = ['documents', target] as const;
  const query = useInfiniteQuery({
    queryKey: baseKey,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchDocuments(target, pageParam),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    refetchInterval: (state) =>
      state.state.data?.pages.some((page) => page.items.some((item) => item.processing === 'processing'))
        ? 5000
        : false,
  });
  const data = query.data?.pages[0];
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const update = (item: DocumentItem) => {
    cache.setQueryData<typeof query.data>(baseKey, (previous) =>
      previous
        ? {
            ...previous,
            pages: previous.pages.map((page, index) => ({
              ...page,
              requests:
                item.review === 'accepted' && item.requestId
                  ? page.requests.filter((request) => request._id !== item.requestId)
                  : page.requests,
              items: (page.items.some((old) => old._id === item._id)
                ? page.items.map((old) => (old._id === item._id ? item : old))
                : index === 0
                  ? [item, ...page.items]
                  : page.items
              )
                .filter((old) => old.processing !== 'deleted')
                .map((old) =>
                  item.review === 'accepted' && item.replacesId === old._id
                    ? { ...old, review: 'superseded' as const, canReview: false }
                    : old,
                ),
            })),
          }
        : previous,
    );
    setUpload(false);
    setReplaces(undefined);
  };
  if (query.isPending)
    return (
      <div className="p-5">
        <Skeleton className="h-24" />
      </div>
    );
  if (query.isError || !data)
    return (
      <div className="space-y-3 p-5">
        <Alert tone="danger">{getAxiosMessage(query.error)}</Alert>
        <Button type="button" variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  return (
    <>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted">
            Accepted means staff reviewed the document, not that the identity has been independently verified.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => void query.refetch()}
            >
              Refresh
            </Button>
            {data.canUpload && (
              <Button
                type="button"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setReplaces(undefined);
                  setUpload((value) => !value);
                }}
              >
                Add document
              </Button>
            )}
          </div>
        </div>
        {!data.canUpload && <p className="text-sm text-muted">Uploads are not enabled for this record.</p>}
        {upload && (
          <DocumentUploader
            key={replaces?._id ?? 'new'}
            target={target}
            data={data}
            replaces={replaces}
            onUploaded={update}
            onCancel={() => {
              setUpload(false);
              setReplaces(undefined);
            }}
          />
        )}
        {target.contractId && data.canUpload && can('documents.write') && (
          <RequestDocument
            target={target}
            data={data}
            onRequested={(request) =>
              cache.setQueryData<typeof query.data>(baseKey, (previous) =>
                previous
                  ? {
                      ...previous,
                      pages: previous.pages.map((page, i) =>
                        i === 0 ? { ...page, requests: [request, ...page.requests] } : page,
                      ),
                    }
                  : previous,
              )
            }
          />
        )}
        {data.requests.length > 0 && (
          <ul className="space-y-1 text-sm text-muted">
            {data.requests.map((request) => (
              <li key={request._id}>
                Requested: {DOCUMENT_LABELS[request.category]} · {request.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      {items.length ? (
        <ul className="divide-y divide-border border-t border-border">
          {items.map((item) => (
            <DocumentRow
              key={item._id}
              item={item}
              onUpdate={update}
              canUpload={data.canUpload}
              onReplace={() => {
                setReplaces(item);
                setUpload(true);
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="px-5 pb-5 text-sm text-muted">No documents added yet.</p>
      )}
      {query.hasNextPage && (
        <div className="border-t border-border p-3">
          <Button
            type="button"
            variant="ghost"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}
function RequestDocument({
  target,
  data,
  onRequested,
}: {
  target: DocumentTarget;
  data: DocumentList;
  onRequested: (item: DocumentRequestItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>('customer_cnic_front');
  const [guarantorId, setGuarantor] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!open)
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Request a document from customer
      </Button>
    );
  return (
    <div className="space-y-3 rounded-control border border-border p-4">
      <Select
        label="Requested document"
        value={category}
        onChange={(event) => setCategory(event.target.value as DocumentCategory)}
        options={DOCUMENT_CATEGORIES.map((value) => ({ value, label: DOCUMENT_LABELS[value] }))}
      />
      {category.startsWith('guarantor') && (
        <Select
          label="Guarantor"
          value={guarantorId}
          placeholder="Choose guarantor"
          onChange={(event) => setGuarantor(event.target.value)}
          options={data.subjects.map((subject) => ({ value: subject.id, label: subject.label }))}
        />
      )}
      <Input
        label="Message to customer"
        maxLength={300}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          loading={busy}
          disabled={!message.trim() || (category.startsWith('guarantor') && !guarantorId)}
          onClick={async () => {
            setBusy(true);
            setError('');
            try {
              const request = await apiPost<DocumentRequestItem>('/documents/requests', {
                contractId: target.contractId,
                category,
                ...(category.startsWith('guarantor') ? { guarantorId } : {}),
                message,
              });
              onRequested(request);
              setOpen(false);
              setMessage('');
            } catch (cause) {
              setError(getAxiosMessage(cause));
            } finally {
              setBusy(false);
            }
          }}
        >
          Create request
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
