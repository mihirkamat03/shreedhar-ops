"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MoreHorizontal, Truck, AlertTriangle, Printer, Search, QrCode, Trash } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { generateGatePass } from "@/lib/generateGatePass"
import QRCode from "react-qr-code"

type Truck = {
  id: string
  truck_number: string
  driver_name: string
  status: string
  entry_time: string
  purpose: string
  net_weight_kg: number | null
  moisture_percent: number | null
  quality_grade: string | null
}

export default function Dashboard() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [qrTruck, setQrTruck] = useState<Truck | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null) // <--- Track who is logged in
  const router = useRouter()

  // 1. AUTH CHECK + GET EMAIL
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUserEmail(session.user.email ?? null)
      }
    }
    checkUser()
  }, [router])

  // Simple check: Is this the Boss?
  // (Change this to your father's actual email later)
  const isAdmin = userEmail === 'admin@shreedhar.com' || userEmail === 'mihir@shreedhar.com'

  // 2. FETCH TRUCKS
  const fetchTrucks = async () => {
    let query = supabase
      .from('trucks')
      .select('*')
      .order('entry_time', { ascending: false })

    if (searchTerm) {
      query = query.or(`truck_number.ilike.%${searchTerm}%,driver_name.ilike.%${searchTerm}%`)
    }

    const { data } = await query
    if (data) setTrucks(data)
  }

  useEffect(() => {
    fetchTrucks()
  }, [searchTerm])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-trucks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trucks' }, () => {
        fetchTrucks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('trucks').update({ status: newStatus }).eq('id', id)
  }
  const deleteTruck = async (id: string) => {
    if (!confirm("Are you sure you want to delete this truck?")) return
    await supabase.from('trucks').delete().eq('id', id)
    fetchTrucks() // Refresh list immediately
  }

  const getBadgeColor = (status: string) => {
    if (status === 'QUALITY_FLAGGED') return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300"
    if (status === 'DISPATCHED') return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    if (status === 'LOADING') return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
  }

  // --- STATS CALCULATIONS ---
  const totalWeight = trucks.reduce((sum, t) => sum + (t.net_weight_kg || 0), 0)
  const trucksWithMoisture = trucks.filter(t => t.moisture_percent)
  const avgMoisture = trucksWithMoisture.length > 0
    ? (trucksWithMoisture.reduce((sum, t) => sum + (t.moisture_percent || 0), 0) / trucksWithMoisture.length).toFixed(1)
    : "0"

  const chartData = [
    { time: '09:00', trucks: 2 },
    { time: '10:00', trucks: 5 },
    { time: '11:00', trucks: 3 },
    { time: '12:00', trucks: 8 },
    { time: '13:00', trucks: 4 },
  ]

  const getVerificationLink = (id: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/verify/${id}`
    }
    return ""
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-8 w-8" />
              Shreedhar Ops
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Admin Control Center" : "Gatekeeper View"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Live System</span>
          </div>
        </div>

        {/* 1. ADMIN ONLY: STATS CARDS ROW */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Total Cotton In (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalWeight.toLocaleString()} <span className="text-lg text-zinc-400 font-normal">kg</span></div>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="bg-green-100 px-1 rounded mr-1">↑</span> Live Tonnage
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Vehicles in Premises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{trucks.filter(t => t.status !== 'DISPATCHED').length}</div>
                <p className="text-xs text-zinc-500 mt-1">Currently loading/unloading</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Avg. Moisture Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flex items-center gap-2">
                  {avgMoisture}%
                  {Number(avgMoisture) > 8.5 && <AlertTriangle className="h-6 w-6 text-red-500" />}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Target: &lt; 8.5%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. ADMIN ONLY: CHARTS */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>Hourly Truck Arrivals</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="trucks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 text-white flex flex-col justify-center items-center p-6 text-center space-y-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">System Healthy</h3>
                <p className="text-zinc-400 text-sm">All gates and weighbridges online.</p>
              </div>
            </Card>
          </div>
        )}

        {/* 3. SHARED: THE MAIN TABLE (Everyone sees this) */}
        <Card className="shadow-xl">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Live Fleet Overview</CardTitle>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search truck or driver..."
                  className="pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Add New Truck Button (Visible to everyone) */}
              {/* <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Truck
              </Button> */}
            </div>

          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck Number</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Net Weight</TableHead>
                  <TableHead>Quality (Moisture)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucks.map((truck) => (
                  <TableRow key={truck.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-bold font-mono">{truck.truck_number}</TableCell>
                    <TableCell>{truck.driver_name}</TableCell>
                    <TableCell className="text-zinc-500 font-mono text-xs">
                      {new Date(truck.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>

                    <TableCell>
                      {truck.net_weight_kg ? (
                        <span className="font-mono font-semibold">{truck.net_weight_kg.toLocaleString()} kg</span>
                      ) : <span className="text-zinc-300">-</span>}
                    </TableCell>

                    <TableCell>
                      {truck.moisture_percent ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${truck.moisture_percent > 8.5 ? "text-red-600" : "text-green-600"}`}>
                            {truck.moisture_percent}%
                          </span>
                          {truck.moisture_percent > 8.5 && (
                            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                          )}
                        </div>
                      ) : <span className="text-zinc-300">-</span>}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={getBadgeColor(truck.status)}>
                        {truck.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem onClick={() => updateStatus(truck.id, 'LOADING')}>
                            Start Loading
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => updateStatus(truck.id, 'DISPATCHED')}>
                            Mark Dispatched
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => setQrTruck(truck)}>
                            <QrCode className="mr-2 h-4 w-4 text-purple-600" />
                            Show Driver QR
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => generateGatePass(truck)}>
                            <Printer className="mr-2 h-4 w-4 text-blue-600" />
                            Print Gate Pass
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* ONLY ADMIN CAN DELETE */}
                          {isAdmin && (
                            <DropdownMenuItem
                              onClick={() => deleteTruck(truck.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Record
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* QR CODE POPUP MODAL */}
        <Dialog open={!!qrTruck} onOpenChange={() => setQrTruck(null)}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-center">Scan to Verify</DialogTitle>
              <DialogDescription className="text-center text-zinc-500">
                Driver can scan this code to verify entry time.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-inner border">
                {qrTruck && (
                  <QRCode
                    value={getVerificationLink(qrTruck.id)}
                    size={200}
                    viewBox={`0 0 256 256`}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                )}
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs font-mono text-zinc-500 break-all w-full text-center">
                {qrTruck && getVerificationLink(qrTruck.id)}
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}