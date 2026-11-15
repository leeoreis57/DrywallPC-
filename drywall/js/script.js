/* ============================================================
   DrywallPC - script da página
   Projeto semestral da turma CDC2NA, UniFECAF, Expotech 2026

   Tudo aqui é JavaScript puro, sem bibliotecas, para rodar em
   qualquer servidor (IIS, Apache, nginx) e em qualquer navegador
   moderno. Se o script não carregar, a página continua legível:
   ele só acrescenta informação e interação.

   O que este arquivo faz:
   1. Mostra o endereço acessado e por qual caminho o visitante
      chegou (ngrok, rede local, localhost ou arquivo).
   2. Calcula o progresso do diário de obra (barra e texto) e
      atualiza a situação na placa de obra.
   3. Filtra as etapas do diário por status.
   4. Mostra quantos dias faltam para a entrega.
   5. Marca no menu a seção que está na tela.
   6. Abre as fotos ampliadas (lightbox) em vez de sair da página.
   7. Botão de voltar ao topo.
   ============================================================ */

(function () {
  'use strict';

  /* Percorre uma lista de elementos (NodeList ou array). */
  function cada(lista, fn) {
    Array.prototype.forEach.call(lista, fn);
  }

  /* ---------- 1. Endereço acessado ---------- */
  function mostrarEndereco() {
    var host = document.getElementById('host');
    var caminho = document.getElementById('caminho');
    if (!host) return;

    var nome = window.location.hostname;
    var porta = window.location.port;
    var https = window.location.protocol === 'https:';

    if (!nome) {
      host.textContent = 'arquivo aberto no computador (ainda fora do servidor)';
      if (caminho) caminho.textContent = 'nenhum servidor envolvido';
      return;
    }

    host.textContent = nome + (porta ? ':' + porta : '');
    if (!caminho) return;

    var texto;
    if (/ngrok/i.test(nome)) {
      texto = 'pela internet, através do túnel do ngrok';
    } else if (nome === 'localhost' || nome === '127.0.0.1' || nome === '[::1]') {
      texto = 'direto no próprio servidor (localhost)';
    } else if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(nome)) {
      texto = 'pela rede local, direto no IIS';
    } else {
      texto = 'pela internet';
    }
    caminho.textContent = texto + (https ? ', com HTTPS' : ', sem HTTPS');
  }

  /* ---------- 2. Progresso do diário de obra ---------- */
  function progresso() {
    var etapas = document.querySelectorAll('.diario > li');
    var total = etapas.length;
    if (!total) return;

    var concluidas = document.querySelectorAll('.diario > li .status.ok').length;
    var andando = document.querySelectorAll('.diario > li .status.andando').length;
    var pct = Math.round((concluidas / total) * 100);

    var barra = document.querySelector('.progresso-barra');
    var preenchimento = document.getElementById('progresso-fill');
    var texto = document.getElementById('progresso-texto');

    if (barra) {
      barra.setAttribute('aria-valuenow', String(pct));
      barra.setAttribute('aria-valuetext', concluidas + ' de ' + total + ' etapas concluídas');
    }
    if (preenchimento) {
      // Pequeno atraso para a barra "crescer" depois que a página aparece.
      window.setTimeout(function () { preenchimento.style.width = pct + '%'; }, 150);
    }
    if (texto) {
      var partes = [concluidas + ' de ' + total + ' etapas concluídas (' + pct + '%)'];
      if (andando) partes.push(andando + ' em andamento');
      texto.textContent = partes.join(', ') + '.';
    }

    // Placa de obra
    var situacao = document.getElementById('situacao');
    var situacaoProgresso = document.getElementById('situacao-progresso');
    if (situacao && concluidas === total) situacao.textContent = 'Obra concluída';
    if (situacaoProgresso) situacaoProgresso.textContent = concluidas + ' de ' + total + ' etapas concluídas';
  }

  /* ---------- 3. Filtro das etapas ---------- */
  function filtros() {
    var botoes = document.querySelectorAll('.filtros button[data-filtro]');
    var etapas = document.querySelectorAll('.diario > li');
    var vazio = document.getElementById('filtros-vazio');
    if (!botoes.length || !etapas.length) return;

    function aplicar(filtro) {
      var visiveis = 0;
      cada(etapas, function (li) {
        var mostra = filtro === 'todas' || !!li.querySelector('.status.' + filtro);
        li.classList.toggle('oculta', !mostra);
        if (mostra) visiveis++;
      });
      cada(botoes, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-filtro') === filtro ? 'true' : 'false');
      });
      if (vazio) vazio.hidden = visiveis > 0;
    }

    cada(botoes, function (b) {
      b.addEventListener('click', function () { aplicar(b.getAttribute('data-filtro')); });
    });
  }

  /* ---------- 4. Contagem para a entrega ---------- */
  function contagem() {
    var el = document.getElementById('contagem');
    if (!el) return;
    var data = el.getAttribute('data-data'); // formato AAAA-MM-DD
    if (!data) return;

    var p = data.split('-');
    var alvo = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var dias = Math.round((alvo - hoje) / 86400000);

    if (dias > 1) el.textContent = 'faltam ' + dias + ' dias';
    else if (dias === 1) el.textContent = 'falta 1 dia';
    else if (dias === 0) el.textContent = 'é hoje';
    else if (dias === -1) el.textContent = 'foi ontem';
    else el.textContent = 'foi há ' + (-dias) + ' dias';
  }

  /* ---------- 5. Seção ativa no menu ---------- */
  function menuAtivo() {
    var links = document.querySelectorAll('.topo nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var porId = {};
    cada(links, function (a) {
      var id = a.getAttribute('href').slice(1);
      if (document.getElementById(id)) porId[id] = a;
    });

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        cada(links, function (a) {
          a.classList.remove('ativo');
          a.removeAttribute('aria-current');
        });
        var link = porId[entrada.target.id];
        link.classList.add('ativo');
        link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    Object.keys(porId).forEach(function (id) {
      observador.observe(document.getElementById(id));
    });
  }

  /* ---------- 6. Foto ampliada ---------- */
  function lightbox() {
    var caixa = document.getElementById('lightbox');
    if (!caixa) return;
    var img = caixa.querySelector('img');
    var legenda = caixa.querySelector('figcaption');
    var botaoFechar = caixa.querySelector('.lightbox-fechar');
    var origem = null;

    function abrir(src, alt, texto, elementoOrigem) {
      img.src = src;
      img.alt = alt || '';
      legenda.textContent = texto || alt || '';
      caixa.hidden = false;
      document.body.classList.add('sem-rolagem');
      origem = elementoOrigem;
      botaoFechar.focus();
    }

    function fechar() {
      caixa.hidden = true;
      img.removeAttribute('src');
      document.body.classList.remove('sem-rolagem');
      if (origem) origem.focus();
    }

    // Qualquer link que envolva uma foto (.foto-real ou figura .print) abre no lightbox.
    document.addEventListener('click', function (ev) {
      var link = ev.target.closest ? ev.target.closest('a.foto-real, figure.print a') : null;
      if (!link) return;
      var foto = link.querySelector('img');
      if (!foto) return;
      ev.preventDefault();
      var figura = link.closest('figure');
      var cap = figura ? figura.querySelector('figcaption') : null;
      abrir(link.getAttribute('href'), foto.alt, cap ? cap.textContent : '', link);
    });

    botaoFechar.addEventListener('click', fechar);
    caixa.addEventListener('click', function (ev) { if (ev.target === caixa) fechar(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !caixa.hidden) fechar();
    });
  }

  /* ---------- 7. Voltar ao topo ---------- */
  function voltarTopo() {
    var botao = document.getElementById('voltar-topo');
    if (!botao) return;
    function checar() { botao.classList.toggle('visivel', window.scrollY > 600); }
    window.addEventListener('scroll', checar, { passive: true });
    checar();
  }

  /* ---------- Início ---------- */
  function iniciar() {
    mostrarEndereco();
    progresso();
    filtros();
    contagem();
    menuAtivo();
    lightbox();
    voltarTopo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
