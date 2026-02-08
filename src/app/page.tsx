"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Truck, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

// Updated Type Definition including new columns
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

  const fetchTrucks = async () => {
    const { data } = await supabase
      .from('trucks')
      .select('*')
      .order('entry_time', { ascending: false })
    
    if (data) setTrucks(data)
  }

  useEffect(() => {
    fetchTrucks()

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

  const getBadgeColor = (status: string) => {
    if (status === 'QUALITY_FLAGGED') return "bg-red-100 text-red-800 border-red-200"
    if (status === 'DISPATCHED') return "bg-green-100 text-green-800"
    if (status === 'LOADING') return "bg-yellow-100 text-yellow-800"
    return "bg-zinc-100 text-zinc-800"
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-8 w-8" />
              Shreedhar Ops
            </h1>
            <p className="text-muted-foreground">Live Factory Operations Control Center</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
            <CardTitle>Live Fleet Overview</CardTitle>
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
                    
                    {/* Weight Column */}
                    <TableCell>
                      {truck.net_weight_kg ? (
                        <span className="font-mono font-semibold">{truck.net_weight_kg.toLocaleString()} kg</span>
                      ) : <span className="text-zinc-300">-</span>}
                    </TableCell>

                    {/* Quality Column (Smart) */}
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}