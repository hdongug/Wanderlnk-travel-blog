import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map view changes
function MapViewController({ selectedPlace }: { selectedPlace: any }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace) {
      const lat = parseFloat(selectedPlace.latitude);
      const lng = parseFloat(selectedPlace.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 8, { animate: true });
      }
    }
  }, [selectedPlace, map]);

  return null;
}

export default function WorldMap() {
  const { data: places, isLoading } = trpc.visitedPlaces.list.useQuery();
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">세계 지도</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            지금까지 방문한 전 세계의 아름다운 장소들을 확인해보세요
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="container py-12 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden h-[600px]">
                {places && places.length > 0 ? (
                  <MapContainer
                    center={[37.5547, 126.9707]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {places.map((place) => {
                      const lat = parseFloat(place.latitude);
                      const lng = parseFloat(place.longitude);

                      if (!isNaN(lat) && !isNaN(lng)) {
                        return (
                          <Marker key={place.id} position={[lat, lng]} icon={customIcon}>
                            <Popup>
                              <div className="p-2 min-w-[200px]">
                                {place.imageUrl && (
                                  <img
                                    src={place.imageUrl}
                                    alt={place.name}
                                    className="w-full h-32 object-cover rounded mb-2"
                                  />
                                )}
                                <h3 className="font-semibold text-sm mb-1">{place.name}</h3>
                                <p className="text-xs text-muted-foreground mb-1">{place.country}</p>
                                {place.visitDate && (
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {new Date(place.visitDate).toLocaleDateString("ko-KR")}
                                  </p>
                                )}
                                {place.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                                    {place.description}
                                  </p>
                                )}
                                {place.postId && (
                                  <Link href={`/posts/${place.postId}`}>
                                    <span className="text-xs text-primary hover:underline">
                                      관련 게시물 보기 →
                                    </span>
                                  </Link>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        );
                      }
                      return null;
                    })}
                    <MapViewController selectedPlace={selectedPlace} />
                  </MapContainer>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">아직 방문한 장소가 없습니다.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        관리자 대시보드에서 방문한 장소를 추가해보세요.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Places List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold mb-4">방문한 장소</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {places && places.length > 0 ? (
                  places.map((place) => (
                    <Card
                      key={place.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPlace?.id === place.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <CardContent className="p-4">
                        {place.imageUrl && (
                          <div className="aspect-video overflow-hidden rounded-md mb-3">
                            <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-1">{place.name}</h3>
                            <p className="text-xs text-muted-foreground">{place.country}</p>
                            {place.visitDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(place.visitDate).toLocaleDateString("ko-KR")}
                              </p>
                            )}
                          </div>
                        </div>
                        {place.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{place.description}</p>
                        )}
                        {place.postId && (
                          <Link href={`/posts/${place.postId}`}>
                            <span className="text-xs text-primary hover:underline mt-2 inline-block">
                              관련 게시물 보기 →
                            </span>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">아직 방문한 장소가 없습니다.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
