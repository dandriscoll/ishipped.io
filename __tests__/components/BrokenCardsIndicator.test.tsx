import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrokenCardsIndicator } from "@/components/BrokenCardsIndicator";
import type { BrokenCard } from "@/lib/user-api";

describe("BrokenCardsIndicator", () => {
  const makeBrokenCard = (i: number): BrokenCard => ({
    owner: "octocat",
    repo: `repo-${i}`,
    file: `card-${i}.md`,
    githubUrl: `https://github.com/octocat/repo-${i}/blob/main/.ishipped/card-${i}.md`,
  });

  it("renders nothing when brokenCards is empty", () => {
    const { container } = render(<BrokenCardsIndicator brokenCards={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows button with correct count and aria-label", () => {
    const cards = [makeBrokenCard(1), makeBrokenCard(2)];
    render(<BrokenCardsIndicator brokenCards={cards} />);

    const button = screen.getByRole("button", { name: "2 broken cards" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("2");
  });

  it("uses singular aria-label for 1 broken card", () => {
    render(<BrokenCardsIndicator brokenCards={[makeBrokenCard(1)]} />);

    expect(screen.getByRole("button", { name: "1 broken card" })).toBeInTheDocument();
  });

  it("click opens popover with card links", async () => {
    const user = userEvent.setup();
    const cards = [makeBrokenCard(1)];
    render(<BrokenCardsIndicator brokenCards={cards} />);

    await user.click(screen.getByRole("button"));

    const link = screen.getByRole("link", { name: /octocat\/repo-1/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/octocat/repo-1/blob/main/.ishipped/card-1.md"
    );
  });

  it("links open in new tab", async () => {
    const user = userEvent.setup();
    render(<BrokenCardsIndicator brokenCards={[makeBrokenCard(1)]} />);

    await user.click(screen.getByRole("button"));

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays max 3 cards with overflow message", async () => {
    const user = userEvent.setup();
    const cards = [1, 2, 3, 4, 5].map(makeBrokenCard);
    render(<BrokenCardsIndicator brokenCards={cards} />);

    await user.click(screen.getByRole("button"));

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(screen.getByText("and 2 more...")).toBeInTheDocument();
  });

  it("does not show overflow message when 3 or fewer", async () => {
    const user = userEvent.setup();
    const cards = [1, 2, 3].map(makeBrokenCard);
    render(<BrokenCardsIndicator brokenCards={cards} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByText(/more\.\.\./)).not.toBeInTheDocument();
  });

  it("closes popover on outside click", async () => {
    const user = userEvent.setup();
    render(<BrokenCardsIndicator brokenCards={[makeBrokenCard(1)]} />);

    // Open
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Broken cards")).toBeInTheDocument();

    // Click the overlay (fixed inset-0 div)
    const overlay = document.querySelector(".fixed.inset-0");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);

    expect(screen.queryByText("Broken cards")).not.toBeInTheDocument();
  });
});
