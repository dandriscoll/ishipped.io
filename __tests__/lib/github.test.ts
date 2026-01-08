import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseGitHubURL,
  getDefaultBranch,
  fetchCardContent,
  getRepoMetadata,
  constructFetchURL,
  GitHubURLError,
} from "@/lib/github";

describe("lib/github", () => {
  describe("parseGitHubURL", () => {
    it("parses basic GitHub URL", () => {
      const result = parseGitHubURL("https://github.com/owner/repo");

      expect(result.owner).toBe("owner");
      expect(result.repo).toBe("repo");
      expect(result.ref).toBeNull();
      expect(result.path).toBeNull();
      expect(result.isFilePath).toBe(false);
    });

    it("removes .git suffix from repo name", () => {
      const result = parseGitHubURL("https://github.com/owner/repo.git");

      expect(result.repo).toBe("repo");
    });

    it("extracts ref from blob URLs", () => {
      const result = parseGitHubURL(
        "https://github.com/owner/repo/blob/main/file.md"
      );

      expect(result.ref).toBe("main");
      expect(result.path).toBe("file.md");
      expect(result.isFilePath).toBe(true);
    });

    it("extracts ref from tree URLs", () => {
      const result = parseGitHubURL(
        "https://github.com/owner/repo/tree/develop"
      );

      expect(result.ref).toBe("develop");
    });

    it("extracts nested file paths", () => {
      const result = parseGitHubURL(
        "https://github.com/owner/repo/blob/main/path/to/file.md"
      );

      expect(result.path).toBe("path/to/file.md");
      expect(result.isFilePath).toBe(true);
    });

    it("throws INVALID_URL for non-GitHub URLs", () => {
      expect(() => parseGitHubURL("https://gitlab.com/owner/repo")).toThrow(
        GitHubURLError
      );
    });

    it("throws INVALID_URL for HTTP URLs", () => {
      expect(() => parseGitHubURL("http://github.com/owner/repo")).toThrow(
        GitHubURLError
      );
    });

    it("throws INVALID_URL for missing owner", () => {
      expect(() => parseGitHubURL("https://github.com/")).toThrow(
        GitHubURLError
      );
    });

    it("throws INVALID_URL for missing repo", () => {
      expect(() => parseGitHubURL("https://github.com/owner")).toThrow(
        GitHubURLError
      );
    });

    it("throws INVALID_URL for invalid URL format", () => {
      expect(() => parseGitHubURL("not a url")).toThrow(GitHubURLError);
    });

    it("throws INVALID_URL for non-.md file paths", () => {
      expect(() =>
        parseGitHubURL("https://github.com/owner/repo/blob/main/file.js")
      ).toThrow(GitHubURLError);
    });

    it("handles URLs with trailing slashes", () => {
      const result = parseGitHubURL("https://github.com/owner/repo/");

      expect(result.owner).toBe("owner");
      expect(result.repo).toBe("repo");
    });
  });

  describe("constructFetchURL", () => {
    it("constructs URL for default card path", () => {
      const parsed = {
        owner: "octocat",
        repo: "hello-world",
        ref: null,
        path: null,
        isFilePath: false,
      };

      const url = constructFetchURL(parsed, "main");

      expect(url).toBe(
        "https://raw.githubusercontent.com/octocat/hello-world/main/.ishipped/card.md"
      );
    });

    it("constructs URL for custom file path", () => {
      const parsed = {
        owner: "octocat",
        repo: "hello-world",
        ref: "main",
        path: "docs/card.md",
        isFilePath: true,
      };

      const url = constructFetchURL(parsed, "main");

      expect(url).toBe(
        "https://raw.githubusercontent.com/octocat/hello-world/main/docs/card.md"
      );
    });
  });

  describe("getDefaultBranch", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns default branch from API", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ default_branch: "main" }),
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      const branch = await getDefaultBranch("owner", "repo");

      expect(branch).toBe("main");
      expect(fetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/owner/repo",
        expect.any(Object)
      );
    });

    it("returns 'main' when default_branch is not set", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      const branch = await getDefaultBranch("owner", "newrepo");

      expect(branch).toBe("main");
    });

    it("throws PRIVATE_REPO on 404", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(getDefaultBranch("owner", "private")).rejects.toThrow(
        "PRIVATE_REPO"
      );
    });

    it("throws RATE_LIMITED on 403 with rate limit header", async () => {
      const headers = new Headers();
      headers.set("X-RateLimit-Remaining", "0");

      const mockResponse = {
        ok: false,
        status: 403,
        headers,
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(getDefaultBranch("owner", "ratelimited")).rejects.toThrow(
        "RATE_LIMITED"
      );
    });

    it("throws PRIVATE_REPO on 403 without rate limit", async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(getDefaultBranch("owner", "forbidden")).rejects.toThrow(
        "PRIVATE_REPO"
      );
    });

    it("throws FETCH_FAILED on other errors", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(getDefaultBranch("owner", "error")).rejects.toThrow(
        "FETCH_FAILED"
      );
    });
  });

  describe("fetchCardContent", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns content on success", async () => {
      const cardContent = "---\ntitle: Test\n---\nBody";
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve(cardContent),
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      const content = await fetchCardContent(
        "https://raw.githubusercontent.com/owner/repo/main/.ishipped/card.md"
      );

      expect(content).toBe(cardContent);
    });

    it("throws CARD_NOT_FOUND on 404", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(
        fetchCardContent("https://raw.githubusercontent.com/owner/repo/main/.ishipped/card.md")
      ).rejects.toThrow("CARD_NOT_FOUND");
    });

    it("throws RATE_LIMITED on 403 with rate limit", async () => {
      const headers = new Headers();
      headers.set("X-RateLimit-Remaining", "0");

      const mockResponse = {
        ok: false,
        status: 403,
        headers,
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(
        fetchCardContent("https://raw.githubusercontent.com/owner/repo/main/.ishipped/card.md")
      ).rejects.toThrow("RATE_LIMITED");
    });

    it("throws PRIVATE_REPO on 403 without rate limit", async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(
        fetchCardContent("https://raw.githubusercontent.com/owner/repo/main/.ishipped/card.md")
      ).rejects.toThrow("PRIVATE_REPO");
    });

    it("throws FETCH_FAILED on other errors", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: new Headers(),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      await expect(
        fetchCardContent("https://raw.githubusercontent.com/owner/repo/main/.ishipped/card.md")
      ).rejects.toThrow("FETCH_FAILED");
    });
  });

  describe("getRepoMetadata", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns metadata on success", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            stargazers_count: 100,
            license: { spdx_id: "MIT" },
            description: "A test repo",
          }),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      const metadata = await getRepoMetadata("owner", "repo");

      expect(metadata).toEqual({
        stars: 100,
        license: "MIT",
        description: "A test repo",
      });
    });

    it("returns defaults when license is null", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            stargazers_count: 50,
            license: null,
            description: null,
          }),
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      const metadata = await getRepoMetadata("owner", "repo");

      expect(metadata).toEqual({
        stars: 50,
        license: null,
        description: null,
      });
    });

    it("returns defaults on error", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        mockResponse as unknown as Response
      );

      const metadata = await getRepoMetadata("owner", "nonexistent");

      expect(metadata).toEqual({
        stars: 0,
        license: null,
        description: null,
      });
    });

    it("returns defaults on fetch exception", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const metadata = await getRepoMetadata("owner", "repo");

      expect(metadata).toEqual({
        stars: 0,
        license: null,
        description: null,
      });
    });
  });
});
