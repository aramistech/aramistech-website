import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Palette, Image } from "lucide-react";

interface ExitIntentPopup {
  id: number;
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl?: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
}

const exitIntentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  message: z.string().min(1, "Message is required"),
  buttonText: z.string().min(1, "Button text is required").max(100, "Button text too long"),
  buttonUrl: z.string().min(1, "Button URL is required").max(500, "URL too long"),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

type ExitIntentFormData = z.infer<typeof exitIntentSchema>;

export default function ExitIntentManager() {
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const { data: popupData, isLoading } = useQuery<{ success: boolean; popup?: ExitIntentPopup }>({
    queryKey: ["/api/exit-intent-popup"],
  });

  const popup = popupData?.popup;

  const form = useForm<ExitIntentFormData>({
    resolver: zodResolver(exitIntentSchema),
    defaultValues: {
      title: popup?.title || "Wait! Don't Leave Yet",
      message: popup?.message || "Get a free IT consultation before you go! Our experts are standing by to help with your technology needs.",
      buttonText: popup?.buttonText || "Get Free Consultation",
      buttonUrl: popup?.buttonUrl || "/contact",
      imageUrl: popup?.imageUrl || "",
      isActive: popup?.isActive ?? true,
      backgroundColor: popup?.backgroundColor || "#ffffff",
      textColor: popup?.textColor || "#000000",
    },
  });

  // Update form when data loads
  useState(() => {
    if (popup) {
      form.reset({
        title: popup.title,
        message: popup.message,
        buttonText: popup.buttonText,
        buttonUrl: popup.buttonUrl,
        imageUrl: popup.imageUrl || "",
        isActive: popup.isActive,
        backgroundColor: popup.backgroundColor,
        textColor: popup.textColor,
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ExitIntentFormData) => {
      return await apiRequest("/api/admin/exit-intent-popup", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exit intent popup settings saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exit-intent-popup"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save popup settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExitIntentFormData) => {
    updateMutation.mutate(data);
  };

  const watchedValues = form.watch();

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading popup settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Exit Intent Popup</h3>
          <p className="text-sm text-muted-foreground">
            Configure the popup that appears when visitors try to leave your site
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {previewMode ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Popup Settings
            </CardTitle>
            <CardDescription>
              Customize your exit intent popup content and appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Popup</FormLabel>
                        <FormDescription>
                          Show exit intent popup to visitors
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Wait! Don't Leave Yet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Get a free IT consultation before you go..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buttonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Get Free Consultation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buttonUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/contact" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where to redirect when button is clicked
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Image URL (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL of image to display in popup
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="color" 
                              className="w-12 h-10 p-1 border rounded cursor-pointer"
                              {...field} 
                            />
                            <Input 
                              placeholder="#ffffff" 
                              className="flex-1"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="color" 
                              className="w-12 h-10 p-1 border rounded cursor-pointer"
                              {...field} 
                            />
                            <Input 
                              placeholder="#000000" 
                              className="flex-1"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Popup Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview */}
        {previewMode && (
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your popup will look to visitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="relative max-w-sm mx-auto border rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  backgroundColor: watchedValues.backgroundColor,
                  color: watchedValues.textColor,
                }}
              >
                {watchedValues.imageUrl && (
                  <div className="w-full h-32 overflow-hidden">
                    <img
                      src={watchedValues.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="p-4 text-center">
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: watchedValues.textColor }}
                  >
                    {watchedValues.title}
                  </h3>
                  
                  <p 
                    className="text-sm mb-4"
                    style={{ color: watchedValues.textColor }}
                  >
                    {watchedValues.message}
                  </p>

                  <button
                    className="w-full py-2 px-4 rounded font-semibold text-sm"
                    style={{
                      backgroundColor: watchedValues.textColor,
                      color: watchedValues.backgroundColor,
                    }}
                  >
                    {watchedValues.buttonText}
                  </button>

                  <button
                    className="mt-2 text-xs underline opacity-70"
                    style={{ color: watchedValues.textColor }}
                  >
                    No thanks, I'll continue browsing
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}