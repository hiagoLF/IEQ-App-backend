# Projeto IEQApp BackEnd
* Aplicativo para Igreja do Evanjelho Quadrangular em Iguaí Bahia
* Funções: Cadastro de membros e carteirinha de identificação, Inscrições em eventos da igreja, e Informações Gerais.

# Tecnologias Utilizadas
* Base: NodeJs
* Server Framework: Express
* Banco de dados Base: MonogoDB + Mongoose
* Banco de Imagens: Amazon Web Services - S3
* Requisições com imagens: Multer
* Autenticação: Json Web Token (JWT)
* Encriptação: Bcrypt

# Rotas e descrições





## Rotas de Usuários
#### POST /users/create --> OK
--> Criar novo usuário
--> req => JSON {
        login,
        password,
        name,
    }
--> res => {
    token + informações do usuário
}

#### POST /user/login --> OK
--> req => JSON {
        login,
        password
    }
--> res => JSON {
    TOKEN + informações de usuário
}

#### GET /user/refresh --> OK
--> req ==> header {
    Authorization: Bearer (user token)
}
--> res => JSON {
    TOKEN + informações de usuário
}

#### PUT /user/edit/:identificator --> OK
--> Editar Dados de um usuário
--> req => JSON {
        name, --> Só adm pode
        memberSince, --> Só adm pode
        type --> Só adm (Só o adm 0 que pode colocar outras pessoas no adm 1 e 0)
        login,
        password
    }
--> res => JSON {
    message: 'user was updated'
}

#### PUT /user/editimage/:identificator --> OK
--> Editar imagem de perfil do usuário
--> req ==> Form {
    image: (imagem do usuário)
}
--> res ==> JSON {
    message: 'image updated'
}

#### DELETE /users/:identificator --> OK
--> Deletar Usuário
--> req ==> header {
    Authorization: Bearer (token de administrador)
}


#### GET /user/byname/:name --> OK
--> Pegar usuários pelo nome
--> req ==> header {
    Authorization: Bearer (token de administrador)
}

#### GET /user/:page --> OK
--> Pegar todos os usuários por página
--> req ==> header {
    Authorization: Bearer (token de administrador)
}

#### DELETE /user/lougout --> OK
--> Deslogar usuário





## Rotas de Índicies de Postagens
#### POST /postindex/create --> OK
--> Criar índicie
--> req ==> {
    headers { Authentication: Bearer (token do administrador) }
    JSON {
        name
    }
}

#### DELETE /postindex/:id --> OK
--> Deletar índicie
--> req ==> headers {
    Authorization: Bearer (token do administrador)
}

#### PUT /postindex/:id --> OK
--> Editar índicie por id
--> req ==> {
    JSON { name: 'Novo nome' }
    headers { Authorization: Bearer (token do administrador) }
}


#### GET /postindex/ --> OK
--> Pegar todos os índicies
--> req ==> Nada

#### GET /postindex/:indexid/:page --> OK
--> Pegar todos os posts de determinado índicie por página




## Rotas de Postagens
#### POST /post/create --> OK
--> req ==> {
    headers { Authorization: Bearer (token do administrador) }
    JSON {
        title --> Obrigatório
        indexId --> Obrigatório
        topics
        peopleBoard
        links
        callTo
        editors
        public
    }
}

#### PUT /post/edit/:id --> OK
--> Editar postagem pelo id
--> req ==> {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    JSON {
        title
        indexId
        topics
        peopleBoard
        links
        callTo
        editors
        public
    }
}

#### DELETE /post/:id --> OK
--> Deletar postagem
--> req ==> headers {
    Authorization: Bearer (token do adm)
}

#### PUT /post/editimage/:id --> OK
--> Editar Imagem de um post
--> req ==> {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    coverImage: (Imagem quer será colocada como cover do post)
}

#### GET /post/:postId




## Rotas do Album de imagens
#### POST /album/create --> OK
--> Criar Album
--> req {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    JSON { title: 'Título do Album' }
}

#### DELETE /album/:id --> Ok
--> Deletar Album
--> req ==> headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }


#### PUT /album/update/:id --> OK
--> Mudar título de um album
--> req {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    JSON { title: 'Novo título' }
}

#### DELETE /album/:albumid/image --> OK
--> Deletar uma imagem de um album
--> req {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    JSON { imageKey: 'key da imagem' }
}

#### PUT /album/:albumid/newimage --> OK
--> Inserir nova imagem em um album
--> req {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    Form { albumImage: (Nova imagem) }
}

#### GET /album/:page --> OK
--> Pegar albuns por página





## Rotas de eventos
#### POST /event/create --> OK
--> Criar Evento
--> req ==> {
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    JSON {
        eventADMs
        { ... dados do post, no mesmo formato de post }
    }
}

#### DELETE /event/:id --> OK
--> Deletar Evento
--> req ==> headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }

#### PUT /event/edit/:id --> OK
--> Editar editar administradores de um evento
    headers { Authorization: Bearer (token adm ou de um dos editores da postagem) }
    JSON {
        eventADMs
        { ... dados do post, no mesmo formato de post }
    }

#### POST /event/:id/subscribe --> OK
--> Se inscrever em um evento
--> req ==> {
    headers { Authorization: Bearer (token do usuário) }
}

#### POST /event/confirm/:eventid/:identificator --> OK
--> Confirmar Alguém em um evento
--> req ==> {
        headers { Authorization: Bearer (token de administrador ou de alguém autorizado no evento) }
}

#### GET /event/:page --> OK
--> Buscar Eventos por página
--> req ==> headers { Authorization: Bearer (token de usuário) }

#### GET /event/byid/:eventId
--> Buscar um evento por seu id
