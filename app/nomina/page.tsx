"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { dbService } from "@/lib/db-service"
import { exportToCSV, formatCurrency, formatDate, generatePayslip } from "@/lib/export-utils"
import type { Payroll, Employee } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, FileText, Printer, Search, Check, X, Calendar, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NominaPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Obtener nóminas del mes y año seleccionados
        const payrollData = await dbService.getPayrolls({
          month: selectedMonth,
          year: selectedYear,
        })
        setPayrolls(payrollData)

        // Obtener todos los empleados para referencias
        const employeeData = await dbService.getEmployees()
        setEmployees(employeeData)
      } catch (error) {
        console.error("Error al cargar datos de nómina:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear])

  const handleGeneratePayroll = async () => {
    setIsGenerating(true)
    try {
      // Generar nómina para el mes y año seleccionados
      const newPayrolls = await dbService.generateMonthlyPayroll(selectedMonth, selectedYear)

      // Actualizar la lista de nóminas
      setPayrolls((prev) => {
        // Filtrar las nóminas existentes para el mes y año seleccionados
        const filtered = prev.filter((p) => !(p.month === selectedMonth && p.year === selectedYear))
        // Agregar las nuevas nóminas
        return [...filtered, ...newPayrolls]
      })

      alert(`Se ha generado la nómina para ${selectedMonth}/${selectedYear} correctamente.`)
    } catch (error) {
      console.error("Error al generar nómina:", error)
      alert("Error al generar la nómina. Por favor, intente nuevamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdatePayrollStatus = async (id: string, field: "isPaidHand" | "isPaidBank", value: boolean) => {
    try {
      // Actualizar el estado de pago de la nómina
      const updatedPayroll = await dbService.updatePayroll(id, {
        [field]: value,
        ...(value && field === "isPaidHand" ? { handPaymentDate: new Date().toISOString().split("T")[0] } : {}),
        ...(value && field === "isPaidBank" ? { bankPaymentDate: new Date().toISOString().split("T")[0] } : {}),
      })

      if (updatedPayroll) {
        // Actualizar la lista de nóminas
        setPayrolls((prev) => prev.map((p) => (p.id === id ? updatedPayroll : p)))
      }
    } catch (error) {
      console.error("Error al actualizar estado de pago:", error)
      alert("Error al actualizar el estado de pago. Por favor, intente nuevamente.")
    }
  }

  const handleExportCSV = () => {
    // Preparar datos para exportar
    const data = payrolls.map((payroll) => {
      const employee = employees.find((e) => e.id === payroll.employeeId)
      return {
        Empleado: employee ? `${employee.firstName} ${employee.lastName}` : "Desconocido",
        Documento: employee?.documentId || "",
        Cargo: employee?.position || "",
        Local: employee?.local || "",
        "Sueldo Base": payroll.baseSalary,
        "Sueldo Banco": payroll.bankSalary,
        Deducciones: payroll.deductions,
        Adiciones: payroll.additions,
        "Sueldo Final Mano": payroll.finalHandSalary,
        "Sueldo Total": payroll.totalSalary,
        "Pagado Mano": payroll.isPaidHand ? "Sí" : "No",
        "Pagado Banco": payroll.isPaidBank ? "Sí" : "No",
        "Fecha Pago Mano": formatDate(payroll.handPaymentDate),
        "Fecha Pago Banco": formatDate(payroll.bankPaymentDate),
      }
    })

    exportToCSV(data, `nomina_${selectedMonth}_${selectedYear}`)
  }

  const handlePrintPayslip = () => {
    if (selectedPayroll && selectedEmployee) {
      generatePayslip(selectedPayroll, selectedEmployee)
    }
  }

  const columns: ColumnDef<Payroll>[] = [
    {
      accessorKey: "employeeId",
      header: "Empleado",
      cell: ({ row }) => {
        const employee = employees.find((e) => e.id === row.original.employeeId)
        return employee ? `${employee.firstName} ${employee.lastName}` : "Desconocido"
      },
    },
    {
      accessorKey: "baseSalary",
      header: "Sueldo Base",
      cell: ({ row }) => formatCurrency(row.original.baseSalary),
    },
    {
      accessorKey: "bankSalary",
      header: "Sueldo Banco",
      cell: ({ row }) => formatCurrency(row.original.bankSalary),
    },
    {
      accessorKey: "deductions",
      header: "Deducciones",
      cell: ({ row }) => formatCurrency(row.original.deductions),
    },
    {
      accessorKey: "additions",
      header: "Adiciones",
      cell: ({ row }) => formatCurrency(row.original.additions),
    },
    {
      accessorKey: "finalHandSalary",
      header: "Sueldo Final Mano",
      cell: ({ row }) => formatCurrency(row.original.finalHandSalary),
    },
    {
      accessorKey: "totalSalary",
      header: "Sueldo Total",
      cell: ({ row }) => formatCurrency(row.original.totalSalary),
    },
    {
      accessorKey: "isPaidHand",
      header: "Pagado Mano",
      cell: ({ row }) => (
        <Button
          variant={row.original.isPaidHand ? "outline" : "default"}
          size="sm"
          onClick={() => handleUpdatePayrollStatus(row.original.id, "isPaidHand", !row.original.isPaidHand)}
        >
          {row.original.isPaidHand ? <Check className="mr-1 h-4 w-4 text-green-500" /> : <X className="mr-1 h-4 w-4" />}
          {row.original.isPaidHand ? "Pagado" : "Marcar Pagado"}
        </Button>
      ),
    },
    {
      accessorKey: "isPaidBank",
      header: "Pagado Banco",
      cell: ({ row }) => (
        <Button
          variant={row.original.isPaidBank ? "outline" : "default"}
          size="sm"
          onClick={() => handleUpdatePayrollStatus(row.original.id, "isPaidBank", !row.original.isPaidBank)}
        >
          {row.original.isPaidBank ? <Check className="mr-1 h-4 w-4 text-green-500" /> : <X className="mr-1 h-4 w-4" />}
          {row.original.isPaidBank ? "Pagado" : "Marcar Pagado"}
        </Button>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const employee = employees.find((e) => e.id === row.original.employeeId)
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPayroll(row.original)
                  setSelectedEmployee(employee || null)
                }}
              >
                <FileText className="mr-1 h-4 w-4" />
                Detalles
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalles de Nómina</DialogTitle>
                <DialogDescription>
                  {employee
                    ? `${employee.firstName} ${employee.lastName} - ${selectedMonth}/${selectedYear}`
                    : "Empleado desconocido"}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Información del Empleado</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Nombre:</span> {employee?.firstName} {employee?.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Documento:</span> {employee?.documentId}
                        </p>
                        <p>
                          <span className="font-medium">Cargo:</span> {employee?.position}
                        </p>
                        <p>
                          <span className="font-medium">Local:</span> {employee?.local}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Información de Pago</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Sueldo Base:</span> {formatCurrency(row.original.baseSalary)}
                        </p>
                        <p>
                          <span className="font-medium">Sueldo Banco:</span> {formatCurrency(row.original.bankSalary)}
                        </p>
                        <p>
                          <span className="font-medium">Deducciones:</span> {formatCurrency(row.original.deductions)}
                        </p>
                        <p>
                          <span className="font-medium">Adiciones:</span> {formatCurrency(row.original.additions)}
                        </p>
                        <p>
                          <span className="font-medium">Sueldo Final Mano:</span>{" "}
                          {formatCurrency(row.original.finalHandSalary)}
                        </p>
                        <p>
                          <span className="font-medium">Sueldo Total:</span> {formatCurrency(row.original.totalSalary)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handlePrintPayslip}>
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir Recibo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="details">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Deducciones</h3>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Concepto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Monto
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {row.original.details
                            .filter((d) => d.type === "deduction")
                            .map((detail) => (
                              <tr key={detail.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{detail.concept}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(detail.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(detail.amount)}</td>
                              </tr>
                            ))}
                          {row.original.details.filter((d) => d.type === "deduction").length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                No hay deducciones
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-sm font-medium">Adiciones</h3>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Concepto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Monto
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {row.original.details
                            .filter((d) => d.type === "addition")
                            .map((detail) => (
                              <tr key={detail.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{detail.concept}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(detail.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(detail.amount)}</td>
                              </tr>
                            ))}
                          {row.original.details.filter((d) => d.type === "addition").length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                No hay adiciones
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nómina</h2>
            <p className="text-muted-foreground">Gestiona los pagos de nómina de todos los empleados</p>
          </div>
          <Button onClick={handleGeneratePayroll} disabled={isGenerating}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isGenerating ? "Generando..." : "Generar Nómina"}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Nómina del Período</CardTitle>
            <CardDescription>Selecciona el mes y año para ver la nómina correspondiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Enero</SelectItem>
                    <SelectItem value="2">Febrero</SelectItem>
                    <SelectItem value="3">Marzo</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Mayo</SelectItem>
                    <SelectItem value="6">Junio</SelectItem>
                    <SelectItem value="7">Julio</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                      {new Date().getFullYear() - 1}
                    </SelectItem>
                    <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                    <SelectItem value={(new Date().getFullYear() + 1).toString()}>
                      {new Date().getFullYear() + 1}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar empleado..." className="pl-8" />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={payrolls}
              searchColumn="employeeId"
              searchPlaceholder="Buscar empleado..."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

