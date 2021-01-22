export interface Center {
  centerId: string
  centerName?: string
}
export interface NurseParam {
  nurseId: string
  manageCenters:
  {
    centerId: string
  }[]
}

export interface Status { }
export interface PatientParam {
  patientId: string
  phone: string
  display?: boolean
  policy_accepted?: string
  Statuses?: Status[]
  centerId: string
}