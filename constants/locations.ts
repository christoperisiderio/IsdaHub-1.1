// constants/locations.ts
export const COVERED_MUNICIPALITIES = ['Buenavista', 'Nasipit'];

export const DELIVERY_FEES: Record<string, number> = {
  Buenavista: 50,
  Nasipit: 70,
};

export const MUNICIPALITIES_WITH_BARANGAYS: Record<string, string[]> = {
  Buenavista: [
    'Poblacion',
    'Afga',
    'Antipaz',
    'Aras-asan',
    'Baliwasan',
    'Buhang',
    'Caloc-an',
    'Hanagdong',
    'Katugasan',
    'La Fraternidad',
    'Lawigan',
    'Magsaysay',
    'Mandangoa',
    'Matabao',
    'Napo',
    'Pinayagan Norte',
    'Pinayagan Sur',
    'Rizal',
    'San Agustin',
    'San Isidro',
    'San Jose',
    'San Vicente',
    'Sangay',
    'Santo Rosario',
    'Tagbayani',
    'Tinigbasan',
    'Victory',
  ],
  Nasipit: [
    'Poblacion 1',
    'Poblacion 2',
    'Poblacion 3',
    'Aclan',
    'Amontay',
    'Ata-atahon',
    'Barangay 1',
    'Barangay 2',
    'Camagong',
    'Cubi-cubi',
    'Culit',
    'Jaguimitan',
    'Kinabjangan',
    'Punta',
    'San Isidro',
    'Talisay',
    'Tungao',
  ],
};

export const isInCoverageArea = (municipality: string): boolean => {
  return COVERED_MUNICIPALITIES.includes(municipality);
};
