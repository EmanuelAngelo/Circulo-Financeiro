# Aplicar a refatoração

1. Pare o Vite com Ctrl+C.
2. Guarde uma cópia da pasta frontend atual se tiver alterações próprias.
3. Extraia o ZIP dentro de `C:\Projetos\circulo`, aceitando substituir os arquivos existentes. O ZIP já contém a pasta `frontend`; não extraia dentro de `frontend`, para evitar duplicar o caminho.
4. No PowerShell:

```powershell
cd C:\Projetos\circulo\frontend
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

5. Abra `http://localhost:5173/#/`. Mantenha o Django em execução no outro terminal, como antes.

`npm ci` é necessário porque foram adicionados Vue Router e ferramentas de teste. Ele reinstala as dependências conforme o package-lock; não apaga banco ou dados do aplicativo.

Este pacote substitui o App.vue e adiciona a arquitetura modular. Não aplique novamente o patch antigo de App.vue por cima desta refatoração.

O backend, o banco e as migrações não foram alterados. O ZIP contém somente arquivos novos/modificados, sem node_modules, dist ou ambientes virtuais. O README existente foi atualizado; os detalhes da organização estão em docs/ARQUITETURA_FRONTEND.md e as regras para próximas alterações em AGENTS.md.
