"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Truck } from "lucide-react"

export default function Weighbridge() {
  const [trucks, setTrucks] = useState<any[]>([])
  const [selectedTruckId, setSelectedTruckId] = useState("")
  
  // Weights
  const [grossWeight, setGrossWeight] = useState("") // Loaded Truck
  const [tareWeight, setTareWeight] = useState("")   // Empty Truck
  
  // Load trucks that are INSIDE the factory
  useEffect(() => {
    const fetchActiveTrucks = async () => {
      const { data } = await supabase
        .from('trucks')
        .select('*')
        .neq('status', 'DISPATCHED') // Only show trucks that haven't left
      
      if (data) setTrucks(data)
    }
    fetchActiveTrucks()
  }, [])

  // Auto-Calculate Net Weight (The Magic Math)
  const netWeight = (Number(grossWeight) - Number(tareWeight)) || 0

  const handleSave = async () => {
    if (!selectedTruckId) return alert("Select a truck first!")
    
    const { error } = await supabase
      .from('trucks')
      .update({
        gross_weight_kg: Number(grossWeight),
        tare_weight_kg: Number(tareWeight),
        // Net weight is auto-calculated by Database, but we update status too
        status: 'WEIGHING_OUT'
      })
      .eq('id', selectedTruckId)

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Weights Saved! Net Weight: " + netWeight + " kg")
      // Reset form
      setGrossWeight("")
      setTareWeight("")
      setSelectedTruckId("")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="bg-zinc-100 dark:bg-zinc-900 border-b">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-blue-600" />
            <CardTitle>Digital Weighbridge</CardTitle>
          </div>
          <CardDescription>Select a truck to record official weights.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          
          {/* 1. Select Truck */}
          <div className="space-y-2">
            <Label>Select Vehicle</Label>
            <Select onValueChange={setSelectedTruckId}>
              <SelectTrigger>
                <SelectValue placeholder="Identify Truck..." />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.truck_number} ({t.driver_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Gross Weight */}
            <div className="space-y-2">
              <Label className="text-zinc-500">Gross Weight (Kg)</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="text-lg font-mono"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
              />
            </div>

            {/* 3. Tare Weight */}
            <div className="space-y-2">
              <Label className="text-zinc-500">Tare Weight (Kg)</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="text-lg font-mono"
                value={tareWeight}
                onChange={(e) => setTareWeight(e.target.value)}
              />
            </div>
          </div>

          {/* 4. The Result (Read Only) */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900 text-center">
            <Label className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
              Net Cotton Weight
            </Label>
            <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 font-mono mt-1">
              {netWeight > 0 ? netWeight.toLocaleString() : "0"} <span className="text-lg text-blue-400">kg</span>
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            onClick={handleSave}
          >
            Confirm & Print Ticket 🖨️
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}