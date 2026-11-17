import { useEffect, useState } from 'react';
import { DOCUMENT_LABELS, type DocumentItem } from '@shop/shared';
import { Download, Eye, FileText, RefreshCw, Trash2 } from 'lucide-react';
import api, { apiPost } from '../../config/api';
import { Alert, Button, Textarea } from '../../ui';
import ConfirmPanel from '../../ui/confirm_modal';
import Modal from '../../ui/modal';
import useShow from '../../hooks/useShow';
import getAxiosMessage from '../../utils/get_axios_message';
import { formatDateTime } from '../../utils/dates';
import { documentBlob } from './queries';
const status = (item: DocumentItem) =>
  item.processing === 'ready'
    ? {
        pending: 'Pending review',
        accepted: 'Accepted',
        rejected: 'Needs replacement',
        superseded: 'Replaced',
      }[item.review]
    : {
        uploading: 'Waiting for upload',
        processing: 'Checking file',
        failed: 'File checks unavailable',
        rejected: 'File not accepted',
        deleted: 'Removed',
      }[item.processing];
export default function DocumentRow({
  item,
  onUpdate,
  onReplace,
  canUpload,
}: {
  item: DocumentItem;
  onUpdate: (item: DocumentItem) => void;
  onReplace: () => void;
  canUpload: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const removal = useShow();
  const viewer = useShow();
  const [preview, setPreview] = useState<string>();
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const perform = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(getAxiosMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const review = (decision: 'accepted' | 'rejected') =>
    perform(async () => {
      const result = await apiPost<DocumentItem>(`/documents/${item._id}/review`, {
        version: item.version,
        decision,
        feedback: decision === 'rejected' ? feedback : '',
      });
      onUpdate(result);
      setRejecting(false);
    });
  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex items-start gap-3">
        <FileText size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{DOCUMENT_LABELS[item.category]}</p>
          <p className="mt-1 text-xs text-muted">
            {status(item)} · {formatDateTime(item.createdAt)} ·{' '}
            {item.uploadedBy === 'customer' ? 'Customer upload' : 'Staff upload'}
          </p>
        </div>
      </div>
      {item.legalHold && <p className="text-xs text-muted">Retention hold · automatic deletion paused</p>}
      {item.feedback && <p className="text-sm text-muted">{item.feedback}</p>}
      <div className="flex flex-wrap gap-2">
        {item.canView && item.contentType?.startsWith('image/') && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            icon={Eye}
            disabled={busy}
            onClick={() =>
              void perform(async () => {
                const blob = await documentBlob(item, true);
                setPreview(URL.createObjectURL(blob));
                viewer.open();
              })
            }
          >
            Preview
          </Button>
        )}
        {item.canView && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={Download}
            disabled={busy}
            onClick={() =>
              void perform(async () => {
                const blob = await documentBlob(item, false);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = item.contentType === 'application/pdf' ? 'document.pdf' : 'document.jpg';
                link.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
              })
            }
          >
            Download
          </Button>
        )}
        {item.canReview && (
          <>
            <Button type="button" size="sm" disabled={busy} onClick={() => void review('accepted')}>
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setRejecting(true)}
            >
              Request replacement
            </Button>
          </>
        )}
        {canUpload && item.review !== 'superseded' && item.processing !== 'deleted' && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            disabled={busy}
            onClick={onReplace}
          >
            Replace
          </Button>
        )}
        {item.canHold && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void perform(async () => {
                onUpdate(
                  await apiPost<DocumentItem>(`/documents/${item._id}/hold`, {
                    version: item.version,
                    hold: !item.legalHold,
                  }),
                );
              })
            }
          >
            {item.legalHold ? 'Remove retention hold' : 'Place retention hold'}
          </Button>
        )}
        {item.canDelete && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={Trash2}
            disabled={busy}
            onClick={removal.open}
          >
            Remove
          </Button>
        )}
      </div>
      {rejecting && (
        <div className="space-y-3">
          <Textarea
            label="Tell the customer what needs to change"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            maxLength={300}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || feedback.trim().length < 3}
              onClick={() => void review('rejected')}
            >
              Send feedback
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {error && <Alert tone="danger">{error}</Alert>}
      {removal.state && (
        <ConfirmPanel
          {...removal}
          title="Remove document?"
          description="Access will be removed immediately. Stored copies are removed by the cleanup process."
          confirmText="Remove document"
          confirmVariant="danger"
          onConfirm={() =>
            void perform(async () => {
              const response = await api.delete<{ data: DocumentItem }>(`/documents/${item._id}`, {
                params: { version: item.version },
              });
              onUpdate(response.data.data);
              removal.close();
            })
          }
        />
      )}
      {viewer.state && (
        <Modal {...viewer} title={DOCUMENT_LABELS[item.category]}>
          {preview && (
            <img
              src={preview}
              alt={DOCUMENT_LABELS[item.category]}
              className="mx-auto max-h-[70dvh] max-w-full object-contain"
            />
          )}
        </Modal>
      )}
    </li>
  );
}
