import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const generateGatePass = (truck: any) => {
  const doc = new jsPDF()

  // 1. Header - Company Branding
  doc.setFillColor(41, 128, 185) // Blue color
  doc.rect(0, 0, 210, 40, "F") // Top banner
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("SHREEDHAR COTSYN PVT LTD", 105, 20, { align: "center" })
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Gate Pass & Weighment Slip", 105, 30, { align: "center" })

  // 2. Ticket Details
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Ticket No: ${truck.id.slice(0, 8).toUpperCase()}`, 15, 50)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50)

  // 3. Vehicle Information Table
  autoTable(doc, {
    startY: 60,
    head: [['Field', 'Details']],
    body: [
      ['Truck Number', truck.truck_number],
      ['Driver Name', truck.driver_name],
      ['Purpose', (truck.purpose || 'N/A').toUpperCase()],
      ['Entry Time', new Date(truck.entry_time).toLocaleString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  })

  // 4. Weighbridge Data (Only if weights exist)
  if (truck.gross_weight_kg && truck.tare_weight_kg) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Weight Type', 'Value (Kg)']],
      body: [
        ['Gross Weight', `${truck.gross_weight_kg} kg`],
        ['Tare Weight', `${truck.tare_weight_kg} kg`],
        ['NET WEIGHT', `${truck.net_weight_kg} kg`], // Highlight this row later if needed
      ],
      theme: 'striped',
    })
  }

  // 5. Footer / Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 40
  
  doc.text("_______________________", 20, finalY)
  doc.text("Weighbridge Operator", 20, finalY + 5)

  doc.text("_______________________", 140, finalY)
  doc.text("Driver Signature", 140, finalY + 5)

  // 6. Save the PDF
  doc.save(`${truck.truck_number}_GATEPASS.pdf`)
}