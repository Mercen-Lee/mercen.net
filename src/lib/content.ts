import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked, Renderer } from 'marked';
import type { Locale } from './i18n';

const ASSETS_ROOT = path.resolve(process.cwd(), 'assets');

const curatedProjectTitles = [
  'NextGen',
  'BL Agent',
  'WHOFA',
  'Interactor',
  'Toongether',
  'DodamDodam',
  'Love & Code',
  'Allermi',
  'Tamaloid',
  'AMAZE Paint',
  'App Pilot',
  'Allergist',
  'Desktop Fushi',
  'Windows 11 for Galaxy Tab 6 Lite',
  'FlowKit',
  'Story',
] as const;

export type LinkItem = {
  label: string;
  url: string;
};

export type ReferenceChip = {
  id: string;
  href: string;
  label: string;
  meta?: string;
  type: ReferenceType;
};

export type ReferenceType = 'education' | 'career' | 'award' | 'license' | 'project';

export type StackBadge = {
  name: string;
  category?: string;
  aliases: string[];
  icon?: string;
  badge?: {
    background: string;
    foreground: string;
  };
  link?: string;
};

export type EducationItem = {
  id: string;
  index: number;
  name: string;
  logoImage?: string;
  role?: string;
  period?: string;
  description?: string;
  descriptionHtml?: string;
  highlights?: string[];
  highlightsHtml?: string[];
  references: ReferenceChip[];
};

export type CareerItem = {
  id: string;
  index: number;
  company: string;
  display_name?: string;
  role: string;
  period: string;
  locations?: string[];
  description?: string;
  descriptionHtml?: string;
  responsibilities?: string[];
  responsibilitiesHtml?: string[];
  highlights?: string[];
  highlightsHtml?: string[];
  tech_stacks?: string[];
  stacks: StackBadge[];
  references: ReferenceChip[];
};

export type AwardItem = {
  id: string;
  index: number;
  name: string;
  level?: string;
  date: string;
  references: ReferenceChip[];
  featured: boolean;
};

export type LicenseItem = {
  id: string;
  index: number;
  name: string;
  level?: string;
  score?: string;
  date: string;
  issuer?: string;
  references: ReferenceChip[];
};

export type ProjectItem = {
  id: string;
  slug: string;
  sourcePath: string;
  kind: ProjectKind;
  title: string;
  description?: string;
  descriptionHtml?: string;
  period?: string;
  team?: string;
  award?: string;
  sourceCode?: string;
  meta: ProjectMetaItem[];
  links: LinkItem[];
  stacks: StackBadge[];
  references: ReferenceChip[];
  html: string;
  htmlBeforeProblemSolutions: string;
  htmlAfterProblemSolutions: string;
  problemSolutions: ProjectProblemSolution[];
  order: number;
  logoImage?: string;
  mockupImage?: string;
  mockupImages: string[];
};

export type ProjectKind = 'company' | 'team' | 'personal';

export type ProjectMetaItem = {
  kind: 'period' | 'team' | 'award';
  value: string;
  href?: string;
  type?: ReferenceType;
};

export type ProjectProblemSolution = {
  problemHtml: string;
  solutionHtml: string;
};

export type MainInfo = {
  id: string;
  name: string;
  email?: string;
  github?: string;
  linkedin?: string;
  birth_date?: string;
  html: string;
};

export type PortfolioData = {
  main: MainInfo;
  educations: EducationItem[];
  careers: CareerItem[];
  awards: AwardItem[];
  featuredAwards: AwardItem[];
  projects: ProjectItem[];
  licenses: LicenseItem[];
};

type RawProject = {
  sourcePath: string;
  body: string;
  data: Record<string, unknown>;
};

type TargetRecord = {
  id: string;
  type: ReferenceType;
  label: string;
  meta?: string;
  key: string;
};

type ParsedReference = {
  normalizedPath: string;
  pointer?: string;
  key: string;
};

type ProjectMarkdownSections = {
  beforeProblemSolutions: string;
  afterProblemSolutions: string;
  problemSolutions: RawProjectProblemSolution[];
};

type RawProjectProblemSolution = {
  problem: string;
  solution: string;
};

const marked = new Marked({
  gfm: true,
  breaks: false,
});

export async function loadPortfolio(locale: Locale = 'ko'): Promise<PortfolioData> {
  const contentRoot = locale === 'ko' ? ASSETS_ROOT : path.join(ASSETS_ROOT, 'locales', locale);
  const [mainMarkdown, educationsRaw, careersRaw, awardsRaw, licensesRaw, techStacksRaw, projectsRaw] =
    await Promise.all([
      readMarkdown('main.md', contentRoot),
      readJson<Record<string, unknown>[]>('educations.json', contentRoot),
      readJson<Record<string, unknown>[]>('career.json', contentRoot),
      readJson<Record<string, unknown>[]>('awards.json', contentRoot),
      readJson<Record<string, unknown>[]>('licenses.json', contentRoot),
      readJson<{ stacks: StackBadge[] }>('tech_stacks.json', ASSETS_ROOT),
      readProjects(contentRoot),
    ]);

  const mainMatter = matter(mainMarkdown);
  const stackResolver = createStackResolver(techStacksRaw.stacks ?? []);
  const registry = buildRegistry(educationsRaw, careersRaw, awardsRaw, licensesRaw, projectsRaw);
  const errors: string[] = [];

  validateStructuredReferences(mainMatter.data, 'main.md', registry, errors);
  for (const [index, item] of educationsRaw.entries()) validateStructuredReferences(item, 'educations.json', registry, errors, `educations.json#/${index}`);
  for (const [index, item] of careersRaw.entries()) validateStructuredReferences(item, 'career.json', registry, errors, `career.json#/${index}`);
  for (const [index, item] of awardsRaw.entries()) validateStructuredReferences(item, 'awards.json', registry, errors, `awards.json#/${index}`);
  for (const [index, item] of licensesRaw.entries()) validateStructuredReferences(item, 'licenses.json', registry, errors, `licenses.json#/${index}`);
  for (const project of projectsRaw) validateStructuredReferences(project.data, project.sourcePath, registry, errors, project.sourcePath);

  const referencedAwardKeys = new Set(
    collectReferenceStrings(mainMatter.data)
      .map((value) => parseReference(value, 'main.md'))
      .filter((ref): ref is ParsedReference => Boolean(ref && ref.normalizedPath === 'awards.json' && ref.pointer))
      .map((ref) => ref.key),
  );

  const mainName = extractFirstHeading(mainMatter.content) ?? (locale === 'en' ? 'Seokho Lee' : '이석호');
  const main: MainInfo = {
    id: 'intro',
    name: mainName,
    email: asString(mainMatter.data.email),
    github: asString(mainMatter.data.github),
    linkedin: asString(mainMatter.data.linkedin),
    birth_date: asString(mainMatter.data.birth_date),
    html: renderMarkdown(stripFirstHeading(mainMatter.content), 'main.md', registry, errors),
  };

  const educations = educationsRaw
    .map<EducationItem>((item, index) => ({
      id: `education-${index}`,
      index,
      name: requiredString(item.name, `educations.json#/${index}.name`),
      logoImage: asAssetImagePath(item.logo_image, 'educations.json'),
      role: asString(item.role),
      period: asString(item.period),
      description: asString(item.description),
      descriptionHtml: renderInlineIfPresent(asString(item.description), 'educations.json', registry, errors),
      highlights: asStringArray(item.highlights),
      highlightsHtml: asStringArray(item.highlights).map((value) => renderMarkdownInline(value, 'educations.json', registry, errors)),
      references: createReferenceChips(item, 'educations.json', registry, `education-${index}`),
    }))
    .sort(comparePeriodDescending);

  const careers = careersRaw
    .map<CareerItem>((item, index) => ({
      id: `career-${index}`,
      index,
      company: requiredString(item.company, `career.json#/${index}.company`),
      display_name: asString(item.display_name),
      role: requiredString(item.role, `career.json#/${index}.role`),
      period: requiredString(item.period, `career.json#/${index}.period`),
      locations: asStringArray(item.locations),
      description: asString(item.description),
      descriptionHtml: renderInlineIfPresent(asString(item.description), 'career.json', registry, errors),
      responsibilities: asStringArray(item.responsibilities),
      responsibilitiesHtml: asStringArray(item.responsibilities).map((value) => renderMarkdownInline(value, 'career.json', registry, errors)),
      highlights: asStringArray(item.highlights),
      highlightsHtml: asStringArray(item.highlights).map((value) => renderMarkdownInline(value, 'career.json', registry, errors)),
      tech_stacks: asStringArray(item.tech_stacks),
      stacks: resolveStacks(asStringArray(item.tech_stacks), stackResolver),
      references: createReferenceChips(item, 'career.json', registry, `career-${index}`),
    }))
    .sort(comparePeriodDescending);

  const awards = awardsRaw
    .map<AwardItem>((item, index) => {
      const key = `awards.json#/${index}`;
      return {
        id: `award-${index}`,
        index,
        name: requiredString(item.name, `${key}.name`),
        level: asString(item.level),
        date: requiredString(item.date, `${key}.date`),
        references: createReferenceChips(item, 'awards.json', registry, `award-${index}`),
        featured: referencedAwardKeys.has(key),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const licenses = licensesRaw
    .map<LicenseItem>((item, index) => ({
      id: `license-${index}`,
      index,
      name: requiredString(item.name, `licenses.json#/${index}.name`),
      level: asString(item.level),
      score: asString(item.score),
      date: requiredString(item.date, `licenses.json#/${index}.date`),
      issuer: asString(item.issuer),
      references: createReferenceChips(item, 'licenses.json', registry, `license-${index}`),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const projects = projectsRaw
    .map<ProjectItem>((project) => {
      const slug = projectSlugFromPath(project.sourcePath);
      const techStackNames = asStringArray(project.data.tech_stacks);
      const currentId = `project-${slug}`;
      const period = asString(project.data.period);
      const team = asString(project.data.team);
      const award = asString(project.data.award);
      const projectMarkdown = stripFirstHeading(project.body);
      const projectSections = extractProjectProblemSolutions(projectMarkdown, project.sourcePath, errors, locale);
      const htmlBeforeProblemSolutions = renderMarkdownIfPresent(
        projectSections.beforeProblemSolutions,
        project.sourcePath,
        registry,
        errors,
      );
      const htmlAfterProblemSolutions = renderMarkdownIfPresent(
        projectSections.afterProblemSolutions,
        project.sourcePath,
        registry,
        errors,
      );

      return {
        id: currentId,
        slug,
        sourcePath: project.sourcePath,
        kind: projectKind(project.data, project.sourcePath, errors),
        title: requiredString(project.data.title, `${project.sourcePath}.title`),
        description: asString(project.data.description),
        descriptionHtml: renderInlineIfPresent(asString(project.data.description), project.sourcePath, registry, errors),
        period,
        team,
        award,
        sourceCode: asString(project.data.source_code),
        meta: createProjectMeta(project.data, project.sourcePath, registry, currentId, { period, team, award }),
        links: asLinks(project.data.links),
        stacks: resolveStacks(techStackNames, stackResolver),
        references: createReferenceChips(project.data, project.sourcePath, registry, currentId),
        html: [htmlBeforeProblemSolutions, htmlAfterProblemSolutions].filter(Boolean).join('\n'),
        htmlBeforeProblemSolutions,
        htmlAfterProblemSolutions,
        problemSolutions: projectSections.problemSolutions.map((item) => ({
          problemHtml: renderMarkdownInline(item.problem, project.sourcePath, registry, errors),
          solutionHtml: renderMarkdownInline(item.solution, project.sourcePath, registry, errors),
        })),
        order: projectOrder(requiredString(project.data.title, `${project.sourcePath}.title`)),
        logoImage: asAssetImagePath(project.data.logo_image, project.sourcePath),
        mockupImage: asString(project.data.mockup_image),
        mockupImages: [asString(project.data.mockup_image), ...asStringArray(project.data.mockup_images)].filter(
          (item): item is string => Boolean(item),
        ),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  if (errors.length > 0) {
    throw new Error(`Invalid asset references:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }

  return {
    main,
    educations,
    careers,
    awards,
    featuredAwards: awards.filter((award) => award.featured),
    projects,
    licenses,
  };
}

function buildRegistry(
  educations: Record<string, unknown>[],
  careers: Record<string, unknown>[],
  awards: Record<string, unknown>[],
  licenses: Record<string, unknown>[],
  projects: RawProject[],
): Map<string, TargetRecord> {
  const registry = new Map<string, TargetRecord>();

  for (const [index, item] of educations.entries()) {
    registry.set(`educations.json#/${index}`, {
      id: `education-${index}`,
      type: 'education',
      label: requiredString(item.name, `educations.json#/${index}.name`),
      meta: asString(item.period),
      key: `educations.json#/${index}`,
    });
  }

  for (const [index, item] of careers.entries()) {
    registry.set(`career.json#/${index}`, {
      id: `career-${index}`,
      type: 'career',
      label: asString(item.display_name) ?? requiredString(item.company, `career.json#/${index}.company`),
      meta: asString(item.role),
      key: `career.json#/${index}`,
    });
  }

  for (const [index, item] of awards.entries()) {
    registry.set(`awards.json#/${index}`, {
      id: `award-${index}`,
      type: 'award',
      label: requiredString(item.name, `awards.json#/${index}.name`),
      meta: [asString(item.level), asString(item.date)].filter(Boolean).join(' · '),
      key: `awards.json#/${index}`,
    });
  }

  for (const [index, item] of licenses.entries()) {
    registry.set(`licenses.json#/${index}`, {
      id: `license-${index}`,
      type: 'license',
      label: requiredString(item.name, `licenses.json#/${index}.name`),
      meta: [asString(item.level) ?? asString(item.score), asString(item.issuer)].filter(Boolean).join(' · '),
      key: `licenses.json#/${index}`,
    });
  }

  for (const project of projects) {
    const slug = projectSlugFromPath(project.sourcePath);
    registry.set(project.sourcePath, {
      id: `project-${slug}`,
      type: 'project',
      label: requiredString(project.data.title, `${project.sourcePath}.title`),
      meta: asString(project.data.period),
      key: project.sourcePath,
    });
  }

  return registry;
}

function renderMarkdown(
  markdown: string,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  errors: string[],
): string {
  return marked.parse(markdown, {
    renderer: createMarkdownRenderer(sourcePath, registry, errors),
    async: false,
  }) as string;
}

function renderMarkdownIfPresent(
  markdown: string,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  errors: string[],
): string {
  const trimmed = markdown.trim();
  return trimmed ? renderMarkdown(trimmed, sourcePath, registry, errors) : '';
}

function renderMarkdownInline(
  markdown: string,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  errors: string[],
): string {
  return marked.parseInline(markdown, {
    renderer: createMarkdownRenderer(sourcePath, registry, errors),
    async: false,
  }) as string;
}

function renderInlineIfPresent(
  markdown: string | undefined,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  errors: string[],
): string | undefined {
  return markdown ? renderMarkdownInline(markdown, sourcePath, registry, errors) : undefined;
}

function createMarkdownRenderer(
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  errors: string[],
): Renderer {
  const renderer = new Renderer();

  renderer.link = function link(token) {
    const href = token.href ?? '';
    const text = this.parser.parseInline(token.tokens);
    const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
    const resolvedHref = resolveHref(href, sourcePath, registry, errors);

    if (isExternalHref(resolvedHref)) {
      return `<a href="${escapeHtml(resolvedHref)}"${title} target="_blank" rel="noreferrer">${text}</a>`;
    }

    return `<a href="${escapeHtml(resolvedHref)}"${title} data-reference-link>${text}</a>`;
  };

  return renderer;
}

function extractProjectProblemSolutions(
  markdown: string,
  sourcePath: string,
  errors: string[],
  locale: Locale,
): ProjectMarkdownSections {
  const syntax = projectProblemSolutionSyntax(locale);
  const headingMatch = new RegExp(`^##\\s+${escapeRegExp(syntax.heading)}\\s*$`, 'm').exec(markdown);

  if (!headingMatch) {
    return {
      beforeProblemSolutions: markdown,
      afterProblemSolutions: '',
      problemSolutions: [],
    };
  }

  const beforeProblemSolutions = markdown.slice(0, headingMatch.index).trim();
  const afterHeading = markdown.slice(headingMatch.index + headingMatch[0].length);
  const nextHeadingMatch = /^##\s+/m.exec(afterHeading);
  const rawProblemSolutions = nextHeadingMatch ? afterHeading.slice(0, nextHeadingMatch.index) : afterHeading;
  const afterProblemSolutions = nextHeadingMatch ? afterHeading.slice(nextHeadingMatch.index).trim() : '';

  return {
    beforeProblemSolutions,
    afterProblemSolutions,
    problemSolutions: parseProjectProblemSolutions(rawProblemSolutions, sourcePath, errors, syntax),
  };
}

function parseProjectProblemSolutions(
  markdown: string,
  sourcePath: string,
  errors: string[],
  syntax: { heading: string; problem: string; solution: string },
): RawProjectProblemSolution[] {
  const problemSolutions: RawProjectProblemSolution[] = [];
  let pendingProblem: string | undefined;
  const problemPattern = new RegExp(`^\\s*-\\s*${escapeRegExp(syntax.problem)}:\\s*(.+)\\s*$`);
  const solutionPattern = new RegExp(`^\\s*-\\s*${escapeRegExp(syntax.solution)}:\\s*(.+)\\s*$`);

  for (const [index, line] of markdown.trim().split(/\r?\n/).entries()) {
    const problemMatch = line.match(problemPattern);
    if (problemMatch) {
      if (pendingProblem) {
        errors.push(`${sourcePath}: problem without solution before line ${index + 1} in "${syntax.heading}" section`);
      }
      pendingProblem = problemMatch[1].trim();
      continue;
    }

    const solutionMatch = line.match(solutionPattern);
    if (solutionMatch) {
      if (!pendingProblem) {
        errors.push(`${sourcePath}: solution without problem at line ${index + 1} in "${syntax.heading}" section`);
        continue;
      }

      problemSolutions.push({
        problem: pendingProblem,
        solution: solutionMatch[1].trim(),
      });
      pendingProblem = undefined;
      continue;
    }

    if (line.trim().length === 0) continue;

    errors.push(`${sourcePath}: unsupported line at ${index + 1} in "${syntax.heading}" section`);
  }

  if (pendingProblem) {
    errors.push(`${sourcePath}: problem without solution at end of "${syntax.heading}" section`);
  }

  return problemSolutions;
}

function projectProblemSolutionSyntax(locale: Locale): { heading: string; problem: string; solution: string } {
  return locale === 'en'
    ? { heading: 'Problems and Solutions', problem: 'Problem', solution: 'Solution' }
    : { heading: '문제와 해결', problem: '문제', solution: '해결' };
}

function resolveHref(href: string, sourcePath: string, registry: Map<string, TargetRecord>, errors: string[]): string {
  if (!href || href.startsWith('#') || isExternalHref(href)) return href;

  const reference = parseReference(href, sourcePath);
  if (!reference) return href;

  const target = registry.get(reference.key);
  if (!target) {
    errors.push(`${sourcePath}: unresolved Markdown link "${href}"`);
    return href;
  }

  return `#${target.id}`;
}

function validateStructuredReferences(
  value: unknown,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  errors: string[],
  label = sourcePath,
): void {
  for (const ref of collectReferenceStrings(value)) {
    const parsed = parseReference(ref, sourcePath);
    if (!parsed) continue;

    if (parsed.normalizedPath.startsWith('images/') || isImageAssetPath(parsed.normalizedPath)) {
      continue;
    }

    if (!registry.has(parsed.key)) {
      errors.push(`${label}: unresolved structured reference "${ref}"`);
    }
  }
}

function createReferenceChips(
  value: unknown,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  currentId: string,
): ReferenceChip[] {
  const seen = new Set<string>();
  const chips: ReferenceChip[] = [];

  for (const ref of collectReferenceStrings(value)) {
    const parsed = parseReference(ref, sourcePath);
    if (!parsed) continue;
    const target = registry.get(parsed.key);
    if (!target || target.id === currentId || seen.has(target.id)) continue;

    chips.push({
      id: target.id,
      href: `#${target.id}`,
      label: target.label,
      meta: target.meta,
      type: target.type,
    });
    seen.add(target.id);
  }

  return chips;
}

function createProjectMeta(
  data: Record<string, unknown>,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  currentId: string,
  values: Pick<ProjectItem, 'period' | 'team' | 'award'>,
): ProjectMetaItem[] {
  const meta: ProjectMetaItem[] = [];

  if (values.period) meta.push({ kind: 'period', value: values.period });
  if (values.team) {
    meta.push({
      kind: 'team',
      value: values.team,
      ...resolveMetaReference(data.team_ref ?? data.career_ref, sourcePath, registry, currentId),
    });
  }
  if (values.award) {
    meta.push({
      kind: 'award',
      value: values.award,
      ...resolveMetaReference(data.award_ref, sourcePath, registry, currentId),
    });
  }
  return meta;
}

function resolveMetaReference(
  rawReference: unknown,
  sourcePath: string,
  registry: Map<string, TargetRecord>,
  currentId: string,
): Pick<ProjectMetaItem, 'href' | 'type'> {
  const reference = asString(rawReference);
  if (!reference) return {};

  const parsed = parseReference(reference, sourcePath);
  if (!parsed) return {};

  const target = registry.get(parsed.key);
  if (!target || target.id === currentId) return {};

  return {
    href: `#${target.id}`,
    type: target.type,
  };
}

function collectReferenceStrings(value: unknown): string[] {
  const refs: string[] = [];

  function visit(current: unknown): void {
    if (typeof current === 'string') {
      if (current.startsWith('./') || current.startsWith('../')) refs.push(current);
      return;
    }

    if (Array.isArray(current)) {
      for (const item of current) visit(item);
      return;
    }

    if (current && typeof current === 'object') {
      for (const item of Object.values(current as Record<string, unknown>)) visit(item);
    }
  }

  visit(value);
  return refs;
}

function parseReference(rawReference: string, sourcePath: string): ParsedReference | null {
  if (!rawReference.startsWith('./') && !rawReference.startsWith('../')) return null;

  const [pathPart, hashPart] = rawReference.split('#');
  const sourceDir = path.posix.dirname(sourcePath);
  const baseDir = sourceDir === '.' ? '' : sourceDir;
  const normalizedPath = normalizeAssetPath(path.posix.join(baseDir, pathPart));
  const pointer = hashPart?.startsWith('/') ? hashPart : undefined;
  const key = pointer ? `${normalizedPath}#${pointer}` : normalizedPath;

  return { normalizedPath, pointer, key };
}

function normalizeAssetPath(value: string): string {
  return path.posix
    .normalize(value)
    .replace(/^\/+/, '')
    .replace(/^\.\//, '');
}

function asAssetImagePath(value: unknown, sourcePath: string): string | undefined {
  const rawValue = asString(value);
  if (!rawValue) return undefined;

  const reference = parseReference(rawValue, sourcePath);
  return normalizeAssetPath(reference?.normalizedPath ?? rawValue);
}

function createStackResolver(stacks: StackBadge[]): Map<string, StackBadge> {
  const resolver = new Map<string, StackBadge>();

  for (const stack of stacks) {
    resolver.set(stack.name.toLowerCase(), normalizeStack(stack));
    for (const alias of stack.aliases ?? []) {
      resolver.set(alias.toLowerCase(), normalizeStack(stack));
    }
  }

  return resolver;
}

function resolveStacks(names: string[], resolver: Map<string, StackBadge>): StackBadge[] {
  return names.map((name) => resolver.get(name.toLowerCase()) ?? { name, aliases: [] });
}

function normalizeStack(stack: StackBadge): StackBadge {
  return {
    ...stack,
    aliases: stack.aliases ?? [],
  };
}

async function readProjects(contentRoot: string): Promise<RawProject[]> {
  const projectPaths = await listMarkdownFiles(path.join(contentRoot, 'projects'));

  return Promise.all(
    projectPaths.map(async (absolutePath) => {
      const sourcePath = normalizeAssetPath(path.relative(contentRoot, absolutePath).split(path.sep).join(path.posix.sep));
      const file = matter(await fs.readFile(absolutePath, 'utf8'));

      return {
        sourcePath,
        body: file.content,
        data: file.data,
      };
    }),
  );
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(absolutePath);
      if (entry.isFile() && entry.name.endsWith('.md')) return [absolutePath];
      return [];
    }),
  );

  return files.flat();
}

async function readMarkdown(relativePath: string, contentRoot: string): Promise<string> {
  return fs.readFile(path.join(contentRoot, relativePath), 'utf8');
}

async function readJson<T>(relativePath: string, contentRoot: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(contentRoot, relativePath), 'utf8')) as T;
}

function comparePeriodDescending<T extends { index: number; period?: string }>(a: T, b: T): number {
  const periodOrder = comparePeriodKey(periodSortKey(b.period), periodSortKey(a.period));
  return periodOrder || a.index - b.index;
}

function comparePeriodKey(a: PeriodSortKey, b: PeriodSortKey): number {
  return comparePeriodValue(a.end, b.end) || comparePeriodValue(a.start, b.start);
}

function comparePeriodValue(a: number, b: number): number {
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

type PeriodSortKey = {
  start: number;
  end: number;
};

function periodSortKey(period: string | undefined): PeriodSortKey {
  if (!period) return { start: 0, end: 0 };

  const values = Array.from(period.matchAll(/(\d{4})\.(\d{1,2})/g), ([, year, month]) => Number(year) * 100 + Number(month));
  const start = values[0] ?? 0;
  const last = values[values.length - 1];
  const end = /~\s*$/.test(period) ? Number.POSITIVE_INFINITY : (last ?? start);

  return { start, end };
}

function extractFirstHeading(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function stripFirstHeading(markdown: string): string {
  return markdown.replace(/^\s*#\s+.+\n+/, '').trim();
}

function projectSlugFromPath(sourcePath: string): string {
  return slugify(path.posix.basename(sourcePath, '.md'));
}

function projectOrder(title: string): number {
  const index = curatedProjectTitles.findIndex((item) => item === title);
  return index === -1 ? curatedProjectTitles.length + 1 : index;
}

function projectKind(data: Record<string, unknown>, sourcePath: string, errors: string[]): ProjectKind {
  const explicitKind = asString(data.project_group);

  if (explicitKind) {
    if (explicitKind === 'company' || explicitKind === 'team' || explicitKind === 'personal') {
      return explicitKind;
    }

    errors.push(`${sourcePath}.project_group must be one of company, team, personal`);
  }

  if (asString(data.career_ref)) return 'company';
  return sourcePath.includes('/team/') ? 'team' : 'personal';
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asLinks(value: unknown): LinkItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = asString(record.label);
      const url = asString(record.url);
      if (!label || !url) return null;
      return { label, url };
    })
    .filter((item): item is LinkItem => Boolean(item));
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required string field: ${field}`);
  }

  return value;
}

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:)/.test(href);
}

function isImageAssetPath(value: string): boolean {
  return /\.(?:avif|gif|jpe?g|png|webp)$/i.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
