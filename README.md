# Projeto IEQApp BackEnd
Aplicativo para Igreja do Evanjelho Quadrangular em Iguaí Bahia
Funções: Cadastro de membros e carteirinha de identificação, Inscrições em eventos da igreja, e Informações Gerais.

# Tecnologias Utilizadas
Base: NodeJs
Server Framework: Express
Banco de dados Base: MonogoDB + Mongoose
Banco de Imagens: Amazon Web Services - S3
Requisições com imagens: Multer
Autenticação: Json Web Token (JWT)
Encriptação: Bcrypt

# Rotas e descrições

## Rotas de Usuários
#### GET /users --> OK
--> Recuperar informações de todos os usuário
--> Header
    Authorization: Bearer (Usuário Hierarquia max 1)

#### POST /users/create --> OK
--> Criar novo usuário
--> JSON {
        Login,
        Password,
        Name,
    }
--> O Servidor deverá gerar um identificator
--> Retorna um token de acesso

#### GET /users/indexes/page?pg=1 --> OK
--> Recuperar índicies de todos os usuários {
        index,
        name,
        image,
    }
--> Header {
        Authorization: Bearer (Usuário Hierarquia max 1)
    }
--> Informar a página

#### GET /users/index/by?name=hiago --> OK
--> Recuperar índicies do usuário buscado pelo nome {
        identificator,
        name,
        image,
    }
--> Header {
        Authorization: Bearer (Usuário Hierararquia min 1)
    }

#### GET /users/:identificator --> OK
--> Recuperar usuário por identificador{
        Todas as informações
    }
--> Header {
        Authorization: Bearer (Usuário Hierarquia max 1)
    }

#### POST /users/login --> OK
--> JSON {
        login,
        password
    }
--> Retornar um token de acesso

#### PUT /users/edit/me --> OK
--> Editar Dados
--> JSON {
        about: 'max 200 caracteres',
        memberSince: 'string', --> Só pode editar uma vez
        image: 'pequena'
    }
--> Header {
        Authorization: Bearer (Token)
    }

#### PUT /users/edit/byadm --> OK
--> Editar Dados pelo administrador
--> JSON {
        Todos os dados a serem editados
        identificador do usuário
    }
--> Header
    Authorization: Bearer (Token do administrador)

#### GET /users/info/me --> OK
--> Informações do usuário logado
--> Headers {
        Authorization Bearer (Token usuário)
    }

#### PUT /users/editpassword --> OK
--> Alterar Senha
--> JSON {
        oldPassword,
        newPassword,
    }
--> Header {
        Authorization (Token)
    }

#### DELETE /users/:identificator --> OK
--> Deletar Usuário
--> Header --> {
        Token min 1
    }


## Rotas de Informações Gerais (Descriptions)
#### POST /ministry/create --> OK
--> Criar ministério
--> JSON {
        name,
        editores,
    }
--> Header --> Token de Hierarquia max 1

#### GET /ministry/:id/info --> OK
--> Retorna todas as informações de um ministério
--> Todo mundo pode ler. Até quem não está logado

#### GET /ministry/ids --> OK
--> Pegar id, nome e imagem dos ministérios.

#### POST /ministry/editone --> OK
--> Editar informações de um ministério
--> JSON {
        id do ministério --> ministryId
        Todas as informações a serem editadas,
        coverImage --> url
    }
--> Header --> { 
        Token min 1 ou token do editor
    }

#### PUT /ministry/editmembers --> OK
--> Inserir e colocar membros
--> É só enviar a lista nova de membros
{
    // identificador - líder
    ministryId: 'sdfsdfse'
    members: [
        ['identificator', true],
        ['identificator', true],
        ['identificator', false] 
    ]
}
--> Pode fazer isso o administrador ou o líder do ministério

#### DELETE /ministry/:id --> OK
--> Deletar ministério
--> Header --> {
        Token min 1
    }




#### POST /history/create --> OK
--> Criar nova história --> OK
--> JSON {
        title,
        description,
        coverImage --> Image,
        text,
        links[title, url],
        published,
    }
--> Header --> Usuário Max 1

#### GET /history/byadm --> OK
--> Recuperar todas as histórias se o usuário for administrador

#### GET /history/byuser --> OK
--> Recuperar apenas histórias publicadas

#### PUT history/:id/edit --> OK
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE history/:id --> OK
--> Deletar história
--> Header --> Hierarquia max 1




#### GET /news/published?page=1 --> OK
--> Qualquer usuário pega as notícias já publicadas

#### GET /news/unpublished?page=1 --> OK
--> Author ou administrador pega as notícias não publicadas

#### POST news/create --> OK
--> Criar nova história
--> JSON {
        title,
        cover,
        links[title, url]
        published,
        authorIdentificator,
        authorID,
        authorName,
        text,
    }
--> Header --> Usuário Max 1

#### POST news/:id/edit --> OK
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE news/:id --> OK
--> Deletar notícia
--> Header --> Hierarquia max 1 OU autor da notícia




#### POST  reflections/create --> OK
--> Criar nova reflexão
--> JSON {
        title,
        description,
        author,
        cover,
        text, (opcional)
        links[title, url] (opcional)
        link youtube Vídeo (opcional)
        published
    }
--> Header --> Usuário Max 1

#### GET  /reflections/published?page=1 --> OK
--> Recuperar todas as reflexões publicas
--> Paginate

#### GET  /reflections/unpublished?page=1 --> OK
--> Recuperar todas as reflexões não publicas
--> Paginate
--> Apenasa ADM

#### PUT reflections/:id/edit --> OK
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE reflections/:id --> OK
--> Deletar reflexão
--> Header --> Hierarquia max 1





#### POST /shepherd/create --> Ok
--> Criar novo pastor
--> JSON {
        name,
        cover,
        office,
        text,
        telephone,
        links
    }
--> Header --> Usuário Max 1

#### GET /shepherds/published?page=1 --> OK

#### GET /shepherds/unpublished?page=1 --> OK

#### PUT /shepherds/:id/edit --> OK
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE /shepherds/:id --> OK
--> Deletar pastor
--> Header --> Hierarquia max 1





#### POST /event/create --> OK
--> Criar um evento {
        name,
        date,
        description,
        text,
        subscribers{id, date, confirmed},
        creator,
        openToSubscribe,
        ministry,
        coverImage
    }

#### PUT /events/:id --> OK
--> Editar evento
--> Quem pode é o adm ou quem criou o evento

#### DELETE /events/:id --> OK
--> Deletar evento
--> ADM ou quem criou

#### POST /events/:id/subscribe --> OK
--> Se inscrever no evento
--> enviar token pela header
--> Receber código de inscrição que será mostrado no QrCode

juju --> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzJkMzZmNjVlOGE1M2M3MDRlZTJlNyIsImlhdCI6MTYwODA1NzQ3MSwiZXhwIjoxNjA4MTQzODcxfQ.2RDuV7UU412ZU9xUD6Y52tuNnueeksvvG0nDH4lV4zY

bundu --> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzEwN2I4YmZmYTVjMjkxMGU3ZmI5MCIsImlhdCI6MTYwODA1NzkxMSwiZXhwIjoxNjA4MTQ0MzExfQ.zwESJvI2a6x4EkXkwuomMnkJUC3lpIwbnDrkl-0kEig

#### DELETE /events/:id/unsubscribe --> OK
--> Se desinscrever

#### DELETE /events/:id/unsubscribe/:user --> OK
--> desinscrever um usuário pelo identificator
--> Apenas adms e donos do evento podem.

#### PUT /events/:eventid/confirm/ --> OK
--> Confirmar inscrição de usuário
--> Só quem pode confirmar é o adm ou líderes do ministério
{
    Enviar Identificator que o usuário mostrou no QrCode
}

#### PUT /events/:eventid/subscribe/byadm --> OK
--> ADM ou criador do evento inscreve alguém e já confirma




#### POST /social/create --> OK
--> Criar ou editar dados das redes sociais
--> {
        name,
        adress,
        icon
    }
--> Só o adm faz isso

#### GET /social --> OK
--> Pegar redes sociais

#### DELETE /social/:id --> OK
--> Deletar rede social pelo id





#### POST /album/create
--> Criar album de fotos
--> JSON {
        title,
        description: opcional,
        date,
        cover,
        images...
    }

#### POST /album/ids
--> Retorna ids dos albuns

#### GET /album/:id
--> Todas as informações de um album

#### PUT /album/:id
--> Editar um album --> Excluir e add fotos

#### DELETE /album/:id
--> Deletar album


juju --> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZGI0YTJkNGRiYjA0MzIwMDdhMmJiZiIsImlhdCI6MTYwODIwNjg5MywiZXhwIjoxNjA4MjkzMjkzfQ.Dhlg1yaXcS9NTZckgrFs-NtFMu1LoQJpW9bgzPaXwYE

bubu --> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZGI0YTUxNGRiYjA0MzIwMDdhMmJjMCIsImlhdCI6MTYwODIwNjkyOSwiZXhwIjoxNjA4MjkzMzI5fQ.Y07Nqg-WsIN83N5xgWGZywlHh_Z_Y2Nx-qwuGiu1y2c

