/* ============================================================
   DrywallPC - script da loja (loja.html)
   Projeto semestral da turma CDC2NA, UniFECAF, Expotech 2026

   JavaScript puro, sem bibliotecas e sem servidor de aplicação:
   o IIS só entrega os arquivos e tudo acontece no navegador.

   O que este arquivo faz:
   1. Monta o catálogo a partir da lista PRODUTOS (abaixo).
   2. Busca, filtro por categoria e ordenação.
   3. Carrinho salvo no navegador (localStorage), com quantidade
      limitada ao estoque.
   4. Calculadora de parede: estima o material e coloca no carrinho.
   5. Finalização do pedido (demonstração, sem pagamento).
   ============================================================ */

(function () {
  'use strict';

  /* Produtos: a lista fica em js/produtos.js (usada também pelo simulador). */
  var PRODUTOS = window.PRODUTOS || [];

  var CHAVE_CARRINHO = 'drywallpc-carrinho';
  var CHAVE_PEDIDOS = 'drywallpc-pedidos';
  var FRETE = 60;
  var FRETE_GRATIS_ACIMA = 800;

  /* ---------- Utilidades ---------- */
  var porId = {};
  PRODUTOS.forEach(function (p) { porId[p.id] = p; });

  function $(id) { return document.getElementById(id); }

  function dinheiro(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // O navegador pode bloquear o localStorage (janela anônima, por exemplo).
  // Nesse caso a loja continua funcionando, só não lembra o carrinho.
  function ler(chave, padrao) {
    try {
      var bruto = window.localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) { return padrao; }
  }
  function gravar(chave, valor) {
    try { window.localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
  }

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  var timerAviso;
  function avisar(texto) {
    var a = $('aviso');
    a.textContent = texto;
    a.classList.add('visivel');
    window.clearTimeout(timerAviso);
    timerAviso = window.setTimeout(function () { a.classList.remove('visivel'); }, 2200);
  }

  /* ---------- Carrinho (estado) ---------- */
  // Formato: { "placa-ru": 3, "trena": 1 }
  var carrinho = ler(CHAVE_CARRINHO, {});
  // Descarta itens que não existem mais no catálogo e limita ao estoque
  // (o simulador também grava neste carrinho).
  Object.keys(carrinho).forEach(function (id) {
    if (!porId[id] || !(carrinho[id] > 0)) delete carrinho[id];
    else carrinho[id] = Math.min(Math.floor(carrinho[id]), porId[id].estoque);
  });

  function adicionar(id, qtd, silencioso) {
    var p = porId[id];
    var atual = carrinho[id] || 0;
    var nova = Math.min(atual + qtd, p.estoque);
    carrinho[id] = nova;
    salvarCarrinho();
    if (!silencioso) {
      if (nova === atual) avisar('Estoque máximo de ' + p.nome + ' já está no carrinho.');
      else avisar(p.nome + ' adicionado ao carrinho.');
    }
    return nova - atual;
  }

  function definir(id, qtd) {
    if (qtd <= 0) delete carrinho[id];
    else carrinho[id] = Math.min(qtd, porId[id].estoque);
    salvarCarrinho();
  }

  function salvarCarrinho() {
    gravar(CHAVE_CARRINHO, carrinho);
    desenharCarrinho();
  }

  function subtotal() {
    return Object.keys(carrinho).reduce(function (s, id) { return s + porId[id].preco * carrinho[id]; }, 0);
  }
  function quantidadeTotal() {
    return Object.keys(carrinho).reduce(function (s, id) { return s + carrinho[id]; }, 0);
  }
  function valorFrete(sub) {
    var marcado = document.querySelector('input[name="entrega"]:checked');
    if (!marcado || marcado.value === 'retirada') return 0;
    return sub >= FRETE_GRATIS_ACIMA ? 0 : FRETE;
  }

  /* ---------- 1 e 2. Catálogo, busca e filtros ---------- */
  var filtroCat = 'Todas';

  function montarCategorias() {
    var caixa = $('categorias');
    var cats = ['Todas'];
    PRODUTOS.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    cats.forEach(function (c) {
      var b = el('button', null, c);
      b.type = 'button';
      b.setAttribute('aria-pressed', c === filtroCat ? 'true' : 'false');
      b.addEventListener('click', function () {
        filtroCat = c;
        Array.prototype.forEach.call(caixa.children, function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        desenharCatalogo();
      });
      caixa.appendChild(b);
    });
  }

  // Busca sem diferenciar acentos nem maiúsculas.
  function normalizar(t) {
    return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function desenharCatalogo() {
    var termo = normalizar($('busca').value.trim());
    var ordem = $('ordem').value;

    var lista = PRODUTOS.filter(function (p) {
      if (filtroCat !== 'Todas' && p.cat !== filtroCat) return false;
      if (!termo) return true;
      return normalizar(p.nome + ' ' + p.cat + ' ' + p.desc + ' ' + p.codigo).indexOf(termo) >= 0;
    });

    if (ordem === 'menor') lista.sort(function (a, b) { return a.preco - b.preco; });
    else if (ordem === 'maior') lista.sort(function (a, b) { return b.preco - a.preco; });
    else if (ordem === 'nome') lista.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });

    var ul = $('produtos');
    ul.textContent = '';
    lista.forEach(function (p) { ul.appendChild(cartao(p)); });

    var n = lista.length;
    $('resultado').textContent = n === 0
      ? 'Nenhum produto encontrado. Tente outra palavra ou a categoria "Todas".'
      : n + (n === 1 ? ' produto' : ' produtos') + (filtroCat !== 'Todas' ? ' em ' + filtroCat : '') + '.';
  }

  function cartao(p) {
    var li = el('li', 'produto');

    var visual = el('div', 'produto-visual');
    visual.setAttribute('aria-hidden', 'true');
    if (p.foto) {
      var foto = el('img');
      foto.src = p.foto;
      foto.alt = '';
      foto.loading = 'lazy';
      visual.appendChild(foto);
    } else if (window.Ilustracoes) {
      // Desenhos fixos do js/ilustracoes.js (não vêm de quem acessa a página).
      visual.innerHTML = window.Ilustracoes.desenhar(p.img[0], p.img[1]);
    }
    visual.appendChild(el('span', 'codigo', p.codigo));
    if (p.destaque) visual.appendChild(el('span', 'destaque', p.destaque));
    li.appendChild(visual);

    var info = el('div', 'produto-info');
    info.appendChild(el('p', 'produto-cat', p.cat));
    info.appendChild(el('h3', null, p.nome));
    info.appendChild(el('p', 'produto-desc', p.desc));

    var preco = el('p', 'produto-preco', dinheiro(p.preco) + ' ');
    preco.appendChild(el('small', null, p.unidade));
    info.appendChild(preco);

    var baixo = p.estoque <= 5;
    info.appendChild(el('p', 'produto-estoque' + (baixo ? ' baixo' : ''),
      baixo ? 'Últimas ' + p.estoque + ' unidades' : p.estoque + ' em estoque'));

    var botao = el('button', 'botao', 'Adicionar ao carrinho');
    botao.type = 'button';
    botao.setAttribute('aria-label', 'Adicionar ' + p.nome + ' ao carrinho');
    botao.addEventListener('click', function () { adicionar(p.id, 1); });
    info.appendChild(botao);

    li.appendChild(info);
    return li;
  }

  /* ---------- 3. Carrinho (tela) ---------- */
  function desenharCarrinho() {
    var qtd = quantidadeTotal();
    var contador = $('contador');
    if (contador.textContent !== String(qtd)) {
      contador.textContent = qtd;
      contador.classList.remove('pulo');
      void contador.offsetWidth; // reinicia a animação
      contador.classList.add('pulo');
    }
    $('abrir-carrinho').setAttribute('aria-label', 'Carrinho, ' + qtd + (qtd === 1 ? ' item' : ' itens'));

    var ul = $('itens');
    ul.textContent = '';
    Object.keys(carrinho).forEach(function (id) {
      var p = porId[id];
      var n = carrinho[id];
      var li = el('li', 'item-carrinho');

      var esq = el('div');
      esq.appendChild(el('div', 'nome', p.nome));
      esq.appendChild(el('div', 'unit', dinheiro(p.preco) + ' / ' + p.unidade));
      li.appendChild(esq);
      li.appendChild(el('div', 'valor', dinheiro(p.preco * n)));

      var acoes = el('div', 'acoes');
      var ctrl = el('div', 'qtd-ctrl');
      var menos = el('button', null, '−');
      menos.type = 'button';
      menos.setAttribute('aria-label', 'Diminuir ' + p.nome);
      menos.addEventListener('click', function () { definir(id, n - 1); focarItem(id, 'menos'); });
      var mais = el('button', null, '+');
      mais.type = 'button';
      mais.setAttribute('aria-label', 'Aumentar ' + p.nome);
      mais.disabled = n >= p.estoque;
      mais.addEventListener('click', function () { definir(id, n + 1); focarItem(id, 'mais'); });
      var num = el('span', null, String(n));
      num.setAttribute('aria-label', n + ' unidades');
      ctrl.appendChild(menos);
      ctrl.appendChild(num);
      ctrl.appendChild(mais);
      acoes.appendChild(ctrl);

      var rem = el('button', 'botao-link remover', 'Remover');
      rem.type = 'button';
      rem.setAttribute('aria-label', 'Remover ' + p.nome);
      rem.addEventListener('click', function () { definir(id, 0); $('fechar-carrinho').focus(); });
      acoes.appendChild(rem);
      li.appendChild(acoes);

      li.setAttribute('data-id', id);
      ul.appendChild(li);
    });

    var vazio = qtd === 0;
    $('carrinho-vazio').hidden = !vazio;
    atualizarTotais();
    if (vazio && etapa === 'checkout') irPara('itens');
  }

  // Depois de redesenhar, devolve o foco ao botão que foi clicado.
  function focarItem(id, qual) {
    var li = document.querySelector('.item-carrinho[data-id="' + id + '"]');
    if (!li) { $('fechar-carrinho').focus(); return; }
    var b = li.querySelectorAll('.qtd-ctrl button')[qual === 'menos' ? 0 : 1];
    if (b && !b.disabled) b.focus();
  }

  function atualizarTotais() {
    var sub = subtotal();
    var frete = valorFrete(sub);
    $('subtotal').textContent = dinheiro(sub);
    if (etapa === 'checkout') {
      $('frete').textContent = frete === 0 ? 'Grátis' : dinheiro(frete);
    } else {
      $('frete').textContent = sub >= FRETE_GRATIS_ACIMA ? 'Grátis' : 'escolha na próxima etapa';
    }
    $('total').textContent = dinheiro(sub + (etapa === 'checkout' ? frete : 0));
    $('avancar').disabled = sub === 0;
  }

  /* ---------- Gaveta: abrir e fechar ---------- */
  var origemFoco = null;

  function abrirCarrinho() {
    origemFoco = document.activeElement;
    $('carrinho').hidden = false;
    $('gaveta-fundo').hidden = false;
    $('abrir-carrinho').setAttribute('aria-expanded', 'true');
    document.body.classList.add('sem-rolagem');
    $('fechar-carrinho').focus();
  }

  function fecharCarrinho() {
    $('carrinho').hidden = true;
    $('gaveta-fundo').hidden = true;
    $('abrir-carrinho').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sem-rolagem');
    if (etapa === 'confirmado') irPara('itens');
    if (origemFoco && origemFoco.focus) origemFoco.focus();
  }

  /* ---------- 5. Etapas do pedido ---------- */
  var etapa = 'itens'; // itens -> checkout -> confirmado

  function irPara(nova) {
    etapa = nova;
    $('etapa-itens').hidden = nova !== 'itens';
    $('checkout').hidden = nova !== 'checkout';
    $('confirmado').hidden = nova !== 'confirmado';
    $('gaveta-rodape').hidden = nova === 'confirmado';
    $('avancar').textContent = nova === 'checkout' ? 'Confirmar pedido' : 'Finalizar pedido';
    $('ck-erro').hidden = true;
    atualizarTotais();
  }

  function soDigitos(t) { return t.replace(/\D/g, ''); }

  function validarCheckout() {
    var nome = $('ck-nome').value.trim();
    var tel = soDigitos($('ck-telefone').value);
    var cep = soDigitos($('ck-cep').value);
    if (nome.length < 3 || nome.indexOf(' ') < 0) return ['ck-nome', 'Informe nome e sobrenome.'];
    if (tel.length < 10 || tel.length > 11) return ['ck-telefone', 'Telefone com DDD, só números: 10 ou 11 dígitos.'];
    if (cep.length !== 8) return ['ck-cep', 'O CEP precisa ter 8 dígitos.'];
    return null;
  }

  function confirmarPedido() {
    var problema = validarCheckout();
    var erro = $('ck-erro');
    if (problema) {
      erro.textContent = problema[1];
      erro.hidden = false;
      $(problema[0]).focus();
      return;
    }

    var sub = subtotal();
    var frete = valorFrete(sub);
    var entrega = document.querySelector('input[name="entrega"]:checked').value;
    var pedidos = ler(CHAVE_PEDIDOS, []);
    var numero = 'DW-' + String(1001 + pedidos.length);
    var pedido = {
      numero: numero,
      data: new Date().toISOString(),
      cliente: $('ck-nome').value.trim(),
      entrega: entrega,
      itens: Object.keys(carrinho).map(function (id) { return { id: id, nome: porId[id].nome, qtd: carrinho[id], preco: porId[id].preco }; }),
      subtotal: sub,
      frete: frete,
      total: sub + frete
    };
    pedidos.push(pedido);
    gravar(CHAVE_PEDIDOS, pedidos);

    // Tela de confirmação
    var c = $('confirmado');
    c.textContent = '';
    c.appendChild(el('h3', null, 'Pedido confirmado'));
    var num = el('p', 'numero');
    num.appendChild(el('span', null, numero));
    c.appendChild(num);
    c.appendChild(el('p', null, 'Obrigado, ' + pedido.cliente.split(' ')[0] + '! ' +
      (entrega === 'retirada' ? 'Seu pedido fica separado para retirada na loja.' : 'Seu pedido vai para a obra no CEP ' + formatarCep($('ck-cep').value) + '.')));
    var ul = el('ul');
    pedido.itens.forEach(function (i) { ul.appendChild(el('li', null, i.qtd + ' × ' + i.nome + ': ' + dinheiro(i.qtd * i.preco))); });
    c.appendChild(ul);
    c.appendChild(el('p', null, 'Total: ' + dinheiro(pedido.total) + (frete ? ' (com entrega)' : '')));
    c.appendChild(el('p', 'produto-desc', 'Loja de demonstração: nada foi cobrado.'));
    var voltar = el('button', 'botao', 'Continuar comprando');
    voltar.type = 'button';
    voltar.addEventListener('click', fecharCarrinho);
    c.appendChild(voltar);

    carrinho = {};
    salvarCarrinho();
    $('checkout').reset();
    irPara('confirmado');
    c.focus();
  }

  function formatarCep(t) {
    var d = soDigitos(t).slice(0, 8);
    return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
  }

  /* ---------- 4. Calculadora de parede ---------- */
  var AREA_PLACA = 1.2 * 1.8; // m²
  var SOBRA = 1.1;            // 10% para cortes e perdas

  function calcular(largura, altura, placaId, comLa) {
    var area = largura * altura;
    var faces = area * 2;                                   // placa dos dois lados
    var colunas = Math.ceil(largura / 0.6) + 1;             // montante a cada 60 cm
    var barrasPorColuna = Math.ceil(altura / 3);            // barra de 3 m
    var montantes = colunas * barrasPorColuna;

    var itens = [
      [placaId, Math.ceil(faces * SOBRA / AREA_PLACA)],
      ['montante-48', montantes],
      ['guia-48', Math.ceil(largura * 2 * SOBRA / 3)],      // piso e teto
      ['paraf-placa', Math.ceil(faces * 30 / 100)],         // ~30 parafusos por m² de placa
      ['paraf-metal', Math.max(1, Math.ceil(montantes * 4 / 100))],
      ['fita-papel', Math.ceil(faces * 1.5 / 150)],         // ~1,5 m de junta por m²
      ['massa', Math.ceil(faces * 0.5 / 15)]                // ~0,5 kg por m²
    ];
    if (comLa) itens.push(['la-vidro', Math.ceil(area * 1.05 / 15)]);
    return { area: area, itens: itens };
  }

  function calculadora() {
    var form = $('calc-form');
    var saida = $('calc-resultado');
    var erro = $('calc-erro');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var largura = parseFloat(String($('calc-largura').value).replace(',', '.'));
      var altura = parseFloat(String($('calc-altura').value).replace(',', '.'));

      var msg = null;
      if (!(largura >= 0.5 && largura <= 50)) msg = ['calc-largura', 'Largura entre 0,5 e 50 metros.'];
      else if (!(altura >= 0.5 && altura <= 6)) msg = ['calc-altura', 'Altura entre 0,5 e 6 metros.'];
      if (msg) {
        erro.textContent = msg[1];
        erro.hidden = false;
        $(msg[0]).focus();
        return;
      }
      erro.hidden = true;

      var r = calcular(largura, altura, $('calc-placa').value, $('calc-la').checked);
      var total = 0;

      saida.textContent = '';
      saida.appendChild(el('h3', null, 'Material estimado'));
      saida.appendChild(el('p', 'area',
        'Parede de ' + largura.toLocaleString('pt-BR') + ' × ' + altura.toLocaleString('pt-BR') + ' m = ' +
        r.area.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' m² (placas dos dois lados).'));

      var ul = el('ul', 'lista-calc');
      r.itens.forEach(function (par) {
        var p = porId[par[0]];
        var valor = p.preco * par[1];
        total += valor;
        var li = el('li');
        li.appendChild(el('span', 'qtd', par[1] + '×'));
        var nome = el('span', null, p.nome + ' ');
        nome.appendChild(el('small', 'produto-desc', '(' + p.unidade + ')'));
        li.appendChild(nome);
        li.appendChild(el('span', 'valor', dinheiro(valor)));
        ul.appendChild(li);
      });
      saida.appendChild(ul);

      var t = el('p', 'calc-total');
      t.appendChild(el('span', null, 'Total estimado'));
      t.appendChild(el('span', null, dinheiro(total)));
      saida.appendChild(t);

      var botao = el('button', 'botao', 'Colocar tudo no carrinho');
      botao.type = 'button';
      botao.addEventListener('click', function () {
        var faltou = [];
        r.itens.forEach(function (par) {
          var p = porId[par[0]];
          var entrou = adicionar(par[0], par[1], true);
          if (entrou < par[1]) faltou.push(p.nome);
        });
        avisar(faltou.length
          ? 'Adicionado. Estoque insuficiente para: ' + faltou.join(', ') + '.'
          : 'Material da parede adicionado ao carrinho.');
        abrirCarrinho();
      });
      saida.appendChild(botao);
      saida.appendChild(el('p', 'calc-nota', 'Estimativa para orçamento. Confira as medidas na obra antes de comprar.'));
    });
  }

  /* ---------- Início ---------- */
  function iniciar() {
    montarCategorias();
    desenharCatalogo();
    desenharCarrinho();
    calculadora();

    $('busca').addEventListener('input', desenharCatalogo);
    $('ordem').addEventListener('change', desenharCatalogo);

    $('abrir-carrinho').addEventListener('click', abrirCarrinho);
    $('fechar-carrinho').addEventListener('click', fecharCarrinho);
    $('gaveta-fundo').addEventListener('click', fecharCarrinho);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !$('carrinho').hidden) fecharCarrinho();
    });

    $('avancar').addEventListener('click', function () {
      if (etapa === 'itens') { irPara('checkout'); $('ck-nome').focus(); }
      else if (etapa === 'checkout') confirmarPedido();
    });
    $('voltar-itens').addEventListener('click', function () { irPara('itens'); $('fechar-carrinho').focus(); });
    $('checkout').addEventListener('change', atualizarTotais);
    $('checkout').addEventListener('submit', function (ev) { ev.preventDefault(); confirmarPedido(); });
    $('ck-cep').addEventListener('input', function () { this.value = formatarCep(this.value); });

    // Vindo do simulador (loja.html#carrinho): já abre o carrinho.
    if (window.location.hash === '#carrinho') abrirCarrinho();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
