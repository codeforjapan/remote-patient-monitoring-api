export interface Center {
  centerId: string
  centerName: string
}
export interface NurseParam {
  nurseId: string
  manageCenters:
  {
    centerId: string
  }[]
}

export interface Center {
  centerId: string,
  centerName: string
}