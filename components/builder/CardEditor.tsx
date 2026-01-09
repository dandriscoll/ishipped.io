"use client";

import { useMemo } from "react";
import {
  type BuilderState,
  type ValidationError,
  getFieldError,
} from "@/lib/builderValidation";
import { FieldEditor } from "./FieldEditor";
import { TagEditor } from "./TagEditor";
import { LinkEditor } from "./LinkEditor";
import { AuthorEditor } from "./AuthorEditor";
import { MarkdownEditor } from "./MarkdownEditor";

type BuilderAction =
  | { type: "SET_FIELD"; field: keyof BuilderState; value: string }
  | { type: "SET_TAGS"; tags: string[] }
  | { type: "SET_LINKS"; links: BuilderState["links"] }
  | { type: "SET_AUTHOR_FIELD"; field: keyof BuilderState["author"]; value: string };

interface CardEditorProps {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  errors: ValidationError[];
}

export function CardEditor({ state, dispatch, errors }: CardEditorProps) {
  // Build a map of link errors for the LinkEditor
  const linkErrors = useMemo(() => {
    const map = new Map<string, string>();
    errors.forEach((e) => {
      if (e.field.startsWith("links[")) {
        map.set(e.field, e.message);
      }
    });
    return map;
  }, [errors]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Card Details
      </h2>

      {/* Title */}
      <FieldEditor
        label="Title *"
        value={state.title}
        onChange={(value) => dispatch({ type: "SET_FIELD", field: "title", value })}
        error={getFieldError(errors, "title")}
        placeholder="My Awesome Project"
        maxLength={100}
      />

      {/* Summary */}
      <FieldEditor
        label="Summary"
        value={state.summary}
        onChange={(value) => dispatch({ type: "SET_FIELD", field: "summary", value })}
        error={getFieldError(errors, "summary")}
        placeholder="A brief description of your project"
        multiline
        rows={2}
        maxLength={280}
      />

      {/* Hero Image */}
      <FieldEditor
        label="Hero Image URL"
        value={state.hero}
        onChange={(value) => dispatch({ type: "SET_FIELD", field: "hero", value })}
        error={getFieldError(errors, "hero")}
        placeholder="https://raw.githubusercontent.com/..."
        type="url"
        hint="Allowed hosts: raw.githubusercontent.com, i.imgur.com"
      />

      {/* Version and Shipped Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldEditor
          label="Version"
          value={state.version}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "version", value })}
          error={getFieldError(errors, "version")}
          placeholder="v1.0.0"
          maxLength={20}
        />
        <FieldEditor
          label="Shipped Date"
          value={state.shipped}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "shipped", value })}
          error={getFieldError(errors, "shipped")}
          placeholder="2024-01-15"
          hint="Format: YYYY-MM-DD"
        />
      </div>

      {/* Tags */}
      <TagEditor
        tags={state.tags}
        onChange={(tags) => dispatch({ type: "SET_TAGS", tags })}
        error={getFieldError(errors, "tags")}
      />

      {/* Links */}
      <LinkEditor
        links={state.links}
        onChange={(links) => dispatch({ type: "SET_LINKS", links })}
        errors={linkErrors}
      />

      {/* Author */}
      <AuthorEditor
        author={state.author}
        onChange={(field, value) =>
          dispatch({ type: "SET_AUTHOR_FIELD", field, value })
        }
        errors={errors}
      />

      {/* Body */}
      <MarkdownEditor
        value={state.body}
        onChange={(value) => dispatch({ type: "SET_FIELD", field: "body", value })}
      />
    </div>
  );
}
