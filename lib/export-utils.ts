import type { Employee, Payroll, Audit, Balance } from "@/types"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Función para exportar a CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    console.error("No hay datos para exportar")
    return
  }

  // Obtener encabezados
  const headers = Object.keys(data[0])

  // Crear contenido CSV
  const csvContent = [
    headers.join(","), // Encabezados
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Manejar valores especiales
          if (value === null || value === undefined) return ""
          if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`
          if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          return value
        })
        .join(","),
    ),
  ].join("\n")

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función para exportar a PDF
export const exportToPDF = (
  data: any[],
  title: string,
  filename: string,
  columns?: { header: string; dataKey: string }[],
) => {
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(title, 14, 22)

    // Fecha
    doc.setFontSize(11)
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 30)

    // Si no se proporcionan columnas, generarlas automáticamente
    if (!columns && data.length > 0) {
      columns = Object.keys(data[0]).map((key) => ({
        header: key.charAt(0).toUpperCase() + key.slice(1),
        dataKey: key,
      }))
    }

    // Crear tabla
    doc.autoTable({
      startY: 40,
      head: [columns?.map((col) => col.header) || []],
      body: data.map((item) => columns?.map((col) => item[col.dataKey]) || []),
      theme: "grid",
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    // Guardar PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error("Error al exportar a PDF:", error)
    alert("Ocurrió un error al exportar a PDF. Por favor, intente nuevamente.")
  }
}

// Función para formatear fecha
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Función para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Función para calcular días trabajados
export const calculateWorkedDays = (hireDate: string, terminationDate?: string): number => {
  const start = new Date(hireDate)
  const end = terminationDate ? new Date(terminationDate) : new Date()

  // Calcular diferencia en milisegundos
  const diffTime = Math.abs(end.getTime() - start.getTime())

  // Convertir a días
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Función para generar recibo de sueldo en PDF
export const generatePayslip = (payroll: Payroll, employee: Employee) => {
  try {
    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(18)
    doc.text("RECIBO DE SUELDO", 105, 20, { align: "center" })

    // Información de la empresa
    doc.setFontSize(12)
    doc.text("Quadrifoglio S.A.", 14, 30)
    doc.text("CUIT: 30-12345678-9", 14, 35)
    doc.text("Av. Corrientes 1234, CABA", 14, 40)

    // Información del empleado
    doc.text("INFORMACIÓN DEL EMPLEADO", 14, 50)
    doc.line(14, 51, 196, 51)

    doc.text(`Nombre: ${employee.firstName} ${employee.lastName}`, 14, 60)
    doc.text(`DNI: ${employee.documentId}`, 14, 65)
    doc.text(`Cargo: ${employee.position}`, 14, 70)
    doc.text(`Local: ${employee.local}`, 14, 75)
    doc.text(`Fecha de ingreso: ${formatDate(employee.hireDate)}`, 14, 80)

    // Información del período
    doc.text("PERÍODO", 14, 90)
    doc.line(14, 91, 196, 91)

    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    doc.text(`Mes: ${monthNames[payroll.month - 1]} ${payroll.year}`, 14, 100)

    // Detalle de haberes y deducciones
    doc.text("DETALLE DE HABERES Y DEDUCCIONES", 14, 110)
    doc.line(14, 111, 196, 111)

    // Tabla de conceptos
    const tableColumn = ["Concepto", "Tipo", "Monto"]
    const tableRows = [
      ["Sueldo Base", "Haber", formatCurrency(payroll.baseSalary)],
      ["Sueldo Banco", "Haber", formatCurrency(payroll.bankSalary)],
    ]

    // Agregar deducciones
    payroll.details.forEach((detail) => {
      if (detail.type === "deduction") {
        tableRows.push([detail.concept, "Deducción", `- ${formatCurrency(detail.amount)}`])
      }
    })

    // Agregar adiciones
    payroll.details.forEach((detail) => {
      if (detail.type === "addition") {
        tableRows.push([detail.concept, "Adición", formatCurrency(detail.amount)])
      }
    })

    // Totales
    tableRows.push(
      ["TOTAL DEDUCCIONES", "", `- ${formatCurrency(payroll.deductions)}`],
      ["TOTAL ADICIONES", "", formatCurrency(payroll.additions)],
      ["SUELDO EN MANO FINAL", "", formatCurrency(payroll.finalHandSalary)],
      ["SUELDO TOTAL", "", formatCurrency(payroll.totalSalary)],
    )

    doc.autoTable({
      startY: 115,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255,
        fontStyle: "bold",
      },
    })

    // Firmas
    const finalY = (doc as any).lastAutoTable.finalY + 20

    doc.text("_______________________", 40, finalY)
    doc.text("_______________________", 150, finalY)

    doc.text("Firma del Empleado", 40, finalY + 10)
    doc.text("Firma del Empleador", 150, finalY + 10)

    // Guardar PDF
    doc.save(`Recibo_${employee.firstName}_${employee.lastName}_${payroll.month}_${payroll.year}.pdf`)
  } catch (error) {
    console.error("Error al generar recibo de sueldo:", error)
    alert("Ocurrió un error al generar el recibo de sueldo. Por favor, intente nuevamente.")
  }
}

// Define the AuditItem type
interface AuditItem {
  name: string
  value: number
  completed: boolean
  category: string
}

// Función para generar reporte de auditoría en PDF
export const generateAuditReport = (audit: Audit) => {
  try {
    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(18)
    doc.text("REPORTE DE AUDITORÍA", 105, 20, { align: "center" })

    // Información general
    doc.setFontSize(12)
    doc.text(`Local: ${audit.local}`, 14, 30)
    doc.text(`Fecha: ${formatDate(audit.date)}`, 14, 35)
    doc.text(`Turno: ${audit.shift === "morning" ? "Mañana" : audit.shift === "afternoon" ? "Tarde" : "Noche"}`, 14, 40)
    doc.text(`Supervisor: ${audit.supervisorName}`, 14, 45)
    doc.text(`Encargado: ${audit.managerName}`, 14, 50)
    doc.text(`Puntaje Total: ${audit.totalScore} / 150`, 14, 55)

    // Agrupar items por categoría
    const itemsByCategory: Record<string, AuditItem[]> = {}
    audit.items.forEach((item) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = []
      }
      itemsByCategory[item.category].push(item)
    })

    let yPos = 65

    // Mostrar items por categoría
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      // Verificar si hay espacio suficiente en la página
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.text(`${category}`, 14, yPos)
      yPos += 5
      doc.line(14, yPos, 196, yPos)
      yPos += 10

      // Calcular puntaje de la categoría
      const categoryScore = items.reduce((sum, item) => sum + (item.completed ? item.value : 0), 0)
      const categoryMaxScore = items.reduce((sum, item) => sum + item.value, 0)

      doc.setFontSize(12)
      doc.text(`Puntaje: ${categoryScore} / ${categoryMaxScore}`, 14, yPos)
      yPos += 10

      // Tabla de items
      const tableColumn = ["Item", "Valor", "Completado"]
      const tableRows = items.map((item) => [item.name, item.value.toString(), item.completed ? "Sí" : "No"])

      doc.autoTable({
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    })

    // Guardar PDF
    doc.save(`Auditoria_${audit.local}_${audit.date}.pdf`)
  } catch (error) {
    console.error("Error al generar reporte de auditoría:", error)
    alert("Ocurrió un error al generar el reporte de auditoría. Por favor, intente nuevamente.")
  }
}

// Función para generar reporte de balance en PDF
export const generateBalanceReport = (balance: Balance) => {
  try {
    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(18)
    doc.text("REPORTE DE BALANCE", 105, 20, { align: "center" })

    // Información general
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    doc.setFontSize(12)
    doc.text(`Local: ${balance.local}`, 14, 30)
    doc.text(`Período: ${monthNames[balance.month - 1]} ${balance.year}`, 14, 35)

    // Ingresos
    doc.setFontSize(14)
    doc.text("INGRESOS", 14, 45)
    doc.line(14, 46, 196, 46)

    doc.setFontSize(12)
    doc.text(`Ventas en Mostrador: ${formatCurrency(balance.counterSales)}`, 14, 55)
    doc.text(`Ventas por Delivery: ${formatCurrency(balance.deliverySales)}`, 14, 60)
    doc.text(`TOTAL INGRESOS: ${formatCurrency(balance.totalIncome)}`, 14, 70)

    // Gastos
    doc.setFontSize(14)
    doc.text("GASTOS", 14, 80)
    doc.line(14, 81, 196, 81)

    doc.setFontSize(12)
    doc.text(`Nómina: ${formatCurrency(balance.payrollExpenses)}`, 14, 90)
    doc.text(`Alquiler: ${formatCurrency(balance.rentExpenses)}`, 14, 95)
    doc.text(`Expensas: ${formatCurrency(balance.maintenanceExpenses)}`, 14, 100)
    doc.text(`Mercadería: ${formatCurrency(balance.suppliesExpenses)}`, 14, 105)
    doc.text(`Reparaciones: ${formatCurrency(balance.repairsExpenses)}`, 14, 110)
    doc.text(`Otros: ${formatCurrency(balance.otherExpenses)}`, 14, 115)
    doc.text(`TOTAL GASTOS: ${formatCurrency(balance.totalExpenses)}`, 14, 125)

    // Resultado
    doc.setFontSize(16)
    doc.text("RESULTADO", 14, 140)
    doc.line(14, 141, 196, 141)

    doc.setFontSize(14)
    doc.text(`RENTABILIDAD NETA: ${formatCurrency(balance.netProfit)}`, 14, 150)

    // Gráfico de distribución de gastos (simulado con texto)
    doc.setFontSize(14)
    doc.text("DISTRIBUCIÓN DE GASTOS", 14, 170)
    doc.line(14, 171, 196, 171)

    // Calcular porcentajes
    const totalExpenses = balance.totalExpenses
    const payrollPercentage = ((balance.payrollExpenses / totalExpenses) * 100).toFixed(2)
    const rentPercentage = ((balance.rentExpenses / totalExpenses) * 100).toFixed(2)
    const maintenancePercentage = ((balance.maintenanceExpenses / totalExpenses) * 100).toFixed(2)
    const suppliesPercentage = ((balance.suppliesExpenses / totalExpenses) * 100).toFixed(2)
    const repairsPercentage = ((balance.repairsExpenses / totalExpenses) * 100).toFixed(2)
    const otherPercentage = ((balance.otherExpenses / totalExpenses) * 100).toFixed(2)

    doc.setFontSize(12)
    doc.text(`Nómina: ${payrollPercentage}%`, 14, 180)
    doc.text(`Alquiler: ${rentPercentage}%`, 14, 185)
    doc.text(`Expensas: ${maintenancePercentage}%`, 14, 190)
    doc.text(`Mercadería: ${suppliesPercentage}%`, 14, 195)
    doc.text(`Reparaciones: ${repairsPercentage}%`, 14, 200)
    doc.text(`Otros: ${otherPercentage}%`, 14, 205)

    // Guardar PDF
    doc.save(`Balance_${balance.local}_${monthNames[balance.month - 1]}_${balance.year}.pdf`)
  } catch (error) {
    console.error("Error al generar reporte de balance:", error)
    alert("Ocurrió un error al generar el reporte de balance. Por favor, intente nuevamente.")
  }
}

