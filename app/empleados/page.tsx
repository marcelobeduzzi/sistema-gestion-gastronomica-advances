"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { dbService } from "@/lib/db-service"
import { Employee } from "@/types"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await dbService.getEmployees()
      setEmployees(data || [])
    } catch (error) {
      console.error("Error loading employees:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">Cargando empleados...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
            <p className="text-muted-foreground">Gestiona los empleados del sistema</p>
          </div>
          <Link href="/empleados/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
          </Link>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                  <TableCell>{`${employee.documentType}: ${employee.documentId}`}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.local}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        employee.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/empleados/${employee.id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}

