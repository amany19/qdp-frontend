export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  profilePicture?: string;
}

export interface Contract {
  _id: string;
  contractNumber?: string;
  propertyId: {
    _id: string;
    title: string;
    titleAr: string;
    images: Array<{ url: string; isCover: boolean }>;
    location: {
      address: string;
      city: string;
      area: string;
    };
    price: number;
  };
  contractType: 'rent' | 'sale';
  startDate: string;
  endDate?: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListing {
  _id: string;
  title: string;
  titleAr: string;
  price: number;
  propertyType: string;
  listingType: 'rent' | 'sale';
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: {
    city: string;
    area: string;
  };
  images: Array<{ url: string; isCover: boolean }>;
  status: 'draft' | 'pending_approval' | 'active' | 'inactive';
  createdAt: string;
}

export type TabType = 'account' | 'units' | 'ads' | 'offers' | 'appointments';