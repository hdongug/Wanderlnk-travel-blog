import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { MapPin, Calendar, Loader2, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useMemo } from "react";

export default function Posts() {
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [selectedTravelType, setSelectedTravelType] = useState<string>("all");

  const { data: posts, isLoading } = trpc.posts.list.useQuery();
  const { data: destinations } = trpc.posts.getDestinations.useQuery();
  const { data: travelTypes } = trpc.posts.getTravelTypes.useQuery();

  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      const matchesDestination = selectedDestination === "all" || post.destination === selectedDestination;
      const matchesTravelType = selectedTravelType === "all" || post.travelType === selectedTravelType;
      return matchesDestination && matchesTravelType;
    });
  }, [posts, selectedDestination, selectedTravelType]);

  const handleResetFilters = () => {
    setSelectedDestination("all");
    setSelectedTravelType("all");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">여행 이야기</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            전 세계 곳곳의 여행 경험과 모험을 함께 나눠보세요
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container py-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">필터</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">목적지</label>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="목적지 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {destinations?.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">여행 유형</label>
              <Select value={selectedTravelType} onValueChange={setSelectedTravelType}>
                <SelectTrigger>
                  <SelectValue placeholder="여행 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {travelTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                필터 초기화
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container py-8 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">선택한 필터에 맞는 게시물이 없습니다.</p>
            <Button variant="outline" onClick={handleResetFilters} className="mt-4">
              필터 초기화
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                총 <span className="font-semibold text-foreground">{filteredPosts.length}</span>개의 이야기
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {post.coverImage && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{post.destination}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </div>
                      {post.travelType && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                            {post.travelType}
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
