import { useState, type FormEvent } from 'react';
import './App.css';

interface AssistantResponse {
  question: string;
  answer: string;
  source: {
    document: string;
    section: string;
  } | null;
  excerpt: string | null;
  reasoning: string;
}

function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim()) {
      setError('Digite uma pergunta.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/assistant/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível consultar o assistente.');
      }

      const data: AssistantResponse = await response.json();
      setResult(data);
    } catch {
      setError(
        'Não foi possível conectar ao backend. Verifique se o NestJS está rodando na porta 3000.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <section className="assistant-container">
        <header className="assistant-header">
          <span className="badge">Customer Success</span>
          <h1>Assistente Leapy</h1>
          <p>
            Faça uma pergunta sobre os procedimentos disponíveis na base de
            ajuda.
          </p>
        </header>

        <form className="question-form" onSubmit={handleSubmit}>
          <label htmlFor="question">Pergunta</label>

          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ex.: Quanto tempo dura o link de recuperação de senha?"
            rows={4}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Consultando...' : 'Perguntar'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {result && (
          <section className="result">
            <article className="answer-card">
              <span className="card-label">Resposta</span>
              <p>{result.answer}</p>
            </article>

            {result.source && (
              <article className="source-card">
                <span className="card-label">Fonte consultada</span>

                <dl>
                  <div>
                    <dt>Documento</dt>
                    <dd>{result.source.document}</dd>
                  </div>

                  <div>
                    <dt>Seção</dt>
                    <dd>{result.source.section}</dd>
                  </div>
                </dl>
              </article>
            )}

            {result.excerpt && (
              <article className="detail-card">
                <span className="card-label">Trecho utilizado</span>
                <blockquote>{result.excerpt}</blockquote>
              </article>
            )}

            <article className="detail-card">
              <span className="card-label">Como a resposta foi encontrada</span>
              <p>{result.reasoning}</p>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;