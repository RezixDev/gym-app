import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell } from "lucide-react";

export function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(""); // For signup
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) setError(error.message);
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });
        if (error) setError(error.message);
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-border">
                        <Dumbbell className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">GymTrack</h1>
                    <p className="text-sm text-muted-foreground">Track your progress, reach your goals.</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted text-muted-foreground">
                        <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <CardTitle>Welcome back</CardTitle>
                                <CardDescription className="text-muted-foreground">Enter your credentials to access your account.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={loading} className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <CardTitle>Create an account</CardTitle>
                                <CardDescription className="text-muted-foreground">Enter your details to create a new account.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSignUp}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-username">Username</Label>
                                        <Input
                                            id="signup-username"
                                            type="text"
                                            placeholder="gymrat123"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-emerald-500"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={loading} className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
                                        {loading ? "Creating account..." : "Sign Up"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
