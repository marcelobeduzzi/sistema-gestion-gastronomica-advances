"use client"

import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FileText, Download, Printer } from "lucide-react"

// Datos de ejemplo para facturas
const facturas = [
  {
    id: "F-2023-001",
    fecha: "15/03/2023",
    cliente: "Juan Pérez",
    total: 1250.5,
    estado: "Pagada",
    local: "Centro",
  },
  {
    id: "F-2023-002",
    fecha: "18/03/2023",
    cliente: "María López",
    total: 875.25,
    estado: "Pendiente",
    local: "Norte",
  },
  {
    id: "F-2023-003",
    fecha: "20/03/2023",
    cliente: "Carlos Rodríguez",
    total: 1500.0,
    estado: "Pagada",
    local: "Sur",
  },
  {
    id: "F-2023-004",
    fecha: "22/03/2023",
    cliente: "Ana Martínez",
    total: 950.75,
    estado: "Anulada",
    local: "Centro",
  },
  {
    id: "F-2023-005",
    fecha: "25/03/2023",
    cliente: "Roberto Sánchez",
    total: 2100.3,
    estado: "Pagada",
    local: "Norte",
  },
]

export default function FacturacionPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Facturación</h2>
            <p className="text-muted-foreground">Gestiona las facturas y comprobantes de venta</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$6,676.80</div>
              <p className="text-xs text-muted-foreground">+12.5% respecto al mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">125</div>
              <p className="text-xs text-muted-foreground">+8.1% respecto al mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">-3.2% respecto al mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$53.42</div>
              <p className="text-xs text-muted-foreground">+5.7% respecto al mes anterior</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Facturas Recientes</CardTitle>
            <CardDescription>Últimas facturas emitidas en todos los locales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar factura..." className="pl-8" />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Factura</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell className="font-medium">{factura.id}</TableCell>
                      <TableCell>{factura.fecha}</TableCell>
                      <TableCell>{factura.cliente}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>${factura.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            factura.estado === "Pagada"
                              ? "bg-green-100 text-green-800"
                              : factura.estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {factura.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

