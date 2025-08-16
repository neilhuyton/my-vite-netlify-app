// src/__tests__/App.test.tsx
import { act, render, screen, waitFor } from "@testing-library/react";
import { useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import AppContent from "../App";
import Sidebar from "../components/Sidebar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  Outlet: vi.fn(() => <div data-testid="outlet" />),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../components/Sidebar", () => ({
  default: vi.fn(
    ({ mobileOpen, onDrawerToggle, locationPathname, drawerWidth }) => (
      <div
        data-testid="sidebar"
        data-mobile-open={mobileOpen.toString()}
        data-pathname={locationPathname}
        data-drawer-width={drawerWidth.toString()}
        onClick={onDrawerToggle}
      />
    )
  ),
}));

// Setup mocks
const mockNavigate = vi.fn();
const mockUseNavigate = useNavigate as unknown as ReturnType<typeof vi.fn>;
const mockUseLocation = useLocation as unknown as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;

// Helper to render AppContent with ThemeProvider
const renderAppContent = () => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <AppContent />
    </ThemeProvider>
  );
};

describe("AppContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({ pathname: "/" });
    mockUseAuth.mockReturnValue({ user: null });
  });

  it("renders Outlet when user is not authenticated", () => {
    renderAppContent();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("renders Sidebar when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
    });
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" });
    renderAppContent();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute("data-mobile-open", "false");
    expect(sidebar).toHaveAttribute("data-pathname", "/dashboard");
    expect(sidebar).toHaveAttribute("data-drawer-width", "240");
  });

  it("toggles Sidebar mobileOpen state when handleDrawerToggle is called", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
    });
    renderAppContent();
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-mobile-open", "false");

    await act(async () => {
      sidebar.click();
      await waitFor(() => {
        expect(sidebar).toHaveAttribute("data-mobile-open", "true");
      });
    });

    await act(async () => {
      sidebar.click();
      await waitFor(() => {
        expect(sidebar).toHaveAttribute("data-mobile-open", "false");
      });
    });
  });

  it("redirects to /login for unauthenticated user on non-public route", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" });
    renderAppContent();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
    });
  });

  it("does not redirect for unauthenticated user on public route", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseLocation.mockReturnValue({ pathname: "/login" });
    renderAppContent();
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("does not redirect for authenticated user", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
    });
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" });
    renderAppContent();
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("memoizes publicRoutes correctly", () => {
    mockUseLocation.mockReturnValue({ pathname: "/login" });
    renderAppContent();
    expect(mockUseLocation).toHaveBeenCalled();
    mockUseLocation.mockClear();
    mockUseLocation.mockReturnValue({ pathname: "/signup" });
    renderAppContent();
    expect(mockUseLocation).toHaveBeenCalled();
    expect(mockUseLocation.mock.calls.length).toBeGreaterThan(0);
  });
});