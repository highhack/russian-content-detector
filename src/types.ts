export interface TextElement {
  tag: string;
  text: string;
  containsRussian: boolean;
}

export interface WebsiteAnalysis {
  url: string;
  isRussianLanguage: boolean;
  detectedLanguage: string;
  textElements: TextElement[] | { [key: string]: string }[];
  russianElementsCount: number;
  languageConfidence: string;
  detectedCharset: string;
  error?: string;
}

export type Languages =
  | "eng"
  | "rus"
  | "ukr"
  | "deu"
  | "fra"
  | "ita"
  | "spa"
  | "por"
  | "nld"
  | "pol"
  | "hun"
  | "ces"
  | "slk"
  | "hrv"
  | "slo"
  | "bul"
  | "rom"
  | "cze"
  | "dan"
  | "est"
  | "fin"
  | "grc"
  | "hun"
  | "isl"
  | "ita"
  | "lat"
  | "lit"
  | "nor"
  | "por"
  | "ron"
  | "slv"
  | "swe"
  | "tur"
  | "ukr"
  | "zho";
