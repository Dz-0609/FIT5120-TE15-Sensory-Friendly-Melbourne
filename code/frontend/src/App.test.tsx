import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./services/api", () => ({
  searchRoutes: vi.fn().mockResolvedValue({
    routes: [
      {
        id: "route-calmer",
        name: "Calmer via Russell Street",
        durationMin: 18,
        distanceM: 1410,
        sensoryScore: 0.37,
        sensoryLevel: "MODERATE",
        dataConfidence: "MEDIUM",
        geometry: { type: "LineString", coordinates: [[144.9631, -37.8136], [144.9672, -37.8108]] },
        reasons: ["Pedestrian load is moderate relative to recent historical peaks.", "Crowd load only."],
        recommended: true
      }
    ],
    alerts: [
      { id: "prediction-swanston", severity: "HIGH", area: "Swanston Street", message: "Likely to become busier.", expectedTime: "2026-08-05T01:00:00Z", confidence: "MEDIUM" }
    ],
    quietSpaces: [
      { id: "state-library", name: "State Library Victoria", type: "LIBRARY", location: { lat: -37.8098, lng: 144.9652 }, distanceM: 260, sourceLabel: "test" }
    ],
    transportAccess: [],
    generatedAt: "2026-08-05T00:00:00Z",
    dataTimestamp: "2026-08-05T00:00:00Z",
    mode: "MOCK",
    dataSources: {
      routing: { source: "test routes", mode: "MOCK", timestamp: "2026-08-05T00:00:00Z", confidence: "MEDIUM", stale: false },
      pedestrian: { source: "test crowd", mode: "MOCK", timestamp: "2026-08-05T00:00:00Z", confidence: "MEDIUM", stale: false },
      quietSpaces: { source: "test places", mode: "MOCK", timestamp: "2026-08-05T00:00:00Z", confidence: "LOW", stale: false },
      transport: { source: "test transport", mode: "MOCK", timestamp: "2026-08-05T00:00:00Z", confidence: "LOW", stale: false }
    }
  })
}));

describe("App", () => {
  it("exposes the core no-login route planning flow", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /path that feels lighter/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/destination in melbourne cbd/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /compare sensory-aware routes/i })).toBeInTheDocument();
    expect(screen.getByText(/no account\. no journey history saved/i)).toBeInTheDocument();
  });

  it("renders the route, alerts and reserved transport integration from the shared response", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Calmer via Russell Street", level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/calmpath pick/i)).toBeInTheDocument();
    expect(screen.getByText("Swanston Street")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /transport access/i })).toBeInTheDocument();
    expect(screen.getByText(/access-point connection ready/i)).toBeInTheDocument();
  });

  it("reveals nearby lower-stimulation spaces on demand", async () => {
    render(<App />);
    const toggle = await screen.findByRole("button", { name: /show 1 nearby place/i });
    fireEvent.click(toggle);
    expect(screen.getByRole("heading", { name: "State Library Victoria", level: 4 })).toBeVisible();
  });
});
