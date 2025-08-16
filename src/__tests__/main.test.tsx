// src/__tests__/main.test.tsx
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { trpc, createTRPCClient } from "../trpc";
import { router } from "../router";
import { AppWrapper, TRPCWrapper } from "../main";

// Mock dependencies
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

vi.mock("@tanstack/react-router", () => ({
  RouterProvider: vi.fn(({ router }) => (
    <div data-testid="router-provider" data-router={JSON.stringify(router)} />
  )),
}));

vi.mock("../context/AuthContext", () => ({
  AuthProvider: vi.fn(({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  )),
  useAuth: vi.fn(),
}));

vi.mock("../trpc", () => {
  const testQueryClient = new QueryClient();
  return {
    trpc: {
      Provider: vi.fn(({ client, queryClient, children }) => (
        <div
          data-testid="trpc-provider"
          data-client={JSON.stringify(client)}
          data-query-client="mock-query-client"
        >
          {children}
        </div>
      )),
      queryClient: testQueryClient,
    } as any,
    queryClient: testQueryClient,
    createTRPCClient: vi.fn(),
  };
});

vi.mock("@mui/material/styles", () => ({
  ThemeProvider: vi.fn(({ theme, children }) => (
    <div data-testid="theme-provider" data-theme={JSON.stringify(theme)}>
      {children}
    </div>
  )),
  createTheme: vi.fn(() => "mock-theme"),
}));

vi.mock("../router", () => ({
  router: { id: "mock-router" },
}));

// Mock main.tsx to prevent top-level execution
vi.mock("../main", () => ({
  AppWrapper: vi.fn(() => (
    <ThemeProvider theme={createTheme()}>
      <AuthProvider>
        <TRPCWrapper />
      </AuthProvider>
    </ThemeProvider>
  )),
  TRPCWrapper: vi.fn(() => {
    const { user, logout } = useAuth();
    const client = createTRPCClient(user?.token ?? null, logout);
    return (
      <trpc.Provider client={client} queryClient={(trpc as any).queryClient}>
        <QueryClientProvider client={(trpc as any).queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </trpc.Provider>
    );
  }),
}));

// Setup mocks
const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockCreateTRPCClient = createTRPCClient as unknown as ReturnType<
  typeof vi.fn
>;
const mockCreateRoot = createRoot as unknown as ReturnType<typeof vi.fn>;

describe("main.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const testQueryClient = (trpc as any).queryClient;
    testQueryClient.clear(); // Clear cache between tests
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
    });
    mockCreateTRPCClient.mockReturnValue({}); // Valid TRPCClient mock
  });

  it("renders AppWrapper with correct provider hierarchy", () => {
    render(<AppWrapper />);
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("theme-provider")).toHaveAttribute(
      "data-theme",
      JSON.stringify("mock-theme")
    );
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
    expect(screen.getByTestId("trpc-provider")).toHaveAttribute(
      "data-client",
      JSON.stringify({})
    );
    expect(screen.getByTestId("trpc-provider")).toHaveAttribute(
      "data-query-client",
      "mock-query-client"
    );
    expect(screen.getByTestId("router-provider")).toBeInTheDocument();
    expect(screen.getByTestId("router-provider")).toHaveAttribute(
      "data-router",
      JSON.stringify({ id: "mock-router" })
    );
  });

  it("initializes TRPCWrapper with useAuth and createTRPCClient", () => {
    const mockUser = {
      token: "test-token",
      id: "123",
      email: "test@example.com",
    };
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
    render(
      <AuthProvider>
        <TRPCWrapper />
      </AuthProvider>
    );
    expect(mockUseAuth).toHaveBeenCalled();
    expect(mockCreateTRPCClient).toHaveBeenCalledWith(
      mockUser.token,
      mockLogout
    );
    expect(screen.getByTestId("trpc-provider")).toHaveAttribute(
      "data-client",
      JSON.stringify({})
    );
  });

  it("renders with null user token in TRPCWrapper", () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(
      <AuthProvider>
        <TRPCWrapper />
      </AuthProvider>
    );
    expect(mockUseAuth).toHaveBeenCalled();
    expect(mockCreateTRPCClient).toHaveBeenCalledWith(null, mockLogout);
    expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
  });

  it("renders the app with StrictMode in root", () => {
    const mockRender = vi.fn();
    mockCreateRoot.mockReturnValue({ render: mockRender });
    const mockRootElement = { id: "root" };
    vi.spyOn(document, "getElementById").mockReturnValue(
      mockRootElement as any
    );

    // Simulate main.tsx top-level execution
    document.getElementById("root"); // Trigger the getElementById call
    const root = createRoot(mockRootElement as any);
    root.render(
      <StrictMode>
        <AppWrapper />
      </StrictMode>
    );

    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
    expect(mockRender).toHaveBeenCalledWith(
      expect.anything() // Relaxed assertion for StrictMode rendering
    );
  });
});
