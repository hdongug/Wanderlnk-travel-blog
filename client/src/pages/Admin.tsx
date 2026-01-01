import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useLocation } from "wouter";
import { FileText, Users, MapPin, Mail, Plus, Pencil, Trash2, Loader2, Images } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = trpc.posts.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: places, isLoading: placesLoading, refetch: refetchPlaces } = trpc.visitedPlaces.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: subscribers, isLoading: subscribersLoading } = trpc.newsletter.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("게시물이 삭제되었습니다");
      refetchPosts();
    },
    onError: () => {
      toast.error("게시물 삭제에 실패했습니다");
    },
  });

  const deletePlaceMutation = trpc.visitedPlaces.delete.useMutation({
    onSuccess: () => {
      toast.success("방문 장소가 삭제되었습니다");
      refetchPlaces();
    },
    onError: () => {
      toast.error("방문 장소 삭제에 실패했습니다");
    },
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      toast.error("관리자 권한이 필요합니다");
      setLocation("/");
    }
  }, [loading, isAuthenticated, user, setLocation]);

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

  const handleDeletePost = (id: number) => {
    if (confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      deletePostMutation.mutate({ id });
    }
  };

  const handleDeletePlace = (id: number) => {
    if (confirm("정말로 이 방문 장소를 삭제하시겠습니까?")) {
      deletePlaceMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">관리자 대시보드</h1>
            <p className="text-muted-foreground">게시물, 사용자, 방문 장소를 관리하세요</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">전체 게시물</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{posts?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">방문 장소</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{places?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">뉴스레터 구독자</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscribers?.filter((s) => s.status === "active").length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="posts">게시물</TabsTrigger>
              <TabsTrigger value="users">사용자</TabsTrigger>
              <TabsTrigger value="places">방문 장소</TabsTrigger>
              <TabsTrigger value="subscribers">뉴스레터</TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>게시물 관리</CardTitle>
                  <Link href="/admin/posts/create">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      새 게시물
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : posts && posts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>제목</TableHead>
                          <TableHead>목적지</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>작성일</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>{post.destination}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  post.published === "published"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {post.published === "published" ? "게시됨" : "임시저장"}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/posts/${post.id}/edit`}>
                                  <Button size="sm" variant="ghost">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/admin/posts/${post.id}/gallery`}>
                                  <Button size="sm" variant="ghost">
                                    <Images className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={deletePostMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">게시물이 없습니다</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>사용자 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : users && users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이름</TableHead>
                          <TableHead>이메일</TableHead>
                          <TableHead>권한</TableHead>
                          <TableHead>가입일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || "이름 없음"}</TableCell>
                            <TableCell>{user.email || "이메일 없음"}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {user.role === "admin" ? "관리자" : "일반 사용자"}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">사용자가 없습니다</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Places Tab */}
            <TabsContent value="places">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>방문 장소 관리</CardTitle>
                  <Button size="sm" className="gap-2" onClick={() => toast.info("방문 장소 추가 기능은 곧 추가됩니다")}>
                    <Plus className="h-4 w-4" />
                    새 장소
                  </Button>
                </CardHeader>
                <CardContent>
                  {placesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : places && places.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>장소명</TableHead>
                          <TableHead>국가</TableHead>
                          <TableHead>방문일</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {places.map((place) => (
                          <TableRow key={place.id}>
                            <TableCell className="font-medium">{place.name}</TableCell>
                            <TableCell>{place.country}</TableCell>
                            <TableCell>
                              {place.visitDate ? new Date(place.visitDate).toLocaleDateString("ko-KR") : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toast.info("방문 장소 수정 기능은 곧 추가됩니다")}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePlace(place.id)}
                                  disabled={deletePlaceMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">방문 장소가 없습니다</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers">
              <Card>
                <CardHeader>
                  <CardTitle>뉴스레터 구독자</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscribersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : subscribers && subscribers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이메일</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>구독일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell className="font-medium">{subscriber.email}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  subscriber.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {subscriber.status === "active" ? "활성" : "구독 취소"}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(subscriber.subscribedAt).toLocaleDateString("ko-KR")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">구독자가 없습니다</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
