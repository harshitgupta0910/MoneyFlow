const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

let OpenRouterClient = null;

async function getOpenRouterClient(apiKey) {
  if (!OpenRouterClient) {
    const sdk = await import('@openrouter/sdk');
    OpenRouterClient = sdk.OpenRouter;
  }

  return new OpenRouterClient({ apiKey });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function toDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sumByTypeInRange(transactions, start, end = new Date()) {
  const totals = { income: 0, expense: 0, transfer: 0 };

  for (const tx of transactions) {
    const txDate = toDate(tx.dateTime);
    if (!txDate) continue;
    if (txDate < start || txDate > end) continue;

    if (tx.type === 'income') totals.income += tx.amount || 0;
    if (tx.type === 'expense') totals.expense += tx.amount || 0;
    if (tx.type === 'transfer') totals.transfer += tx.amount || 0;
  }

  return {
    ...totals,
    savings: totals.income - totals.expense,
  };
}

function getCurrentWeekStart(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diffToMonday = (day + 6) % 7;
  start.setDate(start.getDate() - diffToMonday);
  return start;
}

function getCurrentMonthStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

function tryBuildDeterministicPeriodAnswer(message, analytics) {
  const text = String(message || '').toLowerCase();

  const asksWeek = /(this week|is week|is hafte|iss hafte|hafta|weekly)/i.test(text);
  const asksMonth = /(this month|is month|is mahine|iss mahine|mahina|monthly)/i.test(text);

  if (!asksWeek && !asksMonth) return null;

  const asksIncome = /(income|earning|earnings|kamai|aamdani)/i.test(text);
  const asksExpense = /(expense|spend|spending|kharch|expenses)/i.test(text);
  const asksSavings = /(saving|savings|bachat|save|net)/i.test(text);

  const periodKey = asksWeek ? 'currentWeek' : 'currentMonth';
  const periodLabel = asksWeek ? 'Is week' : 'Is month';
  const period = analytics.periods?.[periodKey];
  if (!period) return null;

  if (asksIncome && !asksExpense && !asksSavings) {
    return `${periodLabel} aapki exact income ${formatCurrency(period.income)} hai.`;
  }

  if (asksExpense && !asksIncome && !asksSavings) {
    return `${periodLabel} aapka exact expense ${formatCurrency(period.expense)} hai.`;
  }

  if (asksSavings && !asksIncome && !asksExpense) {
    return `${periodLabel} aapki exact net savings ${formatCurrency(period.savings)} hai.`;
  }

  if (asksIncome && asksExpense && !asksSavings) {
    return `${periodLabel} income ${formatCurrency(period.income)} aur expense ${formatCurrency(period.expense)} hai.`;
  }

  if (asksIncome && asksExpense && asksSavings) {
    return `${periodLabel} income ${formatCurrency(period.income)}, expense ${formatCurrency(period.expense)}, net savings ${formatCurrency(period.savings)} hai.`;
  }

  if (!asksIncome && !asksExpense && !asksSavings) {
    return `${periodLabel} income ${formatCurrency(period.income)}, expense ${formatCurrency(period.expense)}, net savings ${formatCurrency(period.savings)} hai.`;
  }

  return null;
}

function buildAnalytics(transactions, accounts) {
  const now = new Date();
  const incomeTx = transactions.filter((t) => t.type === 'income');
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const transferTx = transactions.filter((t) => t.type === 'transfer');

  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const totalTransfer = transferTx.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const categoryTotals = {};
  for (const tx of expenseTx) {
    const key = tx.category || 'Uncategorized';
    categoryTotals[key] = (categoryTotals[key] || 0) + tx.amount;
  }

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, amount]) => ({ category, amount }));

  const accountTotals = accounts
    .map((acc) => ({ name: acc.name, balance: acc.balance, type: acc.type }))
    .sort((a, b) => b.balance - a.balance);

  const currentWeekStart = getCurrentWeekStart(now);
  const currentMonthStart = getCurrentMonthStart(now);
  const currentWeek = sumByTypeInRange(transactions, currentWeekStart, now);
  const currentMonth = sumByTypeInRange(transactions, currentMonthStart, now);

  return {
    totals: {
      totalIncome,
      totalExpense,
      totalTransfer,
      savings,
      savingsRate,
    },
    periods: {
      currentWeek,
      currentMonth,
    },
    topCategories,
    accounts: accountTotals,
    transactionsCount: transactions.length,
  };
}

function buildSystemPrompt(analytics) {
  const categoryLines = analytics.topCategories.length
    ? analytics.topCategories
        .map((c, i) => `${i + 1}. ${c.category}: ${formatCurrency(c.amount)}`)
        .join('\n')
    : 'No expense categories found in selected data.';

  const accountLines = analytics.accounts.length
    ? analytics.accounts
        .slice(0, 6)
        .map((a, i) => `${i + 1}. ${a.name} (${a.type}): ${formatCurrency(a.balance)}`)
        .join('\n')
    : 'No accounts found.';

  return `You are an AI personal finance assistant for Money Manager.
Use simple, practical guidance in a friendly Hinglish style.
Always be concise, data-backed, and avoid generic answers.

Financial snapshot for this user (last 120 days):
- Total income: ${formatCurrency(analytics.totals.totalIncome)}
- Total expense: ${formatCurrency(analytics.totals.totalExpense)}
- Net savings: ${formatCurrency(analytics.totals.savings)}
- Savings rate: ${analytics.totals.savingsRate.toFixed(1)}%
- Transfers: ${formatCurrency(analytics.totals.totalTransfer)}
- Transactions analyzed: ${analytics.transactionsCount}

Current period metrics (exact):
- This week income: ${formatCurrency(analytics.periods.currentWeek.income)}
- This week expense: ${formatCurrency(analytics.periods.currentWeek.expense)}
- This week net savings: ${formatCurrency(analytics.periods.currentWeek.savings)}
- This month income: ${formatCurrency(analytics.periods.currentMonth.income)}
- This month expense: ${formatCurrency(analytics.periods.currentMonth.expense)}
- This month net savings: ${formatCurrency(analytics.periods.currentMonth.savings)}

Top spending categories:
${categoryLines}

Top account balances:
${accountLines}

Rules:
1. If user asks spending by category, answer with exact numbers from snapshot when possible.
2. If user asks "kya mujhe kam kharch karna chahiye", give threshold-based advice using savings rate:
   - <10%: urgent control
   - 10-25%: improve
   - >25%: healthy
3. Offer 3 concrete action steps only when user explicitly asks for suggestions/advice/plan.
4. If data is not available, clearly say what is missing.
5. Do not invent transactions that are not in snapshot.
6. Keep responses short: max 2-4 lines for factual questions.
7. For "this week" or "this month" income/expense/savings, use the exact current period metrics above first.`;
}

exports.chatAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.OPEN_ROUTER || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key is not configured' });
    }

    const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';

    const since = new Date();
    since.setDate(since.getDate() - 120);

    const [transactions, accounts] = await Promise.all([
      Transaction.find({ userId: req.userId, dateTime: { $gte: since } })
        .sort({ dateTime: -1 })
        .limit(1000)
        .lean(),
      Account.find({ userId: req.userId }).lean(),
    ]);

    const analytics = buildAnalytics(transactions, accounts);
    const deterministicReply = tryBuildDeterministicPeriodAnswer(message, analytics);
    if (deterministicReply) {
      return res.json({
        reply: deterministicReply,
        model: 'deterministic-period-answer',
        usage: null,
        snapshot: {
          totalIncome: analytics.totals.totalIncome,
          totalExpense: analytics.totals.totalExpense,
          savingsRate: Number(analytics.totals.savingsRate.toFixed(1)),
          topCategories: analytics.topCategories,
          currentWeek: analytics.periods.currentWeek,
          currentMonth: analytics.periods.currentMonth,
        },
      });
    }

    const systemPrompt = buildSystemPrompt(analytics);

    const safeHistory = Array.isArray(history)
      ? history
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-8)
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message.trim() },
    ];

    const openrouter = await getOpenRouterClient(apiKey);

    const stream = await openrouter.chat.send({
      httpReferer: process.env.FRONTEND_URL || 'https://money-flow-fawn.vercel.app',
      appTitle: 'Money Manager Assistant',
      chatRequest: {
        model,
        messages,
        stream: true,
        temperature: 0.4,
      },
    });

    let reply = '';
    let usage = null;

    for await (const chunk of stream) {
      const content = chunk?.choices?.[0]?.delta?.content;
      if (content) {
        reply += content;
      }

      if (chunk?.usage) {
        usage = chunk.usage;
      }
    }

    if (!reply) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    return res.json({
      reply,
      model,
      usage,
      snapshot: {
        totalIncome: analytics.totals.totalIncome,
        totalExpense: analytics.totals.totalExpense,
        savingsRate: Number(analytics.totals.savingsRate.toFixed(1)),
        topCategories: analytics.topCategories,
        currentWeek: analytics.periods.currentWeek,
        currentMonth: analytics.periods.currentMonth,
      },
    });
  } catch (error) {
    const errorText =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Failed to get assistant response';

    if (String(errorText).toLowerCase().includes('rate-limited') || String(errorText).includes('429')) {
      return res.status(429).json({ error: 'OpenRouter is rate-limited right now. Please retry in a few seconds.' });
    }

    console.error('Chat assistant error:', errorText);
    return res.status(500).json({ error: errorText });
  }
};

exports.transcribeAudio = async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key is not configured' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const formData = new FormData();
    const audioBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype || 'audio/webm',
    });

    const requestedLanguage = String(req.body?.language || '').trim().toLowerCase();
    const allowedLanguages = new Set(['en', 'hi', 'eng', 'hin']);
    const languageCode = allowedLanguages.has(requestedLanguage) ? requestedLanguage : null;

    formData.append('model_id', 'scribe_v1');
    formData.append('file', audioBlob, req.file.originalname || 'voice.webm');
    formData.append('tag_audio_events', 'false');
    if (languageCode) {
      formData.append('language_code', languageCode);
    }

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', errorText);
      return res.status(502).json({ error: 'Voice transcription failed' });
    }

    const data = await response.json();
    const text = String(data?.text || data?.transcript || '').trim();

    if (!text) {
      return res.status(502).json({ error: 'No speech detected in audio' });
    }

    return res.json({ text });
  } catch (error) {
    console.error('Voice transcription error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to transcribe voice input' });
  }
};
