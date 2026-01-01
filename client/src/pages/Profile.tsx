import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("로그아웃되었습니다");
      window.location.href = "/";
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">내 프로필</h1>
            <p className="text-muted-foreground">계정 정보를 확인하세요</p>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                사용자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이름</label>
                  <p className="text-lg font-medium">{user.name || "이름 없음"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    이메일
                  </label>
                  <p className="text-lg font-medium">{user.email || "이메일 없음"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    가입일
                  </label>
                  <p className="text-lg font-medium">{new Date(user.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    권한
                  </label>
                  <p className="text-lg font-medium">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        관리자
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                        일반 사용자
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          {user.role === "admin" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  관리자 기능
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">관리자 대시보드에서 게시물과 사용자를 관리할 수 있습니다.</p>
                <Link href="/admin">
                  <Button>관리자 대시보드로 이동</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>계정 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending} className="gap-2">
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
