// src/__tests__/router.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RouterProvider, createMemoryHistory, Outlet } from "@tanstack/react-router";
import { router } from "../router";
import WeightList from "../components/WeightList";
import WeightChart from "../components/WeightChart";
import Login from "../components/Login";
import Signup from "../components/Signup";
import VerifyEmail from "../components/VerifyEmail";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
import GoalContent from "../components/GoalContent";
import Profile from "../components/Profile";
import { AppContent } from "../components/AppContent";
import MainContent from "../components/MainContent";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "../trpc";
import { JSX } from "react";

// Mock dependencies
vi.mock("../components/WeightList", () => ({
  default: vi.fn(() => <div data-testid="weight-list">Weight List</div>),
}));
vi.mock("../components/WeightChart", () => ({
  default: vi.fn(() => <div data-testid="weight-chart">Weight Chart</div>),
}));
vi.mock("../components/Login", () => ({
  default: vi.fn(() => <div data-testid="login">Login</div>),
}));
vi.mock("../components/Signup", () => ({
  default: vi.fn(() => <div data-testid="signup">Signup</div>),
}));
vi.mock("../components/VerifyEmail", () => ({
  default: vi.fn(() => <div data-testid="verify-email">Verify Email</div>),
}));
vi.mock("../components/ForgotPassword", () => ({
  default: vi.fn(() => <div data-testid="forgot-password">Forgot Password</div>),
}));
vi.mock("../components/ResetPassword", () => ({
  default: vi.fn(() => <div data-testid="reset-password">Reset Password</div>),
}));
vi.mock("../components/GoalContent", () => ({
  default: vi.fn(() => <div data-testid="goal-content">Goal Content</div>),
}));
vi.mock("../components/Profile", () => ({
  default: vi.fn(() => <div data-testid="profile">Profile</div>),
}));
vi.mock("../components/AppContent", () => ({
  AppContent: vi.fn(() => (
    <div data-testid="app-content">
      App Content
      <Outlet />
    </div>
  )),
}));
vi.mock("../components/MainContent", () => ({
  default: vi.fn(() => <div data-testid="main-content">Main Content</div>),
}));
vi.mock("../context/AuthContext", () => ({
  AuthProvider: vi.fn(({ children }) => <div data-testid="auth-provider">{children}</div>),
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
      createClient: vi.fn(() => ({
        auth: {
          login: vi.fn(),
          signup: vi.fn(),
          verifyEmail: vi.fn(),
          forgotPassword: vi.fn(),
          resetPassword: vi.fn(),
          logout: vi.fn(),
        },
        weight: {
          getWeights: vi.fn(),
          addWeight: vi.fn(),
          updateWeight: vi.fn(),
          deleteWeight: vi.fn(),
        },
        goal: {
          getGoals: vi.fn(),
          setGoal: vi.fn(),
          updateGoal: vi.fn(),
        },
        trend: {
          getTrends: vi.fn(),
        },
        account: {
          getProfile: vi.fn(),
          updateProfile: vi.fn(),
        },
      })),
    },
    queryClient: testQueryClient,
    createTRPCClient: vi.fn(() => ({
      auth: {
        login: vi.fn(),
        signup: vi.fn(),
        verifyEmail: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
        logout: vi.fn(),
      },
      weight: {
        getWeights: vi.fn(),
        addWeight: vi.fn(),
        updateWeight: vi.fn(),
        deleteWeight: vi.fn(),
      },
      goal: {
        getGoals: vi.fn(),
        setGoal: vi.fn(),
        updateGoal: vi.fn(),
      },
      trend: {
        getTrends: vi.fn(),
      },
      account: {
        getProfile: vi.fn(),
        updateProfile: vi.fn(),
      },
    })),
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

// Setup mocks
const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const queryClient = new QueryClient();
const mockTRPCClient = vi.mocked(trpc).createClient({} as any);

describe("router.tsx", () => {
  let history: ReturnType<typeof createMemoryHistory>;

  beforeEach(() => {
    vi.clearAllMocks();
    history = createMemoryHistory();
    queryClient.clear();
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
    });
  });

  const renderWithProviders = (ui: JSX.Element) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <AuthProvider>
          <trpc.Provider client={mockTRPCClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
          </trpc.Provider>
        </AuthProvider>
      </ThemeProvider>
    );
  };

  it("defines correct route tree structure", () => {
    const routes = router.routesByPath;
    expect(Object.keys(routes)).toEqual(
      expect.arrayContaining([
        "/",
        "/list",
        "/graph",
        "/goal",
        "/profile",
        "/login",
        "/signup",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
      ])
    );
    expect(routes["/"].parentRoute.id).toBe("__root__");
    expect(routes["/list"].parentRoute.id).toBe("__root__");
    expect(routes["/graph"].parentRoute.id).toBe("__root__");
    expect(routes["/goal"].parentRoute.id).toBe("__root__");
    expect(routes["/profile"].parentRoute.id).toBe("__root__");
    expect(routes["/login"].parentRoute.id).toBe("__root__");
    expect(routes["/signup"].parentRoute.id).toBe("__root__");
    expect(routes["/verify-email"].parentRoute.id).toBe("__root__");
    expect(routes["/forgot-password"].parentRoute.id).toBe("__root__");
    expect(routes["/reset-password"].parentRoute.id).toBe("__root__");
  });

  it("renders AppContent as root route component", async () => {
    history.push("/");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("app-content")).toBeInTheDocument();
      expect(AppContent).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it("redirects to /login for index route when not authenticated", async () => {
    history.push("/");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(history.location.pathname).toBe("/login");
      expect(screen.getByTestId("login")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders MainContent for index route when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
      logout: vi.fn(),
    });
    history.push("/");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-route")).toBeInTheDocument();
      expect(screen.getByTestId("main-content")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("redirects to /login for /list route when not authenticated", async () => {
    history.push("/list");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(history.location.pathname).toBe("/login");
      expect(screen.getByTestId("login")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders WeightList for /list route when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
      logout: vi.fn(),
    });
    history.push("/list");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-route")).toBeInTheDocument();
      expect(screen.getByTestId("weight-list")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("redirects to /login for /graph route when not authenticated", async () => {
    history.push("/graph");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(history.location.pathname).toBe("/login");
      expect(screen.getByTestId("login")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders WeightChart for /graph route when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
      logout: vi.fn(),
    });
    history.push("/graph");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-route")).toBeInTheDocument();
      expect(screen.getByTestId("weight-chart")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("redirects to /login for /goal route when not authenticated", async () => {
    history.push("/goal");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(history.location.pathname).toBe("/login");
      expect(screen.getByTestId("login")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders GoalContent for /goal route when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
      logout: vi.fn(),
    });
    history.push("/goal");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-route")).toBeInTheDocument();
      expect(screen.getByTestId("goal-content")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("redirects to /login for /profile route when not authenticated", async () => {
    history.push("/profile");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(history.location.pathname).toBe("/login");
      expect(screen.getByTestId("login")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders Profile for /profile route when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { token: "test-token", id: "123", email: "test@example.com" },
      logout: vi.fn(),
    });
    history.push("/profile");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-route")).toBeInTheDocument();
      expect(screen.getByTestId("profile")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders Login for /login route without AuthenticatedRoute", async () => {
    history.push("/login");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("login")).toBeInTheDocument();
      expect(screen.queryByTestId("authenticated-route")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders Signup for /signup route without AuthenticatedRoute", async () => {
    history.push("/signup");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("signup")).toBeInTheDocument();
      expect(screen.queryByTestId("authenticated-route")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders VerifyEmail for /verify-email route without AuthenticatedRoute", async () => {
    history.push("/verify-email");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("verify-email")).toBeInTheDocument();
      expect(screen.queryByTestId("authenticated-route")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders ForgotPassword for /forgot-password route without AuthenticatedRoute", async () => {
    history.push("/forgot-password");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("forgot-password")).toBeInTheDocument();
      expect(screen.queryByTestId("authenticated-route")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders ResetPassword for /reset-password route without AuthenticatedRoute", async () => {
    history.push("/reset-password");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByTestId("reset-password")).toBeInTheDocument();
      expect(screen.queryByTestId("authenticated-route")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders not-found route for invalid paths", async () => {
    history.push("/invalid-path");
    renderWithProviders(<RouterProvider router={router} history={history} />);
    await waitFor(() => {
      expect(screen.getByText("Not Found")).toBeInTheDocument();
      expect(screen.queryByTestId("authenticated-route")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});