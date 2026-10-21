(() => {
  'use strict';
  const rates = { 70: 15000, 90: 19000, 120: 23000 };
  const weeksPerMonth = 4;
  const inputs = { 70: document.getElementById('count-70'), 90: document.getElementById('count-90'), 120: document.getElementById('count-120'), weekDays: document.getElementById('days-per-week') };
  const compared = { 70: document.getElementById('compare-70'), 90: document.getElementById('compare-90'), 120: document.getElementById('compare-120') };
  const error = document.getElementById('sim-error');
  const month = document.getElementById('result-month');
  const day = document.getElementById('result-day');
  const minutes = document.getElementById('result-minutes');
  const weekDays = document.getElementById('result-week-days');
  const monthDays = document.getElementById('result-month-days');
  const preview = document.getElementById('consultation-preview');
  const compareOutput = document.getElementById('compare-output');
  const live = document.getElementById('sim-live');
  const copyStatus = document.getElementById('copy-status');
  const yen = value => new Intl.NumberFormat('ja-JP').format(value) + '円';
  let animationId = 0;
  let shownMonth = 0;
  let completeTracked = false;

  const integer = (element, max, label) => {
    const raw = element.value.trim();
    const valid = raw !== '' && /^\d+$/.test(raw) && Number(raw) <= max;
    element.setAttribute('aria-invalid', String(!valid));
    return valid ? { value: Number(raw) } : { error: `${label}は0〜${max}の整数で入力してください。` };
  };
  const animateMonth = target => {
    cancelAnimationFrame(animationId);
    const reduce = document.documentElement.classList.contains('design-mode') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { month.textContent = yen(target); shownMonth = target; return; }
    const startValue = shownMonth;
    const startTime = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - startTime) / 270);
      shownMonth = Math.round(startValue + (target - startValue) * (1 - Math.pow(1 - progress, 3)));
      month.textContent = yen(shownMonth);
      if (progress < 1) animationId = requestAnimationFrame(tick);
      else shownMonth = target;
    };
    animationId = requestAnimationFrame(tick);
  };
  const buildMessage = values => {
    const countText = [70, 90, 120].filter(course => values[course] > 0).map(course => `${course}分コースを1日${values[course]}件`).join('、');
    return values.weekDays > 0 && countText
      ? `SOGの報酬シミュレーションを見ました。週${values.weekDays}日（月${values.weekDays * weeksPerMonth}日・4週換算）、${countText}で計算しました。この働き方について相談したいです。`
      : 'SOGの報酬シミュレーションを見ました。働き方について相談したいです。';
  };
  const update = announce => {
    const values = {};
    for (const [key, input] of Object.entries(inputs)) {
      const label = key === 'weekDays' ? '週の出勤日数' : `${key}分コースの件数`;
      const parsed = integer(input, key === 'weekDays' ? 7 : 12, label);
      if (parsed.error) {
        error.textContent = parsed.error;
        month.textContent = '—';
        day.textContent = '—';
        minutes.textContent = '—';
        weekDays.textContent = '—';
        monthDays.textContent = '—';
        compareOutput.textContent = '';
        preview.textContent = '正しい入力値に直してから、計算を表示します。';
        window.SOG_SIM_MESSAGE = 'SOGの求人について相談したいです。';
        return;
      }
      values[key] = parsed.value;
    }
    error.textContent = '';
    const daily = values[70] * rates[70] + values[90] * rates[90] + values[120] * rates[120];
    const calculatedMonthDays = values.weekDays * weeksPerMonth;
    const monthly = daily * calculatedMonthDays;
    const treatmentMinutes = values[70] * 70 + values[90] * 90 + values[120] * 120;
    animateMonth(monthly);
    day.textContent = yen(daily);
    minutes.textContent = `${treatmentMinutes}分`;
    weekDays.textContent = `${values.weekDays}日`;
    monthDays.textContent = `${calculatedMonthDays}日`;
    window.SOG_SIM_MESSAGE = buildMessage(values);
    preview.textContent = window.SOG_SIM_MESSAGE;
    if (announce) live.textContent = `月のコース報酬計算は${yen(monthly)}です。`;
    if (monthly > 0 && !completeTracked) {
      window.SOG_CONFIG.track('simulator_complete');
      completeTracked = true;
    }
    const rawComparison = [70, 90, 120].map(course => compared[course].value.trim());
    if (rawComparison.every(value => value === '')) { compareOutput.textContent = ''; return; }
    if (rawComparison.some(value => value === '' || !/^\d+$/.test(value) || Number(value) > 100000)) {
      compareOutput.textContent = '比較する場合は、3コースすべてに0〜100,000円の整数を入力してください。';
      return;
    }
    const otherDaily = [70, 90, 120].reduce((sum, course, i) => sum + values[course] * Number(rawComparison[i]), 0);
    const difference = monthly - otherDaily * calculatedMonthDays;
    compareOutput.textContent = difference === 0 ? '入力した求人との差額は0円です。' : `入力した求人との月の差額：${difference > 0 ? '+' : '−'}${yen(Math.abs(difference))}`;
  };

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => update(false));
    input.addEventListener('change', () => update(true));
  });
  Object.values(compared).forEach(input => input.addEventListener('input', () => update(false)));
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.step);
    const max = Number(input.max);
    const current = /^\d+$/.test(input.value) ? Number(input.value) : 0;
    input.value = String(Math.min(max, Math.max(0, current + Number(button.dataset.direction))));
    update(true);
    input.focus();
  }));
  document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    const example = button.dataset.example;
    const values = example === 'work' ? [0, 2, 0, 1] : example === 'mixed' ? [1, 1, 1, 3] : [0, 0, 0, 0];
    [inputs[70], inputs[90], inputs[120], inputs.weekDays].forEach((input, i) => { input.value = String(values[i]); });
    update(true);
  }));
  document.getElementById('copy-consultation').addEventListener('click', async () => {
    try { await window.SOG_COPY_TEXT(window.SOG_SIM_MESSAGE); copyStatus.textContent = '相談文をコピーしました。'; }
    catch { copyStatus.textContent = 'コピーできませんでした。文章を選択してコピーしてください。'; }
  });
  window.SOG_SIM_MESSAGE = buildMessage({ 70: 0, 90: 0, 120: 0, weekDays: 0 });
  update(false);
})();
