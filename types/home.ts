export type HeroSlide = {
  id: string | number;
  title: string;
  copy: string;
  cta: string;
  image?: string;
  tone: string;
};

export type CategoryItem = {
  id: number;
  name: string;
  image?: string;
};

export type ProductCard = {
  id: number;
  name: string;
  price: string;
  image?: string;
  badge?: string;
  description?: string;
};

export type GeneralInfo = {
  shop_name?: string;
  top_bar_slogan?: string;
  media?: { original_url?: string }[];
};

export type ApiGeneralInfoResponse = {
  generalInfo?: GeneralInfo;
};
