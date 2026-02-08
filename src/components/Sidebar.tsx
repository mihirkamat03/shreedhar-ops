"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Truck, Scale, Microscope, Settings, LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/gate", label: "Gate Entry", icon: Truck },
    { href: "/weighbridge", label: "Weighbridge", icon: Scale },
    { href: "/qc", label: "Quality Lab", icon: Microscope },
  ]

  return (
  <div className="hidden md:flex h-screen w-64 bg-zinc-900 text-white flex-col fixed left-0 top-0 border-r border-zinc-800">
      {/* Logo Area */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-500">SHREEDHAR<span className="text-white">OPS</span></h1>
        <p className="text-xs text-zinc-500 mt-1">Textile Management System</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-950/50 border border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            SK
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Shreedhar Cotsyn</p>
            <p className="text-xs text-zinc-500">Admin</p>
          </div>
          <Settings className="h-4 w-4 text-zinc-500 cursor-pointer hover:text-white" />
        </div>
      </div>
    </div>
  )
}