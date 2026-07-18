# Assistente de CS Leapy

Aplicação desenvolvida como proposta de solução para o desafio técnico do processo seletivo da Leapy.

O projeto consiste em um assistente interno para o time de Customer Success, capaz de responder perguntas com base em uma documentação fictícia de ajuda, apresentando a fonte, a seção e o trecho utilizados na resposta.

## Funcionalidades

- Consulta a uma base fictícia de documentos em Markdown
- Busca de trechos relevantes com base na pergunta
- Respostas fundamentadas na documentação
- Exibição do documento utilizado como fonte
- Exibição da seção encontrada
- Exibição do trecho consultado
- Explicação resumida de como a informação foi localizada
- Tratamento de perguntas sem informações suficientes
- Validação das perguntas enviadas para a API

## Tecnologias utilizadas

### Backend

- Node.js
- NestJS
- TypeScript
- Class Validator
- Class Transformer

### Frontend

- React
- TypeScript
- Vite
- CSS

## Estrutura do projeto

```text
leapy-cs-assistant/
├── backend/
│   ├── src/
│   │   ├── assistant/
│   │   ├── documents/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   └── package.json
├── .gitignore
└── README.md
```

## Base documental

A base fictícia contém documentos sobre:

- criação de conta;
- recuperação de senha;
- planos e cobrança;
- cancelamento;
- integrações.

Os documentos estão localizados em:

```text
backend/src/documents
```

Cada arquivo Markdown é dividido em seções. Essas seções são analisadas individualmente para encontrar o trecho mais relevante para a pergunta realizada.

## Como a solução funciona

O fluxo da aplicação é:

```text
Usuário envia uma pergunta
        ↓
Frontend envia a pergunta para a API
        ↓
Backend lê os documentos Markdown
        ↓
Os documentos são divididos em seções
        ↓
Pergunta e seções são normalizadas
        ↓
O sistema calcula a relevância dos trechos
        ↓
O melhor trecho é selecionado
        ↓
A API retorna resposta, fonte e justificativa
```

A busca atual utiliza correspondência textual e pontuação de relevância.

Os títulos das seções possuem peso maior que o conteúdo comum. Quando mais de um termo relevante da pergunta aparece no mesmo trecho, a pontuação também é aumentada.

Caso nenhum trecho tenha relevância suficiente, o sistema informa que não encontrou informações na documentação, evitando criar uma resposta sem fundamento.

## Como executar o projeto

### Pré-requisitos

É necessário ter instalado:

- Node.js
- npm
- Git

## Executando o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm run start:dev
```

O backend ficará disponível em:

```text
http://localhost:3000
```

## Executando o frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Endpoint principal

### Fazer uma pergunta

```http
POST /assistant/ask
```

URL local:

```text
http://localhost:3000/assistant/ask
```

Exemplo de corpo da requisição:

```json
{
  "question": "Quanto tempo dura o link de recuperação de senha?"
}
```

Exemplo de resposta:

```json
{
  "question": "Quanto tempo dura o link de recuperação de senha?",
  "answer": "O link de redefinição de senha possui validade de 30 minutos.",
  "source": {
    "document": "recuperacao-de-senha.md",
    "section": "Validade do link"
  },
  "excerpt": "O link de redefinição de senha possui validade de 30 minutos.",
  "reasoning": "O trecho foi selecionado por apresentar correspondência com os termos: link, senha. Pontuação de relevância: 7."
}
```

## Exemplos de perguntas

```text
Quanto tempo dura o link de recuperação de senha?

Com quantos dias de antecedência devo solicitar o cancelamento?

Quem pode ativar integrações?

Quando a cobrança é realizada?

Por quanto tempo os dados ficam disponíveis após o cancelamento?
```

Também é possível testar uma pergunta sem resposta na documentação:

```text
A Leapy possui integração com WhatsApp?
```

Nesse caso, o assistente informa que não encontrou informações suficientes na base documental.

## Validação

O campo `question` é obrigatório e precisa ser uma string não vazia.

Uma requisição inválida recebe uma resposta HTTP `400 Bad Request`.

Exemplo inválido:

```json
{
  "question": ""
}
```

## Decisões técnicas

A primeira versão foi construída sem depender de uma API externa de inteligência artificial.

Essa decisão permite:

- execução local sem chave de API;
- menor complexidade de configuração;
- respostas previsíveis;
- controle sobre as fontes utilizadas;
- redução do risco de respostas inventadas.

A arquitetura foi organizada para permitir a evolução futura da busca sem a necessidade de alterar o frontend ou o contrato principal da API.

## Limitações atuais

- A busca é baseada principalmente em correspondência textual
- Sinônimos e perguntas semanticamente diferentes podem não ser reconhecidos
- Os documentos precisam estar disponíveis no projeto
- Não existe painel para gerenciar a base documental
- Não existe histórico de perguntas
- A resposta utiliza diretamente o trecho encontrado

## Possíveis melhorias

Em uma versão de produção, a solução poderia incluir:

- embeddings para busca semântica;
- banco de dados vetorial;
- arquitetura RAG;
- integração com um modelo de linguagem;
- geração de respostas mais naturais;
- upload e gerenciamento de documentos;
- histórico de consultas;
- autenticação;
- métricas de qualidade e confiança;
- testes automatizados da relevância;
- suporte a documentos PDF e outros formatos.

## Autor

Desenvolvido por Wellington Felipe de Oliveira Filho.