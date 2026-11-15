/* ============================================================
   DrywallPC - simulador "Monte seu cômodo" (simulador.html)
   Projeto semestral da turma CDC2NA, UniFECAF, Expotech 2026

   JavaScript puro, sem bibliotecas. O que este arquivo faz:
   1. Desenha o cômodo em perspectiva isométrica (SVG) com as
      medidas e materiais escolhidos, e o modo raio-x da estrutura.
   2. Vistoria: confere se as escolhas fazem sentido para o
      cômodo e dá estrelas (a parte de "jogo").
   3. Orçamento com os produtos da loja (js/produtos.js) e botão
      que leva tudo para o carrinho da loja.
   ============================================================ */

(function () {
  'use strict';

  var PRODUTOS = window.PRODUTOS || [];
  var porId = {};
  PRODUTOS.forEach(function (p) { porId[p.id] = p; });

  var CHAVE_CARRINHO = 'drywallpc-carrinho';

  /* ---------- Opções ---------- */
  var CORES = [
    ['Branco neve', '#F5F4EF'], ['Gelo', '#E4E7E2'], ['Areia', '#E3D3B5'],
    ['Cinza concreto', '#B9B8B2'], ['Verde sálvia', '#A9BCA0'], ['Azul sereno', '#A8C1D6'],
    ['Terracota', '#D08A6A'], ['Amarelo obra', '#FFC20E'], ['Grafite', '#4A4D54']
  ];

  var PLACAS = {
    'placa-st': { nome: 'Standard', cor: '#F4F3EF' },
    'placa-ru': { nome: 'RU', cor: '#7DB46C' },
    'placa-rf': { nome: 'RF', cor: '#E9A3A8' }
  };

  // Regras da vistoria para cada cômodo.
  //   placa: placa exigida (null = qualquer uma serve)
  //   extra: exigência específica do cômodo
  //   areaMin: área mínima do piso (m²), alturaMin: pé-direito mínimo (m)
  var COMODOS = {
    quarto: {
      nome: 'Quarto', placa: null, areaMin: 6, alturaMin: 2.5,
      dica: 'Área seca: a placa Standard resolve. Quarto precisa de janela para ventilar.',
      extra: { teste: function (e) { return e.janela; }, titulo: 'Janela para ventilação', ok: 'Tem janela: o quarto ventila e recebe luz.', falha: 'Quarto sem janela fica abafado. Coloque uma janela.' },
      movel: 'cama'
    },
    banheiro: {
      nome: 'Banheiro', placa: 'placa-ru', areaMin: 2.5, alturaMin: 2.3,
      dica: 'Área molhada: escolha a placa RU (verde), resistente à umidade.',
      extra: { teste: function (e) { return e.porta; }, titulo: 'Porta', ok: 'Tem porta: privacidade garantida.', falha: 'Banheiro sem porta? Coloque uma porta.' },
      movel: 'bancada'
    },
    cozinha: {
      nome: 'Cozinha', placa: 'placa-ru', areaMin: 4, alturaMin: 2.3,
      dica: 'Tem vapor e água perto da pia: use a placa RU (verde).',
      extra: { teste: function (e) { return e.janela; }, titulo: 'Janela para a fumaça sair', ok: 'Tem janela: a fumaça e o calor saem.', falha: 'Cozinha sem janela acumula fumaça. Coloque uma janela.' },
      movel: 'balcao'
    },
    home: {
      nome: 'Sala de cinema', placa: null, areaMin: 9, alturaMin: 2.5,
      dica: 'O som não pode vazar: ative o isolamento acústico (lã de vidro).',
      extra: { teste: function (e) { return e.la; }, titulo: 'Isolamento acústico', ok: 'Com lã de vidro: o som fica dentro da sala.', falha: 'Sem isolamento, o filme vaza para a casa toda. Ative a lã de vidro.' },
      movel: 'sofa'
    },
    escritorio: {
      nome: 'Escritório', placa: null, areaMin: 5, alturaMin: 2.5,
      dica: 'Área seca. Luz natural ajuda a trabalhar: coloque uma janela.',
      extra: { teste: function (e) { return e.janela; }, titulo: 'Luz natural', ok: 'Tem janela: luz natural para trabalhar.', falha: 'Sem janela o escritório fica escuro. Coloque uma janela.' },
      movel: 'mesa'
    },
    servidor: {
      nome: 'Sala de servidores', placa: 'placa-rf', areaMin: 4, alturaMin: 2.5,
      dica: 'Como no projeto DrywallPC: equipamento ligado o tempo todo pede placa RF (rosa), resistente ao fogo, e sala sem janela.',
      extra: { teste: function (e) { return !e.janela; }, titulo: 'Sem janela', ok: 'Sem janela: temperatura controlada e acesso só pela porta.', falha: 'Data center não tem janela: entra calor, sol e risco de invasão. Tire a janela.' },
      movel: 'rack'
    }
  };

  /* ---------- Utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function num(v, casas) { return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }); }
  function dinheiro(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function tom(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      v = f < 0 ? v * (1 + f) : v + (255 - v) * f;
      return ('0' + Math.round(v).toString(16)).slice(-2);
    });
    return '#' + c.join('');
  }
  function lerCarrinho() {
    try { return JSON.parse(window.localStorage.getItem(CHAVE_CARRINHO)) || {}; } catch (e) { return {}; }
  }

  var timerAviso;
  function avisar(texto) {
    var a = $('aviso');
    a.textContent = texto;
    a.classList.add('visivel');
    window.clearTimeout(timerAviso);
    timerAviso = window.setTimeout(function () { a.classList.remove('visivel'); }, 2400);
  }

  /* ---------- Estado: lê o formulário ---------- */
  function estado() {
    var cor = document.querySelector('input[name="cor"]:checked');
    return {
      comodo: $('comodo').value,
      W: parseFloat($('largura').value),
      D: parseFloat($('profundidade').value),
      H: parseFloat($('altura').value),
      esq: $('parede-esq').checked,
      dir: $('parede-dir').checked,
      placa: document.querySelector('input[name="placa"]:checked').value,
      la: $('la').checked,
      cor: cor ? CORES[Number(cor.value)] : CORES[1],
      piso: $('piso').value,
      forro: $('forro').value,
      porta: $('porta').checked,
      janela: $('janela').checked,
      orcamento: parseFloat($('orcamento').value) || 0,
      raiox: $('raiox').checked
    };
  }

  // Posição das aberturas (em metros, ao longo da parede).
  // Porta na parede da direita, janela na parede da esquerda.
  function aberturas(e) {
    var r = {};
    // Ficam perto da frente, para não brigar com os móveis encostados no fundo.
    if (e.porta && e.W >= 1.4) r.porta = { u: Math.max(e.W - 1.2, 0.3), w: 0.8, z0: 0, z1: Math.min(2.1, e.H - 0.1) };
    if (e.janela && e.D >= 1.8 && e.H >= 2.3) r.janela = { u: Math.max(e.D - 1.6, 0.3), w: 1.2, z0: 1.0, z1: Math.min(2.0, e.H - 0.2) };
    return r;
  }

  /* ============================================================
     1. Desenho isométrico
     Eixos: x = largura (desce para a direita), y = profundidade
     (desce para a esquerda), z = altura. As duas paredes desenhadas
     são as do fundo: x = 0 (esquerda) e y = 0 (direita).
     ============================================================ */
  var S = 100; // 1 metro = 100 unidades do SVG
  function P(x, y, z) { return [(x - y) * 0.866 * S, (x + y) * 0.5 * S - z * S]; }
  function pts(lista) { return lista.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function poly(lista, fill, extra) {
    return '<polygon points="' + pts(lista) + '" fill="' + fill + '" ' + (extra || 'stroke="#23252A" stroke-width="2" stroke-linejoin="round"') + '/>';
  }
  function linha(a, b, stroke, w, extra) {
    return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + stroke + '" stroke-width="' + w + '" ' + (extra || '') + '/>';
  }
  function texto(p, t, extra) {
    return '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" font-size="22" fill="#23252A" text-anchor="middle" ' + (extra || '') + '>' + t + '</text>';
  }

  // Ponto numa parede: u = posição ao longo dela, z = altura.
  function ptParede(lado, u, z) { return lado === 'esq' ? P(0, u, z) : P(u, 0, z); }
  function retParede(lado, u0, u1, z0, z1) {
    return [ptParede(lado, u0, z0), ptParede(lado, u1, z0), ptParede(lado, u1, z1), ptParede(lado, u0, z1)];
  }

  // Caixa (móvel) de x0..x0+w, y0..y0+d, altura z0..z0+h:
  // mostra o topo e as duas faces viradas para quem olha.
  function caixa(x0, y0, w, d, h, cor, z0) {
    var x1 = x0 + w, y1 = y0 + d, a = z0 || 0, b = a + h, s = '';
    s += poly([P(x1, y0, a), P(x1, y1, a), P(x1, y1, b), P(x1, y0, b)], tom(cor, -0.12));
    s += poly([P(x0, y1, a), P(x1, y1, a), P(x1, y1, b), P(x0, y1, b)], tom(cor, -0.25));
    s += poly([P(x0, y0, b), P(x1, y0, b), P(x1, y1, b), P(x0, y1, b)], cor);
    return s;
  }

  function desenharPiso(e) {
    var W = e.W, D = e.D, s = '';
    var cores = { porcelanato: '#E9E5DD', madeira: '#B98451', cimento: '#A9A9A3' };
    s += poly([P(0, 0, 0), P(W, 0, 0), P(W, D, 0), P(0, D, 0)], cores[e.piso]);
    var x, y;
    if (e.piso === 'porcelanato') {
      for (x = 0.6; x < W; x += 0.6) s += linha(P(x, 0, 0), P(x, D, 0), '#C9C2B4', 1.5);
      for (y = 0.6; y < D; y += 0.6) s += linha(P(0, y, 0), P(W, y, 0), '#C9C2B4', 1.5);
    } else if (e.piso === 'madeira') {
      for (y = 0.18; y < D; y += 0.18) s += linha(P(0, y, 0), P(W, y, 0), '#8E6038', 1.2);
      // emendas das réguas, alternadas
      var i = 0;
      for (y = 0; y < D; y += 0.18, i++) {
        for (x = (i % 2 ? 0.6 : 1.2); x < W; x += 1.2) s += linha(P(x, y, 0), P(x, Math.min(y + 0.18, D), 0), '#8E6038', 1.2);
      }
    } else {
      s += poly([P(W * 0.2, D * 0.3, 0), P(W * 0.5, D * 0.25, 0), P(W * 0.6, D * 0.5, 0), P(W * 0.3, D * 0.6, 0)], '#B3B3AD', 'stroke="none" opacity=".6"');
    }
    return s;
  }

  function desenharParede(e, lado, ab) {
    var L = lado === 'esq' ? e.D : e.W, H = e.H, s = '';
    var drywall = lado === 'esq' ? e.esq : e.dir;
    var escurece = lado === 'dir' ? -0.1 : 0;
    var contorno = retParede(lado, 0, L, 0, H);

    if (!e.raiox) {
      s += poly(contorno, tom(e.cor[1], escurece));
    } else if (!drywall) {
      // Parede existente de alvenaria
      s += poly(contorno, tom('#C9B8A6', escurece));
      for (var zb = 0.2; zb < H; zb += 0.2) s += linha(ptParede(lado, 0, zb), ptParede(lado, L, zb), '#A58D76', 1);
    } else {
      s += poly(contorno, tom(PLACAS[e.placa].cor, escurece));
      if (e.la) s += poly(contorno, '#F2D58A', 'opacity=".45" stroke="none"');
      // Montantes a cada 60 cm e guias no piso e no teto
      for (var u = 0; u <= L + 0.001; u += 0.6) {
        var uu = Math.min(u, L - 0.02);
        s += linha(ptParede(lado, uu, 0), ptParede(lado, uu, H), '#7F858C', 5, 'opacity=".85"');
      }
      s += linha(ptParede(lado, 0, 0.03), ptParede(lado, L, 0.03), '#7F858C', 6);
      s += linha(ptParede(lado, 0, H - 0.03), ptParede(lado, L, H - 0.03), '#7F858C', 6);
      // Emendas das placas (1,20 × 1,80 m)
      for (var j = 1.2; j < L; j += 1.2) s += linha(ptParede(lado, j, 0), ptParede(lado, j, H), '#23252A', 1.5, 'stroke-dasharray="6 5"');
      if (H > 1.8) s += linha(ptParede(lado, 0, 1.8), ptParede(lado, L, 1.8), '#23252A', 1.5, 'stroke-dasharray="6 5"');
      s += poly(contorno, 'none');
    }

    // Aberturas
    if (lado === 'esq' && ab.janela) {
      var j1 = ab.janela;
      s += poly(retParede(lado, j1.u, j1.u + j1.w, j1.z0, j1.z1), '#BFDDF0');
      s += linha(ptParede(lado, j1.u + j1.w / 2, j1.z0), ptParede(lado, j1.u + j1.w / 2, j1.z1), '#23252A', 2);
      s += linha(ptParede(lado, j1.u + 0.1, j1.z1 - 0.15), ptParede(lado, j1.u + 0.4, j1.z0 + 0.4), '#FFFFFF', 3, 'opacity=".8"');
      s += poly(retParede(lado, j1.u - 0.05, j1.u + j1.w + 0.05, j1.z0 - 0.06, j1.z0), '#F4F3EF');
    }
    if (lado === 'dir' && ab.porta) {
      var p = ab.porta;
      s += poly(retParede(lado, p.u, p.u + p.w, p.z0, p.z1), '#A86F3F');
      s += poly(retParede(lado, p.u + 0.1, p.u + p.w - 0.1, 1.15, p.z1 - 0.12), '#B98451', 'stroke="#7A4F2A" stroke-width="1.5"');
      s += poly(retParede(lado, p.u + 0.1, p.u + p.w - 0.1, 0.12, 0.95), '#B98451', 'stroke="#7A4F2A" stroke-width="1.5"');
      var m = ptParede(lado, p.u + p.w - 0.12, 1.0);
      s += '<circle cx="' + m[0].toFixed(1) + '" cy="' + m[1].toFixed(1) + '" r="5" fill="#FFC20E" stroke="#23252A" stroke-width="1.5"/>';
    }
    return s;
  }

  function desenharForro(e) {
    if (e.forro === 'nenhum') return '';
    var s = '', H = e.H, faixa = 0.14;
    var cor = e.forro === 'pvc' ? '#FAFAF7' : '#F4F3EF';
    ['esq', 'dir'].forEach(function (lado) {
      var L = lado === 'esq' ? e.D : e.W;
      s += poly(retParede(lado, 0, L, H - faixa, H), tom(cor, lado === 'dir' ? -0.06 : 0));
      if (e.forro === 'pvc') {
        for (var u = 0.2; u < L; u += 0.2) s += linha(ptParede(lado, u, H - faixa), ptParede(lado, u, H), '#C9CCC6', 1);
      } else {
        // sombra da tabica
        s += linha(ptParede(lado, 0, H - faixa), ptParede(lado, L, H - faixa), '#23252A', 3);
      }
    });
    return s;
  }

  function desenharMovel(e) {
    var W = e.W, D = e.D, s = '';
    var m = COMODOS[e.comodo].movel;
    // Móveis encostados no canto do fundo; só aparecem se couberem.
    if (m === 'cama' && W >= 1.8 && D >= 2.3) {
      s += caixa(0.25, 0.1, 1.4, 1.9, 0.45, '#F4F3EF');      // colchão, cabeceira na parede da direita
      s += caixa(0.25, 0.02, 1.4, 0.1, 0.85, '#8E6038');     // cabeceira
      s += caixa(0.4, 0.2, 1.1, 0.35, 0.12, '#A8C1D6', 0.45); // travesseiro
    } else if (m === 'bancada' && W >= 1 && D >= 1.6) {
      s += caixa(0.05, 0.2, 0.55, 1.0, 0.85, '#F4F3EF');     // na parede da esquerda
      var pia = P(0.32, 0.7, 0.85);
      s += '<ellipse cx="' + pia[0].toFixed(1) + '" cy="' + pia[1].toFixed(1) + '" rx="24" ry="13" fill="#D6E2EA" stroke="#23252A" stroke-width="1.5"/>';
    } else if (m === 'balcao' && W >= 1.2 && D >= 1.6) {
      var comp = Math.min(2.4, D - 0.4);
      s += caixa(0.05, 0.1, 0.6, comp, 0.86, '#E4E7E2');
      s += caixa(0.03, 0.08, 0.64, comp + 0.04, 0.04, '#4A4D54', 0.86); // tampo de granito
    } else if (m === 'sofa' && W >= 2.4 && D >= 2.4) {
      // TV na parede da esquerda e sofá de frente para ela
      s += poly(retParede('esq', 0.25, 1.45, 1.0, 1.7), '#23252A');
      var xs = Math.min(W - 1.1, 2.4);
      s += caixa(xs, 0.1, 0.9, 2.0, 0.42, '#5F605C');
      s += caixa(xs + 0.72, 0.1, 0.18, 2.0, 0.42, '#4A4D54', 0.42);
    } else if (m === 'mesa' && W >= 1.2 && D >= 1.8) {
      s += caixa(0.1, 0.3, 0.6, 1.2, 0.72, '#C99A5B');       // na parede da esquerda
      s += caixa(0.18, 0.6, 0.05, 0.55, 0.35, '#23252A', 0.72); // monitor
    } else if (m === 'rack' && W >= 1 && D >= 1.5) {
      s += caixa(0.15, 0.15, 0.6, 1.0, 2.0, '#2B2E34');
      for (var z = 0.3; z < 1.9; z += 0.25) {
        var a = P(0.75, 0.3, z), b = P(0.75, 1.05, z);
        s += linha(a, b, '#5F605C', 2);
        s += '<circle cx="' + (a[0] + 4).toFixed(1) + '" cy="' + (a[1] - 6).toFixed(1) + '" r="2.5" fill="' + (z < 1 ? '#7DDB6C' : '#FFC20E') + '"/>';
      }
    }
    return s;
  }

  // Pessoa de 1,70 m para dar noção de tamanho.
  function desenharPessoa(e) {
    var b = P(e.W * 0.72, e.D * 0.78, 0), x = b[0], y = b[1];
    var cor = '#23252A';
    return '<g fill="' + cor + '" opacity=".88">' +
      '<circle cx="' + x + '" cy="' + (y - 158) + '" r="12"/>' +
      '<rect x="' + (x - 17) + '" y="' + (y - 143) + '" width="34" height="62" rx="10"/>' +
      '<rect x="' + (x - 15) + '" y="' + (y - 86) + '" width="13" height="86" rx="5"/>' +
      '<rect x="' + (x + 2) + '" y="' + (y - 86) + '" width="13" height="86" rx="5"/>' +
      '<rect x="' + (x - 26) + '" y="' + (y - 140) + '" width="10" height="58" rx="5"/>' +
      '<rect x="' + (x + 16) + '" y="' + (y - 140) + '" width="10" height="58" rx="5"/>' +
      '</g>' + texto([x + 44, y - 150], '1,70 m', 'font-size="18" fill="#5F605C"');
  }

  function desenharCotas(e) {
    var W = e.W, D = e.D, H = e.H, s = '';
    var a = P(0, D, 0), b = P(W, D, 0), c = P(W, 0, 0);
    s += linha([a[0], a[1] + 22], [b[0], b[1] + 22], '#5F605C', 1.5);
    s += texto([(a[0] + b[0]) / 2 - 18, (a[1] + b[1]) / 2 + 52], num(W, 1) + ' m');
    s += linha([b[0], b[1] + 22], [c[0], c[1] + 22], '#5F605C', 1.5);
    s += texto([(b[0] + c[0]) / 2 + 18, (b[1] + c[1]) / 2 + 52], num(D, 1) + ' m');
    var t = P(0, D, H);
    s += linha([a[0] - 22, a[1]], [t[0] - 22, t[1]], '#5F605C', 1.5);
    s += texto([t[0] - 32, (a[1] + t[1]) / 2], num(H, 1) + ' m', 'text-anchor="end"');
    return s;
  }

  function desenhar(e) {
    var ab = aberturas(e);
    var svg = $('cena');
    var minX = P(0, e.D, 0)[0] - 120, maxX = P(e.W, 0, 0)[0] + 60;
    var minY = P(0, 0, e.H)[1] - 30, maxY = P(e.W, e.D, 0)[1] + 70;
    // Mantém a proporção 4:3 da área de desenho, centralizando a cena.
    var w = maxX - minX, h = maxY - minY;
    if (w / h > 4 / 3) { var nh = w * 3 / 4; minY -= (nh - h) / 2; h = nh; }
    else { var nw = h * 4 / 3; minX -= (nw - w) / 2; w = nw; }
    svg.setAttribute('viewBox', [minX, minY, w, h].map(function (v) { return v.toFixed(1); }).join(' '));

    svg.innerHTML =
      desenharPiso(e) +
      desenharParede(e, 'esq', ab) +
      desenharParede(e, 'dir', ab) +
      desenharForro(e) +
      desenharMovel(e) +
      desenharPessoa(e) +
      desenharCotas(e);

    // Descrição em texto (leitores de tela e quem não enxerga bem o desenho)
    var c = COMODOS[e.comodo];
    var paredes = e.esq && e.dir ? 'duas paredes' : (e.esq || e.dir ? 'uma parede' : 'nenhuma parede');
    var forro = { nenhum: 'sem forro novo', drywall: 'forro de drywall', pvc: 'forro de PVC' }[e.forro];
    var piso = { porcelanato: 'porcelanato', madeira: 'piso de madeira', cimento: 'cimento queimado' }[e.piso];
    var extras = [];
    if (ab.porta) extras.push('porta');
    if (ab.janela) extras.push('janela');
    $('cena-desc').textContent = c.nome + ' de ' + num(e.W, 1) + ' × ' + num(e.D, 1) + ' m, pé-direito ' + num(e.H, 1) +
      ' m. ' + cap(paredes) + ' de drywall com placa ' + PLACAS[e.placa].nome + ', pintura ' + e.cor[0].toLowerCase() +
      ', ' + piso + ', ' + forro + (extras.length ? ', com ' + extras.join(' e ') : '') + '.' +
      (e.raiox ? ' Raio-x ligado: aparecem montantes, guias e emendas das placas.' : '');
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ============================================================
     3. Orçamento (calculado antes da vistoria, que usa o total)
     ============================================================ */
  function orcamento(e) {
    var ab = aberturas(e);
    var itens = {};
    function add(id, q) { if (q > 0) itens[id] = (itens[id] || 0) + q; }

    var paredes = [];
    if (e.esq) paredes.push({ L: e.D, vao: ab.janela ? ab.janela.w * (ab.janela.z1 - ab.janela.z0) : 0, aberturas: ab.janela ? 1 : 0 });
    if (e.dir) paredes.push({ L: e.W, vao: ab.porta ? ab.porta.w * (ab.porta.z1 - ab.porta.z0) : 0, aberturas: ab.porta ? 1 : 0 });

    var areaParedes = 0, montantes = 0, guiasM = 0, faces = 0;
    var alto = e.H > 3;
    paredes.forEach(function (p) {
      areaParedes += p.L * e.H - p.vao;
      montantes += (Math.ceil(p.L / 0.6) + 1) * Math.ceil(e.H / 3) + p.aberturas * 2; // reforço nos vãos
      guiasM += p.L * 2;
    });
    faces = areaParedes * 2;

    var parafPlaca = faces * 30, juntas = faces, placaSt = 0;
    if (paredes.length) {
      add(e.placa, Math.ceil(faces * 1.1 / 2.16));
      add(alto ? 'montante-70' : 'montante-48', montantes);
      add(alto ? 'guia-70' : 'guia-48', Math.ceil(guiasM * 1.1 / 3));
      add('paraf-metal', Math.max(1, Math.ceil(montantes * 4 / 100)));
      add('pino-aco', Math.max(1, Math.ceil(guiasM / 0.6 / 100)));
      if (e.la) add('la-vidro', Math.ceil(areaParedes * 1.05 / 15));
    }

    var areaPiso = e.W * e.D;
    if (e.forro === 'drywall') {
      var linhas = Math.ceil(e.W / 0.6) + 1;
      placaSt = Math.ceil(areaPiso * 1.1 / 2.16);
      add('placa-st', placaSt);
      add('perfil-f530', Math.ceil(linhas * e.D * 1.05 / 3));
      add('regulador', Math.max(1, Math.ceil(linhas * Math.ceil(e.D) / 50)));
      add('arame', Math.max(1, Math.ceil(areaPiso / 20)));
      add('tabica', Math.ceil((e.W + e.D) * 2 * 1.05 / 3));
      parafPlaca += areaPiso * 20;
      juntas += areaPiso;
    } else if (e.forro === 'pvc') {
      add('forro-pvc', Math.ceil(areaPiso * 1.1));
      add('arame', Math.max(1, Math.ceil(areaPiso / 20)));
    }

    if (juntas > 0) {
      add('paraf-placa', Math.ceil(parafPlaca / 100));
      add('fita-papel', Math.ceil(juntas * 1.5 / 150));
      add('massa', Math.ceil(juntas * 0.5 / 15));
      add('lixa', Math.max(1, Math.ceil(juntas / 40)));
    }

    // Pintura: as duas paredes do desenho (drywall ou não) e o forro de drywall
    var vaos = (ab.porta ? ab.porta.w * (ab.porta.z1 - ab.porta.z0) : 0) + (ab.janela ? ab.janela.w * (ab.janela.z1 - ab.janela.z0) : 0);
    var areaPintura = (e.W + e.D) * e.H - vaos + (e.forro === 'drywall' ? areaPiso : 0);
    add('selador', Math.ceil(areaPintura / 250));
    add('tinta', Math.ceil(areaPintura * 2 / 300)); // duas demãos
    add('rolo-pintura', 1);

    var total = 0;
    var lista = Object.keys(itens).filter(function (id) { return porId[id]; }).map(function (id) {
      var v = porId[id].preco * itens[id];
      total += v;
      return { id: id, qtd: itens[id], valor: v };
    });
    return { lista: lista, total: total, areaParedes: areaParedes, areaPintura: areaPintura, areaPiso: areaPiso, alto: alto };
  }

  function mostrarOrcamento(e, o) {
    $('orc-area').textContent =
      (o.areaParedes > 0 ? num(o.areaParedes, 1) + ' m² de parede de drywall (placa dos dois lados)' : 'Sem parede nova de drywall') +
      (e.forro !== 'nenhum' ? ', ' + num(o.areaPiso, 1) + ' m² de forro' : '') +
      ', ' + num(o.areaPintura, 1) + ' m² de pintura.';

    var ul = $('orc-lista');
    ul.textContent = '';
    o.lista.forEach(function (i) {
      var p = porId[i.id];
      var li = el('li');
      li.appendChild(el('span', 'qtd', i.qtd + '×'));
      var nome = el('span', null, p.nome + ' ');
      nome.appendChild(el('small', 'produto-desc', '(' + p.unidade + ')'));
      li.appendChild(nome);
      li.appendChild(el('span', 'valor', dinheiro(i.valor)));
      ul.appendChild(li);
    });
    $('orc-total').textContent = dinheiro(o.total);

    var meta = $('meta-orc');
    meta.hidden = !e.orcamento;
    if (e.orcamento) {
      var pct = Math.min(100, o.total / e.orcamento * 100);
      $('meta-fill').style.width = pct.toFixed(1) + '%';
      var estourou = o.total > e.orcamento;
      meta.querySelector('.meta-barra').classList.toggle('estourou', estourou);
      $('meta-texto').textContent = estourou
        ? 'Passou ' + dinheiro(o.total - e.orcamento) + ' do seu orçamento de ' + dinheiro(e.orcamento) + '.'
        : 'Dentro do orçamento: sobram ' + dinheiro(e.orcamento - o.total) + ' de ' + dinheiro(e.orcamento) + '.';
    }
  }

  /* ============================================================
     2. Vistoria (o "jogo")
     ============================================================ */
  function vistoria(e, o) {
    var c = COMODOS[e.comodo];
    var itens = [];

    itens.push(e.esq || e.dir || e.forro === 'drywall'
      ? { st: 'ok', t: 'Tem drywall na obra', d: 'Parede ou forro de drywall escolhidos.' }
      : { st: 'falha', t: 'Tem drywall na obra', d: 'Nenhuma parede ou forro de drywall. Marque pelo menos uma parede.' });

    if (!(e.esq || e.dir)) {
      itens.push({ st: 'neutro', t: 'Placa certa para o cômodo', d: 'Sem parede de drywall para conferir.' });
    } else if (!c.placa) {
      itens.push(e.placa === 'placa-st'
        ? { st: 'ok', t: 'Placa certa para o cômodo', d: 'Standard é a placa ideal para ' + c.nome.toLowerCase() + ': área seca e mais barata.' }
        : { st: 'ok', t: 'Placa certa para o cômodo', d: 'Funciona, mas a Standard já resolveria por um preço menor.' });
    } else {
      itens.push(e.placa === c.placa
        ? { st: 'ok', t: 'Placa certa para o cômodo', d: 'Placa ' + PLACAS[c.placa].nome + ': a escolha certa para ' + c.nome.toLowerCase() + '.' }
        : { st: 'falha', t: 'Placa certa para o cômodo', d: c.nome + ' pede placa ' + PLACAS[c.placa].nome + '. ' + c.dica });
    }

    var ex = c.extra;
    itens.push(ex.teste(e) ? { st: 'ok', t: ex.titulo, d: ex.ok } : { st: 'falha', t: ex.titulo, d: ex.falha });

    itens.push(e.H >= c.alturaMin
      ? { st: 'ok', t: 'Pé-direito', d: num(e.H, 1) + ' m' + (o.alto ? ': alto, por isso o orçamento usa montantes de 70 mm.' : ': altura confortável.') }
      : { st: 'falha', t: 'Pé-direito', d: num(e.H, 1) + ' m é baixo para ' + c.nome.toLowerCase() + '. Suba para pelo menos ' + num(c.alturaMin, 1) + ' m.' });

    var area = e.W * e.D;
    itens.push(area >= c.areaMin
      ? { st: 'ok', t: 'Tamanho do cômodo', d: num(area, 1) + ' m² de piso.' }
      : { st: 'falha', t: 'Tamanho do cômodo', d: num(area, 1) + ' m² é apertado para ' + c.nome.toLowerCase() + '. O mínimo aqui é ' + num(c.areaMin, 0) + ' m².' });

    if (!e.orcamento) itens.push({ st: 'neutro', t: 'Desafio do orçamento', d: 'Informe quanto pode gastar (item 5) para valer estrela.' });
    else itens.push(o.total <= e.orcamento
      ? { st: 'ok', t: 'Desafio do orçamento', d: 'A obra cabe no bolso.' }
      : { st: 'falha', t: 'Desafio do orçamento', d: 'Estourou. Tente outra placa, tire o forro ou diminua o cômodo.' });

    var ul = $('checklist');
    ul.textContent = '';
    var validos = 0, oks = 0;
    itens.forEach(function (i) {
      if (i.st !== 'neutro') { validos++; if (i.st === 'ok') oks++; }
      var li = el('li', i.st);
      var m = el('span', 'marca-vist', i.st === 'ok' ? '✓' : (i.st === 'falha' ? '✗' : '–'));
      m.setAttribute('aria-hidden', 'true');
      li.appendChild(m);
      var corpo = el('div');
      var tit = el('strong', null, i.t);
      var rotulo = el('span', 'sr', i.st === 'ok' ? ' (aprovado)' : (i.st === 'falha' ? ' (reprovado)' : ' (não avaliado)'));
      rotulo.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
      tit.appendChild(rotulo);
      corpo.appendChild(tit);
      corpo.appendChild(el('p', null, i.d));
      li.appendChild(corpo);
      ul.appendChild(li);
    });

    var estrelas = validos ? Math.round(oks / validos * 5) : 0;
    var e1 = $('estrelas');
    e1.textContent = '★★★★★'.slice(0, estrelas) + '☆☆☆☆☆'.slice(0, 5 - estrelas);
    e1.appendChild(el('small', null, oks + ' de ' + validos + ' itens aprovados'));
    e1.setAttribute('aria-label', estrelas + ' de 5 estrelas, ' + oks + ' de ' + validos + ' itens aprovados');
    e1.classList.toggle('aprovada', validos > 0 && oks === validos);
  }

  /* ---------- Levar para o carrinho da loja ---------- */
  var ultimoOrcamento = null;
  function levarParaCarrinho() {
    if (!ultimoOrcamento || !ultimoOrcamento.lista.length) return;
    var carrinho = lerCarrinho();
    ultimoOrcamento.lista.forEach(function (i) { carrinho[i.id] = (carrinho[i.id] || 0) + i.qtd; });
    try {
      window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    } catch (err) {
      avisar('O navegador bloqueou o carrinho (janela anônima?). Tente numa janela normal.');
      return;
    }
    avisar('Material adicionado. Abrindo o carrinho da loja…');
    window.setTimeout(function () { window.location.href = 'loja.html#carrinho'; }, 700);
  }

  function atualizarContador() {
    var c = lerCarrinho();
    var n = Object.keys(c).reduce(function (s, id) { return s + (porId[id] ? (c[id] || 0) : 0); }, 0);
    $('contador').textContent = n;
  }

  /* ---------- Início ---------- */
  function atualizar() {
    var e = estado();
    $('out-largura').textContent = num(e.W, 1) + ' m';
    $('out-profundidade').textContent = num(e.D, 1) + ' m';
    $('out-altura').textContent = num(e.H, 1) + ' m';
    $('comodo-dica').textContent = COMODOS[e.comodo].dica;

    desenhar(e);
    var o = orcamento(e);
    ultimoOrcamento = o;
    mostrarOrcamento(e, o);
    vistoria(e, o);
  }

  function iniciar() {
    var caixaCores = $('cores');
    CORES.forEach(function (c, i) {
      var l = el('label', 'cor');
      l.title = c[0];
      var r = el('input');
      r.type = 'radio';
      r.name = 'cor';
      r.value = String(i);
      r.checked = i === 1;
      r.setAttribute('aria-label', c[0]);
      var s = el('span');
      s.style.background = c[1];
      l.appendChild(r);
      l.appendChild(s);
      caixaCores.appendChild(l);
    });

    $('sim-form').addEventListener('input', atualizar);
    $('sim-form').addEventListener('change', atualizar);
    $('sim-form').addEventListener('submit', function (ev) { ev.preventDefault(); });
    $('raiox').addEventListener('change', atualizar);
    $('levar').addEventListener('click', levarParaCarrinho);

    atualizarContador();
    atualizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
