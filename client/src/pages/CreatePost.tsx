import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreatePost() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [destination, setDestination] = useState("");
  const [travelType, setTravelType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [published, setPublished] = useState<"draft" | "published">("draft");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const uploadImageMutation = trpc.upload.image.useMutation();

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("게시물이 생성되었습니다");
      setLocation("/admin");
    },
    onError: (error) => {
      toast.error(error.message || "게시물 생성에 실패했습니다");
    },
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      toast.error("관리자 권한이 필요합니다");
      setLocation("/");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  const searchLocation = async (locationName: string) => {
    if (!locationName.trim()) return;

    setIsSearchingLocation(true);
    try {
      // 도시명만 입력한 경우 시청을 우선 검색
      const cityKeywords = ['용인', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '수원', '성남', '고양', '창원', '청주', '전주', '천안', '남양주'];
      const isCityOnly = cityKeywords.some(city => locationName.trim() === city);
      
      let searchQuery = locationName;
      if (isCityOnly) {
        // 도시명만 입력한 경우 "시청" 추가
        searchQuery = `${locationName} 시청, 대한민국`;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=kr`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // 시청이나 행정 구역 중심을 우선 선택
        const priorityLocation = data.find((loc: any) => 
          loc.type === 'administrative' || 
          loc.type === 'city' ||
          loc.display_name.includes('시청') ||
          loc.display_name.includes('City Hall')
        ) || data[0];
        
        setLatitude(priorityLocation.lat);
        setLongitude(priorityLocation.lon);
        toast.success(`위치를 찾았습니다: ${priorityLocation.display_name}`);
      } else {
        toast.error("위치를 찾을 수 없습니다. 직접 입력해주세요.");
      }
    } catch (error) {
      console.error("Location search error:", error);
      toast.error("위치 검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleDestinationBlur = () => {
    if (destination && !latitude && !longitude) {
      searchLocation(destination);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("이미지 크기는 5MB 이하여야 합니다");
        return;
      }
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview("");
    setCoverImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !destination) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }

    try {
      const slug = generateSlug(title);
      let finalCoverImage = coverImageUrl;

      // If user selected a file, upload to S3 first
      if (coverImageFile && coverImagePreview) {
        toast.info("커버 이미지를 업로드 중...");
        
        const result = await uploadImageMutation.mutateAsync({
          base64: coverImagePreview,
          filename: coverImageFile.name,
          mimeType: coverImageFile.type,
        });
        
        finalCoverImage = result.url;
      }

      createPostMutation.mutate({
        title,
        slug,
        excerpt: excerpt || undefined,
        content,
        destination,
        travelType: travelType || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        coverImage: finalCoverImage || undefined,
        published,
      });
    } catch (error) {
      toast.error("이미지 업로드 실패");
    }
  };

  if (loading || !isAuthenticated || user?.role !== "admin") {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setLocation("/admin")} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              관리자 대시보드로
            </Button>
            <h1 className="text-4xl font-serif font-bold mb-2">새 게시물 작성</h1>
            <p className="text-muted-foreground">여행 이야기를 공유하세요</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="게시물 제목을 입력하세요"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">URL 슬러그는 제목에서 자동으로 생성됩니다</p>
                </div>

                <div>
                  <Label htmlFor="excerpt">요약</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="게시물의 간단한 요약을 입력하세요"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">본문 *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="여행 이야기를 자세히 작성하세요"
                    rows={12}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>여행 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="destination">목적지 *</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onBlur={handleDestinationBlur}
                    placeholder="예: 서울, 파리, 도쿄"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isSearchingLocation ? "위치를 검색하는 중..." : "목적지를 입력하면 위도/경도가 자동으로 검색됩니다"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="travelType">여행 유형</Label>
                  <Input
                    id="travelType"
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value)}
                    placeholder="예: 모험, 휴양, 문화 탐방"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">위도</Label>
                    <Input
                      id="latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="37.5665"
                      type="text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">경도</Label>
                    <Input
                      id="longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="126.9780"
                      type="text"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">지도에 위치를 표시하려면 위도와 경도를 입력하세요</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>커버 이미지</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coverImagePreview ? (
                  <div className="relative">
                    <img src={coverImagePreview} alt="커버 이미지 미리보기" className="w-full h-64 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeCoverImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="coverImage">이미지 업로드</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="coverImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">클릭하여 이미지 업로드</p>
                        <p className="text-xs text-muted-foreground">최대 5MB</p>
                      </label>
                      <input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="coverImageUrl">또는 이미지 URL 입력</Label>
                  <Input
                    id="coverImageUrl"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={!!coverImagePreview}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>게시 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="published">상태</Label>
                  <Select value={published} onValueChange={(value: "draft" | "published") => setPublished(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">임시저장</SelectItem>
                      <SelectItem value="published">게시</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={createPostMutation.isPending} className="flex-1">
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "게시물 생성"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setLocation("/admin")}>
                취소
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
