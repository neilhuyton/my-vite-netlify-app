// src/__tests__/trpc.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
import { trpc, createTRPCClient, queryClient } from "../trpc";
import type { AppRouter } from "../../netlify/functions/router";

// Store the last configuration passed to createClient
let lastClientConfig: any;

// Mock the @trpc/react-query module
vi.mock("@trpc/react-query", async () => {
  const actual = await vi.importActual("@trpc/react-query");
  return {
    ...actual,
    createTRPCReact: vi.fn(() => ({
      createClient: vi.fn((config) => {
        lastClientConfig = config; // Store the config
        return {};
      }),
      Provider: vi.fn(({ children }) => <div>{children}</div>),
    })),
    httpBatchLink: vi.fn((options) => ({ type: "httpBatchLink", options })),
  };
});

describe("trpc.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastClientConfig = null; // Reset config before each test
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("creates QueryClient with correct default options", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
    expect(queryClient.getDefaultOptions().queries).toEqual({
      retry: false,
      refetchOnWindowFocus: false,
    });
  });

  it("initializes trpc with AppRouter", () => {
    // Verify that trpc is initialized with the expected properties
    expect(trpc.createClient).toBeDefined();
    expect(trpc.Provider).toBeDefined();
  });

  it("creates tRPC client with correct configuration", () => {
    const mockToken = "test-token";
    const mockOnUnauthorized = vi.fn();
    createTRPCClient(mockToken, mockOnUnauthorized);

    expect(lastClientConfig).toEqual({
      links: [
        expect.objectContaining({
          type: "httpBatchLink",
          options: expect.objectContaining({
            url: expect.any(String),
            headers: expect.any(Function),
            fetch: expect.any(Function),
          }),
        }),
      ],
    });

    const headersFn = lastClientConfig.links[0].options.headers;
    expect(headersFn()).toEqual({
      "Content-Type": "application/json",
      Authorization: `Bearer ${mockToken}`,
    });
  });

  it("creates tRPC client without token in headers when token is null", () => {
    const mockOnUnauthorized = vi.fn();
    createTRPCClient(null, mockOnUnauthorized);

    const headersFn = lastClientConfig.links[0].options.headers;
    expect(headersFn()).toEqual({
      "Content-Type": "application/json",
    });
  });

  it("calls onUnauthorized and throws error on 401 response", async () => {
    const mockOnUnauthorized = vi.fn();
    createTRPCClient("test-token", mockOnUnauthorized);

    const fetchFn = lastClientConfig.links[0].options.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: new Headers(),
      text: vi.fn().mockResolvedValue("Unauthorized"),
    });
    global.fetch = mockFetch;

    await expect(fetchFn("/api/trpc", {})).rejects.toThrow("UNAUTHORIZED");
    expect(mockOnUnauthorized).toHaveBeenCalled();
  });

  it("throws error on non-401 HTTP error", async () => {
    const mockOnUnauthorized = vi.fn();
    createTRPCClient("test-token", mockOnUnauthorized);

    const fetchFn = lastClientConfig.links[0].options.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers(),
      text: vi.fn().mockResolvedValue("Server Error"),
    });
    global.fetch = mockFetch;

    await expect(fetchFn("/api/trpc", {})).rejects.toThrow("HTTP error 500: Server Error");
    expect(mockOnUnauthorized).not.toHaveBeenCalled();
  });

  it("returns response on successful fetch", async () => {
    const mockOnUnauthorized = vi.fn();
    createTRPCClient("test-token", mockOnUnauthorized);

    const fetchFn = lastClientConfig.links[0].options.fetch;
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      text: vi.fn().mockResolvedValue('{"data":"success"}'),
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const response = await fetchFn("/api/trpc", {});
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toBe('{"data":"success"}');
    expect(mockOnUnauthorized).not.toHaveBeenCalled();
  });
});