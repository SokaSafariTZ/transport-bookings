import type {
  BookingDetail,
  Fare,
  Location,
  Operator,
  Seat,
  SeatLayout,
  SearchParams,
  TripWithRefs,
} from "@/lib/types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json.data as T;
}

export interface CatalogResponse {
  locations: Location[];
  operators: Operator[];
  routes: { mode: string; from?: Location; to?: Location; fromPrice: number }[];
}

export const api = {
  catalog: (mode?: string) =>
    req<CatalogResponse>(`/api/v1/catalog${mode ? `?mode=${mode}` : ""}`),

  search: (p: SearchParams) =>
    req<{ count: number; results: TripWithRefs[]; query: SearchParams }>(
      `/api/v1/search?mode=${p.mode}&from=${p.from}&to=${p.to}&date=${p.date}&passengers=${p.passengers}`,
    ),

  trip: (id: string) =>
    req<{ trip: TripWithRefs; fares: Fare[]; layout: SeatLayout; seats: Seat[] }>(
      `/api/v1/trips/${id}`,
    ),

  createBooking: (body: unknown) =>
    req<BookingDetail>(`/api/v1/bookings`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getBooking: (ref: string) => req<BookingDetail>(`/api/v1/bookings/${ref}`),

  pay: (reference: string, method = "card") =>
    req<{ paid: boolean; transactionId: string; booking: BookingDetail }>(
      `/api/v1/payments`,
      { method: "POST", body: JSON.stringify({ reference, method }) },
    ),
};
