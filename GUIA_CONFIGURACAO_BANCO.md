# Guia de Configuração do Banco de Dados (Passo a Passo)

Você tem o **carro** (o código do aplicativo), mas ele precisa de **combustível** (o Banco de Dados) para andar. Atualmente, o aplicativo está tentando conectar em um banco que não existe no seu computador.

Vamos resolver isso criando um banco de dados **gratuito e profissional** na nuvem usando o **Supabase**.

## Passo 1: Criar o Banco de Dados

1. Acesse o site [supabase.com](https://supabase.com) no seu navegador.
2. Clique no botão verde **"Start your project"**.
3. Faça login (pode usar sua conta do GitHub se tiver, ou crie uma conta com email).
4. Clique em **"New Project"**.
5. Preencha o formulário:
   - **Name**: `TrainerPro`
   - **Database Password**: Crie uma senha forte (ex: `MinhaSenhaForte123!`). **ANOTE ELA AGORA, VOCÊ VAI PRECISAR!**
   - **Region**: Escolha `South America (São Paulo)` para ser mais rápido.
6. Clique em **"Create new project"**.
   - *Aguarde alguns minutos enquanto eles configuram o servidor para você.*

## Passo 2: Pegar o Endereço de Conexão

1. **Olhe para o TOPO da tela**.
2. Na barra superior (onde tem o nome do projeto), procure um botão cinza chamado **"Connect"** (perto da barra de busca).
3. Uma janela vai abrir. Clique na aba **"ORM"** ou **"URI"**.
4. Selecione **"Prisma"** (se houver opção) ou apenas copie a string que aparece.
5. Você verá algo parecido com isso:
   ```
   postgresql://postgres.vqsxampleuser:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
6. **Copie** esse código inteiro.

## Passo 3: Colocar no Código

1. Volte para o VS Code.
2. Abra o arquivo chamado `.env` (está na lista de arquivos à esquerda).
3. Encontre a linha que começa com `DATABASE_URL=`.
4. Apague tudo o que está depois do `=` e cole o código que você copiou do Supabase.
5. **Atenção**: Onde estiver escrito `[YOUR-PASSWORD]` na linha que você colou, apague e escreva a senha que você criou no Passo 1 (ex: `MinhaSenhaForte123!`).

   **Vai ficar parecido com isso (exemplo):**
   ```env
   DATABASE_URL="postgresql://postgres.vqsxampleuser:MinhaSenhaForte123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
   ```

6. Salve o arquivo (Ctrl + S).

---

## Passo 4: Avisar o Sistema

Assim que você salvar o arquivo `.env` com a URL correta, o "combustível" estará conectado.

Volte para o chat comigo e diga: **"Pronto, configurei o banco"**.

Aí eu poderei rodar os comandos para criar as tabelas e o app vai funcionar!
