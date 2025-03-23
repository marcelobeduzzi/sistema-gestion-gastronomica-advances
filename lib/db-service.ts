import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type {
  Employee,
  Attendance,
  Payroll,
  PayrollDetail,
  DeliveryStats,
  Audit,
  AuditItem,
  Billing,
  Balance,
  Report,
  Local,
  DeliveryPlatform,
  WorkShift,
  User,
  UserRole,
} from "@/types"

// Datos simulados para locales
const locales: Local[] = [
  "BR Cabildo",
  "BR Carranza",
  "BR Pacifico",
  "BR Lavalle",
  "BR Rivadavia",
  "BR Aguero",
  "BR Dorrego",
  "Dean & Dennys",
  "Administración",
]

// Datos simulados para empleados
const employees: Employee[] = [
  {
    id: "1",
    firstName: "Juan",
    lastName: "Pérez",
    documentId: "28456789",
    documentType: "DNI",
    phone: "11-5555-1234",
    email: "juan.perez@quadrifoglio.com",
    address: "Av. Corrientes 1234, CABA",
    birthDate: "1990-05-15",
    hireDate: "2022-03-10",
    position: "Mesero",
    local: "BR Cabildo",
    workShift: "morning",
    baseSalary: 150000,
    bankSalary: 50000,
    totalSalary: 200000,
    status: "active",
    role: "waiter",
    createdAt: "2022-03-10T00:00:00Z",
    updatedAt: "2022-03-10T00:00:00Z"
  },
  {
    id: "2",
    firstName: "María",
    lastName: "López",
    documentId: "30123456",
    documentType: "DNI",
    phone: "11-5555-5678",
    email: "maria.lopez@quadrifoglio.com",
    address: "Av. Santa Fe 4321, CABA",
    birthDate: "1988-10-20",
    hireDate: "2021-11-15",
    position: "Cocinera",
    local: "BR Cabildo",
    workShift: "afternoon",
    baseSalary: 180000,
    bankSalary: 60000,
    totalSalary: 240000,
    status: "active",
    role: "kitchen",
    createdAt: "2021-11-15T00:00:00Z",
    updatedAt: "2021-11-15T00:00:00Z"
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Rodríguez",
    documentId: "25789456",
    documentType: "DNI",
    phone: "11-5555-9012",
    email: "carlos.rodriguez@quadrifoglio.com",
    address: "Av. Cabildo 2345, CABA",
    birthDate: "1992-03-25",
    hireDate: "2022-01-20",
    position: "Cajero",
    local: "BR Carranza",
    workShift: "full_time",
    baseSalary: 160000,
    bankSalary: 55000,
    totalSalary: 215000,
    status: "active",
    role: "cashier",
    createdAt: "2022-01-20T00:00:00Z",
    updatedAt: "2022-01-20T00:00:00Z"
  },
  {
    id: "4",
    firstName: "Ana",
    lastName: "Martínez",
    documentId: "27654321",
    documentType: "DNI",
    phone: "11-5555-3456",
    email: "ana.martinez@quadrifoglio.com",
    address: "Av. Rivadavia 5678, CABA",
    birthDate: "1985-12-10",
    hireDate: "2020-08-05",
    position: "Gerente",
    local: "BR Pacifico",
    workShift: "full_time",
    baseSalary: 250000,
    bankSalary: 100000,
    totalSalary: 350000,
    status: "active",
    role: "manager",
    createdAt: "2020-08-05T00:00:00Z",
    updatedAt: "2020-08-05T00:00:00Z"
  },
  {
    id: "5",
    firstName: "Roberto",
    lastName: "Sánchez",
    documentId: "29876543",
    documentType: "DNI",
    phone: "11-5555-7890",
    email: "roberto.sanchez@quadrifoglio.com",
    address: "Av. Belgrano 9012, CABA",
    birthDate: "1991-07-30",
    hireDate: "2021-05-12",
    terminationDate: "2023-02-28",
    position: "Mesero",
    local: "BR Carranza",
    workShift: "night",
    baseSalary: 150000,
    bankSalary: 50000,
    totalSalary: 200000,
    status: "inactive",
    role: "waiter",
    workedDays: 292, // Calculado: fecha_egreso - fecha_ingreso
    createdAt: "2021-05-12T00:00:00Z",
    updatedAt: "2023-02-28T00:00:00Z"
  },
  {
    id: "6",
    firstName: "Laura",
    lastName: "Gómez",
    documentId: "31234567",
    documentType: "DNI",
    phone: "11-5555-2345",
    email: "laura.gomez@quadrifoglio.com",
    address: "Av. Callao 3456, CABA",
    birthDate: "1993-09-18",
    hireDate: "2022-06-01",
    position: "Administrativa",
    local: "Administración",
    workShift: "full_time",
    baseSalary: 200000,
    bankSalary: 70000,
    totalSalary: 270000,
    status: "active",
    role: "admin",
    createdAt: "2022-06-01T00:00:00Z",
    updatedAt: "2022-06-01T00:00:00Z"
  },
  {
    id: "7",
    firstName: "Diego",
    lastName: "Fernández",
    documentId: "26543210",
    documentType: "DNI",
    phone: "11-5555-6789",
    email: "diego.fernandez@quadrifoglio.com",
    address: "Av. Córdoba 7890, CABA",
    birthDate: "1987-04-05",
    hireDate: "2021-02-15",
    position: "Cocinero",
    local: "BR Pacifico",
    workShift: "morning",
    baseSalary: 180000,
    bankSalary: 60000,
    totalSalary: 240000,
    status: "active",
    role: "kitchen",
    createdAt: "2021-02-15T00:00:00Z",
    updatedAt: "2021-02-15T00:00:00Z"
  },
  {
    id: "8",
    firstName: "Sofía",
    lastName: "Torres",
    documentId: "32345678",
    documentType: "DNI",
    phone: "11-5555-0123",
    email: "sofia.torres@quadrifoglio.com",
    address: "Av. Entre Ríos 1234, CABA",
    birthDate: "1994-11-22",
    hireDate: "2022-09-10",
    position: "Mesera",
    local: "BR Cabildo",
    workShift: "afternoon",
    baseSalary: 150000,
    bankSalary: 50000,
    totalSalary: 200000,
    status: "active",
    role: "waiter",
    createdAt: "2022-09-10T00:00:00Z",
    updatedAt: "2022-09-10T00:00:00Z"
  },
  {
    id: "9",
    firstName: "Javier",
    lastName: "Díaz",
    documentId: "28901234",
    documentType: "DNI",
    phone: "11-5555-4567",
    email: "javier.diaz@quadrifoglio.com",
    address: "Av. Pueyrredón 5678, CABA",
    birthDate: "1989-08-12",
    hireDate: "2021-07-20",
    position: "Cajero",
    local: "BR Cabildo",
    workShift: "night",
    baseSalary: 160000,
    bankSalary: 55000,
    totalSalary: 215000,
    status: "active",
    role: "cashier",
    createdAt: "2021-07-20T00:00:00Z",
    updatedAt: "2021-07-20T00:00:00Z"
  },
  {
    id: "10",
    firstName: "Valentina",
    lastName: "Ruiz",
    documentId: "33456789",
    documentType: "DNI",
    phone: "11-5555-8901",
    email: "valentina.ruiz@quadrifoglio.com",
    address: "Av. Scalabrini Ortiz 9012, CABA",
    birthDate: "1995-02-14",
    hireDate: "2023-01-05",
    position: "Mesera",
    local: "BR Carranza",
    workShift: "part_time",
    baseSalary: 120000,
    bankSalary: 40000,
    totalSalary: 160000,
    status: "active",
    role: "waiter",
    createdAt: "2023-01-05T00:00:00Z",
    updatedAt: "2023-01-05T00:00:00Z"
  },
  {
    id: "11",
    firstName: "Martín",
    lastName: "González",
    documentId: "27123456",
    documentType: "DNI",
    phone: "11-5555-2468",
    email: "martin.gonzalez@quadrifoglio.com",
    address: "Av. Libertador 1357, CABA",
    birthDate: "1988-06-25",
    hireDate: "2021-03-15",
    position: "Supervisor",
    local: "Administración",
    workShift: "full_time",
    baseSalary: 220000,
    bankSalary: 80000,
    totalSalary: 300000,
    status: "active",
    role: "supervisor",
    createdAt: "2021-03-15T00:00:00Z",
    updatedAt: "2021-03-15T00:00:00Z"
  },
  {
    id: "12",
    firstName: "Lucía",
    lastName: "Fernández",
    documentId: "29654321",
    documentType: "DNI",
    phone: "11-5555-1357",
    email: "lucia.fernandez@quadrifoglio.com",
    address: "Av. Córdoba 2468, CABA",
    birthDate: "1990-11-10",
    hireDate: "2022-02-01",
    position: "Encargada",
    local: "BR Lavalle",
    workShift: "full_time",
    baseSalary: 200000,
    bankSalary: 70000,
    totalSalary: 270000,
    status: "active",
    role: "manager",
    createdAt: "2022-02-01T00:00:00Z",
    updatedAt: "2022-02-01T00:00:00Z"
  },
]

// Datos simulados para asistencias
const generateAttendances = (): Attendance[] => {
  const attendances: Attendance[] = []
  const today = new Date()

  // Generar asistencias para los últimos 30 días para cada empleado activo
  employees
    .filter((emp) => emp.status === "active")
    .forEach((employee) => {
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(today.getDate() - i)

        // No generar asistencias para fines de semana
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        // Determinar horarios esperados según turno
        let expectedCheckIn = ""
        let expectedCheckOut = ""

        switch (employee.workShift) {
          case "morning":
            expectedCheckIn = "08:00"
            expectedCheckOut = "16:00"
            break
          case "afternoon":
            expectedCheckIn = "16:00"
            expectedCheckOut = "00:00"
            break
          case "night":
            expectedCheckIn = "00:00"
            expectedCheckOut = "08:00"
            break
          case "full_time":
            expectedCheckIn = "09:00"
            expectedCheckOut = "18:00"
            break
          case "part_time":
            expectedCheckIn = "18:00"
            expectedCheckOut = "22:00"
            break
        }

        // Generar variaciones aleatorias para check-in y check-out
        const lateMinutes = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0
        const earlyDepartureMinutes = Math.random() > 0.8 ? Math.floor(Math.random() * 20) : 0

        // Calcular check-in y check-out reales
        const [checkInHour, checkInMinute] = expectedCheckIn.split(":").map(Number)
        const checkInDate = new Date(date)
        checkInDate.setHours(checkInHour, checkInMinute + lateMinutes)

        const [checkOutHour, checkOutMinute] = expectedCheckOut.split(":").map(Number)
        const checkOutDate = new Date(date)
        checkOutDate.setHours(checkOutHour, checkOutMinute - earlyDepartureMinutes)

        // Formatear check-in y check-out
        const formatTime = (d: Date) => {
          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        }

        const checkIn = formatTime(checkInDate)
        const checkOut = formatTime(checkOutDate)

        // Determinar si es feriado (simulado)
        const isHoliday = Math.random() > 0.95

        // Determinar si está ausente (simulado)
        const isAbsent = Math.random() > 0.95

        // Determinar si la ausencia está justificada (simulado)
        const isJustified = isAbsent && Math.random() > 0.3

        attendances.push({
          id: `${employee.id}-${date.toISOString().split("T")[0]}`,
          employeeId: employee.id,
          date: date.toISOString().split("T")[0],
          checkIn: isAbsent ? "" : checkIn,
          checkOut: isAbsent ? "" : checkOut,
          expectedCheckIn,
          expectedCheckOut,
          lateMinutes: isAbsent ? 0 : lateMinutes,
          earlyDepartureMinutes: isAbsent ? 0 : earlyDepartureMinutes,
          isHoliday,
          isAbsent,
          isJustified,
          justificationDocument: isJustified ? "certificado_medico.pdf" : undefined,
          notes: isAbsent ? "Ausente" : isHoliday ? "Feriado trabajado" : undefined,
        })
      }
    })

  return attendances
}

const attendances = generateAttendances()

// Datos simulados para nóminas
const generatePayrolls = (): { payrolls: Payroll[]; payrollDetails: PayrollDetail[] } => {
  const payrolls: Payroll[] = []
  const payrollDetails: PayrollDetail[] = []
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Generar nóminas para los últimos 3 meses para cada empleado
  employees.forEach((employee) => {
    for (let i = 0; i < 3; i++) {
      const month = currentMonth - i <= 0 ? 12 + (currentMonth - i) : currentMonth - i
      const year = currentMonth - i <= 0 ? currentYear - 1 : currentYear

      // Calcular deducciones y adiciones basadas en asistencias
      const monthAttendances = attendances.filter((att) => {
        const attDate = new Date(att.date)
        return attDate.getMonth() + 1 === month && attDate.getFullYear() === year && att.employeeId === employee.id
      })

      // Calcular valor del minuto
      const dailySalary = employee.totalSalary / 30
      const minuteValue = dailySalary / 480 // 8 horas = 480 minutos

      let totalDeductions = 0
      let totalAdditions = 0

      const payrollId = `${employee.id}-${year}-${month}`

      // Procesar cada asistencia para calcular deducciones y adiciones
      monthAttendances.forEach((att) => {
        // Deducciones por llegadas tarde
        if (att.lateMinutes > 10) {
          // 10 minutos de tolerancia
          const deductionMinutes = att.lateMinutes - 10
          const deductionAmount = deductionMinutes * minuteValue
          totalDeductions += deductionAmount

          payrollDetails.push({
            id: `${payrollId}-late-${att.date}`,
            payrollId,
            type: "deduction",
            concept: `Llegada tarde (${deductionMinutes} min)`,
            amount: deductionAmount,
            date: att.date,
          })
        }

        // Deducciones por salidas anticipadas
        if (att.earlyDepartureMinutes > 0) {
          const deductionAmount = att.earlyDepartureMinutes * minuteValue
          totalDeductions += deductionAmount

          payrollDetails.push({
            id: `${payrollId}-early-${att.date}`,
            payrollId,
            type: "deduction",
            concept: `Salida anticipada (${att.earlyDepartureMinutes} min)`,
            amount: deductionAmount,
            date: att.date,
          })
        }

        // Deducciones por ausencias injustificadas
        if (att.isAbsent && !att.isJustified) {
          const deductionAmount = dailySalary
          totalDeductions += deductionAmount

          payrollDetails.push({
            id: `${payrollId}-absent-${att.date}`,
            payrollId,
            type: "deduction",
            concept: "Ausencia injustificada",
            amount: deductionAmount,
            date: att.date,
          })
        }

        // Adiciones por feriados trabajados
        if (att.isHoliday && !att.isAbsent) {
          const additionAmount = dailySalary
          totalAdditions += additionAmount

          payrollDetails.push({
            id: `${payrollId}-holiday-${att.date}`,
            payrollId,
            type: "addition",
            concept: "Feriado trabajado",
            amount: additionAmount,
            date: att.date,
          })
        }
      })

      // Calcular salario final
      const finalHandSalary = employee.baseSalary - totalDeductions + totalAdditions

      // Determinar si ya está pagado (los meses anteriores sí, el actual no)
      const isPaidHand = i > 0
      const isPaidBank = i > 0

      payrolls.push({
        id: payrollId,
        employeeId: employee.id,
        month,
        year,
        baseSalary: employee.baseSalary,
        bankSalary: employee.bankSalary,
        deductions: totalDeductions,
        additions: totalAdditions,
        finalHandSalary,
        totalSalary: finalHandSalary + employee.bankSalary,
        isPaidHand,
        isPaidBank,
        handPaymentDate: isPaidHand ? `${year}-${month}-10` : undefined,
        bankPaymentDate: isPaidBank ? `${year}-${month}-05` : undefined,
        details: [],
      })
    }
  })

  // Asignar detalles a cada nómina
  payrolls.forEach((payroll) => {
    payroll.details = payrollDetails.filter((detail) => detail.payrollId === payroll.id)
  })

  return { payrolls, payrollDetails }
}

const { payrolls, payrollDetails } = generatePayrolls()

// Datos simulados para estadísticas de delivery
const generateDeliveryStats = (): DeliveryStats[] => {
  const stats: DeliveryStats[] = []
  const platforms: DeliveryPlatform[] = ["PedidosYa", "Rappi", "MercadoPago"]
  const currentDate = new Date()
  const currentWeek = Math.ceil(currentDate.getDate() / 7)
  const currentYear = currentDate.getFullYear()

  // Generar estadísticas para las últimas 8 semanas para cada plataforma y local
  locales
    .filter((local) => local !== "Administración")
    .forEach((local) => {
      platforms.forEach((platform) => {
        for (let i = 0; i < 8; i++) {
          const week = currentWeek - i <= 0 ? 52 + (currentWeek - i) : currentWeek - i
          const year = currentWeek - i <= 0 ? currentYear - 1 : currentYear

          // Generar datos aleatorios para cada estadística
          const orderCount = Math.floor(Math.random() * 100) + 50
          const revenue = orderCount * (Math.floor(Math.random() * 1000) + 1000)
          const complaints = Math.floor(Math.random() * 5)
          const rating = Math.random() * 2 + 3 // Rating entre 3 y 5

          stats.push({
            id: `${platform}-${local}-${year}-${week}`,
            platform,
            week,
            year,
            orderCount,
            revenue,
            complaints,
            rating,
            local,
          })
        }
      })
    })

  return stats
}

const deliveryStats = generateDeliveryStats()

// Datos simulados para auditorías
const generateAuditItems = (): AuditItem[] => {
  const categories = [
    { name: "Limpieza", items: ["Pisos", "Baños", "Cocina", "Mesas", "Vitrinas", "Depósito", "Exterior"] },
    { name: "Orden", items: ["Cocina", "Salón", "Depósito", "Caja", "Mostrador"] },
    {
      name: "Operatividad",
      items: ["Equipos de cocina", "Caja registradora", "Terminales de pago", "Iluminación", "Aire acondicionado"],
    },
    {
      name: "Temperaturas",
      items: ["Heladeras", "Freezers", "Exhibidores", "Hornos", "Alimentos calientes", "Alimentos fríos"],
    },
    {
      name: "Procedimientos",
      items: [
        "Apertura",
        "Cierre",
        "Preparación de alimentos",
        "Atención al cliente",
        "Manejo de reclamos",
        "Limpieza",
      ],
    },
    {
      name: "Legales",
      items: ["Habilitaciones", "Libreta sanitaria", "Extintores", "Salidas de emergencia", "Señalética"],
    },
    {
      name: "Nómina",
      items: ["Presentismo", "Uniformes", "Higiene personal", "Conocimiento de productos", "Atención al cliente"],
    },
  ]

  const items: AuditItem[] = []
  let id = 1
  let totalValue = 0

  // Distribuir 150 puntos entre todas las categorías y sus items
  categories.forEach((category) => {
    const categoryValue = Math.floor(150 / categories.length)
    const itemValue = Math.floor(categoryValue / category.items.length)

    category.items.forEach((item) => {
      items.push({
        id: id.toString(),
        category: category.name,
        name: item,
        value: itemValue,
        completed: false,
      })
      id++
      totalValue += itemValue
    })
  })

  // Ajustar el último item para que el total sea exactamente 150
  if (totalValue !== 150 && items.length > 0) {
    const lastItem = items[items.length - 1]
    lastItem.value += 150 - totalValue
  }

  return items
}

const auditItems = generateAuditItems()

// Generar auditorías de ejemplo
const generateAudits = (): Audit[] => {
  const audits: Audit[] = []
  const supervisors = employees.filter((emp) => emp.role === "supervisor")
  const managers = employees.filter((emp) => emp.role === "manager")

  if (supervisors.length === 0 || managers.length === 0) return audits

  locales
    .filter((local) => local !== "Administración")
    .forEach((local) => {
      const supervisor = supervisors[Math.floor(Math.random() * supervisors.length)]
      const manager = managers[Math.floor(Math.random() * managers.length)]

      // Generar una auditoría para cada local
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))

      const shifts: WorkShift[] = ["morning", "afternoon", "night"]
      const shift = shifts[Math.floor(Math.random() * shifts.length)]

      // Copiar los items de auditoría y marcar algunos como completados
      const items = auditItems.map((item) => ({
        ...item,
        completed: Math.random() > 0.3, // 70% de probabilidad de estar completado
      }))

      // Calcular puntaje total
      const totalScore = items.reduce((sum, item) => sum + (item.completed ? item.value : 0), 0)

      audits.push({
        id: `${local}-${date.toISOString().split("T")[0]}`,
        localId: local,
        local,
        date: date.toISOString().split("T")[0],
        shift,
        supervisorId: supervisor.id,
        supervisorName: `${supervisor.firstName} ${supervisor.lastName}`,
        managerId: manager.id,
        managerName: `${manager.firstName} ${manager.lastName}`,
        totalScore,
        items,
      })
    })

  return audits
}

const audits = generateAudits()

// Generar datos de facturación
const generateBillings = (): Billing[] => {
  const billings: Billing[] = []
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  locales
    .filter((local) => local !== "Administración")
    .forEach((local) => {
      // Generar facturación para los últimos 12 meses
      for (let i = 0; i < 12; i++) {
        const month = currentMonth - i <= 0 ? 12 + (currentMonth - i) : currentMonth - i
        const year = currentMonth - i <= 0 ? currentYear - 1 : currentYear

        // Generar monto aleatorio entre 1,000,000 y 5,000,000
        const amount = Math.floor(Math.random() * 4000000) + 1000000

        billings.push({
          id: `${local}-${year}-${month}`,
          localId: local,
          local,
          month,
          year,
          amount,
        })
      }
    })

  return billings
}

const billings = generateBillings()

// Generar datos de balances
const generateBalances = (): Balance[] => {
  const balances: Balance[] = []
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  locales
    .filter((local) => local !== "Administración")
    .forEach((local) => {
      // Generar balances para los últimos 12 meses
      for (let i = 0; i < 12; i++) {
        const month = currentMonth - i <= 0 ? 12 + (currentMonth - i) : currentMonth - i
        const year = currentMonth - i <= 0 ? currentYear - 1 : currentYear

        // Generar montos aleatorios para cada categoría
        const counterSales = Math.floor(Math.random() * 3000000) + 1000000
        const deliverySales = Math.floor(Math.random() * 2000000) + 500000
        const payrollExpenses = Math.floor(Math.random() * 1000000) + 500000
        const rentExpenses = Math.floor(Math.random() * 300000) + 200000
        const maintenanceExpenses = Math.floor(Math.random() * 100000) + 50000
        const suppliesExpenses = Math.floor(Math.random() * 500000) + 300000
        const repairsExpenses = Math.floor(Math.random() * 100000) + 20000
        const otherExpenses = Math.floor(Math.random() * 100000) + 10000

        // Calcular totales
        const totalIncome = counterSales + deliverySales
        const totalExpenses =
          payrollExpenses + rentExpenses + maintenanceExpenses + suppliesExpenses + repairsExpenses + otherExpenses
        const netProfit = totalIncome - totalExpenses

        balances.push({
          id: `${local}-${year}-${month}`,
          localId: local,
          local,
          month,
          year,
          counterSales,
          deliverySales,
          payrollExpenses,
          rentExpenses,
          maintenanceExpenses,
          suppliesExpenses,
          repairsExpenses,
          otherExpenses,
          totalIncome,
          totalExpenses,
          netProfit,
        })
      }
    })

  return balances
}

const balances = generateBalances()

// Add mock users data
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@quadrifoglio.com",
    password: "admin123",
    role: "admin" as UserRole,
    isActive: true,
  },
  {
    id: "2",
    name: "Manager User",
    email: "gerente@quadrifoglio.com",
    password: "gerente123",
    role: "manager" as UserRole,
    isActive: true,
  },
  {
    id: "3",
    name: "Employee User",
    email: "empleado@quadrifoglio.com",
    password: "empleado123",
    role: "employee" as UserRole,
    isActive: true,
  },
]

class DatabaseService {
  private supabase = createClientComponentClient()

  // User methods
  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw error
    return data
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Employee methods
  async getEmployees() {
    try {
      const { data, error } = await this.supabase
        .from('employees')
        .select('*')
        .order('firstName')

      if (error) {
        console.error("Error fetching employees:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in getEmployees:", error)
      throw error
    }
  }

  async getEmployeeById(id: string) {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createEmployee(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) {
    try {
      // Add timestamps
      const now = new Date().toISOString()
      const employeeData = {
        ...employee,
        createdAt: now,
        updatedAt: now,
        // Convert dates to proper format
        birthDate: new Date(employee.birthDate).toISOString(),
        hireDate: new Date(employee.hireDate).toISOString(),
      }

      console.log("Attempting to create employee with data:", employeeData)

      const { data, error } = await this.supabase
        .from("employees")
        .insert([employeeData])
        .select()
        .single()

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Error creating employee: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating employee:", error)
      throw error
    }
  }

  async updateEmployee(id: string, employee: Partial<Employee>) {
    const { data, error } = await this.supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteEmployee(id: string) {
    const { error } = await this.supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Attendance methods
  async getAttendanceByEmployeeId(employeeId: string) {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  async createAttendance(attendance: Omit<Attendance, 'id'>) {
    const { data, error } = await this.supabase
      .from('attendance')
      .insert([attendance])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Payroll methods
  async getPayrollByEmployeeId(employeeId: string) {
    const { data, error } = await this.supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', employeeId)
      .order('period_start', { ascending: false })

    if (error) throw error
    return data
  }

  async createPayroll(payroll: Omit<Payroll, 'id'>) {
    const { data, error } = await this.supabase
      .from('payroll')
      .insert([payroll])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createPayrollDetail(detail: Omit<PayrollDetail, 'id'>) {
    const { data, error } = await this.supabase
      .from('payroll_details')
      .insert([detail])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delivery stats methods
  async getDeliveryStats(startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('delivery_stats')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date')

    if (error) throw error
    return data
  }

  // Audit methods
  async getAudits(startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('audits')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  async createAudit(audit: Omit<Audit, 'id'>) {
    const { data, error } = await this.supabase
      .from('audits')
      .insert([audit])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Billing methods
  async getBilling(startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('billing')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }

  async createBilling(billing: Omit<Billing, 'id'>) {
    const { data, error } = await this.supabase
      .from('billing')
      .insert([billing])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Balance methods
  async getBalance(startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('balance')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date')

    if (error) throw error
    return data
  }

  async createBalance(balance: Omit<Balance, 'id'>) {
    const { data, error } = await this.supabase
      .from('balance')
      .insert([balance])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getDashboardStats() {
    try {
      // Get active employees count
      const { data: activeEmployees } = await this.supabase
        .from("employees")
        .select("id")
        .eq("status", "active");

      // Get delivery orders for the current month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const { data: deliveryOrders } = await this.supabase
        .from("delivery_orders")
        .select("*")
        .gte("created_at", firstDayOfMonth.toISOString());

      // Calculate statistics
      const stats = {
        activeEmployees: activeEmployees?.length || 0,
        activeEmployeesChange: 5, // Mock data - would need historical data to calculate
        totalDeliveryOrders: deliveryOrders?.length || 0,
        deliveryOrdersChange: 10, // Mock data - would need historical data to calculate
        totalRevenue: deliveryOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
        revenueChange: 15, // Mock data - would need historical data to calculate
        averageRating: 4.5, // Mock data - would need actual ratings
        ratingChange: 0.2, // Mock data - would need historical data to calculate
      };

      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  async generateReports() {
    try {
      // Mock data for reports
      return [
        {
      name: "Facturación por Local",
          data: {
            labels: ["BR Cabildo", "BR Carranza", "BR Pacifico", "BR Lavalle", "BR Rivadavia"],
      datasets: [
        {
                label: "Ventas Mensuales",
                data: [150000, 120000, 180000, 90000, 160000],
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
              },
            ],
          },
        },
        {
      name: "Evolución de Pedidos por Plataforma",
          data: {
            labels: ["PedidosYa", "Rappi", "MercadoPago"],
      datasets: [
        {
                data: [35, 40, 25],
                backgroundColor: [
                  "rgba(255, 99, 132, 0.5)",
                  "rgba(54, 162, 235, 0.5)",
                  "rgba(255, 206, 86, 0.5)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
        },
      ];
    } catch (error) {
      console.error("Error generating reports:", error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService()

