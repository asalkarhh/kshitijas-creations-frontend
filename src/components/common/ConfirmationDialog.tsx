import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}: ConfirmationDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="leading-7 text-muted">{description}</p>
    <div className="mt-7 flex justify-end gap-3">
      <Button onClick={onClose} variant="ghost">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
