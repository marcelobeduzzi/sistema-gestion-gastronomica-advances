"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { dbService } from "@/lib/db-service"
import { exportToCSV, formatDate, generateAuditReport } from "@/lib/export-utils"
import type { Audit, AuditItem } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, Plus, Calendar, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuditoriasPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditItems, setAuditItems] = useState<AuditItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedLocal, setSelectedLocal] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Estado para el formulario de nueva auditoría
  const [newAudit, setNewAudit] = useState<Omit<Audit, "id">>({
    localId: "",
    local: "BR Cabildo",
    date: new Date().toISOString().split("T")[0],
    shift: "morning",
    supervisorId: "",
    supervisorName: "",
    managerId: "",
    managerName: "",
    totalScore: 0,
    items: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Obtener auditorías
        const auditData = await dbService.getAudits({
          ...(selectedDate ? { date: selectedDate.toISOString().split("T")[0] } : {}),
          ...(selectedLocal ? { local: selectedLocal } : {}),
        })
        setAudits(auditData)

        // Obtener items de auditoría
        const itemsData = await dbService.getAuditItems()
        setAuditItems(itemsData)

        // Inicializar nueva auditoría con los items
        setNewAudit((prev) => ({
          ...prev,
          items: itemsData.map((item) => ({ ...item, completed: false })),
        }))
      } catch (error) {
        console.error("Error al cargar datos de auditorías:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedDate, selectedLocal])

  const handleExportCSV = () => {
    // Preparar datos para exportar
    const data = audits.map((audit) => ({
      Local: audit.local,
      Fecha: formatDate(audit.date),
      Turno: audit.shift === "morning" ? "Mañana" : audit.shift === "afternoon" ? "Tarde" : "Noche",
      Supervisor: audit.supervisorName,
      Encargado: audit.managerName,
      "Puntaje Total": audit.totalScore,
      "Puntaje Máximo": 150,
      Porcentaje: `${Math.round((audit.totalScore / 150) * 100)}%`,
    }))

    exportToCSV(data, `auditorias_${selectedDate ? selectedDate.toISOString().split("T")[0] : "todas"}`)
  }

  const handleItemChange = (id: string, completed: boolean) => {
    setNewAudit((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, completed } : item)),
      // Recalcular puntaje total
      totalScore: prev.items.reduce(
        (sum, item) => sum + (item.id === id ? (completed ? item.value : 0) : item.completed ? item.value : 0),
        0,
      ),
    }))
  }

  const handleSubmit = async () => {
    try {
      // Crear nueva auditoría
      const createdAudit = await dbService.createAudit(newAudit)

      // Actualizar la lista de auditorías
      setAudits((prev) => [...prev, createdAudit])

      // Cerrar el diálogo
      setIsDialogOpen(false)

      // Resetear el formulario
      setNewAudit({
        localId: "",
        local: "BR Cabildo",
        date: new Date().toISOString().split("T")[0],
        shift: "morning",
        supervisorId: "",
        supervisorName: "",
        managerId: "",
        managerName: "",
        totalScore: 0,
        items: auditItems.map((item) => ({ ...item, completed: false })),
      })
    } catch (error) {
      console.error("Error al crear auditoría:", error)
      alert("Error al registrar la auditoría. Por favor, intente nuevamente.")
    }
  }

  const columns: ColumnDef<Audit>[] = [
    {
      accessorKey: "local",
      header: "Local",
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "shift",
      header: "Turno",
      cell: ({ row }) =>
        row.original.shift === "morning" ? "Mañana" : row.original.shift === "afternoon" ? "Tarde" : "Noche",
    },
    {
      accessorKey: "supervisorName",
      header: "Supervisor",
    },
    {
      accessorKey: "managerName",
      header: "Encargado",
    },
    {
      accessorKey: "totalScore",
      header: "Puntaje",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span>{row.original.totalScore}/150</span>
          <Progress value={(row.original.totalScore / 150) * 100} className="w-24" />
        </div>
      ),
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
              // Ver detalles de la auditoría
              const audit = row.original
              generateAuditReport(audit)
            }}
          >
            <FileText className="mr-1 h-4 w-4" />
            Exportar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Ver detalles de la auditoría
              alert(`Ver detalles de la auditoría del ${formatDate(row.original.date)}`)
            }}
          >
            Ver
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Auditorías</h2>
            <p className="text-muted-foreground">Gestiona las auditorías de los locales</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Auditoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Nueva Auditoría</DialogTitle>
                <DialogDescription>Completa el formulario para registrar una nueva auditoría</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Select
                      value={newAudit.local}
                      onValueChange={(value) => setNewAudit((prev) => ({ ...prev, local: value }))}
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
                    <Label htmlFor="date">Fecha</Label>
                    <DatePicker
                      date={new Date(newAudit.date)}
                      setDate={(date) => setNewAudit((prev) => ({ ...prev, date: date.toISOString().split("T")[0] }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shift">Turno</Label>
                    <Select
                      value={newAudit.shift}
                      onValueChange={(value) =>
                        setNewAudit((prev) => ({ ...prev, shift: value as "morning" | "afternoon" | "night" }))
                      }
                    >
                      <SelectTrigger id="shift">
                        <SelectValue placeholder="Seleccionar turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Mañana</SelectItem>
                        <SelectItem value="afternoon">Tarde</SelectItem>
                        <SelectItem value="night">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supervisorName">Supervisor</Label>
                    <Input
                      id="supervisorName"
                      value={newAudit.supervisorName}
                      onChange={(e) => setNewAudit((prev) => ({ ...prev, supervisorName: e.target.value }))}
                      placeholder="Nombre del supervisor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managerName">Encargado</Label>
                    <Input
                      id="managerName"
                      value={newAudit.managerName}
                      onChange={(e) => setNewAudit((prev) => ({ ...prev, managerName: e.target.value }))}
                      placeholder="Nombre del encargado"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Items de Auditoría</Label>
                    <div className="text-sm">
                      Puntaje: <span className="font-medium">{newAudit.totalScore}/150</span>
                      <Progress value={(newAudit.totalScore / 150) * 100} className="w-24 ml-2 inline-block" />
                    </div>
                  </div>

                  <Tabs defaultValue="limpieza">
                    <TabsList className="grid grid-cols-7 w-full">
                      <TabsTrigger value="limpieza">Limpieza</TabsTrigger>
                      <TabsTrigger value="orden">Orden</TabsTrigger>
                      <TabsTrigger value="operatividad">Operatividad</TabsTrigger>
                      <TabsTrigger value="temperaturas">Temperaturas</TabsTrigger>
                      <TabsTrigger value="procedimientos">Procedimientos</TabsTrigger>
                      <TabsTrigger value="legales">Legales</TabsTrigger>
                      <TabsTrigger value="nomina">Nómina</TabsTrigger>
                    </TabsList>

                    {["limpieza", "orden", "operatividad", "temperaturas", "procedimientos", "legales", "nomina"].map(
                      (category) => (
                        <TabsContent key={category} value={category} className="border rounded-md p-4">
                          <div className="space-y-4">
                            {newAudit.items
                              .filter((item) => item.category.toLowerCase() === category)
                              .map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`item-${item.id}`}
                                      checked={item.completed}
                                      onCheckedChange={(checked) => handleItemChange(item.id, checked === true)}
                                    />
                                    <Label htmlFor={`item-${item.id}`} className="text-sm">
                                      {item.name}
                                    </Label>
                                  </div>
                                  <div className="text-sm text-muted-foreground">{item.value} puntos</div>
                                </div>
                              ))}
                          </div>
                        </TabsContent>
                      ),
                    )}
                  </Tabs>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>
                  Guardar Auditoría
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Historial de Auditorías</CardTitle>
            <CardDescription>Consulta y gestiona las auditorías realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <DatePicker date={selectedDate || new Date()} setDate={(date) => setSelectedDate(date)} />
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
                  Todas las fechas
                </Button>
              </div>

              <div className="flex-1 max-w-sm">
                <Select value={selectedLocal} onValueChange={setSelectedLocal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los locales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los locales</SelectItem>
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

            <DataTable columns={columns} data={audits} searchColumn="local" searchPlaceholder="Buscar por local..." />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

