"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { dbService } from "@/lib/db-service"
import { exportToCSV, formatCurrency, generateBalanceReport } from "@/lib/export-utils"
import type { Balance } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, Plus, Calendar, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PieChart } from "@/components/charts"

export default function BalancesPage() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedLocal, setSelectedLocal] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expenseChartData, setExpenseChartData] = useState<any>(null)

  // Estado para el formulario de nuevo balance
  const [newBalance, setNewBalance] = useState<Omit<Balance, "id" | "totalIncome" | "totalExpenses" | "netProfit">>({
    localId: "",
    local: "BR Cabildo",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    counterSales: 0,
    deliverySales: 0,
    payrollExpenses: 0,
    rentExpenses: 0,
    maintenanceExpenses: 0,
    suppliesExpenses: 0,
    repairsExpenses: 0,
    otherExpenses: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Obtener balances
        const balanceData = await dbService.getBalances({
          year: selectedYear,
          ...(selectedMonth ? { month: selectedMonth } : {}),
          ...(selectedLocal ? { local: selectedLocal } : {}),
        })
        setBalances(balanceData)

        // Preparar datos para gráfico de gastos
        if (balanceData.length > 0) {
          // Calcular totales por categoría de gasto
          const totalPayroll = balanceData.reduce((sum, b) => sum + b.payrollExpenses, 0)
          const totalRent = balanceData.reduce((sum, b) => sum + b.rentExpenses, 0)
          const totalMaintenance = balanceData.reduce((sum, b) => sum + b.maintenanceExpenses, 0)
          const totalSupplies = balanceData.reduce((sum, b) => sum + b.suppliesExpenses, 0)
          const totalRepairs = balanceData.reduce((sum, b) => sum + b.repairsExpenses, 0)
          const totalOther = balanceData.reduce((sum, b) => sum + b.otherExpenses, 0)

          setExpenseChartData({
            labels: ["Nómina", "Alquiler", "Expensas", "Mercadería", "Reparaciones", "Otros"],
            datasets: [
              {
                data: [totalPayroll, totalRent, totalMaintenance, totalSupplies, totalRepairs, totalOther],
                backgroundColor: [
                  "rgba(255, 99, 132, 0.5)",
                  "rgba(54, 162, 235, 0.5)",
                  "rgba(255, 206, 86, 0.5)",
                  "rgba(75, 192, 192, 0.5)",
                  "rgba(153, 102, 255, 0.5)",
                  "rgba(255, 159, 64, 0.5)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
              },
            ],
          })
        }
      } catch (error) {
        console.error("Error al cargar datos de balances:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedMonth, selectedLocal])

  const handleExportCSV = () => {
    // Preparar datos para exportar
    const data = balances.map((balance) => ({
      Local: balance.local,
      Mes: balance.month,
      Año: balance.year,
      "Ventas Mostrador": balance.counterSales,
      "Ventas Delivery": balance.deliverySales,
      "Ingresos Totales": balance.totalIncome,
      "Gastos Nómina": balance.payrollExpenses,
      "Gastos Alquiler": balance.rentExpenses,
      "Gastos Expensas": balance.maintenanceExpenses,
      "Gastos Mercadería": balance.suppliesExpenses,
      "Gastos Reparaciones": balance.repairsExpenses,
      "Gastos Otros": balance.otherExpenses,
      "Gastos Totales": balance.totalExpenses,
      "Rentabilidad Neta": balance.netProfit,
    }))

    exportToCSV(data, `balances_${selectedYear}_${selectedMonth || "todos"}`)
  }

  const handleSubmit = async () => {
    try {
      // Crear nuevo balance
      const createdBalance = await dbService.createBalance(newBalance)

      // Actualizar la lista de balances
      setBalances((prev) => [...prev, createdBalance])

      // Cerrar el diálogo y resetear el formulario
      setIsDialogOpen(false)
      setNewBalance({
        localId: "",
        local: "BR Cabildo",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        counterSales: 0,
        deliverySales: 0,
        payrollExpenses: 0,
        rentExpenses: 0,
        maintenanceExpenses: 0,
        suppliesExpenses: 0,
        repairsExpenses: 0,
        otherExpenses: 0,
      })
    } catch (error) {
      console.error("Error al crear balance:", error)
      alert("Error al registrar el balance. Por favor, intente nuevamente.")
    }
  }

  const columns: ColumnDef<Balance>[] = [
    {
      accessorKey: "local",
      header: "Local",
    },
    {
      accessorKey: "month",
      header: "Mes",
      cell: ({ row }) => {
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
        return monthNames[row.original.month - 1]
      },
    },
    {
      accessorKey: "year",
      header: "Año",
    },
    {
      accessorKey: "totalIncome",
      header: "Ingresos Totales",
      cell: ({ row }) => formatCurrency(row.original.totalIncome),
    },
    {
      accessorKey: "totalExpenses",
      header: "Gastos Totales",
      cell: ({ row }) => formatCurrency(row.original.totalExpenses),
    },
    {
      accessorKey: "netProfit",
      header: "Rentabilidad Neta",
      cell: ({ row }) => {
        const netProfit = row.original.netProfit
        return (
          <div className="flex items-center">
            {netProfit >= 0 ? (
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(netProfit)}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Generar reporte de balance
              generateBalanceReport(row.original)
            }}
          >
            <FileText className="mr-1 h-4 w-4" />
            Exportar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Ver detalles del balance
              alert(`Ver detalles del balance de ${row.original.local} - ${row.original.month}/${row.original.year}`)
            }}
          >
            Ver
          </Button>
        </div>
      ),
    },
  ]

  // Calcular totales
  const totalIncome = balances.reduce((sum, balance) => sum + balance.totalIncome, 0)
  const totalExpenses = balances.reduce((sum, balance) => sum + balance.totalExpenses, 0)
  const totalNetProfit = balances.reduce((sum, balance) => sum + balance.netProfit, 0)

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Balances</h2>
            <p className="text-muted-foreground">Gestiona los balances financieros de los locales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Balance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Nuevo Balance</DialogTitle>
                <DialogDescription>Completa el formulario para registrar un nuevo balance</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Select
                      value={newBalance.local}
                      onValueChange={(value) => setNewBalance((prev) => ({ ...prev, local: value }))}
                    >
                      <SelectTrigger id="local">
                        <SelectValue placeholder="Seleccionar local" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BR Cabildo">BR Cabildo</SelectItem>
                        <SelectItem value="BR Carranza">BR Carranza</SelectItem>
                        <SelectItem value="BR Pacifico">BR Pacifico</SelectItem>
                        <SelectItem value="BR Lavalle">BR Lavalle</SelectItem>
                        <SelectItem value="BR Rivadavia">BR Rivadavia</SelectItem>
                        <SelectItem value="BR Aguero">BR Aguero</SelectItem>
                        <SelectItem value="BR Dorrego">BR Dorrego</SelectItem>
                        <SelectItem value="Dean & Dennys">Dean & Dennys</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month">Mes</Label>
                    <Select
                      value={newBalance.month.toString()}
                      onValueChange={(value) => setNewBalance((prev) => ({ ...prev, month: Number.parseInt(value) }))}
                    >
                      <SelectTrigger id="month">
                        <SelectValue placeholder="Seleccionar mes" />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Año</Label>
                    <Select
                      value={newBalance.year.toString()}
                      onValueChange={(value) => setNewBalance((prev) => ({ ...prev, year: Number.parseInt(value) }))}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Seleccionar año" />
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
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Ingresos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="counterSales">Ventas en Mostrador</Label>
                      <Input
                        id="counterSales"
                        type="number"
                        value={newBalance.counterSales}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, counterSales: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliverySales">Ventas por Delivery</Label>
                      <Input
                        id="deliverySales"
                        type="number"
                        value={newBalance.deliverySales}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, deliverySales: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Gastos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payrollExpenses">Nómina</Label>
                      <Input
                        id="payrollExpenses"
                        type="number"
                        value={newBalance.payrollExpenses}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, payrollExpenses: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rentExpenses">Alquiler</Label>
                      <Input
                        id="rentExpenses"
                        type="number"
                        value={newBalance.rentExpenses}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, rentExpenses: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maintenanceExpenses">Expensas</Label>
                      <Input
                        id="maintenanceExpenses"
                        type="number"
                        value={newBalance.maintenanceExpenses}
                        onChange={(e) =>
                          setNewBalance((prev) => ({
                            ...prev,
                            maintenanceExpenses: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="suppliesExpenses">Mercadería</Label>
                      <Input
                        id="suppliesExpenses"
                        type="number"
                        value={newBalance.suppliesExpenses}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, suppliesExpenses: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repairsExpenses">Reparaciones</Label>
                      <Input
                        id="repairsExpenses"
                        type="number"
                        value={newBalance.repairsExpenses}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, repairsExpenses: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherExpenses">Otros</Label>
                      <Input
                        id="otherExpenses"
                        type="number"
                        value={newBalance.otherExpenses}
                        onChange={(e) =>
                          setNewBalance((prev) => ({ ...prev, otherExpenses: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Resumen</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalIncome">Ingresos Totales</Label>
                      <Input
                        id="totalIncome"
                        type="number"
                        value={newBalance.counterSales + newBalance.deliverySales}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalExpenses">Gastos Totales</Label>
                      <Input
                        id="totalExpenses"
                        type="number"
                        value={
                          newBalance.payrollExpenses +
                          newBalance.rentExpenses +
                          newBalance.maintenanceExpenses +
                          newBalance.suppliesExpenses +
                          newBalance.repairsExpenses +
                          newBalance.otherExpenses
                        }
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="netProfit">Rentabilidad Neta</Label>
                      <Input
                        id="netProfit"
                        type="number"
                        value={
                          newBalance.counterSales +
                          newBalance.deliverySales -
                          (newBalance.payrollExpenses +
                            newBalance.rentExpenses +
                            newBalance.maintenanceExpenses +
                            newBalance.suppliesExpenses +
                            newBalance.repairsExpenses +
                            newBalance.otherExpenses)
                        }
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>
                  Guardar Balance
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              <div className="text-xs text-muted-foreground">{balances.length} balances en el período</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <div className="text-xs text-muted-foreground">
                {((totalExpenses / totalIncome) * 100).toFixed(2)}% de los ingresos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rentabilidad Neta</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalNetProfit)}
              </div>
              <div className="text-xs text-muted-foreground">
                {((totalNetProfit / totalIncome) * 100).toFixed(2)}% de margen
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de distribución de gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
            <CardDescription>Desglose de gastos por categoría</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {expenseChartData ? (
              <PieChart data={expenseChartData} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Historial de Balances</CardTitle>
            <CardDescription>Consulta y gestiona los balances financieros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
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
                <Select
                  value={selectedMonth ? selectedMonth.toString() : "all"}
                  onValueChange={(value) => setSelectedMonth(value === "all" ? 0 : Number.parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los meses</SelectItem>
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
              </div>

              <div className="flex-1 max-w-sm">
                <Select value={selectedLocal} onValueChange={setSelectedLocal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los locales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los locales</SelectItem>
                    <SelectItem value="BR Cabildo">BR Cabildo</SelectItem>
                    <SelectItem value="BR Carranza">BR Carranza</SelectItem>
                    <SelectItem value="BR Pacifico">BR Pacifico</SelectItem>
                    <SelectItem value="BR Lavalle">BR Lavalle</SelectItem>
                    <SelectItem value="BR Rivadavia">BR Rivadavia</SelectItem>
                    <SelectItem value="BR Aguero">BR Aguero</SelectItem>
                    <SelectItem value="BR Dorrego">BR Dorrego</SelectItem>
                    <SelectItem value="Dean & Dennys">Dean & Dennys</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            <DataTable columns={columns} data={balances} searchColumn="local" searchPlaceholder="Buscar por local..." />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

