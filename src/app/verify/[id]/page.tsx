"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react"
import { useParams } from "next/navigation"

export default function VerifyPage() {
  const { id } = useParams() // Get the ID from the URL
  const [truck, setTruck] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTruck = async () => {
      if (!id) return
      
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) setTruck(data)
      setLoading(false)
    }
    fetchTruck()
  }, [id])

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Verifying...</div>
  
  if (!truck) return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <XCircle className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold">Invalid Ticket</h1>
      <p className="text-zinc-400">This QR code is not recognized by Shreedhar Ops.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
         <h1 className="text-xl font-bold tracking-wider text-blue-500">SHREEDHAR<span className="text-white">OPS</span></h1>
         <p className="text-xs text-zinc-500">Official Digital Receipt</p>
      </div>

      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl">
        <CardHeader className="text-center border-b border-zinc-800 pb-6">
          <div className="mx-auto h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-mono font-bold">{truck.truck_number}</CardTitle>
          <Badge variant="outline" className="mt-2 bg-blue-900/30 text-blue-400 border-blue-800">
            {truck.status.replace('_', ' ')}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Entry Time</p>
              <p className="font-mono font-bold text-lg">
                {new Date(truck.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-xs text-zinc-600">
                {new Date(truck.entry_time).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Truck className="h-3 w-3"/> Net Weight</p>
              <p className="font-mono font-bold text-lg">
                {truck.net_weight_kg ? `${truck.net_weight_kg.toLocaleString()} kg` : "--"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Driver</span>
              <span className="font-medium">{truck.driver_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Purpose</span>
              <span className="font-medium uppercase">{truck.purpose}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Quality (Moisture)</span>
              <span className={`font-bold ${truck.moisture_percent > 8.5 ? "text-red-400" : "text-green-400"}`}>
                {truck.moisture_percent ? `${truck.moisture_percent}%` : "Pending"}
              </span>
            </div>
          </div>

          <div className="bg-blue-900/10 p-4 rounded text-center text-xs text-blue-400 border border-blue-900/20">
            This is a verifiable digital record from the Shreedhar Ops Server.
          </div>

        </CardContent>
      </Card>
    </div>
  )
}