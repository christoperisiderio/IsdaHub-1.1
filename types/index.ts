export type UserRole = 'fisherman' | 'buyer';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_pickup'
  | 'out_delivery'
  | 'completed'
  | 'cancelled'
  | 'declined';

export type PaymentMethod = 'cash_pickup' | 'cash_delivery';

export type FreshnessStatus =
  | 'Fresh catch this morning'
  | 'Fresh catch today'
  | 'Frozen'
  | 'Live seafood'
  | 'Pre-ordered catch';

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  municipality: string;
  barangay: string;
  businessName?: string;
  fisheryRegNumber?: string;
  createdAt: string;
}

export type ListingStatus = 'active' | 'draft' | 'sold_out';

export interface CatchListing {
  id: string;
  fishermanId: string;
  fishermanName: string;
  fishType: string;
  quantityKg: number;
  reservedKg: number;
  pricePerKg: number;
  freshness: FreshnessStatus;
  photos: string[];
  location: string;
  municipality: string;
  barangay: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  availableSchedule: string;
  notes?: string;
  status: ListingStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  fishermanId: string;
  fishermanName: string;
  buyerId: string;
  buyerName: string;
  buyerMobile: string;
  fishType: string;
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfillment: 'pickup' | 'delivery';
  deliveryAddress?: string;
  scheduledAt: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'stock' | 'message' | 'system';
  read: boolean;
  createdAt: string;
  orderId?: string;
}

export interface RegisterPayload {
  fullName: string;
  mobile: string;
  password: string;
  role: UserRole;
  municipality: string;
  barangay: string;
  businessName?: string;
  fisheryRegNumber?: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  text: string;
  createdAt: string;
}
