"use client"

import { Calendar } from "@/components/ui/calendar"
import Link from "next/link"
import { DateRange } from "react-day-picker"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { dbService } from "@/lib/db-service"
import { Users, ShoppingCart, DollarSign, Star, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/export-utils"
import { BarChart, LineChart, PieChart } from "@/components/charts"

export default function Dashboard() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const [stats, setStats] = useState({
    activeEmployees: 0,
    activeEmployeesChange: 0,
    totalDeliveryOrders: 0,
    deliveryOrdersChange: 0,
    totalRevenue: 0,
    revenueChange: 0,
    averageRating: 0,
    ratingChange: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [salesData, setSalesData] = useState<any>(null)
  const [deliveryData, setDeliveryData] = useState<any>(null)
  const [attendanceData, setAttendanceData] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const dashboardStats = await dbService.getDashboardStats()
        setStats(dashboardStats)

        // Obtener datos para gráficos
        const reports = await dbService.generateReports()

        // Encontrar el reporte de ventas mensuales
        const salesReport = reports.find((r: { name: string }) => r.name === "Facturación por Local")
        if (salesReport) {
          setSalesData(salesReport.data)
        }

        // Encontrar el reporte de evolución de delivery
        const deliveryReport = reports.find((r: { name: string }) => r.name === "Evolución de Pedidos por Plataforma")
        if (deliveryReport) {
          setDeliveryData(deliveryReport.data)
        }

        // Generar datos de asistencia (simulados)
        const attendanceLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
        const attendanceValues = [95, 92, 88, 90, 85, 70, 60]

        setAttendanceData({
          labels: attendanceLabels,
          datasets: [
            {
              label: "Asistencia (%)",
              data: attendanceValues,
              backgroundColor: "rgba(59, 130, 246, 0.5)",
              borderColor: "rgb(59, 130, 246)",
              borderWidth: 1,
            },
          ],
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleExport = () => {
    alert("Exportando datos del dashboard...")
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Bienvenido, {user?.name || "Usuario"}.
              {user?.role === "admin"
                ? " Tienes acceso completo al sistema."
                : user?.role
                  ? ` Estás conectado como ${user.role}.`
                  : " Bienvenido al sistema de gestión."}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <Button onClick={handleExport}>Exportar</Button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEmployees}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.activeEmployeesChange > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{stats.activeEmployeesChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stats.activeEmployeesChange}%</span>
                  </>
                )}{" "}
                respecto al mes anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Delivery</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeliveryOrders}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.deliveryOrdersChange > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{stats.deliveryOrdersChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stats.deliveryOrdersChange}%</span>
                  </>
                )}{" "}
                respecto a la semana anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Delivery</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.revenueChange > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{stats.revenueChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stats.revenueChange}%</span>
                  </>
                )}{" "}
                respecto a la semana anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valoración Promedio</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.ratingChange > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{stats.ratingChange.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stats.ratingChange.toFixed(1)}</span>
                  </>
                )}{" "}
                respecto a la semana anterior
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumen de Ventas</CardTitle>
              <CardDescription>Ventas mensuales del último año</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {salesData ? (
                <BarChart data={salesData} />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">Cargando datos...</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ventas</CardTitle>
              <CardDescription>Por plataforma de delivery</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {deliveryData ? (
                <PieChart
                  data={{
                    labels: ["PedidosYa", "Rappi", "MercadoPago"],
                    datasets: [
                      {
                        data: [35, 40, 25],
                        backgroundColor: [
                          "rgba(255, 99, 132, 0.5)",
                          "rgba(54, 162, 235, 0.5)",
                          "rgba(255, 206, 86, 0.5)",
                        ],
                        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">Cargando datos...</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Asistencia de Empleados</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {attendanceData ? (
                <LineChart data={attendanceData} />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">Cargando datos...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Accesos rápidos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/empleados/nuevo" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Nuevo Empleado
                  </Button>
                </Link>
                <Link href="/asistencias" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Registrar Asistencia
                  </Button>
                </Link>
                <Link href="/nomina" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ver Nómina
                  </Button>
                </Link>
                <Link href="/delivery/pedidosya" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Estadísticas Delivery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

