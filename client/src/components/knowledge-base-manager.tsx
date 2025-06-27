import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

interface KnowledgeBaseCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  orderIndex: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  tags?: string[];
  isPublished: boolean;
  viewCount: number;
  orderIndex: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  orderIndex: z.number().min(0).default(0),
  isVisible: z.boolean().default(true),
});

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
  orderIndex: z.number().min(0).default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type ArticleFormData = z.infer<typeof articleSchema>;

export default function KnowledgeBaseManager() {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KnowledgeBaseCategory | null>(null);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagInput, setTagInput] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery<{ success: boolean; categories: KnowledgeBaseCategory[] }>({
    queryKey: ['/api/admin/knowledge-base/categories'],
  });

  const { data: articlesData } = useQuery<{ success: boolean; articles: KnowledgeBaseArticle[] }>({
    queryKey: ['/api/admin/knowledge-base/articles'],
  });

  const categories = categoriesData?.categories || [];
  const articles = articlesData?.articles || [];

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      orderIndex: 0,
      isVisible: true,
    },
  });

  const articleForm = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      categoryId: undefined,
      tags: [],
      isPublished: true,
      orderIndex: 0,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return await apiRequest('POST', '/api/admin/knowledge-base/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/categories'] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
      toast({
        title: "Category created",
        description: "Knowledge base category has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      return await apiRequest('PUT', `/api/admin/knowledge-base/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/categories'] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
      toast({
        title: "Category updated",
        description: "Knowledge base category has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/knowledge-base/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/articles'] });
      toast({
        title: "Category deleted",
        description: "Knowledge base category and its articles have been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      return await apiRequest('POST', '/api/admin/knowledge-base/articles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/articles'] });
      setArticleDialogOpen(false);
      setEditingArticle(null);
      articleForm.reset();
      toast({
        title: "Article created",
        description: "Knowledge base article has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArticleFormData }) => {
      return await apiRequest('PUT', `/api/admin/knowledge-base/articles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/articles'] });
      setArticleDialogOpen(false);
      setEditingArticle(null);
      articleForm.reset();
      toast({
        title: "Article updated",
        description: "Knowledge base article has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/knowledge-base/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/articles'] });
      toast({
        title: "Article deleted",
        description: "Knowledge base article has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditCategory = (category: KnowledgeBaseCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      orderIndex: category.orderIndex,
      isVisible: category.isVisible,
    });
    setCategoryDialogOpen(true);
  };

  const handleEditArticle = (article: KnowledgeBaseArticle) => {
    setEditingArticle(article);
    articleForm.reset({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || "",
      categoryId: article.categoryId,
      tags: article.tags || [],
      isPublished: article.isPublished,
      orderIndex: article.orderIndex,
      metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || "",
    });
    setArticleDialogOpen(true);
  };

  const onCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const onArticleSubmit = (data: ArticleFormData) => {
    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle.id, data });
    } else {
      createArticleMutation.mutate(data);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = articleForm.getValues('tags');
      if (!currentTags.includes(tagInput.trim())) {
        articleForm.setValue('tags', [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = articleForm.getValues('tags');
    articleForm.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Knowledge Base Management</h2>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingArticle(null);
                    articleForm.reset();
                  }}
                  className="bg-aramis-orange hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingArticle ? 'Edit Article' : 'Create New Article'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={articleForm.handleSubmit(onArticleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        {...articleForm.register('title')}
                        onChange={(e) => {
                          articleForm.setValue('title', e.target.value);
                          if (!editingArticle) {
                            articleForm.setValue('slug', generateSlug(e.target.value));
                          }
                        }}
                      />
                      {articleForm.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">{articleForm.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input {...articleForm.register('slug')} />
                      {articleForm.formState.errors.slug && (
                        <p className="text-red-500 text-sm mt-1">{articleForm.formState.errors.slug.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea {...articleForm.register('excerpt')} rows={2} />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea {...articleForm.register('content')} rows={8} />
                    {articleForm.formState.errors.content && (
                      <p className="text-red-500 text-sm mt-1">{articleForm.formState.errors.content.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={articleForm.watch('categoryId')?.toString() || ""}
                        onValueChange={(value) => articleForm.setValue('categoryId', value ? parseInt(value) : undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Category</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="orderIndex">Order Index</Label>
                      <Input
                        type="number"
                        {...articleForm.register('orderIndex', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {articleForm.watch('tags').map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input {...articleForm.register('metaTitle')} />
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Input {...articleForm.register('metaDescription')} />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={articleForm.watch('isPublished')}
                      onCheckedChange={(checked) => articleForm.setValue('isPublished', checked)}
                    />
                    <Label>Published</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setArticleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                      className="bg-aramis-orange hover:bg-orange-600"
                    >
                      {editingArticle ? 'Update' : 'Create'} Article
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredArticles.map(article => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant={article.isPublished ? "default" : "secondary"}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getCategoryName(article.categoryId)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          {article.viewCount} views
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditArticle(article)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteArticleMutation.mutate(article.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {article.excerpt && (
                    <p className="text-gray-600 mb-2">{article.excerpt}</p>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categories</h3>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingCategory(null);
                    categoryForm.reset();
                  }}
                  className="bg-aramis-orange hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      {...categoryForm.register('name')}
                      onChange={(e) => {
                        categoryForm.setValue('name', e.target.value);
                        if (!editingCategory) {
                          categoryForm.setValue('slug', generateSlug(e.target.value));
                        }
                      }}
                    />
                    {categoryForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{categoryForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input {...categoryForm.register('slug')} />
                    {categoryForm.formState.errors.slug && (
                      <p className="text-red-500 text-sm mt-1">{categoryForm.formState.errors.slug.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...categoryForm.register('description')} />
                  </div>

                  <div>
                    <Label htmlFor="orderIndex">Order Index</Label>
                    <Input
                      type="number"
                      {...categoryForm.register('orderIndex', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryForm.watch('isVisible')}
                      onCheckedChange={(checked) => categoryForm.setValue('isVisible', checked)}
                    />
                    <Label>Visible</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                      className="bg-aramis-orange hover:bg-orange-600"
                    >
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {categories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">/{category.slug}</p>
                      {category.description && (
                        <p className="text-gray-600 mt-2">{category.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant={category.isVisible ? "default" : "secondary"}>
                          {category.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Order: {category.orderIndex}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}