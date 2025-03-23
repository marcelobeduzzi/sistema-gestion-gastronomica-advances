// Tipos comunes para todo el sistema

export type UserRole = "admin" | "manager" | "supervisor" | "employee" | "cashier" | "waiter" | "kitchen"

export type EmployeeStatus = "active" | "inactive" | "on_leave" | "vacation"

export type Local =
  | "BR Cabildo"
  | "BR Carranza"
  | "BR Pacifico"
  | "BR Lavalle"
  | "BR Rivadavia"
  | "BR Aguero"
  | "BR Dorrego"
  | "Dean & Dennys"
  | "Administración"

export type WorkShift = "morning" | "afternoon" | "night" | "full_time" | "part_time"

export type DeliveryPlatform = "PedidosYa" | "Rappi" | "MercadoPago"

export type Restaurant = 
  | "BR Cabildo" 
  | "BR Carranza" 
  | "BR Pacifico" 
  | "BR Lavalle" 
  | "BR Rivadavia" 
  | "BR Aguero" 
  | "BR Dorrego" 
  | "Dean & Dennys"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  documentId: string
  documentType: string
  phone: string
  email: string
  address: string
  birthDate: string
  hireDate: string
  terminationDate?: string
  position: string
  local: Local
  workShift: WorkShift
  baseSalary: number
  bankSalary: number
  totalSalary: number
  status: EmployeeStatus
  role: UserRole
  workedDays?: number
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut?: string
  expectedCheckIn: string
  expectedCheckOut: string
  lateMinutes: number
  earlyDepartureMinutes: number
  isAbsent: boolean
  isJustified: boolean
  isHoliday: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Payroll {
  id: string
  employeeId: string
  month: number
  year: number
  baseSalary: number
  bankSalary: number
  deductions: number
  additions: number
  finalHandSalary: number
  totalSalary: number
  isPaidHand: boolean
  isPaidBank: boolean
  handPaymentDate?: string
  bankPaymentDate?: string
  details: PayrollDetail[]
  createdAt: string
  updatedAt: string
}

export interface PayrollDetail {
  id: string
  payrollId: string
  type: "deduction" | "addition"
  concept: string
  amount: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryStats {
  id: string
  platform: string
  week: number
  year: number
  orderCount: number
  revenue: number
  complaints: number
  rating: number
  local: string
  createdAt: string
  updatedAt: string
}

export interface Audit {
  id: string
  date: string
  type: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Billing {
  id: string
  date: string
  amount: number
  type: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Balance {
  id: string
  date: string
  counterSales: number
  deliverySales: number
  totalIncome: number
  payrollExpenses: number
  rentExpenses: number
  maintenanceExpenses: number
  suppliesExpenses: number
  repairsExpenses: number
  otherExpenses: number
  totalExpenses: number
  netProfit: number
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  name: string
  type: "bar" | "line" | "pie"
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }
  createdAt: string
}

