import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertContactSchema, insertQuickQuoteSchema } from "@shared/schema";
import type { InsertContact, InsertQuickQuote } from "@shared/schema";

export function useContactForm() {
  const { toast } = useToast();

  const contactForm = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      employees: "",
      challenges: "",
      contactTime: ""
    }
  });

  const quickQuoteForm = useForm<InsertQuickQuote>({
    resolver: zodResolver(insertQuickQuoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for your interest! We will contact you within 2 hours during business hours.",
      });
      contactForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit contact form. Please try again.",
        variant: "destructive",
      });
    }
  });

  const quickQuoteMutation = useMutation({
    mutationFn: async (data: InsertQuickQuote) => {
      const response = await apiRequest("POST", "/api/quick-quote", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for your interest! We will contact you within 2 hours during business hours.",
      });
      quickQuoteForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const submitContact = (data: InsertContact) => {
    contactMutation.mutate(data);
  };

  const submitQuickQuote = (data: InsertQuickQuote) => {
    quickQuoteMutation.mutate(data);
  };

  const setFormValue = (field: keyof InsertContact, value: string) => {
    contactForm.setValue(field, value);
  };

  return {
    contactForm,
    quickQuoteForm,
    submitContact,
    submitQuickQuote,
    setFormValue,
    isContactLoading: contactMutation.isPending,
    isQuickQuoteLoading: quickQuoteMutation.isPending,
  };
}
