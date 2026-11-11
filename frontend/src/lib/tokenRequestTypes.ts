export type TokenRequestType =
  | 'temporary_extension' // ขอขยายโควต้าชั่วคราว (สอบ/จัดแล็บ)
  | 'purchase_package'    // ขอซื้อแพ็กเกจขยายลิมิตประจำภาคเรียน
  | 'institution_key'     // นำ API Key ของสถาบัน/วิทยาลัยมาเชื่อมต่อ
  | 'other'               // อื่นๆ

export type TokenRequestStatus = 'pending' | 'approved' | 'rejected'

export type TokenRequestRow = {
  id: string
  user_id: string
  teacher_name: string
  school_name: string | null
  request_type: TokenRequestType
  package_name: string | null
  student_count: number
  target_date: string | null
  contact_channel: string | null
  notes: string | null
  status: TokenRequestStatus
  admin_notes: string | null
  approved_quota: number | null
  created_at: string
  updated_at: string
}

export const REQUEST_TYPE_LABELS: Record<TokenRequestType, string> = {
  temporary_extension: 'ขยายโควต้าชั่วคราว (วันสอบ/กิจกรรมพิเศษ)',
  purchase_package: 'ขอซื้อแพ็กเกจขยายลิมิตประจำภาคเรียน',
  institution_key: 'เชื่อมต่อ API Key ของวิทยาลัย/สถาบัน',
  other: 'ปรึกษา/สอบถามข้อมูลเพิ่มเติม',
}
