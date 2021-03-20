"use strict";
import { NurseParam } from "../lambda/definitions/types";

export default class Formatter {
  getCenterFormatter(queryResult: any) {
    return queryResult.Items[0];
  }
  buildNurseParam(nurseId: string, centerIds: string[]): NurseParam {
    const centers = centerIds.map((centerId): { centerId: string } => {
      return { centerId: centerId };
    });
    return {
      nurseId: nurseId,
      manageCenters: centers,
    };
  }
}
