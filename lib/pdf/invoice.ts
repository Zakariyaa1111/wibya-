// lib/pdf/invoice.ts
// مولد الفاتورة PDF

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceData {
  orderId: string
  orderDate: string
  status: string
  // البائع
  sellerName: string
  sellerStoreName: string
  sellerEmail: string
  sellerCity: string
  sellerPhone?: string
  // المشتري
  buyerName: string
  buyerEmail: string
  shippingAddress?: string
  // المنتجات
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  commission: number
  commissionRate: number
  total: number
  paymentMethod?: string
  trackingNumber?: string
}

export function generateInvoicePDF(data: InvoiceData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // ألوان
  const navy = [26, 54, 93] as [number, number, number]
  const lightGray = [245, 245, 245] as [number, number, number]
  const darkGray = [60, 60, 60] as [number, number, number]
  const white = [255, 255, 255] as [number, number, number]
  const green = [34, 197, 94] as [number, number, number]

  // Header
  doc.setFillColor(...navy)
  doc.rect(0, 0, pageW, 40, 'F')

  // Logo text
  doc.setTextColor(...white)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Wibya', 15, 22)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Marketplace Marocain', 15, 30)

  // Invoice title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', pageW - 15, 20, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${data.orderId.slice(-8).toUpperCase()}`, pageW - 15, 28, { align: 'right' })
  doc.text(`Date: ${data.orderDate}`, pageW - 15, 34, { align: 'right' })

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    delivered: green,
    pending: [245, 158, 11],
    cancelled: [239, 68, 68],
  }
  const statusColor = statusColors[data.status] || darkGray
  doc.setFillColor(...statusColor)
  doc.roundedRect(pageW - 50, 36, 35, 8, 2, 2, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  const statusLabel: Record<string, string> = { delivered: 'LIVRÉ', pending: 'EN ATTENTE', cancelled: 'ANNULÉ' }
  doc.text(statusLabel[data.status] || data.status.toUpperCase(), pageW - 32.5, 41.5, { align: 'center' })

  // Seller & Buyer info
  let y = 55
  doc.setTextColor(...darkGray)

  // Vendeur
  doc.setFillColor(...lightGray)
  doc.rect(10, y, 88, 7, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...navy)
  doc.text('VENDEUR', 14, y + 5)

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  doc.text(data.sellerStoreName || data.sellerName, 14, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(data.sellerEmail, 14, y)
  y += 4.5
  if (data.sellerCity) doc.text(data.sellerCity + ', Maroc', 14, y)
  y += 4.5
  if (data.sellerPhone) doc.text(data.sellerPhone, 14, y)

  // Acheteur
  let y2 = 55
  doc.setFillColor(...lightGray)
  doc.rect(110, y2, 88, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...navy)
  doc.text('ACHETEUR', 114, y2 + 5)

  y2 += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  doc.text(data.buyerName, 114, y2)
  y2 += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(data.buyerEmail, 114, y2)
  y2 += 4.5
  if (data.shippingAddress) {
    const addr = doc.splitTextToSize(data.shippingAddress, 80)
    doc.text(addr, 114, y2)
    y2 += addr.length * 4.5
  }

  // Items table
  const tableY = Math.max(y, y2) + 15

  autoTable(doc, {
    startY: tableY,
    head: [['Produit', 'Qté', 'Prix unitaire', 'Total']],
    body: data.items.map(item => [
      item.name,
      item.quantity.toString(),
      `${item.price.toLocaleString()} MAD`,
      `${item.total.toLocaleString()} MAD`,
    ]),
    headStyles: {
      fillColor: navy,
      textColor: white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkGray,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 10, right: 10 },
  })

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 8
  const totalsX = pageW - 80

  const totals = [
    { label: 'Sous-total', value: `${data.subtotal.toLocaleString()} MAD` },
    { label: `Commission Wibya (${data.commissionRate}%)`, value: `-${data.commission.toLocaleString()} MAD` },
  ]

  totals.forEach((t, i) => {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text(t.label, totalsX, finalY + i * 7)
    doc.text(t.value, pageW - 10, finalY + i * 7, { align: 'right' })
  })

  // Total line
  const totalY = finalY + totals.length * 7 + 3
  doc.setFillColor(...navy)
  doc.rect(totalsX - 5, totalY - 5, pageW - totalsX + 5 - 10 + 5, 10, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL NET', totalsX, totalY + 1)
  doc.text(`${data.total.toLocaleString()} MAD`, pageW - 10, totalY + 1, { align: 'right' })

  // Payment info
  if (data.paymentMethod || data.trackingNumber) {
    const infoY = totalY + 20
    doc.setFillColor(...lightGray)
    doc.rect(10, infoY, pageW - 20, data.trackingNumber ? 16 : 10, 'F')
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    if (data.paymentMethod) doc.text(`Méthode de paiement: ${data.paymentMethod}`, 14, infoY + 6)
    if (data.trackingNumber) doc.text(`N° de suivi: ${data.trackingNumber}`, 14, infoY + 12)
  }

  // Footer
  doc.setFillColor(...navy)
  doc.rect(0, pageH - 18, pageW, 18, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Wibya — Marketplace Marocain | wibya.com', pageW / 2, pageH - 10, { align: 'center' })
  doc.text('Ce document est généré automatiquement et constitue une preuve d\'achat valide.', pageW / 2, pageH - 5, { align: 'center' })

  // تحميل
  doc.save(`wibya-facture-${data.orderId.slice(-8).toUpperCase()}.pdf`)
}