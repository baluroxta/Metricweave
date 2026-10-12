"use client";

import { use } from "react";
import { createHighlighter } from "shiki/bundle/web";
import { useTheme } from "next-themes";

const highlighterPromise = createHighlighter({
  langs: [
    "html",
    "css",
    "js",
    "graphql",
    "javascript",
    "json",
    "jsx",
    "markdown",
    "md",
    "mdx",
    "plaintext",
    "py",
    "python",
    "sh",
    "shell",
    "sql",
    "text",
    "ts",
    "tsx",
    "txt",
    "typescript",
    "zsh",
  ],
  themes: ["github-light-default", "github-dark-default"],
});

export default function SyntaxHighlighter({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const { theme } = useTheme();
  const highlighter = use(highlighterPromise);
  
  const selectedTheme = theme === "light" ? "github-light-default" : "github-dark-default";
  
  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: selectedTheme,
  });

  return (
    <div className="p-4 text-sm bg-background text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
