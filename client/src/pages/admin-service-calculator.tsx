import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, DollarSign, Settings, Calculator, Package, List } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

// Form schemas
const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  basePrice: z.string().min(1, "Base price is required"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
});

const serviceOptionSchema = z.object({
  categoryId: z.number().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priceModifier: z.string().min(1, "Price modifier is required"),
  priceType: z.string(),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
});

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  basePrice: string;
  hourlyRate: string;
  isActive: boolean;
  displayOrder: number;
}

interface ServiceOption {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  priceModifier: string;
  priceType: string;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface PricingCalculation {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  totalEstimate: string;
  projectDescription: string;
  urgencyLevel: string;
  createdAt: string;
}

export default function AdminServiceCalculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingOption, setEditingOption] = useState<ServiceOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);

  // Fetch data
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/admin/service-categories"],
  });

  const { data: optionsResponse, isLoading: optionsLoading } = useQuery({
    queryKey: ["/api/admin/service-options"],
  });

  const { data: calculationsResponse, isLoading: calculationsLoading } = useQuery({
    queryKey: ["/api/admin/service-calculations"],
  });

  const categories: ServiceCategory[] = (categoriesResponse as any)?.categories || [];
  const options: ServiceOption[] = (optionsResponse as any)?.options || [];
  const calculations: PricingCalculation[] = (calculationsResponse as any)?.calculations || [];

  // Category form
  const categoryForm = useForm({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      basePrice: "0",
      hourlyRate: "0",
      isActive: true,
      displayOrder: 0,
    },
  });

  // Option form
  const optionForm = useForm({
    resolver: zodResolver(serviceOptionSchema),
    defaultValues: {
      categoryId: 0,
      name: "",
      description: "",
      priceModifier: "0",
      priceType: "fixed" as const,
      isRequired: false,
      isActive: true,
      displayOrder: 0,
    },
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/service-categories", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-categories"] });
      toast({ title: "Success", description: "Service category created successfully" });
      setIsDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/service-categories/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-categories"] });
      toast({ title: "Success", description: "Service category updated successfully" });
      setIsDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update service category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/service-categories/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-categories"] });
      toast({ title: "Success", description: "Service category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service category", variant: "destructive" });
    },
  });

  const createOptionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/service-options", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-options"] });
      toast({ title: "Success", description: "Service option created successfully" });
      setIsOptionDialogOpen(false);
      optionForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service option", variant: "destructive" });
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/service-options/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-options"] });
      toast({ title: "Success", description: "Service option updated successfully" });
      setIsOptionDialogOpen(false);
      setEditingOption(null);
      optionForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update service option", variant: "destructive" });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/service-options/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-options"] });
      toast({ title: "Success", description: "Service option deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service option", variant: "destructive" });
    },
  });

  // Form handlers
  const handleCategorySubmit = (data: any) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleOptionSubmit = (data: any) => {
    if (editingOption) {
      updateOptionMutation.mutate({ id: editingOption.id, data });
    } else {
      createOptionMutation.mutate(data);
    }
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description,
      icon: category.icon,
      basePrice: category.basePrice,
      hourlyRate: category.hourlyRate,
      isActive: category.isActive,
      displayOrder: category.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleEditOption = (option: ServiceOption) => {
    setEditingOption(option);
    optionForm.reset({
      categoryId: option.categoryId,
      name: option.name,
      description: option.description,
      priceModifier: option.priceModifier,
      priceType: option.priceType as "fixed" | "multiplier" | "percentage",
      isRequired: option.isRequired,
      isActive: option.isActive,
      displayOrder: option.displayOrder,
    });
    setIsOptionDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    categoryForm.reset();
  };

  const handleCloseOptionDialog = () => {
    setIsOptionDialogOpen(false);
    setEditingOption(null);
    optionForm.reset();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-aramis-orange" />
          Service Calculator Management
        </h1>
        <p className="text-gray-600">Manage service categories, pricing, and customer quote submissions</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Options
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Quotes
          </TabsTrigger>
        </TabsList>

        {/* Service Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Categories</CardTitle>
                <CardDescription>Manage the main service categories available in the calculator</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-aramis-orange hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit" : "Create"} Service Category</DialogTitle>
                    <DialogDescription>
                      {editingCategory ? "Update" : "Add"} a service category for the calculator
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Network Setup" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Complete network infrastructure setup" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon (Lucide React)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Network" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={categoryForm.control}
                          name="basePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Price ($)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={categoryForm.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Show this category in the calculator
                              </div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseDialog}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-aramis-orange hover:bg-orange-600"
                          disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                        >
                          {editingCategory ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category: ServiceCategory) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{category.name}</h3>
                          {category.isActive ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>Base: ${category.basePrice}</span>
                          <span>Hourly: ${category.hourlyRate}</span>
                          <span>Order: {category.displayOrder}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Options Tab */}
        <TabsContent value="options">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Options</CardTitle>
                <CardDescription>Manage additional options and add-ons for each service category</CardDescription>
              </div>
              <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-aramis-orange hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingOption ? "Edit" : "Create"} Service Option</DialogTitle>
                    <DialogDescription>
                      {editingOption ? "Update" : "Add"} an option for a service category
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...optionForm}>
                    <form onSubmit={optionForm.handleSubmit(handleOptionSubmit)} className="space-y-4">
                      <FormField
                        control={optionForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category: ServiceCategory) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={optionForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="24/7 Monitoring" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={optionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Round-the-clock network monitoring" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={optionForm.control}
                          name="priceModifier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Modifier</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={optionForm.control}
                          name="priceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                  <SelectItem value="multiplier">Multiplier</SelectItem>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={optionForm.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4">
                        <FormField
                          control={optionForm.control}
                          name="isRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Required</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  This option is mandatory
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={optionForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Show this option in the calculator
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseOptionDialog}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-aramis-orange hover:bg-orange-600"
                          disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                        >
                          {editingOption ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {optionsLoading ? (
                <div className="text-center py-8">Loading options...</div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category: ServiceCategory) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">{category.name}</h3>
                      <div className="space-y-2">
                        {options
                          .filter((option: ServiceOption) => option.categoryId === category.id)
                          .map((option: ServiceOption) => (
                            <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{option.name}</span>
                                  {option.isRequired && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                  {option.isActive ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{option.description}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                  {option.priceType === "fixed" && `+$${option.priceModifier}`}
                                  {option.priceType === "multiplier" && `×${option.priceModifier}`}
                                  {option.priceType === "percentage" && `+${option.priceModifier}%`}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditOption(option)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deleteOptionMutation.mutate(option.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {options.filter((option: ServiceOption) => option.categoryId === category.id).length === 0 && (
                          <p className="text-sm text-gray-500 italic">No options configured for this category</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Submissions Tab */}
        <TabsContent value="calculations">
          <Card>
            <CardHeader>
              <CardTitle>Customer Quote Submissions</CardTitle>
              <CardDescription>View and manage customer quote requests from the service calculator</CardDescription>
            </CardHeader>
            <CardContent>
              {calculationsLoading ? (
                <div className="text-center py-8">Loading quotes...</div>
              ) : (
                <div className="space-y-4">
                  {calculations.map((calc: PricingCalculation) => (
                    <div key={calc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{calc.customerName}</h3>
                          <p className="text-sm text-gray-600">{calc.customerEmail}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-aramis-orange">${calc.totalEstimate}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(calc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {calc.companyName && (
                        <p className="text-sm text-gray-600 mb-2">Company: {calc.companyName}</p>
                      )}
                      {calc.customerPhone && (
                        <p className="text-sm text-gray-600 mb-2">Phone: {calc.customerPhone}</p>
                      )}
                      {calc.urgencyLevel && (
                        <div className="mb-2">
                          <Badge 
                            variant={calc.urgencyLevel === "urgent" ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {calc.urgencyLevel.charAt(0).toUpperCase() + calc.urgencyLevel.slice(1)}
                          </Badge>
                        </div>
                      )}
                      {calc.projectDescription && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{calc.projectDescription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {calculations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No quote submissions yet
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}