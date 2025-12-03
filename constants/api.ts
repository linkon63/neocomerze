// export const API_BASE_URL = 'https://bunon.hs-inventory.softzino.xyz/api/v1';
// export const API_BASE_URL = "https://barnoi.hs-inventory.softzino.xyz/api/v1"
// export const API_BASE_URL = 'https://radi.hs-inventory.softzino.xyz/api/v1';
export const API_BASE_URL = 'https://pjfashion.hs-inventory.softzino.xyz/api/v1';

export const endpoints = {
  products: `${API_BASE_URL}/products`,
  categories: `${API_BASE_URL}/categories`,
  campaigns: `${API_BASE_URL}/campaigns?status=true`,
  productDetail: (id: string | number) => `${API_BASE_URL}/products/${id}`,
  generalInfo: `${API_BASE_URL}/general-infos`,
  register: `${API_BASE_URL}/register`,
  customers: `${API_BASE_URL}/customers`,
  profile: `${API_BASE_URL}/profile`,
};
