import { useLocation } from "react-router";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter flex-1">
      {children}
    </div>
  );
}
