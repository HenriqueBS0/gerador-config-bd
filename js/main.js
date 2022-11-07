class Main {

    static campos;
    static tabelas;
    static botoes;

    static tabelaSelecionada = null;

    static processaDadosOnLoad() {
        this.mapearElementos();
        this.setEventos();
    }

    static mapearElementos() {
        this.mapearCampos();
        this.mapearTabelas();
        this.mapearBotoes();
    }

    static mapearCampos() {
        this.campos = {
            host : $('#host'),
            port : $('#port'),
            user : $('#user'),
            pass : $('#pass'),
            sgbd : $('#sgbd'),
            
            baseDados           : $('#base-dados'),

            nomeTabelaAdicionar : $('#nome-tabela-adicionar'),
            nomeTabelaAlterar   : $('#nome-tabela-alterar'),

            nomeColuna    : $('#nome-coluna'),
            tipoColuna    : $('#tipo-coluna'),
            chavePrimaria : $('#chave-primaria'),
            naoNula       : $('#nao-nula'),
            serial        : $('#serial'),
        }
    }

    static mapearTabelas() {
        this.tabelas = {
            tabelas : $('#tabela-tabelas'),
            colunas : $('#tabela-colunas')
        }
    }

    static mapearBotoes() {
        this.botoes = {
            visualizar      : $('#visualizar'),
            baixar          : $('#baixar'),
            adicionarTabela : $('#adicionar-tabela'),
            adicionarColuna : $('#adicionar-coluna'),
        }
    }

    static setEventos() {
        this.setOnClickVisualizar();
        this.setOnClickBaixar();
        this.setOnClickAdicionarTabela();
        this.setOnChangeNomeTabela();
        this.setOnDefinirChavePrimaria();
        this.setOnChangeNaoNula();
        this.setOnClickAdicionarColuna();
    }

    static setOnClickVisualizar() {
        this.botoes.visualizar.on('click', this.onClickVisualizar.bind(this));
    }

    static onClickVisualizar() {
        const janela = window.open('', "json");
        janela.document.write(`<pre>${JSON.stringify(this.getObjetoDados(), null, 4)}</pre>`);
    }

    static setOnClickBaixar() {
        this.botoes.baixar.on('click', this.onClickBaixar.bind(this));
    }

    static onClickBaixar() {
        const conteudo = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.getObjetoDados()));
        var link = document.createElement('a');
        link.setAttribute("href", conteudo);
        link.setAttribute("download", `${(new Date().getTime())}_config.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    static getObjetoDados() {
        return {
            gerenciador : this.campos.sgbd.val(),
            conexao     : {
                host : this.campos.host.val(),
                port : this.campos.port.val(),
                user : this.campos.user.val(),
                pass : this.campos.pass.val(),
            },
            baseDados : {
                nome    : this.campos.baseDados.val(),
                tabelas : this.getTabelas()
            }
        };
    }

    static getTabelas() {
        const tabelas = [];

        this.tabelas.tabelas.find('tbody tr').each(function() {
            tabelas.push($(this).prop('dados'));
        });

        return tabelas;
    }

    static setOnClickAdicionarTabela() {
        this.botoes.adicionarTabela.on('click', this.onClickAdicionarTabela.bind(this));
    }

    static onClickAdicionarTabela() {
        const nomeTabela = this.campos.nomeTabelaAdicionar.val().trim();

        this.campos.nomeTabelaAdicionar.val(null);

        const btnRemover = $(
            `<button type="button" class="btn btn-danger">
                <i class="bi bi-trash-fill"></i>
            </button>`
        ); 

        const tr = $('<tr>').append([
            $('<td>', {html: nomeTabela}),
            $('<td>').css('width', '10px').append(btnRemover),
        ]).css('cursor', 'pointer').prop('dados', {
            nome: nomeTabela,
            colunas: [] 
        });

        tr.on('click', evento => this.onClickTrTabelaTabelas(evento, tr));

        btnRemover.on('click', this.onClickRemoverTrTabelaTabela.bind(this, tr));

        this.tabelas.tabelas.find('tbody').first().append(tr);
        this.selecionarTr(tr);
    }

    static onClickTrTabelaTabelas(evento, tr) {
        if(evento.target.tagName !== 'TD' && evento.target.tagName !== 'TR') {
            return;
        }

        this.selecionarTr(tr);
    }

    static selecionarTr(tr) { 
        if(this.tabelaSelecionada !== null) {
            this.tabelaSelecionada.removeClass('table-light');
        }
        
        this.tabelaSelecionada = tr.addClass('table-light');

        this.carregarDadosTabela(tr.prop('dados'))
    }

    static carregarDadosTabela({nome, colunas}) {

        this.campos.nomeColuna.val(null);
        this.campos.tipoColuna.val('INT');
        this.campos.chavePrimaria.prop('checked', false);
        this.campos.naoNula.prop('checked', false);
        this.campos.serial.prop('checked', false);

        this.campos.nomeTabelaAlterar.val(nome);

        this.tabelas.colunas.find('tbody').first().empty();

        colunas.forEach(dadosColuna => this.inserirColuna(dadosColuna));
    }

    static onClickRemoverTrTabelaTabela(tr) {
        if(this.tabelaSelecionada === tr) {
            this.tabelaSelecionada = null;
            this.carregarDadosTabela({nome: null, colunas: []});
        }

        tr.remove();
    }

    static setOnChangeNomeTabela() {
        this.campos.nomeTabelaAlterar.on('blur, change, keypress, keyup', this.onChangeNomeTabela.bind(this));
    }

    static onChangeNomeTabela() {
        if(this.tabelaSelecionada === null) {
            return;
        }

        this.alterarDadosTabela({nome: this.campos.nomeTabelaAlterar.val().trim()})
    }

    static alterarDadosTabela(dados) {
        dados = $.extend(this.tabelaSelecionada.prop('dados'), dados);
        this.tabelaSelecionada.prop('dados', dados);
        this.tabelaSelecionada.find('td').first().text(dados.nome);
    }

    static setOnDefinirChavePrimaria() {
        this.campos.chavePrimaria.on('change', () => {
            if(this.campos.chavePrimaria.prop('checked')) {
                this.campos.naoNula.prop('checked', true);
            }
        });
    }

    static setOnChangeNaoNula() {
        this.campos.naoNula.on('change', () => {
            if(this.campos.chavePrimaria.prop('checked')) {
                this.campos.naoNula.prop('checked', true);
            }
        });
    }

    static setOnClickAdicionarColuna() {
        this.botoes.adicionarColuna.on('click', this.onClickAdicionarColuna.bind(this));
    }

    static onClickAdicionarColuna() {
        if(this.tabelaSelecionada === null) {
            return;
        }

        const dados = {
            nome          : this.campos.nomeColuna.val().trim(),
            tipo          : this.campos.tipoColuna.val(),
            chavePrimaria : this.campos.chavePrimaria.prop('checked'),
            naoNula       : this.campos.naoNula.prop('checked'),
            serial        : this.campos.serial.prop('checked'),
        };

        this.campos.nomeColuna.val(null);
        this.campos.tipoColuna.val('INT');
        this.campos.chavePrimaria.prop('checked', false);
        this.campos.naoNula.prop('checked', false);
        this.campos.serial.prop('checked', false);

        this.inserirColuna(dados);

        this.alterarDadosTabela({colunas: this.getColunasTabela()});
    }

    static inserirColuna({nome, tipo, chavePrimaria, naoNula, serial}) {
        const btnRemover = $(
            `<button type="button" class="btn btn-danger">
                <i class="bi bi-trash-fill"></i>
            </button>`
        ); 

        const tr = $('<tr>').append([
            $('<td>', {html: nome}),
            $('<td>', {html: tipo}),
            $('<td>', {html: chavePrimaria ? 'Sim' : 'Não'}),
            $('<td>', {html: naoNula       ? 'Sim' : 'Não'}),
            $('<td>', {html: serial        ? 'Sim' : 'Não'}),
            $('<td>').append(btnRemover),
        ]).css('cursor', 'pointer').prop('dados', {nome, tipo, chavePrimaria, naoNula, serial});

        btnRemover.on('click', this.onClickRemoverTrTabelaColuna.bind(this, tr));

        this.tabelas.colunas.find('tbody').first().append(tr);
    }

    static onClickRemoverTrTabelaColuna(tr) {
        tr.remove();
        this.alterarDadosTabela({colunas: this.getColunasTabela()});
    } 

    static getColunasTabela() {
        const colunas = [];

        this.tabelas.colunas.find('tbody tr').each(function() {
            colunas.push($(this).prop('dados'));
        });

        return colunas;
    }
}