import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next/link", () => ({
  default: React.forwardRef<
    HTMLAnchorElement,
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >(function MockLink({ href, children, ...rest }, ref) {
    return (
      <a ref={ref} href={href} {...rest}>
        {children}
      </a>
    );
  }),
}));

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
  }) {
    return <img src={src} alt={alt ?? ""} {...rest} />;
  },
}));
