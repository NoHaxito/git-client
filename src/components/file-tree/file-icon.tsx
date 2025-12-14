import {
  Biome,
  BracketsBlue,
  BracketsYellow,
  CLang,
  Clojure,
  CodeOrange,
  Cplus,
  Dart,
  Docker,
  Document,
  Elixir,
  Erlang,
  Exe,
  Git,
  Go,
  Graphql,
  Haskell,
  Java,
  Js,
  Kotlin,
  Lock,
  Lua,
  Markdown,
  Next,
  Node,
  Nuxt,
  Perl,
  PHP,
  PNPM,
  Python,
  R,
  Reactjs,
  Reactts,
  Ruby,
  Rust,
  Sass,
  Scala,
  Shell,
  Svelte,
  Swift,
  Tailwind,
  Tsconfig,
  TsTypes,
  TypeScript,
  Vite,
  Vue,
  XML,
  Yaml,
  Yarn,
} from "@react-symbols/icons";
import type { FC, SVGProps } from "react";

type FileIconComponent = FC<SVGProps<SVGSVGElement>>;

const EXTENSION_REGEX = /\.[^.]*$/;
const DOT_REGEX = /\./g;

const FILE_NAME_MAP: Record<string, FileIconComponent> = {
  "tsconfig.json": Tsconfig,
  "jsconfig.json": Js,
  "package.json": Node,
  "package-lock.json": Node,
  "yarn.lock": Yarn,
  "pnpm-lock.yaml": PNPM,
  ".gitignore": Git,
  ".gitattributes": Git,
  ".eslintrc": Js,
  ".eslintrc.json": Js,
  ".eslintrc.js": Js,
  ".eslintrc.cjs": Js,
  ".eslintrc.mjs": Js,
  ".prettierrc": Js,
  ".prettierrc.json": BracketsYellow,
  ".prettierrc.js": Js,
  "biome.json": Biome,
  "biome.jsonc": Biome,
  ".babelrc": Js,
  ".babelrc.json": BracketsYellow,
  ".babelrc.js": Js,
  "webpack.config.js": Js,
  "webpack.config.ts": TypeScript,
  "vite.config.js": Vite,
  "vite.config.ts": Vite,
  "vite.config.mjs": Vite,
  "next.config.js": Next,
  "next.config.ts": Next,
  "next.config.mjs": Next,
  "nuxt.config.js": Nuxt,
  "nuxt.config.ts": Nuxt,
  dockerfile: Docker,
  "docker-compose.yml": Yaml,
  "docker-compose.yaml": Yaml,
  readme: Markdown,
  "readme.md": Markdown,
  makefile: Shell,
  ".env": Document,
  ".env.local": Document,
  ".env.production": Document,
  ".env.development": Document,
  ".env.test": Document,
  "tailwind.config.js": Tailwind,
  "tailwind.config.ts": Tailwind,
};

const EXTENSION_MAP: Record<string, FileIconComponent> = {
  js: Js,
  mjs: Js,
  jsx: Reactjs,
  ts: TypeScript,
  tsx: Reactts,
  "d.ts": TsTypes,
  json: BracketsYellow,
  css: BracketsBlue,
  scss: Sass,
  sass: Sass,
  html: CodeOrange,
  htm: Document,
  md: Markdown,
  mdx: Markdown,
  yml: Yaml,
  yaml: Yaml,
  xml: XML,
  lock: Lock,
  gitignore: Git,
  rs: Rust,
  py: Python,
  java: Java,
  c: CLang,
  cpp: Cplus,
  cc: Cplus,
  cxx: Cplus,
  go: Go,
  php: PHP,
  rb: Ruby,
  vue: Vue,
  svelte: Svelte,
  dart: Dart,
  swift: Swift,
  kt: Kotlin,
  kts: Kotlin,
  sh: Shell,
  bash: Shell,
  zsh: Shell,
  dockerfile: Docker,
  sql: Document,
  graphql: Graphql,
  gql: Graphql,
  r: R,
  scala: Scala,
  clj: Clojure,
  cljs: Clojure,
  hs: Haskell,
  ex: Elixir,
  exs: Elixir,
  erl: Erlang,
  hrl: Erlang,
  lua: Lua,
  pl: Perl,
  exe: Exe,
};

const COMPOSITE_EXTENSIONS = [".d.ts"];

function getExtension(fileName: string): string {
  const lowerFileName = fileName.toLowerCase();

  for (const compositeExt of COMPOSITE_EXTENSIONS) {
    if (lowerFileName.endsWith(compositeExt)) {
      return compositeExt.slice(1);
    }
  }

  const parts = fileName.split(".");
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() || "" : "";
}

function getFileNameVariants(fileName: string): string[] {
  const lowerFileName = fileName.toLowerCase();
  const variants: string[] = [lowerFileName];

  const nameWithoutExt = lowerFileName.replace(EXTENSION_REGEX, "");
  if (nameWithoutExt !== lowerFileName) {
    variants.push(nameWithoutExt);
  }

  const nameWithoutDots = lowerFileName.replace(DOT_REGEX, "");
  if (nameWithoutDots !== lowerFileName) {
    variants.push(nameWithoutDots);
  }

  return variants;
}

export function getFileIcon(fileName: string): FileIconComponent {
  const variants = getFileNameVariants(fileName);

  for (const variant of variants) {
    if (FILE_NAME_MAP[variant]) {
      return FILE_NAME_MAP[variant];
    }
  }

  const extension = getExtension(fileName);
  if (extension && EXTENSION_MAP[extension]) {
    return EXTENSION_MAP[extension];
  }

  return Document;
}
