import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Eye, Tag, Share2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DynamicHeader from "@/components/dynamic-header";
import Footer from "@/components/footer";

interface KnowledgeBaseArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  tags?: string[];
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default function KnowledgeBaseArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const { data: articleData, isLoading, error } = useQuery<{ success: boolean; article: KnowledgeBaseArticle }>({
    queryKey: [`/api/knowledge-base/article/${slug}`],
    enabled: !!slug,
  });

  const { data: categoriesData } = useQuery<{ success: boolean; categories: KnowledgeBaseCategory[] }>({
    queryKey: ['/api/knowledge-base/categories'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <DynamicHeader />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !articleData?.success) {
    return (
      <div className="min-h-screen bg-white">
        <DynamicHeader />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h1>
              <p className="text-gray-600 mb-8">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/knowledge-base">
                <Button className="bg-aramis-orange hover:bg-orange-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Knowledge Base
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const article = articleData.article;
  const categories = categoriesData?.categories || [];
  
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'General';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'General';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareArticle = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || 'Check out this helpful IT article from AramisTech',
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Article URL has been copied to your clipboard",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to copy link. Please copy the URL manually.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DynamicHeader />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <section className="bg-gray-50 py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-aramis-orange">Home</Link>
                <span>/</span>
                <Link href="/knowledge-base" className="hover:text-aramis-orange">Knowledge Base</Link>
                <span>/</span>
                <span className="text-gray-800">{getCategoryName(article.categoryId)}</span>
              </nav>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <Link href="/knowledge-base">
                    <Button variant="ghost" size="sm" className="text-aramis-orange hover:text-orange-600">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Knowledge Base
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{getCategoryName(article.categoryId)}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.viewCount} views
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Published {formatDate(article.createdAt)}
                    {article.updatedAt !== article.createdAt && (
                      <span className="ml-4">
                        • Updated {formatDate(article.updatedAt)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareArticle}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </header>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none mb-8">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
                />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Help Section */}
        <section className="bg-primary-blue text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-blue-100 mb-6">
                Our IT experts are ready to provide personalized assistance for your specific situation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-aramis-orange hover:bg-orange-600 text-white"
                  onClick={() => window.location.href = 'tel:305-814-4461'}
                >
                  Call (305) 814-4461
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary-blue"
                  onClick={() => window.location.href = 'mailto:sales@aramistech.com'}
                >
                  Email Support
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}