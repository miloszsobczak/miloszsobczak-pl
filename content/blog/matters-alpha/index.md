---
title: "Matters: an open-source mail client with your own AI built in"
date: 2026-11-13
description: "One place for all your inboxes, and an agent that shows what needs you. It runs on your own Claude or ChatGPT plan, or on a local model."
draft: true
---

> **TL;DR** Matters is an open-source (AGPL-3.0) desktop mail client. It puts all your IMAP
> accounts in one fast, local place. An optional agent reads them and shows only the mail that needs
> you, with a reason for each. The agent runs on your own Claude or ChatGPT plan, or fully offline
> with Ollama. There is no server of ours in between. The first alpha is out for macOS.

Nobody likes going through mail. Most of us have more than one inbox, private, work, a side
project, and each needs its own check. Most of that mail doesn't need you. The few messages that do
(an unanswered question, a decision someone is waiting for, an invoice with a date) look exactly
like everything else.

I wanted one place for every inbox, and an agent that reads them and shows what needs me, with a
reason I can check. Without giving my whole mailbox to someone else's server. So I built Matters.

**[Download the macOS alpha](https://github.com/milolabs/matters-app/releases)** ·
[Code on GitHub](https://github.com/milolabs/matters-app) ·
[getmatters.app](https://getmatters.app)

{{< figure src="needs-you.png" alt="Matters in dark mode: the Needs you view lists threads with a reason under each, a thread is open in the middle, and the agent column is on the right." caption="The Needs you view on the demo mailbox. Each row has a short reason from the agent. (Made-up mail and a canned demo assistant, so the reasons are simple.)" >}}

## One place for every inbox

The base is a normal IMAP/SMTP client. You add your accounts, and Matters syncs all of them into one
SQLite database on your computer. They show up in one list, with a small coloured dot for each
account. Inside, everything is a label, so Gmail labels and IMAP folders work the same way, and a
message that arrives in two accounts is recognised as one message.

The window only reads local data. Lists, search and threads never wait for the network. When the
whole point is to spend less time in mail, a slow client defeats it.

## Views with a prompt

The query bar has the usual fields (`from:`, `has:`, `after:`, `label:`), plus one more:

```text
after:-30d prompt:"mail that needs my reply or decision"
```

Everything before the prompt runs locally, on every keystroke, like any search. The prompt runs only
when you press Enter. The agent then searches all your accounts with read-only tools, reads the
threads that might fit, and keeps the ones that do, each with a reason. You save it as a tab, and
from then on the view reads new mail as it arrives.

The first time you turn AI on, Matters adds one such view, called `Needs you`. It is an ordinary
view: you can edit, rename or delete it. You can write your own in your own words, for example
"invoices I haven't paid" or "anything from the accountant about this year".

You can also ask the agent about one thread or about all your mail, and have it draft a reply. You
read the draft and press Send yourself.

## The agent runs on your plan

Matters has no server: no account, no backend, no telemetry. The model runs on what you already
have:

| Runtime | Runs on | Note |
| --- | --- | --- |
| Claude Code | your Claude plan | the `claude` CLI you already have installed |
| Codex | your ChatGPT plan | each turn runs with its tools off |
| Ollama | your own computer | mail never leaves the machine |

API keys are planned as a fourth option, for people who would rather pay per use.

With Claude Code, Matters never touches your login. It finds the unmodified `claude` binary, starts
it, and the CLI signs in on its own. Matters never opens, reads or stores a token.

{{< figure src="agents.png" alt="The Agents settings: the chosen runtime is ready, with the share of the session and the week that is left, and a model per kind of work." caption="Pick a runtime, then a model and effort for each kind of work. The plan's limits are shown." >}}

Two rules hold everywhere:

- **Plan or nothing.** If a turn would be billed to an API key, it is an error, not a fallback.
  Background reading stops at a limit you set, for example 10% of your weekly plan.
- **No silent switching.** Only the runtime you chose runs. If it isn't available, the agent says
  why and waits. It never sends your mail to another provider on its own.

## The rest of the client

The agent is optional. Without it, Matters is meant to be a good mail client on its own:

- **One query language everywhere.** `from:`, `subject:`, `is:unread`, `has:attachment`, `in:`,
  `label:`, `account:`, `after:-7d`, with `OR` and `-`. Any query can be saved as a tab, with its
  own unread count.
- **⌘K live search.** Results appear while you type: threads, people and file names, with the
  matched words marked.
- **Markdown compose.** The editor is CodeMirror. The mail goes out as `multipart/alternative`:
  the Markdown source as `text/plain`, the rendered HTML next to it. Replies quote the original as
  sanitized HTML, never converted.
- **Designed mail in the dark theme.** If a newsletter has its own dark styles, they are used. If it
  asks to stay light, it stays light.
- **Attachments that never block.** A file downloads when you press it, with progress. A script that
  would run on a double click can be saved or previewed, but not opened.
- **Notifications only for new mail.** Old mail moved into a folder, a first sync or a backfill
  never fires one, and a message in two folders fires once.
- **Keyboard first.** `j`/`k`, `e` to archive, `r` to reply, `c` to write, and `z` to undo the last
  move or send.

## Security: mail is hostile input

A mail client reads text written by strangers. With an LLM inside, that text can also try to give
the model orders. So every message is treated as hostile, in three layers.

**The agent is locked down.** Every Claude Code turn runs in an empty temporary folder, with
`--tools ""`, `--setting-sources ""`, `--strict-mcp-config`, `--no-session-persistence`, its own
system prompt and a JSON schema for the answer. API keys are removed from the child's environment.
To search, the agent gets a small MCP server with our own read-only tools (search, read a thread,
count, list views) and a budget of 30 calls per question.

**The agent proposes, you press.** The agent cannot send, move, delete or create anything. It can
return an offer ("archive these 40 newsletters", "save this as a view"), and the UI shows a button.
A message cannot make the agent act, because the agent has no way to act.

**The mail itself is tested against real attacks.** The repository has a corpus of hostile
messages, each tied to an RFC, a paper or a CVE: spoofed senders, EFAIL-style HTML, tracking pixels,
right-to-left file names, hostile IMAP and SMTP servers. It runs through the real code on every
change: the real MIME parser, the real sanitizer, a sandboxed iframe with a strict content policy,
real TLS on local sockets.

{{< figure src="consent.png" alt="The consent step: AI is off until you turn it on, and it lists which accounts go to which assistant." caption="AI is off by default. You turn it on per account and per runtime." >}}

What Matters does *not* protect against is written down too: malware running as you, your mail
provider, and the AI provider you chose. The [threat model](https://github.com/milolabs/matters-app/blob/main/docs/security/threat-model.md)
is one short page.

## What it doesn't do yet

- **macOS only.** The alpha is signed ad hoc, not notarized, so macOS asks you to allow it. No
  auto-update yet.
- **Password sign-in only.** Gmail, iCloud, Fastmail and Yahoo work with an app password. Microsoft
  365 and Outlook.com need OAuth, which is not built yet.
- **No API keys yet.** The agent runs on Claude Code, Codex or Ollama.

Try it with an account whose mail you are fine showing to an alpha.

## Try it

- Alpha download: [Releases](https://github.com/milolabs/matters-app/releases)
- Code: [github.com/milolabs/matters-app](https://github.com/milolabs/matters-app)
- Website: [getmatters.app](https://getmatters.app)

To try it without a real account, run it from source on a made-up mailbox, with no model needed:

```sh
git clone https://github.com/milolabs/matters-app.git
cd matters-app
bun install
bun run dev:desktop:demo
```

If you find a way for a message to do more than it should, please
[report it privately](https://github.com/milolabs/matters-app/security/advisories/new). It will
become a new case in the corpus.

---

*The rest is for the curious: how it is built, what I measured and dropped, and how I worked.*

## Architecture

Matters is a hexagonal monorepo in TypeScript, with Bun for tooling. `packages/core` holds the domain
and knows nothing about IMAP, SQLite, Electron or Node; a check in CI keeps it that way.
`packages/adapter-*` implement the ports, with one adapter per agent runtime behind a single
`AgentRuntimePort`. `apps/desktop` is Electron with a SolidJS renderer.

The speed comes mostly from how the processes are split:

| Process | Does | Never does |
| --- | --- | --- |
| main | windows, tray, menus | SQLite, sync, parsing |
| backend router | read-only SQLite, routing | writes, network |
| sync worker | IMAP/SMTP, MIME, indexing, writes | serve the UI |
| renderer | SolidJS UI | blocking calls |

The renderer talks to the backend over a direct `MessagePort`, not through the main process, and a
sync never delays a click. The budgets are the same for 8k, 100k and 500k messages: inbox in under
500 ms, `j`/`k` and archive within one frame (16 ms), a thread in under 50 ms, search under 16 ms per
keystroke. A model never sits on that path.

## What I measured and dropped

The [ADRs](https://github.com/milolabs/matters-app/tree/main/docs/adr) keep the options that lost,
with numbers. A few that may be useful outside this project:

- **Swift, then Electrobun.** The first prototype was a native Swift menu bar app. I moved to
  Electron for Windows and Linux later and an easier stack to contribute to. Electrobun was rejected
  for now: younger, a weaker update and signing story, and differences between system webviews.
- **Tantivy, Meilisearch, notmuch.** SQLite FTS5 was fast enough: the newest 50 matches for any term
  in under 0.3 ms on 200k messages. The rowid is chronological (`date_ms * 1024 + seq`), so "newest
  first" is a reverse scan, not a sort. One surprise: FTS5's `remove_diacritics` does not fold the
  Polish `ł`, so "zolw" never found "żółw". Text is now folded in JS first.
- **A trained zstd dictionary, twice.** Raw mail is one zstd block per thread, about 9x thanks to
  quoting. For HTML that failed: on my mailbox, 173k of 178k HTML threads hold a single newsletter.
  What repeats is the sender's template, so HTML is now grouped per sender: 52% smaller. A trained
  dictionary added only 8–10% and one more thing to version.
- **Startup tricks that did nothing.** A V8 code cache over a custom protocol: 268 → 270 ms.
  `bypassHeatCheck`: 268 → 264 ms, noise. What helped: a 300 KB first script instead of 1.4 MB, and
  the empty window frame drawn in plain HTML.
- **A smarter search pipeline.** The first agent search was fixed: plan queries, run them, choose
  from short summaries, answer. Every one of the 18 targets it missed on my mail matched a query it
  had written; it lost them in the choosing step. Better ranking, a better planner model and a
  better index moved results by less than the noise. A plain loop (search, read, search again) did
  better. It is slower and still behind a setting.
- **My own ranking of what matters.** Matters started with a built-in tab: one fixed question and a
  ranking in code, with weights tuned on my mailbox. It worked for me, which was the problem.
  [ADR 0116](https://github.com/milolabs/matters-app/blob/main/docs/adr/0116-a-prompt-is-a-filter.md)
  made the prompt a term of the query, and
  [ADR 0117](https://github.com/milolabs/matters-app/blob/main/docs/adr/0117-matters-is-a-view-with-a-prompt.md)
  removed the tab, with more than fifteen ADRs of work behind it.
- **Trusting `Authentication-Results`.** The first version believed the topmost header, so a sender
  could write its own `dmarc=pass`. Now, as RFC 8601 says, the list of trusted servers starts empty.

## How I worked: one decision, one record

The project has **132 architecture decision records**. Every change of direction gets one: the
context, the decision as numbered rules, the consequences. An old ADR is amended or superseded,
never edited quietly. That is why the section above could be written.

I build Matters with Claude Code as a pair, and the ADRs are its shared memory between sessions:
before a change the agent reads the decisions that apply, after it the decision is written down.
CI checks every pull request: types, lint, tests and the hostile-mail corpus, architecture
boundaries, licenses, a packaged build that has to start, Playwright end-to-end tests against a
Docker IMAP server, CodeQL and an
[OpenSSF Scorecard](https://scorecard.dev/viewer/?uri=github.com/milolabs/matters-app). Releases
ship with an SBOM and a build attestation.

Feedback of any kind is welcome, on [GitHub](https://github.com/milolabs/matters-app) or by mail.
