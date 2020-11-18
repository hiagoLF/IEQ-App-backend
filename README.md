# Rotas e descrições

## Rotas de Usuários
#### GET /users
--> Recuperar informações de todos os usuário
--> Header
    Authorization: Bearer (Usuário Hierarquia max 1)

#### POST /users/create
--> Criar novo usuário
--> JSON {
        Login,
        Password_1x,
        Password_2x, --> Só para confirmação
        Name,
    }
--> Retorna um token de acesso

#### GET /users/indexes?page
--> Recuperar índicies de todos os usuários {
        index,
        name,
        image,
    }
--> Header {
        Authorization: Bearer (Usuário Hierarquia max 1)
    }
--> Informar a página

#### GET /users/index?byname=@
--> Recuperar índicies do usuário buscado pelo nome {
        index,
        name,
        image,
    }
--> Header {
        Authorization: Bearer (Usuário Hierararquia min 1)
    }

#### GET /users/:index
--> Recuperar usuário por índicie{
        Todas as informações
    }
--> Header {
        Authorization: Bearer (Usuário Hierarquia max 1)
    }

#### POST /users/login
--> JSON {
        login,
        password
    }
--> Retornar um token de acesso

#### POST /users/editme
--> Editar Dados
--> JSON {
        about: 'max 200 caracteres',
        memberSince: 'string', --> Só pode editar uma vez
    }
--> Header {
        Authorization: Bearer (Token)
    }

#### POST /users/edit
--> Editar Dados
--> JSON {Todos os dados a serem editados}
--> Header
    Authorization: Bearer (Token do administrador)

#### GET /users/info/me
--> Informações do usuário logado
--> Headers {
        Authorization Bearer (Token usuário)
    }

#### POST /users/editpassword
--> Alterar Senha
--> JSON {
        oldPassword,
        newPassword1x,
        newPassword2x,
    }
--> Header {
        Authorization (Token)
    }



## Rotas de Informações Gerais (Descriptions)
#### POST /ministry/create
--> Criar ministério
--> JSON {
        name,
        cover: image,
        about,
        publishers: id, 
    }
--> Header --> Token de Hierarquia max 1

#### GET /ministry/:id/info
--> Retorna todas as informações do ministério

#### POST /ministry/:id/edit
--> Editar informações do ministério
--> JSON {
        Todas as informações a serem editadas,
        topics[title, text, imageindex],
        imagetopic...
    }
--> Header --> { 
        Token min 1 ou token do editor
    }

#### GET /ministry/ids
--> Pegar id de todos os ministérios que está inscrito ou de todos se for hierarquia max 1.

#### DELETE /ministry/:id
--> Deletar ministério
--> Header --> {
        Token min 1
    }


#### POST /history/create
--> Criar nova história
--> JSON {
        title,
        cover,
        topics[],
        imagetopics...,
        links[title, url]
    }
--> Header --> Usuário Max 1

#### GET /history/ids
--> Recuperar ids das histórias
--> Recuperar {
        id,
        name,
        about
        coverlink
    }

#### GET /history/:id
--> Recuperar tudo de uma história

#### POST history/:id/edit
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE history/:id
--> Deletar história
--> Header --> Hierarquia max 1



#### POST  notice/create
--> Criar nova história
--> JSON {
        title,
        cover,
        topics[],
        imagetopics...,
        links[title, url]
    }
--> Header --> Usuário Max 1

#### GET  notice/ids
--> Recuperar ids das notícias
--> Recuperar {
        id,
        name,
        about
        coverlink
    }

#### GET  notice/:id
--> Recuperar tudo de uma notícia

#### POST notice/:id/edit
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE notice/:id
--> Deletar notícia
--> Header --> Hierarquia max 1




#### POST  reflections/create
--> Criar nova reflexão
--> JSON {
        title,
        description,
        author,
        cover,
        topics[], (opcional)
        imagetopics..., (opcional)
        links[title, url] (opcional)
        link youtube Vídeo (opcional)
    }
--> Header --> Usuário Max 1

#### GET  reflections/ids
--> Recuperar ids das reflexões
--> Recuperar {
        id,
        name,
        about
        coverlink
    }

#### GET  reflections/:id
--> Recuperar tudo de uma reflexão

#### POST reflections/:id/edit
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE reflections/:id
--> Deletar reflexão
--> Header --> Hierarquia max 1





#### POST  minister/create
--> Criar nova pastor
--> JSON {
        name,
        cover,
        office,
        topics
        telephone,
        links
    }
--> Header --> Usuário Max 1

#### GET  minister/ids
--> Recuperar ids dos pastores
--> Recuperar {
        id,
        name,
        about
        coverlink
    }

#### GET  minister/:id
--> Recuperar tudo de um pastor

#### POST minister/:id/edit
--> Editar informações
--> JSON --> Qualquer coisa
--> Header --> Hierarquia max 1

#### DELETE minister/:id
--> Deletar pastor
--> Header --> Hierarquia max 1





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




#### POST /event/create
--> Criar um evento {
        name,
        date,
        description,
        topics[]
        imageTopics...
        subscribers{id, date, confirmed},
        creator,
        openToSubscribe,
        ministry,
    }

#### GET /event/ids
--> Recuperar ids

#### GET /event/:id
--> Ler informações do evento

#### PUT /events/:id
--> Editar evento
--> Quem pode é o adm ou o líder do ministério

#### DELETE /events/:id
--> Deletar evento

#### POST /events/:id/subscribe
--> Se inscrever no evento
--> enviar token pela header

#### PUT /events/:eventid/confirm/:userid
--> Confirmar inscrição de usuário





#### POST /relationgroup/create
--> Criar um grupo de relacionamento
--> JSON {
        name,
        description,
    }

#### POST /relationgroup/ids
--> Recuperar ids dos grupos de relacionamentos

#### PUT /relationgroups/:id
--> Editar dados {
        name,
        description,
        leaders,
    }

#### POST /relationgroups/:id/createlesson
--> Enviar nova lição {
        Título,
        Descrição
    }



#### POST /social/edit
--> Criar ou editar dados das redes sociais
--> {
        Instagram,
        Facebook,
        Youtube,
        Twitter
    }