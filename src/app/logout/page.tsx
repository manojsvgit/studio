
// For a real logout page, you'd handle user session invalidation here.
// For now, it's a placeholder.
export default function LogoutPage() {
  return (
    <div className="flex flex-col items-start justify-start">
      <h1 className="text-3xl font-bold">Logout</h1>
      <p className="mt-2 text-muted-foreground">You have been logged out.</p>
    </div>
  );
}
