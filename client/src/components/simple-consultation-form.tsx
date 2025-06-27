import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SimpleConsultationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleConsultationForm({ isOpen, onClose }: SimpleConsultationFormProps) {
  console.log("🟢 Simple form render - isOpen:", isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("🟢 Simple form dialog onOpenChange:", open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>IT Consultation Request</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Thank you for your interest! Our IT experts will contact you within 2 business hours.
          </p>
          <div className="space-y-3">
            <p><strong>What we'll discuss:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Your current IT challenges</li>
              <li>Technology recommendations</li>
              <li>Custom solutions for your business</li>
              <li>Pricing and implementation timeline</li>
            </ul>
          </div>
          <button 
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}