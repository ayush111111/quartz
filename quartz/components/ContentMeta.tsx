import { Date, getDate, formatMonthYear } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
  /**
   * Whether to display the AI-assistance marker for posts that declare one
   */
  showAssisted: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
  showAssisted: true,
}

// Kinds of AI assistance a note can declare via `assisted:` in its frontmatter.
// The note is what a reader sees on hover; a post can override it with `assistedNote:`.
const assistanceKinds: Record<string, { label: string; note: string }> = {
  prose: {
    label: "AI-assisted prose",
    note: "The work, findings and source material are mine. An LLM drafted the prose from my notes.",
  },
  summary: {
    label: "AI-generated summary",
    note: "An LLM produced this summary from source material I read or attended.",
  },
}

// `Date` is shadowed by the component imported above
const parseDate = (input: unknown): globalThis.Date | undefined => {
  if (typeof input !== "string" && typeof input !== "number") return undefined
  const parsed = new globalThis.Date(input)
  return isNaN(parsed.valueOf()) ? undefined : parsed
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    if (text) {
      const segments: (string | JSX.Element)[] = []
      const frontmatter = fileData.frontmatter

      if (fileData.dates) {
        segments.push(<Date date={getDate(cfg, fileData)!} locale={cfg.locale} />)
      }

      // When a post was actually written, for pieces whose dateline refers to the
      // period they describe rather than the day they were written
      const written = parseDate(frontmatter?.written)
      if (written) {
        segments.push(
          <span>
            written <time datetime={written.toISOString()}>{formatMonthYear(written, cfg.locale)}</time>
          </span>,
        )
      }

      // Display reading time if enabled
      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes),
        })
        segments.push(<span>{displayedTime}</span>)
      }

      const assistance = assistanceKinds[frontmatter?.assisted as string]
      if (options.showAssisted && assistance) {
        const note = (frontmatter?.assistedNote as string) ?? assistance.note
        segments.push(
          <span class="ai-assisted" title={note}>
            {assistance.label}
          </span>,
        )
      }

      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segments}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
