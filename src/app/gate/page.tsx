"use client" // This makes it an interactive component

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient" // Import our new connection
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react" // Icon for loading

export default function GateEntry() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    truckNo: "",
    driverName: "",
    phone: "",
    purpose: ""
  })

  const handleSubmit = async () => {
    setLoading(true)
    
    // 1. Send data to Supabase
    const { error } = await supabase
      .from('trucks') // The table name we created in SQL
      .insert({
        truck_number: formData.truckNo.toUpperCase(),
        driver_name: formData.driverName,
        driver_phone: formData.phone,
        status: 'GATE_ENTRY' // Initial status
      })

    setLoading(false)

    if (error) {
      alert("Error saving: " + error.message)
    } else {
      alert("Success! Truck recorded.")
      // Optional: Clear form here
      setFormData({ truckNo: "", driverName: "", phone: "", purpose: "" })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">🚛 Gate Entry</CardTitle>
          <CardDescription className="text-center">Record a new vehicle arrival</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="truck-no">Truck Number</Label>
            <Input 
              id="truck-no" 
              placeholder="MH-12-AB-1234" 
              className="uppercase"
              value={formData.truckNo}
              onChange={(e) => setFormData({...formData, truckNo: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Driver Name</Label>
            <Input 
              id="driver" 
              placeholder="Enter driver's name" 
              value={formData.driverName}
              onChange={(e) => setFormData({...formData, driverName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select onValueChange={(value) => setFormData({...formData, purpose: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loading">Loading (Dispatch)</SelectItem>
                <SelectItem value="unloading">Unloading (Raw Material)</SelectItem>
                <SelectItem value="maintenance">Maintenance / Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            {loading ? "Saving..." : "Mark Arrival 📍"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}