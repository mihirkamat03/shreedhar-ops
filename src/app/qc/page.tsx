"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Microscope, AlertTriangle, CheckCircle } from "lucide-react"

export default function QualityControl() {
  const [trucks, setTrucks] = useState<any[]>([])
  const [selectedTruckId, setSelectedTruckId] = useState("")
  
  // Lab Data
  const [moisture, setMoisture] = useState("")
  const [trash, setTrash] = useState("")
  const [grade, setGrade] = useState("")
  
  // Load trucks awaiting QC
  useEffect(() => {
    const fetchTrucks = async () => {
      const { data } = await supabase
        .from('trucks')
        .select('*')
        // Show trucks that are inside but haven't been dispatched
        .neq('status', 'DISPATCHED') 
      
      if (data) setTrucks(data)
    }
    fetchTrucks()
  }, [])

  // The Logic: High moisture = Bad
  const isHighMoisture = Number(moisture) > 8.5

  const handleSave = async () => {
    if (!selectedTruckId) return alert("Select a truck first!")
    
    const { error } = await supabase
      .from('trucks')
      .update({
        moisture_percent: Number(moisture),
        trash_percent: Number(trash),
        quality_grade: grade,
        status: isHighMoisture ? 'QUALITY_FLAGGED' : 'QUALITY_PASSED'
      })
      .eq('id', selectedTruckId)

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert(isHighMoisture ? "Warning Saved: High Moisture!" : "Quality Passed.")
      // Reset
      setMoisture("")
      setTrash("")
      setGrade("")
      setSelectedTruckId("")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="bg-purple-50 dark:bg-purple-900/20 border-b">
          <div className="flex items-center gap-2">
            <Microscope className="h-6 w-6 text-purple-600" />
            <CardTitle>Lab Quality Check</CardTitle>
          </div>
          <CardDescription>Record moisture and trash content analysis.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          
          {/* 1. Select Truck */}
          <div className="space-y-2">
            <Label>Select Sample Source</Label>
            <Select onValueChange={setSelectedTruckId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Truck..." />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.truck_number} ({t.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Moisture Input (The Important One) */}
            <div className="space-y-2">
              <Label className="flex justify-between">
                Moisture % 
                {moisture && (
                  isHighMoisture 
                    ? <span className="text-red-500 font-bold text-xs flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>HIGH</span>
                    : <span className="text-green-500 font-bold text-xs flex items-center"><CheckCircle className="h-3 w-3 mr-1"/>OK</span>
                )}
              </Label>
              <Input 
                type="number" 
                placeholder="0.0" 
                step="0.1"
                className={`text-lg font-mono ${isHighMoisture ? "border-red-500 ring-red-200" : ""}`}
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Standard: &lt; 8.5%</p>
            </div>

            {/* 3. Trash Input */}
            <div className="space-y-2">
              <Label>Trash %</Label>
              <Input 
                type="number" 
                placeholder="0.0" 
                step="0.1"
                className="text-lg font-mono"
                value={trash}
                onChange={(e) => setTrash(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Grade Selection */}
          <div className="space-y-2">
            <Label>Visual Grade</Label>
            <Select onValueChange={setGrade} value={grade}>
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Middling">Middling (Standard)</SelectItem>
                <SelectItem value="Strict Middling">Strict Middling (Premium)</SelectItem>
                <SelectItem value="Good Middling">Good Middling (Top)</SelectItem>
                <SelectItem value="Spotted">Spotted (Defect)</SelectItem>
                <SelectItem value="Yellow Stained">Yellow Stained (Reject)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className={`w-full h-12 text-lg font-semibold transition-colors ${
              isHighMoisture 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            onClick={handleSave}
          >
            {isHighMoisture ? "FLAG HIGH MOISTURE 🚩" : "Approve Quality ✅"}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}