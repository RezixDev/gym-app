import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Auth } from "@/components/Auth";
import { ThemeProvider } from "@/components/theme-provider";

function ProtectedApp() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-emerald-500">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <Layout />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" storageKey="vite-ui-theme">
        <ProtectedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
