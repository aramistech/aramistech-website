import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SimpleConsultationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleConsultationForm({ isOpen, onClose }: SimpleConsultationFormProps) {
  console.log("Simple form render - isOpen:", isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Simple form dialog onOpenChange:", open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Simple Test Form</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>This is a simple test form to verify dialog functionality.</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}