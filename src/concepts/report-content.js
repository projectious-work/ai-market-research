(() => {
  const market = JSON.parse(
    document.getElementById("market-data").textContent
  );
  const roster = JSON.parse(
    document.getElementById("model-roster").textContent
  );
  const state = {
    reference: market.meta.reference_default,
    jurisdiction: "all",
    workload: market.quota_burn_matrix.default_workload || "mixed",
  };

  const escapeHtml = (value) => String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;",
    })[char]
  );
  const display = (value) => value === null || value === undefined
    ? "—" : escapeHtml(value);
  const modelById = (id) => market.models.find((model) => model.id === id);
  const selfHostedById = (id) => market.self_hosting.models.find(
    (model) => model.id === id
  );
  const reference = () => modelById(state.reference);
  const jurisdictionMatch = (value) => state.jurisdiction === "all"
    || (state.jurisdiction === "not-China"
      ? value !== "China" : value === state.jurisdiction);
  const quality = (model) => reference()?.swe_pro && model.swe_pro
    ? `${Math.round(model.swe_pro / reference().swe_pro * 100)}%`
    : "—";
  const money = (value) => value === null || value === undefined
    ? "—" : `$${Number(value).toFixed(2)}`;
  const html = (value, className = "") => ({
    className, value,
  });
  const table = (headers, rows, className = "") => `
    <div class="r-table-wrap ${className}"><table class="r-table">
      <thead><tr>${headers.map((header) =>
        `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((raw) => {
        const item = raw && typeof raw === "object" && "value" in raw
          ? raw : {value: display(raw), className: ""};
        return `<td class="${item.className}">${item.value}</td>`;
      }).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
  const heading = (eyebrow, title, note = "") => `
    <header class="r-heading"><span>${escapeHtml(eyebrow)}</span>
      <h2>${escapeHtml(title)}</h2>
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}
    </header>`;
  const subhead = (title, note = "") => `
    <div class="r-subhead"><h3>${escapeHtml(title)}</h3>
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}</div>`;

  function briefing() {
    const stats = `<div class="r-stats">${market.headline_stats.map(
      (item) => `<div class="r-stat"><span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}${escapeHtml(item.unit || "")}</strong>
        <small>${escapeHtml(item.delta || "")}</small></div>`
    ).join("")}</div>`;
    const summaries = `<div class="r-summaries">${Object.entries(
      market.executive_summary
    ).map(([key, value]) => `<article><h3>${escapeHtml(
      key.replaceAll("_", " ")
    )}</h3><p>${escapeHtml(value)}</p></article>`).join("")}</div>`;
    const trends = table(
      ["Signal", "Latest", "Six-month change", "Observations"],
      Object.values(market.trends).map((trend) => {
        const first = trend.history[0].value;
        const last = trend.history.at(-1).value;
        return [
          html(escapeHtml(trend.label), "wide"),
          last,
          Number(last - first).toFixed(1),
          html(escapeHtml(trend.history.map((point) =>
            `${point.date.slice(5)} ${point.value}`).join(" · ")), "wide"),
        ];
      })
    );
    return heading("Current position", "Market pulse",
      `Updated ${market.meta.generated_at.slice(0, 10)}`)
      + stats + subhead("Executive readout") + summaries
      + subhead("Market signals") + trends;
  }

  function signals() {
    const actions = `<ol class="r-actions">${market.actions.map(
      (action) => `<li>${escapeHtml(action)}</li>`
    ).join("")}</ol>`;
    const changes = `<div class="r-changes">${market.changelog.map(
      (change) => `<article><time>${escapeHtml(change.date)}</time>
        <span>${escapeHtml(change.tag)}</span><p>${escapeHtml(change.text)}</p>
      </article>`
    ).join("")}</div>`;
    return heading("What needs attention", "Signals and actions")
      + subhead("Action queue") + actions
      + subhead("Change log") + changes;
  }

  function modelCatalog() {
    const currentRows = roster.models
      .filter((model) => jurisdictionMatch(model.region))
      .map((model) => [
        html(`<strong>${escapeHtml(model.name)}</strong><small>${escapeHtml(
          model.family
        )} · ${escapeHtml(model.channel.replaceAll("_", " "))}</small>`,
        "model"),
        model.provider, model.status, model.default_level,
        html(escapeHtml(model.levels.length
          ? `${model.control}: ${model.levels.join(" · ")}`
          : "No documented control"), "wide"),
        model.speed_band,
        html(escapeHtml(model.speed_note), "wide"),
        model.price, model.context, model.region,
      ]);
    const currentTable = table([
      "Model", "Provider", "Status", "Default", "Configurations",
      "Speed", "Speed evidence", "Price / Mtok", "Context", "Region",
    ], currentRows, "roster");
    const benchmarkRows = market.models
      .filter((model) => jurisdictionMatch(model.jurisdiction))
      .map((model) => [
        html(`<strong>${escapeHtml(model.name)}</strong><small>${escapeHtml(
          model.license
        )} · ${escapeHtml(model.tier)}</small>`, "model"),
        model.provider, quality(model), model.swe_pro, model.swe_verified,
        model.livecodebench, model.aime, money(model.api_in),
        money(model.api_out), money(model.api_cache_hit), model.context_label,
        model.tok_per_sec, model.released,
      ]);
    const benchmarkTable = table([
      "Model", "Provider", "Quality vs ref", "SWE-Pro", "SWE-Ver",
      "LCB", "AIME", "Input", "Output", "Cache", "Context", "tok/s",
      "Released",
    ], benchmarkRows, "benchmarks");
    return heading("Compare the field", "Models and configurations",
      "Current roster, native reasoning controls, and retained benchmarks")
      + subhead("Current roster") + currentTable
      + subhead("Benchmark register") + benchmarkTable;
  }

  function burnData() {
    const matrix = market.quota_burn_matrix;
    const combined = [
      ...matrix.openai_matrix,
      ...matrix.anthropic_matrix,
      ...matrix.google_matrix,
    ];
    const findRow = (id) => combined.find((row) => row.model_id === id);
    const cacheFactor = (id) => {
      const model = modelById(id);
      const hit = matrix.workload_presets[state.workload]?.cache_hit_rate || 0;
      return (1 - hit) + hit * (model?.cache_discount ?? 1);
    };
    const referenceRow = findRow(state.reference);
    const referenceValue = referenceRow && [
      "medium", "high", "low", "xhigh", "max", "off",
    ].map((key) => referenceRow[key]).find(
      (value) => typeof value === "number"
    );
    const divisor = (referenceValue || 1) * cacheFactor(state.reference);
    return {matrix, combined, cacheFactor, divisor};
  }

  function economics() {
    const {matrix, combined, cacheFactor, divisor} = burnData();
    const matrixTable = (title, rows) => {
      const keys = [...new Set(rows.flatMap((row) => Object.keys(row).filter(
        (key) => !["model_id", "note"].includes(key)
      )))];
      return subhead(title) + table(
        ["Model", ...keys],
        rows.map((row) => [
          html(escapeHtml(modelById(row.model_id)?.name || row.model_id),
            "model"),
          ...keys.map((key) => typeof row[key] === "number"
            ? `${(row[key] * cacheFactor(row.model_id) / divisor).toFixed(2)}×`
            : "—"),
        ])
      );
    };
    const factors = matrix.effort_quality_factors;
    const leaders = combined.flatMap((row) => Object.entries(row)
      .filter(([, value]) => typeof value === "number")
      .map(([effort, value]) => {
        const model = modelById(row.model_id);
        const burn = value * cacheFactor(row.model_id) / divisor;
        const score = model?.swe_pro && reference()?.swe_pro
          ? model.swe_pro / reference().swe_pro
            * (factors[effort] ?? 1) * 100
          : null;
        return {model, effort, burn, score,
          ratio: score ? burn / score : null};
      }))
      .filter((item) => item.score >= 80 && item.ratio !== null)
      .sort((a, b) => a.ratio - b.ratio).slice(0, 10);
    const leaderTable = table(
      ["Model", "Configuration", "Burn", "Quality", "Burn / quality"],
      leaders.map((item) => [
        item.model?.name || "Unknown", item.effort,
        `${item.burn.toFixed(2)}×`, `${item.score.toFixed(0)}%`,
        item.ratio.toFixed(4),
      ])
    );
    const subscriptions = table(
      ["Provider", "Tier", "$/month", "Limits", "Models", "Features"],
      market.subscriptions.map((item) => [
        item.provider, item.tier, item.price_usd,
        html(escapeHtml(item.limits), "wide"),
        html(escapeHtml(item.models), "wide"),
        html(escapeHtml(item.features), "wide"),
      ])
    );
    const policies = table(
      ["Provider", "Subscription automation", "Enforcement",
        "First-party exception", "API required"],
      market.agent_policies.map((item) => [
        item.provider, item.subscription_automated,
        html(escapeHtml(item.enforcement), "wide"),
        html(escapeHtml(item.first_party_exception), "wide"),
        item.api_required_for_automation ? "Yes" : "No",
      ])
    );
    const workloadRows = Object.values(matrix.workload_presets).map(
      (item) => [item.label, `${item.cache_hit_rate * 100}%`,
        html(escapeHtml(item.description), "wide")]
    );
    return heading("Understand the trade", "Economics and policy",
      `Burn is relative to ${reference()?.name || "the selected reference"}`)
      + matrixTable("OpenAI effort", matrix.openai_matrix)
      + matrixTable("Anthropic effort", matrix.anthropic_matrix)
      + matrixTable("Google thinking budgets", matrix.google_matrix)
      + subhead("Fixed-burn models", matrix.non_reasoning_note)
      + subhead("Efficiency leaders", "80% minimum quality") + leaderTable
      + subhead("Cache workloads", matrix.cache_methodology)
      + table(["Preset", "Cache hit", "Description"], workloadRows)
      + subhead("Subscription tiers") + subscriptions
      + subhead("Automation policy") + policies
      + subhead("Methodology")
      + `<p class="r-method">${escapeHtml(matrix.methodology)}</p>
        <p class="r-method">${escapeHtml(matrix.quality_methodology)}</p>`;
  }

  function tooling() {
    const rows = market.harnesses.map((item) => [
      html(`<strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(
        item.license
      )}</small>`, "model"),
      item.vendor, item.category,
      ...["mcp", "skills", "hooks", "subagents", "voice", "remote",
        "computer_use", "lsp"].map((key) => item[key] ? "Yes" : "No"),
      item.memory, item.swe_pro, html(escapeHtml(item.pricing), "wide"),
    ]);
    const profiles = `<div class="r-profiles">${market.harnesses.map(
      (item) => `<details><summary>${escapeHtml(item.name)} · ${escapeHtml(
        item.category
      )}</summary><div><strong>Best at:</strong> ${escapeHtml(
        item.sweet_spot
      )}<br><strong>Limitations:</strong> ${escapeHtml(item.stumbles)}<br>
        <strong>Providers:</strong> ${escapeHtml(item.providers.join(", "))}
        · <strong>Sandbox:</strong> ${escapeHtml(item.sandbox)}</div></details>`
    ).join("")}</div>`;
    return heading("Choose the operating layer", "Agent harnesses")
      + table([
        "Harness", "Vendor", "Category", "MCP", "Skills", "Hooks",
        "Subagents", "Voice", "Remote", "Computer use", "LSP", "Memory",
        "SWE-Pro", "Pricing",
      ], rows, "harnesses")
      + subhead("Detailed profiles") + profiles;
  }

  function infrastructure() {
    const hardware = market.self_hosting.hardware_options;
    const fitRows = market.self_hosting.models
      .filter((model) => jurisdictionMatch(model.jurisdiction))
      .map((model) => [
        html(`<strong>${escapeHtml(model.name)}</strong><small>${escapeHtml(
          model.license
        )} · ${escapeHtml(model.params_total)}B total</small>`, "model"),
        ...hardware.map((device) => {
          const fit = model.fits[device.id];
          return fit ? html(`${escapeHtml(fit.quant)} · ${escapeHtml(
            fit.vram_used
          )} GB · ${escapeHtml(fit.tok_per_sec)} tok/s`, "wide")
            : "Does not fit";
        }),
      ]);
    const options = table(
      ["Hardware", "Type", "VRAM", "Cost", "Notes"],
      hardware.map((item) => [
        item.name, item.type, `${item.vram_gb} GB`, item.cost_label,
        html(escapeHtml(item.notes), "wide"),
      ])
    );
    const frameworks = table(
      ["Framework", "Best for", "Notes"],
      market.self_hosting.frameworks.map((item) => [
        item.name, item.best_for, html(escapeHtml(item.notes), "wide"),
      ])
    );
    return heading("Place the workload", "Self-hosting and infrastructure")
      + subhead("Hardware × model fit")
      + table(["Model", ...hardware.map((item) => item.name)], fitRows,
        "hardware-fit")
      + subhead("Hardware options") + options
      + subhead("Inference frameworks") + frameworks;
  }

  function decisions() {
    const strategy = market.strategy;
    const providers = ["anthropic", "openai", "google", "self_hosted"];
    const taskRows = strategy.task_fit.rows.map((row) => [
      html(`<strong>${escapeHtml(row.task)}</strong><small>${escapeHtml(
        row.description
      )}</small>`, "wide"),
      ...providers.map((provider) => {
        const rec = row.recommendations[provider];
        const model = modelById(rec.model_id) || selfHostedById(rec.model_id);
        const runners = row.runner_up_per_provider[provider] || [];
        return html(`<strong>${escapeHtml(
          model?.name || "No recommendation"
        )}</strong>${rec.effort ? ` · ${escapeHtml(rec.effort)}` : ""}<br>
          ${escapeHtml(rec.rationale)}${runners.length
            ? `<small>Also: ${escapeHtml(runners.join("; "))}</small>` : ""}`,
        "wide");
      }),
    ]);
    const axes = market.capabilities.axes;
    const capabilityRows = market.models.filter(
      (model) => model.capability_levels
        && jurisdictionMatch(model.jurisdiction)
    ).map((model) => [
      html(escapeHtml(model.name), "model"),
      ...axes.map((axis) => model.capability_levels[axis.key] ?? "—"),
    ]);
    const recommendation = `<div class="r-recommendation">
      <article><span>Recommended portfolio</span><strong>~$${escapeHtml(
        strategy.current_recommendation.monthly_usd
      )}/month</strong><ul>${strategy.current_recommendation.components.map(
        (item) => `<li>${escapeHtml(item)}</li>`
      ).join("")}</ul><p>${escapeHtml(
        strategy.current_recommendation.rationale
      )}</p></article>
      <article><span>Routing</span><ul>${strategy.routing.map((item) =>
        `<li><strong>${escapeHtml(item.tier)}</strong>: ${escapeHtml(
          item.use_for
        )}<br>${escapeHtml(item.preferred)} · ${escapeHtml(
          item.cost_label
        )}</li>`).join("")}</ul></article></div>`;
    const alternatives = `<div class="r-alternatives">${strategy.alternatives.map(
      (item) => `<article><h3>${escapeHtml(item.label)}</h3>
        <strong>~$${escapeHtml(item.monthly_usd)}/month</strong>
        <p>${escapeHtml(item.rationale)}</p><p><b>Verdict:</b>
        ${escapeHtml(item.verdict)}</p></article>`
    ).join("")}</div>`;
    return heading("Turn evidence into a choice", "Decision support")
      + subhead("Task-fit recommendations", strategy.task_fit.description)
      + table(["Task", "Anthropic", "OpenAI", "Google", "Self-hosted"],
        taskRows, "task-fit")
      + subhead("Capability register",
        "The six-axis ratings behind the original capability analysis")
      + table(["Model", ...axes.map((axis) => axis.label)], capabilityRows)
      + `<p class="r-method">${escapeHtml(
        market.capabilities.methodology
      )}</p>`
      + subhead("Recommended stack and routing") + recommendation
      + subhead("Alternatives considered") + alternatives
      + subhead("Open questions")
      + `<ul class="r-questions">${strategy.open_questions.map(
        (item) => `<li>${escapeHtml(item)}</li>`
      ).join("")}</ul>`;
  }

  function evidence() {
    const rosterSources = [...new Map(
      [...roster.models, ...roster.watchlist].map((item) =>
        [item.source, item])
    ).values()];
    const categories = [...new Set(market.sources.map(
      (source) => source.category
    ))];
    return heading("Verify before acting", "Evidence and limitations")
      + subhead("Current roster sources")
      + `<div class="r-sources">${rosterSources.map((item) =>
        `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener">
          <span>${escapeHtml(item.provider)}</span>${escapeHtml(item.name)}</a>`
      ).join("")}</div>`
      + subhead("Complete source register")
      + `<div class="r-source-groups">${categories.map((category) =>
        `<section><h3>${escapeHtml(category)}</h3><ol>${market.sources.filter(
          (source) => source.category === category
        ).map((source) => `<li><a href="${escapeHtml(
          source.url
        )}" target="_blank" rel="noopener">${escapeHtml(
          source.title
        )}</a>${source.note ? `<small>${escapeHtml(source.note)}</small>` : ""}</li>`).join("")}</ol></section>`
      ).join("")}</div>
      <div class="r-disclaimer"><strong>AI-generated, no warranty.</strong>
        Verify figures, prices, benchmarks, and policies against primary
        sources. This is informational research, not professional advice.</div>`;
  }

  const modules = {
    briefing, signals, models: modelCatalog, economics, tooling,
    infrastructure, decisions, evidence,
  };
  function render() {
    document.querySelectorAll("[data-report-module]").forEach((target) => {
      const module = modules[target.dataset.reportModule];
      if (module) target.innerHTML = module();
    });
    document.querySelectorAll("[data-current-reference]").forEach((target) => {
      target.textContent = reference()?.name || "No reference";
    });
  }
  function initializeControls() {
    document.querySelectorAll("[data-control=reference]").forEach((select) => {
      market.models.forEach((model) => select.add(new Option(
        model.name, model.id, false, model.id === state.reference
      )));
      select.addEventListener("change", (event) => {
        state.reference = event.target.value;
        render();
      });
    });
    document.querySelectorAll("[data-control=jurisdiction]").forEach(
      (select) => select.addEventListener("change", (event) => {
        state.jurisdiction = event.target.value;
        render();
      })
    );
    document.querySelectorAll("[data-control=workload]").forEach((select) => {
      select.value = state.workload;
      select.addEventListener("change", (event) => {
        state.workload = event.target.value;
        render();
      });
    });
  }
  window.ReportContent = {market, roster, state, render};
  initializeControls();
  render();
})();
