import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover, #fff)",
          "--normal-text": "var(--popover-foreground, #18181b)",
          "--normal-border": "var(--border, #e4e4e7)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
