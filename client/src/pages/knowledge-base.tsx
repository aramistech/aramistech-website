import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight, Eye, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface KnowledgeBaseCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  orderIndex: number;
  isVisible: boolean;
}

interface KnowledgeBaseArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  categoryId?: number;
  tags?: string[];
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categoriesData } = useQuery<{ success: boolean; categories: KnowledgeBaseCategory[] }>({
    queryKey: ['/api/knowledge-base/categories'],
  });

  const { data: articlesData } = useQuery<{ success: boolean; articles: KnowledgeBaseArticle[] }>({
    queryKey: ['/api/knowledge-base/articles', selectedCategory],
    queryKey: selectedCategory 
      ? [`/api/knowledge-base/articles?category=${selectedCategory}`]
      : ['/api/knowledge-base/articles'],
  });

  const categories = categoriesData?.categories || [];
  const articles = articlesData?.articles || [];

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'General';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'General';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-blue to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AramisTech Knowledge Base
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Find answers to common IT questions and learn from our 27+ years of experience
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles, troubleshooting guides, and more..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white text-gray-800 border-0 rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Browse by Category</h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null ? "bg-aramis-orange hover:bg-orange-600" : ""}
                >
                  All Articles
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "bg-aramis-orange hover:bg-orange-600" : ""}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    {searchTerm ? 'No articles found matching your search' : 'No articles available yet'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms or browse all categories'
                      : 'Our IT experts are working on creating helpful content for you'
                    }
                  </p>
                  {searchTerm && (
                    <Button 
                      onClick={() => setSearchTerm("")}
                      className="bg-aramis-orange hover:bg-orange-600"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredArticles.map(article => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(article.categoryId)}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.viewCount}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 hover:text-aramis-orange transition-colors">
                          <Link href={`/knowledge-base/${article.slug}`}>
                            {article.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{article.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(article.createdAt)}
                          </div>
                          <Link href={`/knowledge-base/${article.slug}`}>
                            <Button variant="ghost" size="sm" className="text-aramis-orange hover:text-orange-600">
                              Read More
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-primary-blue text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our IT experts are here to help! With 27+ years of experience serving South Florida businesses, 
              we can solve any technical challenge you're facing.
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
                Email Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}