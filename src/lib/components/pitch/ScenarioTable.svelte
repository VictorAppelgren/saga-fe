<script lang="ts">
  import { RAISE_SCENARIOS, formatCurrency, formatPercent } from './FinancialData';
</script>

<div class="table-container">
  <div class="table-header">
    <h3>Raise Scenarios Comparison</h3>
    <span class="badge">$2M Recommended</span>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          {#each RAISE_SCENARIOS as scenario}
            <th class:recommended={scenario.recommended}>
              {scenario.name}
              {#if scenario.recommended}
                <span class="rec-badge">Best Fit</span>
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <tr class="section-header">
          <td colspan="5">Funding</td>
        </tr>
        <tr>
          <td class="label">Raise Amount</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{formatCurrency(s.amount, true)}</td>
          {/each}
        </tr>
        <tr>
          <td class="label">Pre-Money Valuation</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{formatCurrency(s.preMoneyVal, true)}</td>
          {/each}
        </tr>
        <tr>
          <td class="label">Dilution</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{formatPercent(s.dilution)}</td>
          {/each}
        </tr>

        <tr class="section-header">
          <td colspan="5">Team Growth</td>
        </tr>
        <tr>
          <td class="label">Team Size Y1</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{s.teamY1} people</td>
          {/each}
        </tr>
        <tr>
          <td class="label">Team Size Y2</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{s.teamY2} people</td>
          {/each}
        </tr>

        <tr class="section-header">
          <td colspan="5">Customer Traction</td>
        </tr>
        <tr>
          <td class="label">Customers Y1</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{s.custY1}</td>
          {/each}
        </tr>
        <tr>
          <td class="label">Customers Y2</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{s.custY2}</td>
          {/each}
        </tr>

        <tr class="section-header">
          <td colspan="5">Revenue</td>
        </tr>
        <tr>
          <td class="label">ARR Y1 (Run Rate)</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended} class="arr">{formatCurrency(s.arrY1, true)}</td>
          {/each}
        </tr>
        <tr>
          <td class="label">ARR Y2 (Run Rate)</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended} class="arr">{formatCurrency(s.arrY2, true)}</td>
          {/each}
        </tr>

        <tr class="section-header">
          <td colspan="5">Timeline</td>
        </tr>
        <tr>
          <td class="label">Runway</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended}>{s.runway} months</td>
          {/each}
        </tr>
        <tr>
          <td class="label">Break-even</td>
          {#each RAISE_SCENARIOS as s}
            <td class:highlight={s.recommended} class="breakeven">Month {s.breakeven}</td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-container {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .table-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .badge {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.75rem 1rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  th {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
  }

  th.recommended {
    background: linear-gradient(180deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%);
    color: #a5b4fc;
  }

  .rec-badge {
    display: block;
    background: #6366f1;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.65rem;
    margin-top: 0.3rem;
  }

  td {
    color: rgba(255, 255, 255, 0.85);
  }

  td.label {
    text-align: left;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  td.highlight {
    background: rgba(99, 102, 241, 0.1);
    color: white;
    font-weight: 600;
  }

  td.arr {
    color: #22c55e;
  }

  td.highlight.arr {
    color: #4ade80;
  }

  td.breakeven {
    color: #f59e0b;
  }

  tr.section-header td {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.5rem 1rem;
    text-align: left;
    font-weight: 600;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  @media (max-width: 768px) {
    th, td {
      padding: 0.5rem;
      font-size: 0.8rem;
    }
  }
</style>
