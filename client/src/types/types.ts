export interface DataMarker {
  id: number;
  type: string;
  state: string;
  local: string;
  date: string;
  lat: number;
  lng: number;
  localtype: string;
  photo?: string;
  specific_id?: number;
  nest_specific_id?: number;
}

export interface HornetData {
  vespaid: number;
  state_hornet: string;
  past_states: string[];
  confirmed_asian: boolean;
  nest?: number;
}

export interface NestData {
  nestid: number;
  colony: boolean;
  destroyed: boolean;
  state_nest: string;
  past_states: string[];
  destruction_date: Date;
}

export interface Exterminator {
  id: number;
  name: string;
  radius: number;
  type: string;
  localType: string;
  lat: number;
  lng: number;
}

export type HornetDataJoin = DataMarker & HornetData;

export type NestDataJoin = DataMarker & NestData;

export const ViewingStates = ["Não Resolvido", "Em Progresso", "Resolvido"];
export const LocalTypes = ["Residencial", "Rural", "Industrial", "Comercial"];
export const Types = ["Vespa", "Ninho"];

export const NestStates = [
  "Confirmado - por resolver",
  "Exterminador contactado",
  "Exterminação Agendada",
  "Resolvido - Ninho destruído",
];

export const HornetStates = [
  "Vespa confirmada",
  "Ninho encontrado",
  "Exterminador Contactado",
  "Exterminação Agendada",
  "Resolvido - Vespa normal",
  "Resolvido - Ninho exterminado",
];

export interface FilterObject {
  type?: string[];
  state?: string[];
  localtype?: string[];
  years?: string[];
}
