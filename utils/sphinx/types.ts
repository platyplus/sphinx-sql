export type SphinxTranslation = {
  language: string;
  title: string;
};

type SphinxBasicQuestion = {
  label: string;
  variable: string;
  type: string;
  plan: boolean;
  attributes: number;
  translations?: Array<Partial<SphinxQuestion>>;
  vb?: string;
  instructions?: string;
};

export type SphinxOpenQuestion = SphinxBasicQuestion & {
  type: "open";
  nbLines: number;
  nbCharLines: number;
};

export type SphinxDateQuestion = SphinxBasicQuestion & {
  type: "date";
  format: string;
};

export type SphinxOptionsQuestion = SphinxBasicQuestion & {
  type: "options";
  nbOptions: number;
  options: string[];
  weights?: number;
};

export type SphinxMultipleOptionsQuestion = SphinxBasicQuestion & {
  type: "multipleOptions";
  nbOptions: number;
  options: string[];
  maxResponses: number;
  weights?: number;
};

export type SphinxNumberQuestion = SphinxBasicQuestion & {
  type: "number";
  nbDecimals: number;
  numberType: number; // TODO
  format: string;
};

export type SphinxCodeQuestion = SphinxBasicQuestion & {
  type: "code";
  codesFile: string;
  nbCharCode: number;
};

export type SphinxQuestion =
  | SphinxOpenQuestion
  | SphinxDateQuestion
  | SphinxMultipleOptionsQuestion
  | SphinxOptionsQuestion
  | SphinxNumberQuestion
  | SphinxCodeQuestion;

export type SphinxForm = {
  version: number;
  headers: {
    history: string;
    language: string;
    title: string;
    pannelStage: number;
    translations: SphinxTranslation[];
  };
  questions: SphinxQuestion[];
  options?: {
    groups?: boolean;
    resend?: boolean;
    controls?: boolean;
  };
  strata?: any[];
  crossedSorts?: { var1: number; var2: number; plan: number }[];
};

export type SphinxOptionsSet = Record<string, string[]>;
/* // TODO
Strates
	Strate
		Nom=OI_D
		Active=0
		Filtre
			Op�rateur=-1
			Variable=139
			Compris=2
			Modalit�s= 1
			Rang=1
			Num�rique=0
		Fin
		Filtre
			Op�rateur=1
			Variable=141
			Compris=2
			Num�rique=0
		Fin
	Fin
	Strate
		Nom=OI_P
		Active=0
	Fin
Fin
 */
