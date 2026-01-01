import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useParams } from "wouter";
import { MapPin, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery({ slug: slug! });
  const { data: images } = trpc.postImages.getByPostId.useQuery(
    { postId: post?.id! },
    { enabled: !!post?.id }
  );



  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold mb-4">게시물을 찾을 수 없습니다</h2>
            <Link href="/posts">
              <Button>목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Image */}
      {post.coverImage && (
        <div className="w-full h-[50vh] min-h-[400px] relative">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Content */}
      <article className="container py-12 max-w-4xl">
        {/* Back Button */}
        <Link href="/posts">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{post.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
            </div>
          </div>

          {post.travelType && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                {post.travelType}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{post.title}</h1>

          {post.excerpt && <p className="text-xl text-muted-foreground">{post.excerpt}</p>}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</div>
        </div>

        {/* Photo Gallery */}
        {images && images.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">사진 갤러리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <img src={image.imageUrl} alt={image.caption || post.title} className="w-full aspect-[4/3] object-cover" />
                  {image.caption && (
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{image.caption}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Map */}
        {post.latitude && post.longitude && (() => {
          const lat = parseFloat(post.latitude);
          const lng = parseFloat(post.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return (
              <section className="mb-12">
                <h2 className="text-2xl font-serif font-bold mb-6">위치</h2>
                <Card className="overflow-hidden h-[400px]">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">{post.destination}</h3>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Card>
              </section>
            );
          }
          return null;
        })()}
      </article>

      <Footer />
    </div>
  );
}
