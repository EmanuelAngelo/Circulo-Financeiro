# Arquitetura do frontend

O frontend usa Vue 3 com Composition API e Single-File Components, Vue Router e TypeScript estrito. A separação adotada é por responsabilidade, com composição explícita de dependências. O objetivo é permitir alterar uma tela ou formulário sem editar o restante da aplicação.

## Responsabilidades

| Local | Responsabilidade | Não deve conter |
|---|---|---|
| `src/App.vue` | Inicializa e fornece o contexto, renderiza autenticação ou layout | Telas completas, CRUD, fetch, cálculos |
| `src/app/` | Composition root e chave de injeção tipada | Regras de cada formulário |
| `src/router/` | Rotas e carregamento sob demanda | Estado financeiro |
| `src/layouts/` | Estrutura autenticada e posição das views | Regras financeiras |
| `src/views/` | Apresentação da rota, associação de dados e ações | Implementação de HTTP |
| `src/components/layout/` | Menu lateral, cabeçalho e título | Contratos de API |
| `src/components/forms/` | Campos e contratos tipados de edição | Fetch, conhecimento de URLs |
| `src/components/common/` | Modal acessível e avisos | Regras específicas de dívida |
| `src/components/finance/` | Coordenação do diálogo de edição | Implementação de endpoints |
| `src/composables/` | Estado reativo e comportamentos separados | Uma cópia do antigo monólito |
| `src/services/` | Cliente HTTP, CSRF, endpoints e exportação | Template ou interação de componentes |
| `src/types/` | Entidades, DTOs utilizados e tipos discriminados | Lógica de interface |
| `src/constants/`, `src/utils/` | Categorias, navegação, datas e formatação | Estado global mutável |
| `src/assets/styles/` | Estilos separados por área | JavaScript |
| `tests/` | Comportamento, integração e regressões | Dados financeiros reais |

## Composição e estado

`createApplication` instancia o cliente HTTP, os serviços e os composables compartilhados uma vez por aplicação. O contexto é fornecido por `provide` com `InjectionKey` tipada e recuperado com `useApplication`. Cada consumidor acessa somente os módulos de que precisa.

Não existe um objeto global mutável de autenticação/finanças. Estado de busca e ordenação pertence às respectivas views, enquanto estado de sessão e círculo é compartilhado. Pinia é uma opção de evolução caso o produto necessite de stores maiores, ferramentas específicas de depuração ou plugins; não é obrigatório para essa composição com APIs nativas do Vue.

- `useAuth`: sessão, entrada, cadastro e saída.
- `useCircles`: lista de círculos, seleção, associação e membros.
- `useFinance`: snapshot financeiro, carregamento, limpeza e mutações de registros.
- `useDashboard`: indicadores derivados exclusivos do painel.
- `useEntryFilters`: busca e filtro local de lançamentos.
- `useDebtPriorities`: ordenação local das dívidas.
- `useRecordEditor`: rascunho discriminado por entidade, abertura e salvamento.
- `useFeedback`: mensagens e bloqueio de submissões repetidas.
- `usePwa`: conectividade, atualização e instalação.
- `useCircleActions`: coordenação das ações de participação e convite.
- `usePageNavigation`: associação entre navegação e Vue Router.

## Formulários e fluxo de alteração

Os formulários financeiros recebem rascunhos tipados via `defineModel`. A entidade original é copiada ao abrir a edição, portanto cancelar não altera os registros carregados. Formulários de autenticação e participação em círculo emitem eventos de submissão com payload tipado. O componente de formulário não conhece URLs ou cookies.

O fluxo de salvamento é: formulário → diálogo/composable → serviço → HTTP → API Django → recarregamento do estado. Falhas mantêm a edição aberta e exibem o erro. Os métodos da API Django e suas regras não foram alterados.

## Navegação

Seis rotas nomeadas e carregadas sob demanda:

| Nome | URL de desenvolvimento |
|---|---|
| overview | `http://localhost:5173/#/` |
| entries | `http://localhost:5173/#/lancamentos` |
| debts | `http://localhost:5173/#/dividas` |
| budgets | `http://localhost:5173/#/planejamento` |
| goals | `http://localhost:5173/#/metas` |
| circle | `http://localhost:5173/#/circulo` |

Hash history foi escolhido para preservar o servidor Django/WhiteNoise existente sem introduzir reescrita de URLs no backend. Voltar, avançar e recarregar são gerenciados pelo router. A árvore autenticada só é montada quando há sessão; a autorização efetiva continua obrigatória no backend.

## Concorrência e isolamento

O carregamento financeiro usa uma geração de requisição. Uma resposta antiga só pode atualizar o estado se pertencer à geração atual e ao círculo selecionado. Trocar o círculo limpa os dados anteriores e fecha o formulário. O editor guarda o círculo em que foi aberto. Logout limpa o estado e invalida respostas ainda pendentes.

## Testes e limites

`npm run typecheck` verifica os tipos e proíbe declarações/parâmetros sem uso. `npm test` executa Vitest com Vue Test Utils. `npm run build` compila as views e gera a PWA.

Os dez testes incluem autenticação pelo formulário, salvamento de lançamento, passagem pelas seis rotas, logout, troca de círculo com resposta atrasada, invalidação após limpeza, cancelamento de rascunho ao trocar círculo, falha de salvamento, filtros e ordenação de dívidas. Alguns testes exercitam mais de um desses comportamentos.

Os testes de componentes executam em jsdom, com API e registro de service worker simulados. Não substituem conferência visual em navegador, testes físicos de instalação PWA ou testes ponta a ponta contra o Django real. As limitações funcionais da primeira versão, como ausência de sincronização bancária e uso online dos dados financeiros, continuam iguais.

Referências oficiais consultadas: https://vuejs.org/guide/reusability/composables • https://vuejs.org/guide/scaling-up/state-management • https://router.vuejs.org/guide/
