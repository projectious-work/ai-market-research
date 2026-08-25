# Theme integration notes

The site consumes [`brand-theme-hugo-vanilla` v0.3.6](https://github.com/projectious-work/brand-theme-hugo-vanilla/tree/v0.3.6).
Its native templates own the document shell, navigation, version menu/banner,
bundled fonts, CSS, and JavaScript.

The integration gaps below were reported upstream in
[`brand-theme-hugo-vanilla#52`](https://github.com/projectious-work/brand-theme-hugo-vanilla/issues/52).

Version 0.3.6 resolves the explicit-light-mode `--header-bg` and
`--logo-accent` defect. The corresponding local token override has been
removed. It also adds native brand and favicon parameters, but those APIs do
not yet cover all Signal Room requirements described below.

One small consumer shortcode remains because the site publishes generated
release metadata that cannot be authored as ordinary Markdown:

| Consumer file | Workaround | Intended native construct | Reason and impact | Evidence / suggested upstream feature |
| --- | --- | --- | --- | --- |
| `layouts/shortcodes/releases-table.html` | Iterate `data/releases.json` and emit a `.tablewrap` table. | The v0.3.6 data-table partial. | Release cells need generated external links and date formatting. The generic data-table API accepts plain row values and cannot supply that cell rendering yet. | Add column renderers or a caller-supplied cell partial to the data-table API. |
| `layouts/dashboard/*.html` and `layouts/_partials/dashboard-sidebar.html` | Define the dashboard shell using the theme's published classes and icon partial. | The v0.3.6 `app-shell.html` partial. | The native shell always renders its own sidebar brand. Signal Room requires branding only in the header, so adopting it would reintroduce the duplicate logo and wordmark. | Make the sidebar brand optional and accept the current navigation/status inputs. |
| `layouts/_partials/brand.html` | Render the two-color `projectious·signal` wordmark and light/dark resource-pipeline marks. | The v0.3.6 brand parameters and brand partial. | The native custom wordmark is one color and its asset parameters are URL-based. Signal Room requires independently colored wordmark segments and keeps source assets in Hugo's asset pipeline. | Support structured wordmark segments and Hugo resource paths, or expose a wordmark-content hook. |
| `layouts/partials/head.html` | Publish 16 px and 32 px PNG favicons, light/dark SVG favicons, and the Apple touch icon from `assets/logo/`. | The v0.3.6 favicon parameters. | Native parameters cover a 32 px favicon and Apple touch icon, but not the 16 px or color-scheme-specific SVG variants. There is no head-end hook for adding only the missing links. | Add the missing variants or a head-end hook; the full head partial can then be removed. |

The old Docsy layouts, navbar/version overrides, favicon override, Google-font
hook, Docsy SCSS files, and legacy report-fragment integrations were removed.
Dashboard pages retain a small structural override because the native
application shell cannot hide its sidebar brand. Their styling, icons, cards,
diagram, document shell, and scripts remain theme-owned. The narrow Tailwind
executable allowlist remains required build configuration, but is no longer
tracked here as a theme workaround.
