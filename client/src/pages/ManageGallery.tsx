import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, Upload, X, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ManageGallery() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: post, isLoading: postLoading } = trpc.posts.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id && isAuthenticated && user?.role === "admin" }
  );

  const { data: images, isLoading: imagesLoading, refetch: refetchImages } = trpc.postImages.getByPostId.useQuery(
    { postId: parseInt(id!) },
    { enabled: !!id && isAuthenticated && user?.role === "admin" }
  );

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const uploadImageMutation = trpc.upload.image.useMutation();

  const addImageMutation = trpc.postImages.create.useMutation({
    onSuccess: () => {
      toast.success("이미지가 추가되었습니다");
      refetchImages();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "이미지 추가에 실패했습니다");
    },
  });

  const deleteImageMutation = trpc.postImages.delete.useMutation({
    onSuccess: () => {
      toast.success("이미지가 삭제되었습니다");
      refetchImages();
    },
    onError: (error) => {
      toast.error(error.message || "이미지 삭제에 실패했습니다");
    },
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      toast.error("관리자 권한이 필요합니다");
      setLocation("/");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("이미지 크기는 5MB 이하여야 합니다");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setImageUrl("");
    setCaption("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleAddImage = async () => {
    try {
      let finalImageUrl = imageUrl;

      // If user selected a file, upload to S3 first
      if (imageFile && imagePreview) {
        toast.info("이미지를 업로드 중...");
        
        const result = await uploadImageMutation.mutateAsync({
          base64: imagePreview,
          filename: imageFile.name,
          mimeType: imageFile.type,
        });
        
        finalImageUrl = result.url;
      }

      if (!finalImageUrl) {
        toast.error("이미지를 업로드하거나 URL을 입력해주세요");
        return;
      }

      addImageMutation.mutate({
        postId: parseInt(id!),
        imageUrl: finalImageUrl,
        caption: caption || undefined,
      });
    } catch (error) {
      toast.error("이미지 업로드 실패");
    }
  };

  const handleDeleteImage = (imageId: number) => {
    if (confirm("정말로 이 이미지를 삭제하시겠습니까?")) {
      deleteImageMutation.mutate({ id: imageId });
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

  if (postLoading) {
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
            <Button onClick={() => setLocation("/admin")}>관리자 대시보드로</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setLocation("/admin")} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              관리자 대시보드로
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">갤러리 관리</h1>
                <p className="text-muted-foreground">{post.title}</p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    이미지 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>갤러리 이미지 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="이미지 미리보기" className="w-full h-64 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="galleryImage">이미지 업로드</Label>
                        <div className="mt-2">
                          <label
                            htmlFor="galleryImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">클릭하여 이미지 업로드</p>
                            <p className="text-xs text-muted-foreground">최대 5MB</p>
                          </label>
                          <input
                            id="galleryImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="imageUrl">또는 이미지 URL 입력</Label>
                      <Input
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!imagePreview}
                      />
                    </div>

                    <div>
                      <Label htmlFor="caption">캡션 (선택)</Label>
                      <Input
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="이미지 설명"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleAddImage} disabled={addImageMutation.isPending}>
                        {addImageMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            추가 중...
                          </>
                        ) : (
                          "추가"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Gallery Grid */}
          <Card>
            <CardHeader>
              <CardTitle>갤러리 이미지 ({images?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {imagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : images && images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="relative group">
                        <img src={image.imageUrl} alt={image.caption || ""} className="w-full aspect-[4/3] object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-2" />
                            삭제
                          </Button>
                        </div>
                      </div>
                      {image.caption && (
                        <CardContent className="p-3">
                          <p className="text-sm text-muted-foreground">{image.caption}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">아직 갤러리 이미지가 없습니다</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    첫 이미지 추가하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
