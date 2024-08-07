import { Button } from "@bingle/ui/button";
import { cn } from "@bingle/ui/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@bingle/ui/sheet";
import { Menu, BookText, Shirt, Baby, Cable, HeartPulse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, ...props }: Parameters<typeof Link>[0]) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        pathname !== href ? "text-muted-foreground" : "",
        "hover:text-primary text-xl font-medium transition-colors",
      )}
      {...props}
    />
  );
}

export function NavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="px-2 lg:hidden">
          <Menu className="stroke-zinc-400" />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="w-[250px]">
        <SheetHeader className="flex flex-col gap-4 text-start">
          <div className="flex flex-row gap-3">
            <BookText className="stroke-muted-foreground" />
            <NavLink href="/department/books">Books</NavLink>
          </div>
          <div className="flex flex-row gap-3">
            <Shirt className="stroke-muted-foreground" />
            <NavLink href="/department/clothing">Clothing</NavLink>
          </div>
          <div className="flex flex-row gap-3">
            <Baby className="stroke-muted-foreground" />
            <NavLink href="/department/kids">Kids</NavLink>
          </div>
          <div className="flex flex-row gap-3">
            <Cable className="stroke-muted-foreground" />
            <NavLink href="/department/electronics">Electronics</NavLink>
          </div>
          <div className="flex flex-row gap-3">
            <HeartPulse className="stroke-muted-foreground" />
            <NavLink href="/department/health">Health</NavLink>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
