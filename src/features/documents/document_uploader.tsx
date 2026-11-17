import { useEffect, useRef, useState } from 'react';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_LABELS,
  type DocumentCategory,
  type DocumentList,
  type DocumentItem,
} from '@shop/shared';
import { Alert, Button, Checkbox, Input, Select } from '../../ui';
import getAxiosMessage from '../../utils/get_axios_message';
import { uploadDocument, type DocumentTarget } from './queries';
export default function DocumentUploader({
  target,
  data,
  replaces,
  onUploaded,
  onCancel,
}: {
  target: DocumentTarget;
  data: DocumentList;
  replaces?: DocumentItem;
  onUploaded: (item: DocumentItem) => void;
  onCancel?: () => void;
}) {
  const [category, setCategory] = useState<DocumentCategory>(
    replaces?.category ?? (target.contractId ? 'phone_box' : 'customer_cnic_front'),
  );
  const [guarantor, setGuarantor] = useState(replaces?.guarantorId ?? '');
  const [file, setFile] = useState<File>();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const key = useRef(crypto.randomUUID());
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const categories = target.contractId
    ? DOCUMENT_CATEGORIES
    : DOCUMENT_CATEGORIES.filter((value) => value.startsWith('customer_cnic'));
  const needsGuarantor = category.startsWith('guarantor');
  const submit = async () => {
    if (!file || busy || !consent) return;
    if (file.size < 1 || file.size > data.policy.maxFileBytes) {
      setError(`Choose a file up to ${Math.floor(data.policy.maxFileBytes / 1048576)} MB.`);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setError('Choose a JPEG, PNG, WebP or PDF file.');
      return;
    }
    setBusy(true);
    setError('');
    setProgress(0);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const uploaded = await uploadDocument(
        target,
        file,
        category,
        guarantor,
        key.current,
        setProgress,
        abort.signal,
        replaces?._id,
      );
      onUploaded(uploaded);
      setFile(undefined);
      setConsent(false);
      key.current = crypto.randomUUID();
    } catch (cause) {
      if (!abort.signal.aborted) setError(getAxiosMessage(cause));
    } finally {
      setBusy(false);
      controller.current = null;
    }
  };
  return (
    <div className="space-y-4 rounded-control border border-border bg-canvas p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Document type"
          value={category}
          disabled={busy || Boolean(replaces)}
          onChange={(event) => {
            setCategory(event.target.value as DocumentCategory);
            key.current = crypto.randomUUID();
          }}
          options={categories.map((value) => ({ value, label: DOCUMENT_LABELS[value] }))}
        />
        {needsGuarantor && (
          <Select
            label="Guarantor"
            value={guarantor}
            disabled={busy || Boolean(replaces)}
            placeholder="Choose guarantor"
            onChange={(event) => {
              setGuarantor(event.target.value);
              key.current = crypto.randomUUID();
            }}
            options={data.subjects.map((subject) => ({ value: subject.id, label: subject.label }))}
          />
        )}
      </div>
      {needsGuarantor && data.subjects.length === 0 && (
        <Alert tone="warning">Save the guarantor details before attaching their documents.</Alert>
      )}
      <Input
        type="file"
        label="Photo or PDF"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={busy}
        onChange={(event) => {
          setFile(event.target.files?.[0]);
          key.current = crypto.randomUUID();
          setError('');
        }}
      />
      <p className="text-xs leading-relaxed text-muted">
        {data.policy.retentionNotice} Retention period: {data.policy.retentionDays} days{' '}
        {target.contractId ? 'after the contract ends' : 'from upload'}; dispute holds may extend this.
      </p>
      <Checkbox
        label="I have permission to submit this document to this shop."
        checked={consent}
        onChange={(event) => setConsent(event.target.checked)}
        disabled={busy}
      />
      {busy && (
        <div role="status" aria-live="polite" className="text-sm text-muted">
          Uploading {progress}%… Keep this page open. File checks follow the upload.
        </div>
      )}
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={busy}
          disabled={!file || !consent || (needsGuarantor && !guarantor)}
          onClick={() => void submit()}
        >
          {replaces ? 'Submit replacement' : 'Upload document'}
        </Button>
        {busy ? (
          <Button type="button" variant="ghost" onClick={() => controller.current?.abort()}>
            Cancel upload
          </Button>
        ) : (
          onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )
        )}
      </div>
    </div>
  );
}
