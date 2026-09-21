import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Cpu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Đánh giá", href: "/reviews" },
  { label: "Tin tức", href: "/news" },
  { label: "Danh mục", href: "/categories" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block">TechReview</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className="text-sm font-medium"
            >
              <Link to={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Desktop Login + Mobile Menu */}
        <div className="flex items-center gap-2">
          <Button asChild className="hidden md:inline-flex">
            <Link to="/login">Đăng nhập</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[340px]">
              <div className="flex flex-col h-full">
                {/* Logo trong mobile */}
                <div className="flex items-center gap-2 mb-8 mt-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-lg">TechReview</span>
                </div>

                {/* Nav items mobile */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        to={item.href}
                        className="flex items-center rounded-md px-3 py-3 text-base font-medium hover:bg-accent transition-colors"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* Login button mobile */}
                <div className="mt-auto pt-6">
                  <SheetClose asChild>
                    <Button asChild className="w-full" size="lg">
                      <Link to="/login">Đăng nhập</Link>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
