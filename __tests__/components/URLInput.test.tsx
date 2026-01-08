import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { URLInput } from "@/components/URLInput";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("URLInput", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders input and button", () => {
    render(<URLInput />);

    expect(
      screen.getByPlaceholderText("owner/repo or GitHub URL")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Card" })).toBeInTheDocument();
  });

  describe("owner/repo format", () => {
    it("navigates on valid owner/repo input", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "octocat/hello-world");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/octocat/hello-world");
    });

    it("trims whitespace from input", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "  owner/repo  ");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });

    it("removes leading slash", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "/owner/repo");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });

    it("accepts owner/repo with dots and underscores", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "user.name/repo_name");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/user.name/repo_name");
    });

    it("accepts owner/repo with hyphens", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "my-user/my-repo");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/my-user/my-repo");
    });
  });

  describe("GitHub URL parsing", () => {
    it("parses full GitHub URL", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "https://github.com/octocat/hello-world");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/octocat/hello-world");
    });

    it("parses GitHub URL with .git extension", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "https://github.com/owner/repo.git");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });

    it("parses GitHub URL with trailing path", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "https://github.com/owner/repo/tree/main/src");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });

    it("parses GitHub URL without https://", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "github.com/owner/repo");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });

    it("parses GitHub URL with www prefix", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "https://www.github.com/owner/repo");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });
  });

  describe("error handling", () => {
    it("shows error for empty input", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(
        screen.getByText("Please enter a repository path or GitHub URL")
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows error for whitespace-only input", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "   ");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(
        screen.getByText("Please enter a repository path or GitHub URL")
      ).toBeInTheDocument();
    });

    it("shows error for single segment", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "justowner");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(
        screen.getByText("Please use the format: owner/repo or a GitHub URL")
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows error for invalid owner characters", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "owner@bad/repo");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(
        screen.getByText("Invalid owner or repository name")
      ).toBeInTheDocument();
    });

    it("shows error for invalid repo characters", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "owner/repo#bad");
      await user.click(screen.getByRole("button", { name: "View Card" }));

      expect(
        screen.getByText("Invalid owner or repository name")
      ).toBeInTheDocument();
    });

    it("clears error when user types", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      // Trigger error
      await user.click(screen.getByRole("button", { name: "View Card" }));
      expect(
        screen.getByText("Please enter a repository path or GitHub URL")
      ).toBeInTheDocument();

      // Start typing
      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "a");

      expect(
        screen.queryByText("Please enter a repository path or GitHub URL")
      ).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("submits on enter key", async () => {
      const user = userEvent.setup();
      render(<URLInput />);

      const input = screen.getByPlaceholderText("owner/repo or GitHub URL");
      await user.type(input, "owner/repo{enter}");

      expect(mockPush).toHaveBeenCalledWith("/card/owner/repo");
    });

    it("prevents default form submission", async () => {
      render(<URLInput />);

      const form = screen.getByRole("button", { name: "View Card" }).closest("form");
      const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

      fireEvent(form!, submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
