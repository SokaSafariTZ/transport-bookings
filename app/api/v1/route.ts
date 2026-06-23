import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/v1
// Self-describing API index — useful for the Expo app to discover endpoints
// and for integration testing.
export async function GET() {
  return ok({
    version: "1",
    baseUrl: "/api/v1",
    description: "SokaSafari Travel API — Tanzania-centric flights & buses booking",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1",
        description: "This index",
      },
      {
        method: "GET",
        path: "/api/v1/catalog",
        description: "List all locations and operators",
        params: [],
      },
      {
        method: "GET",
        path: "/api/v1/search",
        description: "Search available trips",
        params: [
          { name: "mode",       required: true,  type: "flights | buses" },
          { name: "from",       required: true,  type: "location code (e.g. DAR, DAR-BT)" },
          { name: "to",         required: true,  type: "location code (e.g. NBO, ARU-BT)" },
          { name: "date",       required: true,  type: "YYYY-MM-DD" },
          { name: "passengers", required: false, type: "number (default: 1)" },
        ],
        example: "/api/v1/search?mode=flights&from=DAR&to=NBO&date=2026-07-15",
      },
      {
        method: "GET",
        path: "/api/v1/trips/:id",
        description: "Full trip detail with fares, seat layout, and seat grid",
        params: [{ name: "id", required: true, type: "trip ID from search results" }],
      },
      {
        method: "GET",
        path: "/api/v1/trips/:id/seats",
        description: "Seat map only — layout metadata + per-seat status for rendering bus/flight picker",
        params: [{ name: "id", required: true, type: "trip ID" }],
      },
      {
        method: "POST",
        path: "/api/v1/bookings",
        description: "Create a booking (returns PNR). Booking is pending until paid.",
        body: {
          tripId: "string",
          fareClass: "economy | business | first | standard | vip",
          passengers: "Passenger[]",
          contactEmail: "string",
          contactPhone: "string",
          seatNumbers: "string[] (optional)",
        },
      },
      {
        method: "GET",
        path: "/api/v1/bookings/:ref",
        description: "Look up a booking by PNR (6-char) or booking UUID",
      },
      {
        method: "POST",
        path: "/api/v1/payments",
        description: "Pay for a booking",
        body: {
          ref: "PNR or booking ID",
          method: "card | mobile_money | wallet",
        },
      },
    ],
    travelModes: ["flights", "buses"],
    tanzaniaHubs: {
      airports: ["DAR", "JRO", "ZNZ", "MWZ"],
      busTerminals: ["DAR-BT", "ARU-BT", "MSH-BT", "MWZ-BT", "DOD-BT", "TGA-BT", "ZNZ-BT"],
    },
  });
}
