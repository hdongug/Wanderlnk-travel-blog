import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const { data: posts, isLoading } = trpc.posts.list.useQuery();

  // Get featured posts (latest 3)
  const featuredPosts = posts?.slice(0, 3) || [];
  const recentPosts = posts?.slice(3, 9) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2835&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>

        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 drop-shadow-lg">
            세상을 여행하고
            <br />
            이야기를 남기다
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
            전 세계의 숨겨진 보석 같은 장소들과 잊지 못할 여행 경험을 공유합니다
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/posts">
              <Button size="lg" className="gap-2">
                여행 이야기 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                세계 지도 탐험 <MapPin className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {isLoading ? (
        <section className="container py-16">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </section>
      ) : featuredPosts.length > 0 ? (
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">주요 여행 이야기</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              최근에 공유된 흥미진진한 여행 경험들을 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {featuredPosts.map((post) => (
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
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{post.destination}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Recent Posts Grid */}
      {recentPosts.length > 0 && (
        <section className="container py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">더 많은 이야기</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{post.destination}</span>
                    </div>
                    <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/posts">
              <Button size="lg" variant="outline">
                모든 이야기 보기
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container py-20">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">당신의 여행 이야기를 공유하세요</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            전 세계 여행자들과 함께 특별한 순간과 경험을 나눠보세요
          </p>
          <Link href="/map">
            <Button size="lg" variant="secondary" className="gap-2">
              지도에서 방문한 곳 보기 <MapPin className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
