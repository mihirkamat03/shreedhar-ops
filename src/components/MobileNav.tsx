"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LayoutDashboard, Truck, Scale, Microscope } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/gate", label: "Gate Entry", icon: Truck },
    { href: "/weighbridge", label: "Weighbridge", icon: Scale },
    { href: "/qc", label: "Quality Lab", icon: Microscope },
  ]

  return (
    <div className="md:hidden border-b bg-zinc-950 p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="font-bold text-lg text-white">
        SHREEDHAR<span className="text-blue-500">OPS</span>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-zinc-900 border-zinc-800 text-white w-72 p-0">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-blue-500">Menu</h2>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}