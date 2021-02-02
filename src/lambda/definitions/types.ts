export interface Center {
  centerId: string;
  centerName?: string;
}
export interface NurseParam {
  nurseId: string;
  manageCenters: {
    centerId: string;
  }[];
}

export interface Status {
  statusId: string;
  patientId: string;
  centerId: string;
  created: string;
  SpO2: number;
  body_temperature: number;
  pulse: number;
  symptom?: {
    symptomId: string;
    cough: true;
    phlegm: true;
    suffocation: true;
    headache: true;
    sore_throat: true;
    remarks?: string;
  };
}

export interface Symptom {
  cough: true;
  phlegm: true;
  suffocation: true;
  headache: true;
  sore_throat: true;
  remarks?: string;
}

export interface StatusParam {
  SpO2: number;
  body_temperature: number;
  pulse: number;
  symptom?: Symptom;
}
export interface PatientParam {
  patientId: string;
  phone: string;
  display?: boolean;
  policy_accepted?: string;
  Statuses?: Status[];
  centerId: string;
}
